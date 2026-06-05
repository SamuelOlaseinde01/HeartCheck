import React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import RiskRing from "./RiskRing";
import FeatureImportanceChart from "./FeatureImportanceChart";
import ExplanationCard from "./ExplanationCard";
import styles from "./Results.module.css";

export default function Results() {
  const [isSummaryVisible, setIsSummaryVisible] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  function toggleSummaryVisibility() {
    setIsSummaryVisible(!isSummaryVisible);
  }

  const resultData = location.state?.apiResult;

  if (!resultData) {
    return <Navigate to="/predict" replace />;
  }

  const riskPercentage = (resultData.risk_score * 100).toFixed(1);

  return (
    <div className={styles.resultContainer}>
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h2>Your Assessment Report</h2>
        <div>
          Estimated Cardiovascular Risk:
          <strong>
            <RiskRing percentage={riskPercentage} />
          </strong>
        </div>
      </div>
      <div className={styles.aiSummaryContainer}>
        <div className={styles.aiSummary}>
          <img src="./ai.png" alt="" srcset="" className={styles.aiImg} />
          <button onClick={() => toggleSummaryVisibility()}>
            {isSummaryVisible ? (
              <>Hide summary &#9650;</>
            ) : (
              <>View AI summary &#9660;</>
            )}
          </button>
        </div>

        <ExplanationCard
          visibility={isSummaryVisible}
          aiResponseString={JSON.stringify(resultData.ai_explanation)}
        />
      </div>

      <div>
        <FeatureImportanceChart data={resultData.feature_importance} />
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => navigate("/predict")}
          className={styles.assessmentButton}
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
}
