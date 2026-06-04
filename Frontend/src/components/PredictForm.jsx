import React, { useState, useEffect } from "react";
import {
  Form,
  useNavigation,
  useNavigate,
  useActionData,
  useLoaderData,
} from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import ErrorIcon from "@mui/icons-material/Error";
import { predictRisk } from "./predict-api";

export async function loader() {
  if (!sessionStorage.getItem("disclaimerAccepted")) {
    return true;
  } else return false;
}

export async function action({ request }) {
  const formData = await request.formData();

  const requiredFields = {
    age: "Age",
    height: "Height",
    weight: "Weight",
    systolic: "Systolic Blood Pressure",
    diastolic: "Diastolic Blood Pressure",
    cholesterol: "Cholesterol",
    glucose: "Glucose",
    gender: "Gender",
    smoking: "Smoking status",
    alcohol: "Alcohol intake",
    physicalActivity: "Physical activity",
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    const value = formData.get(field);
    if (!value || value.toString().trim() === "") {
      return {
        error: `${label} cannot be empty.`,
        type: field,
      };
    }
  }

  const age_years = Number(formData.get("age"));
  const height = Number(formData.get("height"));
  const weight = Number(formData.get("weight"));
  const ap_hi = Number(formData.get("systolic"));
  const ap_lo = Number(formData.get("diastolic"));
  const cholesterol = Number(formData.get("cholesterol"));
  const gluc = Number(formData.get("glucose"));
  const gender = formData.get("gender");
  const smoke = formData.get("smoking");
  const alco = formData.get("alcohol");
  const active = formData.get("physicalActivity");

  if (age_years < 40 || age_years > 70) {
    return { error: "Age must be between 40-70years" };
  }

  if (height < 50 || height > 250) {
    return {
      error: "Invalid Height: Please enter a value between 50cm and 250cm.",
      type: "height",
    };
  }

  if (weight < 10 || weight > 300) {
    return {
      error: "Invalid Weight: Please enter a value between 10kg and 300kg.",
      type: "weight",
    };
  }

  if (ap_hi < 50 || ap_hi > 250) {
    return {
      error:
        "Invalid Systolic BP: Please enter a value between 50 and 250 mmHg.",
      type: "systolic",
    };
  }

  if (ap_lo < 30 || ap_lo > 200) {
    return {
      error:
        "Invalid Diastolic BP: Please enter a value between 30 and 200 mmHg.",
      type: "diastolic",
    };
  }

  if (ap_lo >= ap_hi) {
    return {
      error: "Invalid Blood Pressure: Systolic must be higher than Diastolic.",
      type: "bp_logic",
    };
  }

  if (Number(cholesterol) < 50 || Number(cholesterol) > 600) {
    return {
      error:
        "Invalid Cholesterol: Please enter a value between 50 and 600 mg/dL.",
      type: "cholesterol",
    };
  }

  if (Number(gluc) < 30 || Number(gluc) > 500) {
    return {
      error: "Invalid Glucose: Please enter a value between 30 and 500 mg/dL.",
      type: "glucose",
    };
  }

  if (gender !== "male" && gender !== "female") {
    return {
      error: "Invalid Gender: Please select a valid option from the dropdown.",
      type: "gender",
    };
  }

  const validYesNo = ["yes", "no"];

  if (!validYesNo.includes(smoke)) {
    return {
      error: "Invalid Smoking Status: Please select Yes or No.",
      type: "smoking",
    };
  }

  if (!validYesNo.includes(alco)) {
    return {
      error: "Invalid Alcohol Status: Please select Yes or No.",
      type: "alcohol",
    };
  }

  if (!validYesNo.includes(active)) {
    return {
      error: "Invalid Physical Activity Status: Please select Yes or No.",
      type: "physicalActivity",
    };
  }

  const bmi = Number(weight) / (Number(height) / 100) ** 2;

  let formObj = {
    gender,
    height: Number(height),
    weight: Number(weight),
    ap_hi: ap_hi,
    ap_lo: ap_lo,
    cholesterol,
    gluc,
    smoke,
    alco,
    active,
    age_years: Number(age_years),
    bmi: +bmi.toFixed(2),
  };

  formObj.gender = formObj.gender === "male" ? 1 : 0;

  if (Number(formObj.gluc) >= 126) {
    formObj.gluc = 3;
  } else if (Number(formObj.gluc) >= 100) {
    formObj.gluc = 2;
  } else {
    formObj.gluc = 1;
  }

  if (Number(formObj.cholesterol) >= 240) {
    formObj.cholesterol = 3;
  } else if (Number(formObj.cholesterol) >= 200) {
    formObj.cholesterol = 2;
  } else {
    formObj.cholesterol = 1;
  }

  const fieldsToConvert = ["smoke", "alco", "active"];

  fieldsToConvert.forEach((field) => {
    formObj[field] = formObj[field] === "yes" ? 1 : 0;
  });

  try {
    const data = await predictRisk(formObj);
    return data;
  } catch (err) {
    console.log(err);
    return {
      error:
        "An error occurred while connecting to the server. Please try again.",
    };
  }
}

