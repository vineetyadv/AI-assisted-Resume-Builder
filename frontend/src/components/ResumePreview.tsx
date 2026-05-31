"use client";

import type { ResumeData } from "@/lib/types";

export default function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-700/50">
        <p className="section-title">Resume Preview</p>
      </div>

      <div className="overflow-y-auto px-6 py-5 text-sm" style={{ maxHeight: "60vh" }}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{data.name}</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {[data.email, data.phone, data.linkedin].filter(Boolean).join("  ·  ")}
        </p>

        {data.summary && (
          <Section title="Summary">
            <p className="text-slate-600 leading-relaxed dark:text-slate-300">{data.summary}</p>
          </Section>
        )}

        {data.work_experience && data.work_experience.length > 0 && (
          <Section title="Experience">
            {data.work_experience.map((w, i) => (
              <div key={i} className="mb-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{w.role}</span>
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{w.duration}</span>
                </div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{w.company}</p>
                <ul className="mt-1.5 space-y-1">
                  {w.bullets?.map((b, j) => (
                    <li key={j} className="flex gap-2 text-slate-600 dark:text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {data.education && data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{e.degree}</span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">{e.institution}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{e.year}</span>
              </div>
            ))}
          </Section>
        )}

        {data.skills && data.skills.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <span key={s} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <Section title="Certifications">
            <ul className="space-y-1">
              {data.certifications.map((c, i) => (
                <li key={i} className="text-slate-600 dark:text-slate-300">• {c}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{title}</p>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      {children}
    </div>
  );
}
