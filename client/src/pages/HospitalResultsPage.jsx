/**
 * Page 4: Hospital Results & Comparison View
 * SehatSure - Policy-Integrated Care Planning
 * Displays ranked hospital options, recommended match breakdown, side-by-side
 * comparison, contrast analysis, indicative cost comparison, and selected
 * hospital session persistence.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import WorkflowStepper from "../components/WorkflowStepper";

const formatInsuredValue = (value) =>
  value ? `₹${value.toLocaleString("en-IN")}` : "Not specified in uploaded document";

export default function HospitalResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const policyId = searchParams.get("policyId");
  const specialty = searchParams.get("specialty") || "Oncology";
  const selectedState = searchParams.get("state") || "";
  const selectedDistrict = searchParams.get("district") || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Comparison state (up to 3 selected hospitals)
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [expandedHospital, setExpandedHospital] = useState(null);

  useEffect(() => {
    if (!policyId) {
      toast.error("No policy selected for hospital search");
      navigate("/find-hospitals");
      return;
    }

    const fetchHospitals = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const query = new URLSearchParams({
          policyId,
          specialty,
        });
        if (selectedState) query.set("state", selectedState);
        if (selectedDistrict) query.set("district", selectedDistrict);

        const res = await api.get(`/hospitals/search?${query.toString()}`);
        setData(res.data);

        // Pre-select top 2 hospitals for quick comparison if available
        if (res.data?.results?.length >= 2) {
          setSelectedForComparison([res.data.results[0], res.data.results[1]]);
        } else if (res.data?.results?.length === 1) {
          setSelectedForComparison([res.data.results[0]]);
        }
      } catch (err) {
        console.error("Hospital search error:", err);
        setErrorMsg(
          err.response?.data?.message || "Failed to fetch ranked hospital results."
        );
        toast.error("Error running hospital search");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [policyId, specialty, selectedState, selectedDistrict, navigate]);

  const toggleCompareSelect = (h) => {
    const exists = selectedForComparison.some(
      (item) => item.hospitalName === h.hospitalName && item.rank === h.rank
    );
    if (exists) {
      setSelectedForComparison((prev) =>
        prev.filter(
          (item) =>
            !(item.hospitalName === h.hospitalName && item.rank === h.rank)
        )
      );
    } else {
      if (selectedForComparison.length >= 3) {
        toast.error("You can compare up to 3 hospitals at a time");
        return;
      }
      setSelectedForComparison((prev) => [...prev, h]);
    }
  };

  const handleSelectHospitalForJourney = (h) => {
    // Persist selected hospital object & context in session storage
    sessionStorage.setItem("selectedHospital", JSON.stringify(h));
    sessionStorage.setItem("selectedSpecialty", specialty);
    if (data?.policyContext?.insurer) {
      sessionStorage.setItem("selectedInsurer", data.policyContext.insurer);
    }
    if (data?.policyContext?.roomEligibility) {
      sessionStorage.setItem(
        "selectedRoomEligibility",
        data.policyContext.roomEligibility
      );
    }

    toast.success(`Selected ${h.hospitalName} for Care Journey`);
    navigate(
      `/care-journey?hospitalName=${encodeURIComponent(h.hospitalName)}&policyId=${policyId}`
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="spinner" />
          <p className="text-base font-medium text-slate-800">
            Finding hospitals that fit your selected criteria...
          </p>
          <p className="text-xs text-slate-500">
            Evaluating specialty match, policy fit, dataset ratings, and
            nationwide options...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="page-container max-w-2xl py-16">
        <div className="card p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50">
            <svg
              className="h-6 w-6 text-red-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3.5l9 16H3z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Search error</h2>
          <p className="mt-2 text-sm text-slate-600">{errorMsg}</p>
          <button
            onClick={() => navigate("/find-hospitals")}
            className="btn-secondary mt-6"
          >
            Back to Search Form
          </button>
        </div>
      </div>
    );
  }

  const results = data?.results || [];
  const policyContext = data?.policyContext || {};
  const localResultCount = data?.searchContext?.localResultCount || 0;
  const nationwideAlternativeCount = data?.searchContext?.nationwideAlternativeCount || 0;
  const topHospital = results.length > 0 ? results[0] : null;
  const cityHospital = selectedDistrict || selectedState
    ? results.find((hospital) => hospital.isSelectedLocation)
    : null;

  return (
    <div>
      {/* 5-Stage Workflow Stepper */}
      <WorkflowStepper currentStep={4} policyId={policyId} />

      <div className="page-container py-10">
        {/* Page title & controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="page-title">Hospital Options</h1>
            <p className="page-desc">
              {selectedDistrict
                ? `${selectedDistrict}, ${selectedState}`
                : "Nationwide"}{" "}
              options from the PM-JAY dataset for{" "}
              <span className="font-semibold text-primary-dark">{specialty}</span>,
              matched against your uploaded policy.
            </p>
            {selectedDistrict && nationwideAlternativeCount > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {localResultCount} unique hospital
                {localResultCount === 1 ? "" : "s"} found in {selectedDistrict};
                showing {nationwideAlternativeCount} additional unique nationwide
                alternatives.
              </p>
            )}
          </div>

          <div className="flex items-center pt-1">
            {selectedForComparison.length >= 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="btn-primary"
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
                  <path d="M8 3H5a1 1 0 0 0-1 1v3M16 3h3a1 1 0 0 1 1 1v3M8 21H5a1 1 0 0 1-1-1v-3M16 21h3a1 1 0 0 0 1-1v-3" />
                  <path d="M8 12h8" />
                </svg>
                Compare Hospitals ({selectedForComparison.length})
              </button>
            )}
          </div>
        </div>

        {/* Selected city recommendation */}
        {cityHospital && (
          <section className="card mt-10 p-7 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="eyebrow">Recommended in {cityHospital.district}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {cityHospital.hospitalName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cityHospital.district}, {cityHospital.state}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(cityHospital.syntheticProfile?.acceptedInsurers || []).map(
                    (ins) => {
                      const isYourInsurer =
                        policyContext.insurer &&
                        policyContext.insurer
                          .toLowerCase()
                          .includes(ins.split(" (")[0].toLowerCase());
                      return (
                        <span
                          key={ins}
                          className={`chip ${
                            isYourInsurer
                              ? "border-primary-edge bg-primary-tint font-medium text-primary-darker"
                              : ""
                          }`}
                        >
                          {ins}
                        </span>
                      );
                    }
                  )}
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
                  {cityHospital.whyRecommended}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    City match score
                  </p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
                    {cityHospital.matchScore}
                    <span className="text-sm font-normal text-slate-500">
                      {" "}
                      / 100
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {cityHospital.indicativeCost}
                  </p>
                </div>
                <button
                  onClick={() => handleSelectHospitalForJourney(cityHospital)}
                  className="btn-primary"
                >
                  Select Hospital
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Nationwide #1 best match */}
        {topHospital && (
          <section className="card mt-8 p-7 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <span className="chip bg-primary-tint font-semibold text-primary-darker">
                  Rank #1 · Recommended match
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {topHospital.hospitalName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {topHospital.district}, {topHospital.state}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(topHospital.syntheticProfile?.acceptedInsurers || []).map(
                    (ins) => {
                      const isYourInsurer =
                        policyContext.insurer &&
                        policyContext.insurer
                          .toLowerCase()
                          .includes(ins.split(" (")[0].toLowerCase());
                      return (
                        <span
                          key={ins}
                          className={`chip ${
                            isYourInsurer
                              ? "border-primary-edge bg-primary-tint font-medium text-primary-darker"
                              : ""
                          }`}
                        >
                          {ins}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Overall match score
                  </p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
                    {topHospital.matchScore}
                    <span className="text-sm font-normal text-slate-500">
                      {" "}
                      / 100
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleSelectHospitalForJourney(topHospital)}
                  className="btn-primary"
                >
                  Select Hospital for Journey
                </button>
              </div>
            </div>

            {/* Factor checklist */}
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-line bg-slate-50 px-5 py-4 text-sm md:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">Specialty match</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {topHospital.scoreBreakdown?.specialty ?? "—"}/
                  {topHospital.scoreBreakdown?.specialtyMax ?? "30"} pts
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Network tier</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {topHospital.syntheticProfile?.networkTier || "Standard"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Scope</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  Nationwide dataset
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Cost range</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {topHospital.indicativeCost}
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-slate-600">
              "{topHospital.whyRecommended}"
            </p>
          </section>
        )}

        {/* Main grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: policy factors */}
          <div className="lg:col-span-1">
            <aside className="card sticky top-24 border-line-strong p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Policy factors considered
              </h2>
              <dl className="mt-3 divide-y divide-line text-sm">
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-slate-500">Insurer</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {policyContext.insurer ||
                      "Not specified in uploaded document"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-slate-500">Sum insured</dt>
                  <dd className="text-right font-semibold text-primary-dark">
                    {formatInsuredValue(policyContext.sumInsured)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-slate-500">Room category</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {policyContext.roomEligibility ||
                      "Not specified in uploaded document"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-slate-500">Network</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {policyContext.networkRequirement === true
                      ? "Network hospital required"
                      : policyContext.networkRequirement === false
                      ? "No strict restriction"
                      : "Not specified in uploaded document"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-slate-500">Cashless availability</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {policyContext.cashlessAvailable === true
                      ? "Cashless facility available"
                      : policyContext.cashlessAvailable === false
                      ? "Reimbursement only"
                      : "Not clearly specified"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-slate-500">Policy type</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {policyContext.policyType ||
                      "Not specified in uploaded document"}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          {/* Right: hospital results */}
          <div className="space-y-8 lg:col-span-4">
            {results.length === 0 && (
              <div className="card p-10 text-center">
                <p className="text-sm text-slate-500">
                  No matching hospitals were found for your selected criteria.
                </p>
                <button
                  onClick={() => navigate(`/find-hospitals?policyId=${policyId}`)}
                  className="btn-secondary mt-4"
                >
                  Modify Search
                </button>
              </div>
            )}

            {results.map((h) => {
              const isTopMatch = h.isBestMatch;
              const b = h.scoreBreakdown || {};
              const isSelectedForCompare = selectedForComparison.some(
                (item) => item.hospitalName === h.hospitalName && item.rank === h.rank
              );

              return (
                <article
                  key={`${h.hospitalName}_${h.rank}`}
                  className="card border-line-strong p-6 shadow-sm"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={isSelectedForCompare}
                          onChange={() => toggleCompareSelect(h)}
                          className="h-4 w-4 rounded border-slate-300 accent-primary"
                        />
                        Compare
                      </label>

                      <span
                        className={`chip ${
                          isTopMatch
                            ? "border-primary-edge bg-primary-tint font-semibold text-primary-darker"
                            : ""
                        }`}
                      >
                        {isTopMatch
                          ? "Best match"
                          : `Rank #${h.rank} · ${h.recommendationLabel}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Match score
                      </p>
                      <p className="mt-0.5 text-3xl font-semibold tabular-nums text-slate-900">
                        {h.matchScore}
                        <span className="text-sm font-normal text-slate-500">
                          {" "}
                          / 100
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Hospital identity */}
                  <div className="mt-4">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {h.hospitalName}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {h.district}, {h.state}
                    </p>
                  </div>

                  {/* Key metrics */}
                  <dl className="mt-4 grid grid-cols-2 gap-0 rounded-lg border border-line bg-slate-50 px-4 py-3 text-sm sm:grid-cols-4 sm:divide-x sm:divide-line">
                    <div className="px-2 py-1.5">
                      <dt className="text-xs text-slate-500">Indicative cost</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">
                        {h.indicativeCost || "N/A"}
                      </dd>
                    </div>
                    <div className="px-2 py-1.5">
                      <dt className="text-xs text-slate-500">Dataset scope</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">Nationwide</dd>
                    </div>
                    <div className="px-2 py-1.5">
                      <dt className="text-xs text-slate-500">Simulated network</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">
                        {h.syntheticProfile?.networkTier || "Standard"}
                      </dd>
                    </div>
                    <div className="px-2 py-1.5">
                      <dt className="text-xs text-slate-500">Policy room fit</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">
                        {h.syntheticProfile?.roomEligibility || "Ward"}
                      </dd>
                    </div>
                  </dl>

                  {/* Specialties */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500">
                      Accepted insurers
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(h.syntheticProfile?.acceptedInsurers || []).map(
                        (ins) => {
                          const isYourInsurer =
                            policyContext.insurer &&
                            policyContext.insurer
                              .toLowerCase()
                              .includes(ins.split(" (")[0].toLowerCase());
                          return (
                            <span
                              key={ins}
                              className={`chip ${
                                isYourInsurer
                                  ? "border-primary-edge bg-primary-tint font-medium text-primary-darker"
                                  : ""
                              }`}
                            >
                              {ins}
                            </span>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Why this hospital */}
                  <div className="mt-4 rounded-lg border border-line bg-slate-50 p-4">
                    <h4 className="text-base font-semibold text-slate-900">
                      Why this hospital?
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {h.whyRecommended}
                    </p>
                  </div>

                  {/* Match score details */}
                  <div className="mt-4 rounded-lg border border-line bg-slate-50 p-4">
                    <button
                      onClick={() =>
                        setExpandedHospital(
                          expandedHospital === h.rank ? null : h.rank
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="text-base font-semibold text-slate-900">
                        Match score details
                      </span>
                      <span className="btn-link text-sm">
                        {expandedHospital === h.rank
                          ? "Hide details"
                          : "View match score details"}
                      </span>
                    </button>

                    {expandedHospital === h.rank && (
                      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-slate-500">
                            Specialty match
                          </dt>
                          <dd className="mt-0.5 font-medium tabular-nums text-slate-900">
                            {b.specialty || 0}/{b.specialtyMax || 30}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">
                            Insurance / network
                          </dt>
                          <dd className="mt-0.5 font-medium tabular-nums text-slate-900">
                            {b.insurance || 0}/{b.insuranceMax || 30}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Cost factor</dt>
                          <dd className="mt-0.5 font-medium tabular-nums text-slate-900">
                            {b.cost || 0}/{b.costMax || 10}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">
                            Hospital rating
                          </dt>
                          <dd className="mt-0.5 font-medium tabular-nums text-slate-900">
                            {b.rating || 0}/{b.ratingMax || 20}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-xs text-slate-500">
                      Select a hospital to continue to the care journey.
                    </span>
                    <button
                      onClick={() => handleSelectHospitalForJourney(h)}
                      className="btn-primary"
                    >
                      Select for Care Journey →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {showCompareModal && selectedForComparison.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="card flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Compare hospitals
                </h2>
                <p className="text-sm text-slate-500">
                  Side-by-side comparison of your selected options
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close comparison"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto px-6 py-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-3 pr-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parameter
                    </th>
                    {selectedForComparison.map((h) => (
                      <th key={`${h.hospitalName}_${h.rank}`} className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-900">
                          {h.hospitalName}
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">
                          {h.recommendationLabel}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-slate-700">
                  <tr>
                    <td className="py-3 pr-6 font-medium text-slate-500">
                      Match score
                    </td>
                    {selectedForComparison.map((h) => (
                      <td
                        key={`${h.hospitalName}_${h.rank}`}
                        className="px-4 py-3 text-base font-semibold tabular-nums text-slate-900"
                      >
                        {h.matchScore} / 100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-slate-500">
                      Indicative cost
                    </td>
                    {selectedForComparison.map((h) => (
                      <td key={`${h.hospitalName}_${h.rank}`} className="px-4 py-3">
                        {h.indicativeCost || "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-slate-500">
                      Network tier
                    </td>
                    {selectedForComparison.map((h) => (
                      <td key={`${h.hospitalName}_${h.rank}`} className="px-4 py-3">
                        {h.syntheticProfile?.networkTier || "Standard"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-slate-500">
                      Room category
                    </td>
                    {selectedForComparison.map((h) => (
                      <td key={`${h.hospitalName}_${h.rank}`} className="px-4 py-3">
                        {h.syntheticProfile?.roomEligibility || "Ward"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 align-top font-medium text-slate-500">
                      Accepted insurers
                    </td>
                    {selectedForComparison.map((h) => (
                      <td
                        key={`${h.hospitalName}_${h.rank}`}
                        className="px-4 py-3 align-top"
                      >
                        <div className="flex flex-wrap gap-1">
                          {(h.syntheticProfile?.acceptedInsurers || []).map(
                            (ins) => (
                              <span key={ins} className="chip">
                                {ins}
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Contrast analysis */}
            {selectedForComparison.length >= 2 && (
              <div className="mx-6 mb-5 rounded-lg border border-line bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  Why not the others?
                </h3>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                  {selectedForComparison.slice(1).map((alt) => {
                    const topH = selectedForComparison[0];
                    const diffText = `${topH.hospitalName} ranks ahead of ${alt.hospitalName} (${topH.matchScore} vs ${alt.matchScore}) on the current specialty, policy-network, cost, and rating comparison.`;
                    return (
                      <p key={`${alt.hospitalName}_${alt.rank}`}>
                        <span className="font-semibold text-slate-900">
                          vs Rank #{alt.rank} ({alt.hospitalName}):{" "}
                        </span>
                        {diffText}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button
                onClick={() => setShowCompareModal(false)}
                className="btn-secondary"
              >
                Close Comparison
              </button>
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  handleSelectHospitalForJourney(selectedForComparison[0]);
                }}
                className="btn-primary"
              >
                Select Best Match ({selectedForComparison[0].hospitalName}) →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}