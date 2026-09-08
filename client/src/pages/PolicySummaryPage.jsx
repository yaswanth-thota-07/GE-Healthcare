/**
 * Page 2: Insurance Policy Summary View
 * SehatSure - Policy-Integrated Care Planning
 * Displays extracted structured policy terms, room eligibility, network requirements,
 * exclusions, and waiting periods with a banded panel layout.
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import WorkflowStepper from "../components/WorkflowStepper";

const AlertIcon = () => (
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
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const WalletIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" />
    <path d="M3 8V6a1 1 0 0 1 1-1h13M16 12h.01" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-line-strong bg-white">
      <div className="flex items-center gap-3 border-b border-line bg-slate-50 px-5 py-3.5">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-tint text-primary-darker">
            {icon}
          </span>
        )}
        <div>
          <h2 className="section-title leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ icon, value, unit, label, sub }) {
  return (
    <div className="rounded-lg border border-line-strong bg-slate-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary-edge bg-primary-tint text-primary-darker">
          {icon}
        </span>
        <p className="text-[32px] font-semibold leading-none tabular-nums text-slate-900">
          {value}
          {unit && (
            <span className="ml-1 align-baseline text-base font-medium text-slate-500">
              {unit}
            </span>
          )}
        </p>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

export default function PolicySummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policyDoc, setPolicyDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await api.get(`/policy/${id}`);
        setPolicyDoc(res.data.policy);
      } catch (err) {
        toast.error("Failed to load policy analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm text-slate-500">Loading coverage summary...</p>
        </div>
      </div>
    );
  }

  if (!policyDoc) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Insurance policy analysis not found.
          </p>
          <Link to="/upload" className="btn-link mt-2">
            Upload Policy PDF
          </Link>
        </div>
      </div>
    );
  }

  const p = policyDoc.structuredPolicy || {};
  const notSpecifiedText = "Not specified in uploaded document";
  const date = new Date(policyDoc.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <WorkflowStepper currentStep={2} policyId={id} />
      <div className="page-container max-w-5xl py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Step 2 of 5 · Coverage Summary</p>
            <h1 className="page-title mt-2">Your coverage summary</h1>
            <p className="page-desc">
              Extracted terms from policy document:{" "}
              <span className="font-medium text-slate-900">{policyDoc.fileName}</span>
              <span className="text-slate-400"> · {date}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(`/find-hospitals?policyId=${policyDoc._id}`)}
            className="btn-primary self-start sm:self-auto"
          >
            Find Suitable Hospitals
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
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Coverage summary */}
        <SectionCard
          title="Coverage summary"
          subtitle="Generated from the text found in your uploaded policy"
        >
          <div className="flex gap-3.5 rounded-lg border border-primary-edge bg-primary-tint/60 px-4 py-4">
            <span className="mt-0.5 shrink-0 text-primary-darker">
              <CheckCircleIcon />
            </span>
            <p className="text-[15px] leading-relaxed text-slate-700">
              {p.executiveSummary ||
                "A detailed policy briefing was not available for this document. Review the extracted fields below and confirm missing terms with your insurer."}
            </p>
          </div>
        </SectionCard>

        {/* Coverage fields */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <SectionCard
            title="Insurance overview"
          >
            <dl className="divide-y divide-line-strong text-sm">
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-slate-600">Insurer</dt>
                <dd className="text-right font-medium text-slate-900">
                  {p.insurer || notSpecifiedText}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-slate-600">Policy type</dt>
                <dd className="text-right font-medium text-slate-900">
                  {p.policyType || notSpecifiedText}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-slate-600">Sum insured</dt>
                <dd className="text-right text-lg font-semibold tabular-nums text-primary-dark">
                  {p.sumInsured
                    ? `₹${p.sumInsured.toLocaleString("en-IN")}`
                    : notSpecifiedText}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-slate-600">Policy number</dt>
                <dd className="text-right font-mono text-sm text-slate-700">
                  {p.policyNumber || notSpecifiedText}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard
            title="Room & network eligibility"
          >
            <dl className="divide-y divide-line-strong text-sm">
              <div className="py-3">
                <dt className="text-slate-600">Room category</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {p.roomEligibility
                    ? `Your uploaded policy states: ${p.roomEligibility}`
                    : notSpecifiedText}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-slate-600">Network requirement</dt>
                <dd className="text-right font-medium text-slate-900">
                  {p.networkRequirement === true
                    ? "Network hospital required for cashless claims"
                    : p.networkRequirement === false
                    ? "No strict network restriction"
                    : notSpecifiedText}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-slate-600">Cashless availability</dt>
                <dd className="text-right font-medium text-slate-900">
                  {p.cashlessAvailable === true
                    ? "Cashless facility available at empanelled network hospitals"
                    : p.cashlessAvailable === false
                    ? "Reimbursement basis only"
                    : notSpecifiedText}
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        {/* Hospitalization coverage */}
        <SectionCard
          title="Hospitalization coverage"
          subtitle="Coverage windows and limits from your policy"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              icon={<ClockIcon />}
              value={p.preHospitalizationDays || 0}
              unit="days"
              label="Pre-hospitalization"
              sub={
                p.preHospitalizationDays
                  ? "Coverage prior to admission"
                  : notSpecifiedText
              }
            />
            <StatCard
              icon={<ClockIcon />}
              value={p.postHospitalizationDays || 0}
              unit="days"
              label="Post-hospitalization"
              sub={
                p.postHospitalizationDays
                  ? "Coverage after discharge"
                  : notSpecifiedText
              }
            />
            <StatCard
              icon={<WalletIcon />}
              value={
                p.sumInsured ? `₹${p.sumInsured.toLocaleString("en-IN")}` : "—"
              }
              label="Maximum coverage"
              sub={
                p.sumInsured
                  ? "Sum insured from policy document"
                  : notSpecifiedText
              }
            />
            <StatCard
              icon={<CheckCircleIcon />}
              value={p.coveredBenefits?.length || 0}
              label="Covered benefits"
              sub={
                p.coveredBenefits?.length
                  ? "Benefits clearly listed in policy"
                  : notSpecifiedText
              }
            />
          </div>
        </SectionCard>

        {/* Important things to know */}
        <SectionCard
          title="Important things to know"
          subtitle="Key points to keep in mind about this policy"
          icon={<AlertIcon />}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TipPanel
              title="Covered benefits"
              tone="success"
              items={p.coveredBenefits}
              notSpecifiedText={notSpecifiedText}
            />
            <TipPanel
              title="Exclusions"
              tone="error"
              items={p.exclusions}
              notSpecifiedText={notSpecifiedText}
            />
            <TipPanel
              title="Waiting periods"
              tone="warning"
              items={p.waitingPeriods}
              notSpecifiedText={notSpecifiedText}
            />
            <TipPanel
              title="Key clauses"
              tone="info"
              items={p.importantClauses}
              notSpecifiedText={notSpecifiedText}
            />
            <TipPanel
              title="Financial conditions"
              tone="warning"
              items={p.financialConditions}
              notSpecifiedText={notSpecifiedText}
            />
            <TipPanel
              title="Claim & admission"
              tone="info"
              items={p.claimRequirements}
              notSpecifiedText={notSpecifiedText}
            />
          </div>
        </SectionCard>

        {/* Bottom CTA */}
        <div className="mt-8 flex flex-col gap-4 rounded-lg border border-line-strong bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Ready to find hospital options?
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              We will match your policy constraints against suitable hospitals.
            </p>
          </div>
          <button
            onClick={() => navigate(`/find-hospitals?policyId=${policyDoc._id}`)}
            className="btn-primary whitespace-nowrap"
          >
            Find Suitable Hospitals →
          </button>
        </div>
      </div>
    </div>
  );
}

