/**
 * ResumeCard Component
 * Displays a summary card for a past resume analysis in the dashboard
 */

import { Link } from "react-router-dom";

const getScoreText = (score) => {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-blue-800";
  if (score >= 40) return "text-amber-700";
  return "text-red-700";
};

const getScoreBg = (score) => {
  if (score >= 80) return "border-green-200 bg-green-50";
  if (score >= 60) return "border-blue-200 bg-blue-50";
  if (score >= 40) return "border-amber-200 bg-amber-50";
  return "border-red-200 bg-red-50";
};

export default function ResumeCard({ resume, onDelete }) {
  const date = new Date(resume.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="card p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* PDF icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50">
            <svg
              className="h-5 w-5 text-red-700"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {resume.fileName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{date}</p>
          </div>
        </div>

        {/* ATS Score Badge */}
        <div
          className={`shrink-0 rounded-md border px-3 py-1.5 text-sm font-bold tabular-nums ${getScoreBg(resume.atsScore)} ${getScoreText(resume.atsScore)}`}
        >
          {resume.atsScore}%
        </div>
      </div>

      {/* Skills preview */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {resume.detectedSkills?.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-md border border-primary-edge bg-primary-tint px-2 py-0.5 text-xs text-primary-darker"
          >
            {skill}
          </span>
        ))}
        {resume.detectedSkills?.length > 4 && (
          <span className="rounded-md border border-line bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
            +{resume.detectedSkills.length - 4} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          to={`/result/${resume._id}`}
          className="btn-primary flex-1 justify-center py-2 text-sm"
        >
          View Analysis
        </Link>
        <button
          onClick={() => onDelete(resume._id)}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
          title="Delete"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}