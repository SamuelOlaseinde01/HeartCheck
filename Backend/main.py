import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import time
import re
import json
from dotenv import load_dotenv
from google import genai

# ==========================================
# 1. SETUP DATA AND APIs
# ==========================================
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# Load your trained XGBoost model safely
try:
    model = joblib.load('cardio_risk_model5.pkl')
except Exception as e:
    print("Warning: Model file not found. Make sure cardio_risk_model.pkl is in this folder.")

# ==========================================
# 2. INITIALIZE THE FASTAPI APP
# ==========================================
app = FastAPI(title="Cardio Risk API")

# Configure CORS so your React frontend is allowed to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 3. DEFINE THE DATA STRUCTURE
# ==========================================
class PatientData(BaseModel):
    gender: int
    height: float
    weight: float
    ap_hi: int
    ap_lo: int
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    active: int
    age_years: int
    bmi: float

# ==========================================
# 4. HELPER FUNCTIONS
# ==========================================

def clean_and_parse_json(raw_response_string):
    """Strips markdown and newlines to guarantee clean JSON for React."""
    cleaned_string = re.sub(r'\`\`\`(?:json)?\n?(.*?)\n?\`\`\`', r'\1', raw_response_string, flags=re.DOTALL)
    cleaned_string = cleaned_string.replace('\n', ' ').replace('\r', '')
    cleaned_string = cleaned_string.strip()
    
    try:
        parsed_json = json.loads(cleaned_string)
        return parsed_json
    except json.JSONDecodeError:
        print("Failed to parse Gemini output. Raw string was:", raw_response_string)
        return {
            "summary": "Our AI coach generated your advice, but we couldn't display it right now.",
            "keep_it_up": ["Thank you for prioritizing your heart health."],
            "action_plan": ["Please try again to see your personalized tips."]
        }

def generate_clinical_explanation(patient_data_dict, risk_prob, max_retries=3):
    """Generates the lifestyle advice using Gemini 2.5 Flash."""
    risk_percentage = round(risk_prob * 100, 1)
    
    prompt = f"""
    You are an empathetic, preventative health coach. A user just took a cardiovascular lifestyle screening.
    Their risk probability is {risk_percentage}%. 
    Here is their profile: {patient_data_dict}
    
    Provide a short, highly actionable explanation focusing on behavioral and lifestyle changes. 
    Avoid using AMBIGUOUS word, this explanation is for LMICs and make it comprehensive a bit.
    Do not use markdown formatting or newline characters. 
    
    You must respond STRICTLY in JSON format with exactly these three keys:
    {{
      "summary": "A 2-sentence friendly summary of their risk level.",
      "keep_it_up": ["An array of 1-3 short strings highlighting the good lifestyle choices they are making. (Start with 'You...')"],
      "action_plan": ["An array of 1-3 short, actionable lifestyle changes they can make to lower their risk (e.g., diet, exercise habits)."]
    }}
    """
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            return response.text
        except Exception as e:
            if "503" in str(e) or "429" in str(e):
                if attempt < max_retries - 1:
                    time.sleep(2 ** (attempt + 1))
                else:
                    return '{"summary": "Our AI coach is currently experiencing high traffic. Your baseline score is recorded.", "keep_it_up": ["Thank you for prioritizing your health."], "action_plan": ["Please try generating advice again later."]}'
            else:
                raise e

# ==========================================
# 5. THE MAIN API ENDPOINT
# ==========================================
# ==========================================
# 5. THE MAIN API ENDPOINT
# ==========================================
@app.post("/predict")
def predict_risk(data: PatientData):
    # 1. We must define the data and DataFrame FIRST
    patient_dict = data.dict()
    
    ordered_columns = [
        "gender", "height", "weight", "ap_hi", "ap_lo", 
        "cholesterol", "gluc", "smoke", "alco", "active", 
        "age_years", "bmi"
    ]
    
    model_input_dict = {col: patient_dict[col] for col in ordered_columns}
    df = pd.DataFrame([model_input_dict], columns=ordered_columns)
    
    try:
        # 2. Now we can predict, because 'df' exists!
        risk_probability = float(model.predict_proba(df)[0][1])
        
        # --- LOCAL XAI CODE (SPECIFIC TO THIS PATIENT) ---
        
        # Human-readable names for the frontend UI
        human_readable_names = {
            "ap_hi": "Systolic BP", "cholesterol": "Cholesterol", 
            "smoke": "Smoking", "active": "Physical Activity", 
            "gluc": "Glucose", "ap_lo": "Diastolic BP", 
            "alco": "Alcohol", "age_years": "Age", 
            "bmi": "BMI", "weight": "Weight", 
            "height": "Height", "gender": "Gender"
        }
        
        # Extract the underlying Booster from the scikit-learn XGBClassifier
        booster = model.get_booster()
        
        # Calculate the SHAP values (Feature Contributions) for this specific patient
        dmatrix = xgb.DMatrix(df)
        contributions = booster.predict(dmatrix, pred_contribs=True)[0]
        
        # The last value in the array is the "bias" (baseline risk), we only want the features
        feature_contributions = contributions[:-1] 
        
        feature_importance_list = []
        for col, contrib in zip(ordered_columns, feature_contributions):
            # A positive contribution pushes the risk UP (Danger)
            # A negative contribution pushes the risk DOWN (Protective)
            feature_importance_list.append({
                "name": human_readable_names.get(col, col),
                "value": float(contrib), # We keep the raw number so React knows if it's positive/negative
                "impact_type": "Increased Risk" if contrib > 0 else "Lowered Risk"
            })
            
        # Sort by the absolute magnitude of the impact (biggest impact at the top, whether good or bad)
        feature_importance_list = sorted(feature_importance_list, key=lambda x: abs(x["value"]), reverse=True)
        # ----------------------------------------------------
        
        # Get the raw string from Gemini 
        raw_ai_text = generate_clinical_explanation(patient_dict, risk_probability)
        safe_ai_json = clean_and_parse_json(raw_ai_text)
        
        # Return the math score, AI JSON, AND the PATIENT-SPECIFIC Feature Importance data!
        return {
            "status": "success",
            "risk_score": risk_probability,
            "ai_explanation": safe_ai_json,
            "feature_importance": feature_importance_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))