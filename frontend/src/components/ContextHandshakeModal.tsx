"use client";

import { useState } from "react";
import type { ContextHandshake } from "@/lib/types";

const EXP_LEVELS = [
  "Fresher (0–1 yrs)",
  "Junior (1–3 yrs)",
  "Mid-level (3–6 yrs)",
  "Senior (6–10 yrs)",
  "Principal / Staff (10+ yrs)",
];

interface Props {
  onSubmit: (ctx: ContextHandshake) => void;
}

export default function ContextHandshakeModal({ onSubmit }: Props) {
  const [targetRole,       setTargetRole]       = useState("");
  const [experienceLevel,  setExperienceLevel]  = useState(EXP_LEVELS[0]);
  const [error,            setError]            = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetRole.trim()) { setError("Please enter the role you are targeting."); return; }
    onSubmit({ targetRole: targetRole.trim(), experienceLevel });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm dark:bg-slate-950/80">
      <div className="card w-full max-w-md p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Context Handshake</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tell Gemini who you are, so it tailors every word.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Target Role <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Senior Frontend Engineer"
              value={targetRole}
              onChange={e => { setTargetRole(e.target.value); setError(""); }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Experience Level
            </label>
            <select
              className="input"
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value)}
            >
              {EXP_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center">
            Let&apos;s Build My Resume →
          </button>
        </form>
      </div>
    </div>
  );
}
