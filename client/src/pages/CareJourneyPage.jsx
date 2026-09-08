/**
 * Page 5: Care Journey View
 * SehatSure - Policy-Integrated Care Planning
 * Interactive 5-Stage Policy-Integrated Admission & Treatment Checklist with
 * Session Persistence, Progress Bar, Reset Checklist, and Start New Case actions.
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import WorkflowStepper from "../components/WorkflowStepper";
import toast from "react-hot-toast";

const STAGES = [
  {
    id: "admission",
    title: "Admission",
    subtitle: "Pre-admission verification & cashless authorization",
    prompts: [
      { text: "Is the hospital's network / cashless status confirmed?", detail: "Verify with the hospital insurance desk prior to admission." },
      { text: "Is pre-authorization required?", detail: "Submit pre-authorization form at least 24-48 hours before planned admission." },
      { text: "Is your selected room within the policy's stated eligibility?", detail: "Ensure room rent caps match your policy to avoid proportionate deductions." },
      { text: "Have you submitted photo ID, policy card, and doctor recommendation letter?", detail: "Keep physical & digital copies ready for cashless desk." },
    ],
  },
  {
    id: "investigation",
    title: "Investigation",
    subtitle: "Diagnostic tests & pre-hospitalization coverage",
    prompts: [
      { text: "Ask whether planned investigations require pre-authorization.", detail: "High-cost imaging (MRI/CT scans) may need separate approvals." },
      { text: "Confirm which expenses are covered under policy pre-hospitalization terms.", detail: "Check pre-hospitalization window (e.g. 30 days prior to admission)." },
      { text: "Keep all original bills, prescription slips, and test reports organized.", detail: "Required for post-hospitalization reimbursement claims." },
    ],
  },
  {
    id: "procedure",
    title: "Procedure",
    subtitle: "Surgical / treatment authorization & expense verification",
    prompts: [
      { text: "Confirm procedure authorization status with cashless TPA desk.", detail: "Ensure initial sanction amount covers expected procedure cost." },
      { text: "Ask the hospital about expected non-covered out-of-pocket expenses.", detail: "Inquire about consumable charges, hygiene kits, or surgical gloves." },
      { text: "Verify if procedure falls under any specific waiting periods or sub-limits.", detail: "Review policy clause limits on specific surgeries (cataract, joint replacement)." },
    ],
  },
  {
    id: "recovery",
    title: "Recovery",
    subtitle: "In-patient monitoring & additional enhancement claims",
    prompts: [
      { text: "Keep track of daily hospital bills and supporting documents.", detail: "Ask TPA desk for interim billing updates if hospital stay extends." },
      { text: "Track policy-related enhancement request approvals.", detail: "If stay is prolonged, hospital will submit enhancement requests to TPA." },
      { text: "Verify post-operative medication prescriptions.", detail: "Check if discharge medications are included under hospital bill or separate claim." },
    ],
  },
  {
    id: "discharge",
    title: "Discharge",
    subtitle: "Final billing settlement & post-discharge documentation",
    prompts: [
      { text: "Confirm final bill and non-covered out-of-pocket items.", detail: "Pay non-payable items (gloves, administrative fees) directly at counter." },
      { text: "Collect final approval letter from TPA desk prior to leaving.", detail: "Ensure hospital receives final cashless authorization code." },
      { text: "Collect discharge summary, lab reports, pharmacy bills, and payment receipts.", detail: "Crucial for post-hospitalization claims (e.g. 60 days post-discharge)." },
    ],
  },
];

const TOTAL_ITEMS_COUNT = STAGES.reduce((sum, s) => sum + s.prompts.length, 0); // 16 items

export default function CareJourneyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const policyId = searchParams.get("policyId") || "";

  // Session-persisted hospital selection
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [specialty, setSpecialty] = useState("Oncology");
  const [insurer, setInsurer] = useState("Star Health & Allied Insurance");
  const [roomEligibility, setRoomEligibility] = useState("Single Private AC Room");

  const [activeStageId, setActiveStageId] = useState("admission");
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    // Load persisted selected hospital from session
    const storedHospStr = sessionStorage.getItem("selectedHospital");
    if (storedHospStr) {
      try {
        const parsed = JSON.parse(storedHospStr);
        setSelectedHospital(parsed);
      } catch (e) {}
    }

    const storedSpec = sessionStorage.getItem("selectedSpecialty");
    if (storedSpec) setSpecialty(storedSpec);

    const storedIns = sessionStorage.getItem("selectedInsurer");
    if (storedIns) setInsurer(storedIns);

    const storedRoom = sessionStorage.getItem("selectedRoomEligibility");
    if (storedRoom) setRoomEligibility(storedRoom);

    // Load persisted checklist state
    const storedChecklist = localStorage.getItem("hospitality_checklist");
    if (storedChecklist) {
      try {
        setCheckedItems(JSON.parse(storedChecklist));
      } catch (e) {}
    }
  }, []);

  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  const toggleCheck = (stageId, index) => {
    const key = `${stageId}_${index}`;
    const nextState = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(nextState);
    localStorage.setItem("hospitality_checklist", JSON.stringify(nextState));
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
    localStorage.removeItem("hospitality_checklist");
    toast.success("Checklist progress reset");
  };

  const handleStartNewCase = () => {
    sessionStorage.removeItem("selectedHospital");
    sessionStorage.removeItem("selectedSpecialty");
    localStorage.removeItem("hospitality_checklist");
    toast.success("Starting new case");
    navigate("/upload");
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TOTAL_ITEMS_COUNT) * 100);

  const displayHospitalName =
    selectedHospital?.hospitalName ||
    searchParams.get("hospitalName") ||
    "Chittaranjan National Cancer Institute";

  return (
    <div>
      {/* 5-Stage Workflow Stepper */}
      <WorkflowStepper currentStep={5} policyId={policyId} />

      <div className="page-container max-w-5xl py-10">
        {/* Selected context */}
        <div className="card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Active Hospital Care Journey</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {displayHospitalName}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Specialty:{" "}
                <span className="font-medium text-slate-700">{specialty}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                Insurer:{" "}
                <span className="font-medium text-slate-700">{insurer}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                Room:{" "}
                <span className="font-medium text-slate-700">
                  {roomEligibility}
                </span>
              </p>
            </div>
            <button onClick={handleStartNewCase} className="btn-secondary self-start lg:self-auto">
              Start New Case
            </button>
          </div>
        </div>

        {/* Overall progress */}
        <div className="card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="sm:w-2/5">
            <p className="text-xs font-medium text-slate-500">
              Administrative verification progress
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
              {completedCount} / {TOTAL_ITEMS_COUNT} items verified ({progressPercent}%)
            </p>
          </div>
          <div className="flex items-center gap-3 sm:flex-1">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {completedCount > 0 && (
              <button
                onClick={handleResetChecklist}
                className="btn-link whitespace-nowrap text-xs"
              >
                Reset checklist
              </button>
            )}
          </div>
        </div>

        {/* Stage tabs */}
        <div className="mb-6 border-b border-line">
          <div className="flex flex-wrap">
            {STAGES.map((stage, idx) => {
              const isActive = stage.id === activeStageId;
              const stageCompletedCount = stage.prompts.filter(
                (_, i) => !!checkedItems[`${stage.id}_${i}`]
              ).length;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`relative -mb-px min-w-[130px] flex-1 whitespace-nowrap border-b-2 px-3 py-3 text-xs transition-colors sm:text-sm ${
                    isActive
                      ? "border-primary font-semibold text-primary-dark"
                      : "border-transparent font-medium text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Stage {idx + 1} · {stage.title}
                  <span
                    className={`ml-1.5 text-xs tabular-nums ${
                      isActive ? "text-primary-dark/70" : "text-slate-400"
                    }`}
                  >
                    {stageCompletedCount}/{stage.prompts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active stage panel */}
        <div className="card overflow-hidden">
          <div className="border-b border-line bg-slate-50 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              {activeStage.title} stage checklist
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{activeStage.subtitle}</p>
          </div>

          {/* Verification checklist */}
          <ul className="divide-y divide-line">
            {activeStage.prompts.map((item, idx) => {
              const isChecked = !!checkedItems[`${activeStage.id}_${idx}`];
              return (
                <li
                  key={idx}
                  onClick={() => toggleCheck(activeStage.id, idx)}
                  className={`flex cursor-pointer items-start gap-3.5 px-6 py-4 transition-colors ${
                    isChecked ? "bg-primary-tint/40" : "hover:bg-slate-50/70"
                  }`}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCheck(activeStage.id, idx);
                    }
                  }}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isChecked
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isChecked ? "text-slate-400 line-through" : "text-slate-800"
                      }`}
                    >
                      {item.text}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom controls */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to Hospital Options
          </button>
          <button onClick={handleStartNewCase} className="btn-primary">
            Start New Case
          </button>
        </div>
      </div>
    </div>
  );
}