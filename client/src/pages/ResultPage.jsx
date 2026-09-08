/**
 * Result Page
 * Displays the full analysis result for a single resume
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import ScoreRing from "../components/ScoreRing";
import SkillBadge from "../components/SkillBadge";
import toast from "react-hot-toast";

export default function ResultPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/resume/${id}`);
        setResume(res.data.resume);
      } catch (err) {
        toast.error("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-slate-500">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Resume not found.</p>
          <Link to="/dashboard" className="btn-link mt-2 inline-block text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(resume.createdAt).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="btn-link mb-6 inline-flex items-center gap-2 text-sm"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="card mb-6 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{resume.fileName}</h1>
            <p className="mt-1 text-sm text-slate-500">{date}</p>
          </div>
          <Link
            to="/upload"
            className="btn-primary whitespace-nowrap"
          >
            + Analyze New Resume
          </Link>
        </div>
      </div>

      {/* Score + Feedback Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* ATS Score Ring */}
        <div className="card p-6 flex items-center justify-center">
          <ScoreRing score={resume.atsScore} size={150} />
        </div>

        {/* Feedback */}
        <div className="card p-6 sm:col-span-2">
          <p className="eyebrow mb-3">AI Feedback</p>
          <p className="leading-relaxed text-slate-700">{resume.feedback}</p>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-line bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums text-primary-dark">
                {resume.detectedSkills?.length || 0}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Skills Found</p>
            </div>
            <div className="rounded-lg border border-line bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums text-red-700">
                {resume.missingSkills?.length || 0}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Missing Skills</p>
            </div>
            <div className="rounded-lg border border-line bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums text-blue-800">
                {resume.keywords?.length || 0}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Keywords</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Detected Skills */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold text-slate-900">Detected Skills</h2>
            <span className="ml-auto rounded-md border border-line bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
              {resume.detectedSkills?.length}
            </span>
          </div>
          {resume.detectedSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.detectedSkills.map((skill) => (
                <SkillBadge key={skill} skill={skill} variant="detected" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No skills detected</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <h2 className="text-sm font-semibold text-slate-900">Suggested Skills to Add</h2>
            <span className="ml-auto rounded-md border border-line bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
              {resume.missingSkills?.length}
            </span>
          </div>
          {resume.missingSkills?.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {resume.missingSkills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} variant="missing" />
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Adding these skills can significantly improve your ATS score.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Great! No critical skills missing.</p>
          )}
        </div>
      </div>

      {/* Keywords */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900">Top Keywords</h2>
          <span className="ml-auto rounded-md border border-line bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
            {resume.keywords?.length}
          </span>
        </div>
        {resume.keywords?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resume.keywords.map((kw) => (
              <SkillBadge key={kw} skill={kw} variant="keyword" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No keywords extracted</p>
        )}
      </div>
    </div>
  );
}