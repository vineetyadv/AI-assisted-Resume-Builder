"use client";

import { useRef, useState } from "react";
import type { ContextHandshake, ResumeData } from "@/lib/types";
import { generateDraft, parsePdf } from "@/lib/api";

interface Props {
  context: ContextHandshake;
  onNext: (data: ResumeData) => void;
}

type Tab = "notes" | "pdf";

export default function DataIngestion({ context, onNext }: Props) {
  const [tab, setTab]         = useState<Tab>("notes");
  const [notes, setNotes]     = useState("");
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      let result: ResumeData;
      if (tab === "notes") {
        if (!notes.trim()) { setError("Please enter some notes about your background."); return; }
        result = await generateDraft(context, notes);
      } else {
        if (!file) { setError("Please upload a PDF resume."); return; }
        result = await parsePdf(file, context);
      }
      onNext(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="section-title mb-4">Phase 2 — Data Ingestion</h2>

      {/* Tab switcher */}
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700/60">
        {(["notes", "pdf"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all
              ${tab === t
                ? "bg-white shadow text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            {t === "notes" ? "✏️  Raw Notes" : "📄  Upload PDF"}
          </button>
        ))}
      </div>

      {tab === "notes" ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Paste your experience, skills, education — anything raw
          </label>
          <textarea
            className="textarea h-52"
            placeholder={"5 years at Google as SWE, led payments infra team...\nSkills: Java, Kotlin, Kubernetes, distributed systems...\nEducation: B.Tech CSE NIT 2018 8.7 CGPA..."}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-700/40 dark:hover:border-blue-500 dark:hover:bg-slate-700"
          onClick={() => fileRef.current?.click()}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          {file ? (
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to upload PDF</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Max 10 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {tab === "pdf" && !file && (
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          If PDF parsing fails, you will automatically be switched to manual entry.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (<><Spinner /> Gemini is synthesizing…</>) : "Synthesize with AI →"}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
}
