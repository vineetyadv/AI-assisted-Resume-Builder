"use client";

import { useState } from "react";
import type { AtsResult, ContextHandshake, Phase, ResumeData } from "@/lib/types";

import ProgressStepper       from "@/components/ProgressStepper";
import ContextHandshakeModal from "@/components/ContextHandshakeModal";
import DataIngestion         from "@/components/DataIngestion";
import ResumePreview         from "@/components/ResumePreview";
import AtsReview             from "@/components/AtsReview";
import PdfExport             from "@/components/PdfExport";
import DarkModeToggle        from "@/components/DarkModeToggle";

export default function Home() {
  const [phase,      setPhase]      = useState<Phase>(1);
  const [context,    setContext]    = useState<ContextHandshake | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [atsResult,  setAtsResult]  = useState<AtsResult | null>(null);

  function handleContextSubmit(ctx: ContextHandshake) {
    setContext(ctx);
    setPhase(2);
  }

  function handleDraftReady(data: ResumeData) {
    setResumeData(data);
    setPhase(3);
  }

  function handleAtsReady(result: AtsResult) {
    setAtsResult(result);
    setPhase(5);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {phase === 1 && <ContextHandshakeModal onSubmit={handleContextSubmit} />}

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Top bar */}
        <header className="mb-10 text-center relative">
          <div className="absolute right-0 top-0">
            <DarkModeToggle />
          </div>

          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse dark:bg-blue-400" />
            Powered by Google Gemini
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            AI Resume Builder
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            From raw notes to a polished, ATS-optimized PDF — in minutes.
          </p>
        </header>

        {/* Context badge (Phase 2+) */}
        {context && phase > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-white px-5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Targeting:</span>
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {context.targetRole}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{context.experienceLevel}</span>
            <button
              className="ml-auto text-xs text-slate-400 hover:text-blue-600 transition-colors dark:hover:text-blue-400"
              onClick={() => { setPhase(1); setResumeData(null); setAtsResult(null); setContext(null); }}
            >
              Start Over
            </button>
          </div>
        )}

        {/* Progress stepper */}
        {phase > 1 && (
          <div className="mb-8 card px-6 py-5">
            <ProgressStepper phase={phase} />
          </div>
        )}

        {/* Phase content */}
        <main className="space-y-6">
          {phase === 2 && context && (
            <DataIngestion context={context} onNext={handleDraftReady} />
          )}

          {phase === 3 && resumeData && context && (
            <div className="space-y-5">
              <ResumePreview data={resumeData} />
              <div className="flex justify-end">
                <button className="btn-primary" onClick={() => setPhase(4)}>
                  Run ATS Analysis →
                </button>
              </div>
            </div>
          )}

          {phase === 4 && resumeData && context && (
            <AtsReview
              context={context}
              resumeData={resumeData}
              onNext={handleAtsReady}
            />
          )}

          {phase === 5 && resumeData && atsResult && (
            <div className="card p-6">
              <h2 className="section-title mb-5">Phase 5 — Export</h2>
              <PdfExport resumeData={resumeData} atsResult={atsResult} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
