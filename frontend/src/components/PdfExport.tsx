"use client";

import { useState } from "react";
import type { AtsResult, ResumeData } from "@/lib/types";
import { exportPdf } from "@/lib/api";
import ResumePreview from "./ResumePreview";

interface Props {
  resumeData: ResumeData;
  atsResult:  AtsResult;
}

export default function PdfExport({ resumeData, atsResult }: Props) {
  const [loading,    setLoading]    = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error,      setError]      = useState("");

  async function handleDownload() {
    setError("");
    setLoading(true);
    try {
      const blob = await exportPdf(resumeData);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${resumeData.name.replace(/\s+/g, "_")}_Resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setLoading(false);
    }
  }

  const score = atsResult.ats_score;
  const scoreBand = score >= 75 ? "green" : score >= 50 ? "yellow" : "red";

  const scoreBg: Record<string, string> = {
    green:  "bg-green-50  border-green-200  dark:bg-green-900/20  dark:border-green-800/40",
    yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/40",
    red:    "bg-red-50    border-red-200    dark:bg-red-900/20    dark:border-red-800/40",
  };
  const scoreTxt: Record<string, string> = {
    green:  "text-green-600  dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    red:    "text-red-600    dark:text-red-400",
  };

  return (
    <div className="space-y-5">
      {/* Score summary */}
      <div className={`flex items-center justify-between rounded-xl border p-4 ${scoreBg[scoreBand]}`}>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Final ATS Score</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {atsResult.match_analysis.missing_keywords.length} keywords still missing
          </p>
        </div>
        <span className={`text-3xl font-bold ${scoreTxt[scoreBand]}`}>
          {score}<span className="text-base font-normal text-slate-400 dark:text-slate-500">/100</span>
        </span>
      </div>

      <ResumePreview data={resumeData} />

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {downloaded && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Your resume PDF has been downloaded!
        </div>
      )}

      <button
        className="btn-primary w-full justify-center py-3 text-base"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? "Generating PDF…" : downloaded ? "Download Again" : "⬇  Download Professional PDF"}
      </button>
    </div>
  );
}