export default function PredictForm() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const data = useActionData();
  const showDisclaimerInitially = useLoaderData();

  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger modal when form is submitted if they haven't accepted it yet
  const handleSubmit = () => {
    if (!sessionStorage.getItem("disclaimerAccepted")) {
      setIsModalOpen(true);
    }
  };

  // Handle the user clicking "OK"
  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem("disclaimerAccepted", "true");
    setIsModalOpen(false);
  };

  // Wait until both conditions are met: data is successful AND modal is closed
  useEffect(() => {
    if (data?.status === "success" && !isModalOpen) {
      navigate("/results", { state: { apiResult: data } });
    }
  }, [data, isModalOpen, navigate]);

  return (
    <div className="container">
      <div className="predict-form-container">
        <h1>HEART DISEASE RISK PREDICTION</h1>

        {/* Added onSubmit handler here */}
        <Form method="post" noValidate onSubmit={handleSubmit}>
          <div className="label-container">
            <label htmlFor="age">
              Age
              <Tooltip title="Age of the patient (40 to 70 years)">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              id="age"
              name="age"
              type="number"
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="height">
              Height (cm)
              <Tooltip title="Height of the patient in centimeters (50cm to 250cm).">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              id="height"
              name="height"
              type="number"
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="weight">
              Weight (kg)
              <Tooltip title="Weight of the patient in kilograms (10kg to 300kg).">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="systolic">
              Systolic Blood Pressure
              <Tooltip title="Systolic blood pressure reading (50 to 250 mmHg).">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              id="systolic"
              name="systolic"
              type="number"
              min="50"
              max="250"
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="diastolic">
              Diastolic Blood Pressure
              <Tooltip title="Diastolic blood pressure reading (30 to 200 mmHg).">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              id="diastolic"
              name="diastolic"
              type="number"
              min="30"
              max="200"
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="cholesterol">
              Cholesterol (mg/dL)
              <Tooltip title="Cholesterol reading of the patient.">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              name="cholesterol"
              type="number"
              min="50"
              max="600"
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="glucose">
              Glucose (mg/dL)
              <Tooltip title="Glucose reading of the patient.">
                <ErrorIcon />
              </Tooltip>
            </label>
            <input
              name="glucose"
              type="number"
              id="glucose"
              min="30"
              onWheel={(e) => e.target.blur()}
              max="500"
              required
            />
          </div>

          <div className="label-container">
            <label htmlFor="gender">
              Gender
              <Tooltip title="Gender of the patient">
                <ErrorIcon />
              </Tooltip>
            </label>
            <select name="gender" id="gender" required>
              <option></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="label-container">
            <label htmlFor="smoking">
              Smoking
              <Tooltip title="Do you smoke?">
                <ErrorIcon />
              </Tooltip>
            </label>
            <select name="smoking" id="smoking" required>
              <option></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="label-container">
            <label htmlFor="alcohol">
              Alcohol Intake
              <Tooltip title="Do you consume alcohol?">
                <ErrorIcon />
              </Tooltip>
            </label>
            <select name="alcohol" id="alcohol" required>
              <option></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="label-container">
            <label htmlFor="physicalActivity">
              Physical Activity
              <Tooltip title="Are you physically active?">
                <ErrorIcon />
              </Tooltip>
            </label>
            <select name="physicalActivity" id="physicalActivity" required>
              <option></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {data?.error && (
            <div
              className="error-message"
              style={{
                color: "#d32f2f",
                backgroundColor: "#fdecea",
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "15px",
                width: "300px",
                textAlign: "center",
                fontWeight: "bold",
                border: "1px solid #f5c2c7",
              }}
            >
              {data.error}
            </div>
          )}

          <button
            disabled={navigation.state === "submitting"}
            className={
              navigation.state === "submitting"
                ? "submitting-btn"
                : "submit-btn"
            }
          >
            {navigation.state === "submitting" ? "Submitting..." : "Submit"}
          </button>
        </Form>
      </div>

      {/* MODAL COMPONENT */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginTop: 0, color: "#d32f2f" }}>
              ⚠️ Medical Disclaimer
            </h2>
            <p style={{ lineHeight: "1.5", color: "#333" }}>
              This prediction model is an academic project designed for
              educational and informational purposes only. It uses machine
              learning to assess risk factors but{" "}
              <strong>does not replace a professional medical diagnosis</strong>
              .
            </p>
            <p style={{ lineHeight: "1.5", color: "#333" }}>
              Always consult with a qualified healthcare provider regarding your
              heart health.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button onClick={handleAcceptDisclaimer} style={modalButtonStyle}>
                I Understand and Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple inline styles for the modal
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "500px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
};

const modalButtonStyle = {
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};
