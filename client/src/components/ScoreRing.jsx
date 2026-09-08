/**
 * ScoreRing Component
 * Displays the ATS score as an animated circular progress ring
 */

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Returns color based on score range
const getScoreColor = (score) => {
  if (score >= 80) return "#15803d"; // Green — excellent
  if (score >= 60) return "#1d4ed8"; // Blue — good
  if (score >= 40) return "#a16207"; // Amber — average
  return "#b91c1c";                  // Red — poor
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Work";
};

export default function ScoreRing({ score, size = 160 }) {
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: size, height: size }}>
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            pathTransitionDuration: 1.2,
            pathColor: color,
            textColor: "#0f172a",
            trailColor: "#e2e8f0",
            textSize: "22px",
          })}
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          ATS Score
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">
          {getScoreLabel(score)}
        </p>
      </div>
    </div>
  );
}