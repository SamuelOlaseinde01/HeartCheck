import React from "react";
import {
  BarChart,
  Bar,
  Cell, // Make sure to import Cell
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FeatureImportanceChart = ({ data }) => {
  // We will only take the top 5 most important features to keep the UI clean
  const topFeatures = data?.slice(0, 5);

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        paddingBottom: "70px",
        margin: "30px 0",
      }}
    >
      <h3
        style={{ textAlign: "center", marginBottom: "20px", color: "#374151" }}
      >
        What influenced this prediction?
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topFeatures}
          layout="vertical" // Makes it a horizontal bar chart
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          {/* type="category" is required for text labels on the Y-axis */}
          <XAxis type="number" unit="%" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 14, fill: "#4b5563" }}
          />

          <Tooltip
            formatter={(value) => [`${value}%`, "Importance"]}
            cursor={{ fill: "transparent" }}
          />

          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {/* Map over the data to assign conditional colors */}
            {topFeatures?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? "#10b981" : "#ef4444"} // Green for positive, Red for negative
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeatureImportanceChart;
