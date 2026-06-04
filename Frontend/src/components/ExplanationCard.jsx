import React from "react";
import FeatureImportanceChart from "./FeatureImportanceChart";
import styles from "./ExplanationCard.module.css";

export default function ExplanationCard({ aiResponseString, visibility }) {
  let parsedResponse = {};

  try {
    parsedResponse =
      typeof aiResponseString === "string"
        ? JSON.parse(aiResponseString)
        : aiResponseString;
  } catch (error) {
    console.error("Error parsing the AI response:", error);
  }

  const actionsToTake = parsedResponse?.action_plan?.map((res, index) => (
    <li key={index}>{res}</li>
  ));

  const keepItUp = parsedResponse?.keep_it_up?.map((res, index) => (
    <li key={index}>{res}</li>
  ));

  return (
    <>
      {visibility && (
        <div className={styles.summaryContainer}>
          <p>
            <strong>Summary: </strong>
            {parsedResponse?.summary}
          </p>
          <p>
            <strong>Keep it up(s):</strong>
          </p>
          {keepItUp}
          <p>
            <strong>Recommendation(s):</strong>
          </p>
          {actionsToTake}
        </div>
      )}
    </>
  );
}
