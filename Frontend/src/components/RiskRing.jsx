import React from "react";
import styles from "./RiskRing.module.css";

const RiskRing = ({ percentage }) => {
  // SVG Math: Calculate the circumference of the circle
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Calculate how much of the ring should be filled
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine the color based on the risk level
  let ringColor = "#2e7d32"; // Green for Low Risk
  let statusText = "Low Risk";

  if (percentage >= 34 && percentage <= 66) {
    ringColor = "#f57c00"; // Orange for Moderate Risk
    statusText = "Moderate Risk";
  } else if (percentage > 66) {
    ringColor = "#c62828"; // Red for High Risk
    statusText = "High Risk";
  }

  return (
    <div className={styles.riskRingContainer}>
      <div className={styles.ringContainer}>
        <svg className={styles.svgRing} width="160" height="160">
          {/* Background Track Circle */}
          <circle
            className={styles.track}
            stroke="#e0e0e0"
            strokeWidth="12"
            fill="transparent"
            r={radius}
            cx="80"
            cy="80"
          />
          {/* Animated Progress Circle */}
          <circle
            className={styles.progress}
            stroke={ringColor}
            strokeWidth="12"
            fill="transparent"
            r={radius}
            cx="80"
            cy="80"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>

        <div className={styles.textContainer}>
          <span className={styles.percentageText}>{percentage}%</span>
        </div>
      </div>
      <div className={styles.statusLabel} style={{ color: ringColor }}>
        {statusText}
      </div>
    </div>
  );
};

export default RiskRing;
