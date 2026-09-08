/**
 * Dashboard Page
 * SehatSure - Policy-Integrated Care Planning
 * Displays the user's uploaded insurance policies in a structured list,
 * with coverage summaries and hospital search actions.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/policy/history");
        setPolicies(res.data.policies || []);
      } catch (err) {
        console.error("Dashboard policy fetch error:", err);
        toast.error("Failed to load policy history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalSumInsured = policies.reduce((sum, pol) => {
    const value = pol.structuredPolicy?.sumInsured;
    return typeof value === "number" ? sum + value : sum;
  }, 0);

  const networkOnlyCount = policies.filter(
    (pol) => pol.structuredPolicy?.networkRequirement === true
  ).length;

  const handleDeletePolicy = async (pol) => {
    const confirmed = window.confirm(
      `Delete "${pol.fileName}"?\n\nThis permanently removes its analysis and stored document from your account.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/policy/${pol._id}`);
      setPolicies((prev) => prev.filter((p) => p._id !== pol._id));
      toast.success("Policy deleted");
    } catch (err) {
      console.error("Policy delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete policy");
    }
  };

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Policies</h1>
          <p className="page-desc">
            Manage your analyzed insurance policies and run policy-integrated
            hospital matching.
          </p>
        </div>
        <Link to="/upload" className="btn-primary self-start sm:self-auto">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Upload Insurance Policy
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-24">
          <div className="spinner" />
          <p className="text-sm text-slate-500">Loading your insurance policies...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && policies.length === 0 && (
        <div className="card mx-auto my-16 max-w-lg p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-line bg-slate-50">
            <svg
              className="h-6 w-6 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
            </svg>
          </span>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            No insurance policies analyzed yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Upload your health insurance policy document to extract structured
            coverage limits, room eligibility, network constraints, and find
            compatible hospitals.
          </p>
          <Link to="/upload" className="btn-primary mt-6">
            Upload Insurance Policy
          </Link>
        </div>
      )}

      {/* Policy summary stats */}
      {!loading && policies.length > 0 && (
        <>
          <div className="mt-8 grid overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-3">
            <div className="px-6 py-5 sm:border-r sm:border-line">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Policies analyzed
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {policies.length}
              </p>
            </div>
            <div className="border-t border-line px-6 py-5 sm:border-l-0 sm:border-t-0 sm:border-r sm:border-line">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total sum insured
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {totalSumInsured > 0
                  ? `₹${totalSumInsured.toLocaleString("en-IN")}`
                  : "—"}
              </p>
            </div>
            <div className="border-t border-line px-6 py-5 sm:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Network-only policies
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {networkOnlyCount}
              </p>
            </div>
          </div>

          {/* Policy list */}
          <div className="card mt-8 overflow-hidden">
            {/* Table header */}
            <div className="hidden grid-cols-12 gap-4 border-b border-line bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
              <div className="col-span-4">Policy document</div>
              <div className="col-span-2">Insurer</div>
              <div className="col-span-2 text-right">Sum insured</div>
              <div className="col-span-2">Room category</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {policies.map((pol) => {
              const p = pol.structuredPolicy || {};
              const date = new Date(pol.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={pol._id}
                  className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-line px-6 py-4 transition-colors last:border-b-0 hover:bg-slate-50/70 md:grid-cols-12"
                >
                  <div className="col-span-2 md:col-span-4">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {pol.fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.policyType || "Comprehensive Policy"} · {date}
                    </p>
                  </div>
                  <div className="truncate text-sm text-slate-700 md:col-span-2">
                    {p.insurer || "Extracted policy"}
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900 md:col-span-2 md:text-right">
                    {p.sumInsured
                      ? `₹${p.sumInsured.toLocaleString("en-IN")}`
                      : "—"}
                  </div>
                  <div className="truncate text-sm text-slate-600 md:col-span-2">
                    {p.roomEligibility || "Not specified"}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-4 md:col-span-2">
                    <Link
                      to={`/policy/${pol._id}`}
                      className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                      Summary
                    </Link>
                    <Link
                      to={`/find-hospitals?policyId=${pol._id}`}
                      className="text-sm font-medium text-primary-dark transition-colors hover:text-primary"
                    >
                      Find hospitals
                    </Link>
                    <button
                      onClick={() => handleDeletePolicy(pol)}
                      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}