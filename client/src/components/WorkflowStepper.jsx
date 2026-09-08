/**
 * WorkflowStepper Component
 * SehatSure - Policy-Integrated Care Planning
 * 5-Stage linear workflow indicator with connected steps.
 */

import { Link, useLocation } from "react-router-dom";

const STAGES = [
  { step: 1, label: "Policy Upload", path: "/upload" },
  { step: 2, label: "Coverage Summary", path: "/policy" },
  { step: 3, label: "Search Criteria", path: "/find-hospitals" },
  { step: 4, label: "Results & Compare", path: "/hospital-results" },
  { step: 5, label: "Care Journey", path: "/care-journey" },
];

export default function WorkflowStepper({ currentStep, policyId }) {
  const location = useLocation();

  return (
    <div className="border-b border-line">
      <div className="page-container">
        <ol className="flex items-start justify-center overflow-x-auto py-5">
          {STAGES.map((s, idx) => {
            const isActive = currentStep === s.step;
            const isDone = currentStep > s.step;

            let targetPath = s.path;
            if (s.step === 2 && policyId) targetPath = `/policy/${policyId}`;
            if (s.step === 3 && policyId)
              targetPath = `/find-hospitals?policyId=${policyId}`;
            if (s.step === 4 && policyId)
              targetPath = `/hospital-results?policyId=${policyId}`;

            return (
              <li key={s.step} className="flex items-start">
                {idx > 0 && (
                  <span
                    className={`mt-5 h-px w-6 sm:w-16 ${
                      currentStep > s.step ? "bg-primary" : "bg-line-strong"
                    }`}
                  />
                )}
                <Link
                  to={targetPath}
                  className="flex w-24 flex-col items-center gap-2 text-center sm:w-32"
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : isDone
                        ? "border-primary-edge bg-primary-tint text-primary-dark"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {isDone ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.step
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap text-xs leading-tight transition-colors ${
                      isActive
                        ? "font-semibold text-slate-900"
                        : isDone
                        ? "font-medium text-slate-800"
                        : "text-slate-700"
                    }`}
                  >
                    {s.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}