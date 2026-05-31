"use client";

import { useState } from "react";
import type { AtsResult, ContextHandshake, ResumeData } from "@/lib/types";
import { predictAts } from "@/lib/api";

interface Props {
  context: ContextHandshake;
  resumeData: ResumeData;
  onNext: (result: AtsResult) => void;
}

export default function AtsReview({ context, resumeData, onNext }: Props) {
  const [jd, setJd]           = useState("");
  const [result, setResult]   = useState<AtsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleAnalyze() {
    if (!jd.trim()) { setError("Please paste the job description."); return; }
    setError("");
    setLoading(true);
    try {
      const r = await predictAts(context, resumeData, jd);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ATS analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.ats_score >= 75 ? "text-green-600 dark:text-green-400"
    : result.ats_score >= 50 ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400"
    : "";

  const ringColor = result
    ? result.ats_score >= 75 ? "stroke-green-500"
    : result.ats_score >= 50 ? "stroke-yellow-500"
    : "stroke-red-500"
    : "";

  return (
    <div className="card p-6">
      <h2 className="section-title mb-4">Phase 4 — ATS Review</h2>

      {!result ? (
        <>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Paste the Job Description
          </label>
          <textarea
            className="textarea h-52"
            placeholder="We are looking for a Senior Frontend Engineer with 5+ years of experience in React…"
            value={jd}
            onChange={e => { setJd(e.target.value); setError(""); }}
          />
          {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing…" : "Run ATS Analysis →"}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Score gauge */}
          <div className="flex items-center gap-6 rounded-xl bg-slate-50 p-5 dark:bg-slate-700/50">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-600" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  className={ringColor}
                  strokeWidth="3"
                  strokeDasharray={`${result.ats_score} ${100 - result.ats_score}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold leading-none ${scoreColor}`}>{result.ats_score}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">/ 100</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">ATS Score</p>
              <p className={`text-sm font-bold ${scoreColor}`}>
                {result.ats_score >= 75 ? "Strong Match ✓"
                 : result.ats_score >= 50 ? "Needs Work"
                 : "Significant Gaps"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{result.formatting_feedback}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold
                ${result.is_ready_for_application
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                {result.is_ready_for_application ? "Ready to Apply" : "Needs Improvement"}
              </span>
            </div>
          </div>

          {/* Keyword analysis */}
          <div className="grid gap-4 sm:grid-cols-2">
            <KeywordGroup label="Found Keywords ✓" color="green" items={result.match_analysis.found_keywords} />
            <KeywordGroup label="Missing Keywords ✗" color="red"   items={result.match_analysis.missing_keywords} />
          </div>

          {result.match_analysis.critical_gaps.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical Gaps</p>
              <ul className="space-y-1">
                {result.match_analysis.critical_gaps.map((g, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-300">• {g}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.improvement_suggestions.length > 0 && (
            <div>
              <p className="section-title mb-3">Improvement Suggestions</p>
              <div className="space-y-3">
                {result.improvement_suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-900/20">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">{s.section}</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{s.advice}</p>
                    {s.example && (
                      <p className="mt-1.5 rounded bg-white px-3 py-1.5 text-xs text-slate-600 font-mono border border-blue-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
                        {s.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setResult(null)}>Try Another JD</button>
            <button className="btn-primary"   onClick={() => onNext(result)}>Proceed to Export →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function KeywordGroup({ label, color, items }: { label: string; color: "green" | "red"; items: string[] }) {
  const g = color === "green";
  return (
    <div className={`rounded-lg border p-4 ${g
      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/40"
      : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/40"}`}>
      <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${g
        ? "text-green-700 dark:text-green-400"
        : "text-red-700 dark:text-red-400"}`}>{label}</p>
      {items.length === 0
        ? <p className="text-xs text-slate-400 dark:text-slate-500">None</p>
        : <div className="flex flex-wrap gap-1.5">
            {items.map(k => (
              <span key={k} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${g
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>{k}</span>
            ))}
          </div>
      }
    </div>
  );
}