const TONES = {
  success: {
    top: "border-t-green-700",
    head: "bg-green-50",
    headText: "text-green-800",
    bullet: "bg-green-700",
  },
  error: {
    top: "border-t-red-700",
    head: "bg-red-50",
    headText: "text-red-800",
    bullet: "bg-red-700",
  },
  warning: {
    top: "border-t-amber-700",
    head: "bg-amber-50",
    headText: "text-amber-800",
    bullet: "bg-amber-700",
  },
  info: {
    top: "border-t-blue-700",
    head: "bg-blue-50",
    headText: "text-blue-800",
    bullet: "bg-blue-700",
  },
};

function TipPanel({ title, tone, items, notSpecifiedText }) {
  const palette = TONES[tone];
  const limitedItems = (items || []).slice(0, 5);
  return (
    <div className={`rounded-lg border border-line bg-white border-t-2 ${palette.top}`}>
      <div className={`rounded-t-lg border-b border-line px-4 py-2.5 ${palette.head}`}>
        <h3 className={`text-sm font-semibold ${palette.headText}`}>{title}</h3>
      </div>
      <div className="px-4 py-3">
        {limitedItems.length > 0 ? (
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
            {limitedItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${palette.bullet}`} />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-slate-500">{notSpecifiedText}</p>
        )}
      </div>
    </div>
  );
}