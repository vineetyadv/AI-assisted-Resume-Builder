"use client";

import type { Phase } from "@/lib/types";

const STEPS: { label: string; subtitle: string }[] = [
  { label: "Context",    subtitle: "Role & Level"  },
  { label: "Ingest",     subtitle: "Notes or PDF"  },
  { label: "Synthesize", subtitle: "AI Draft"      },
  { label: "ATS Review", subtitle: "Score vs JD"   },
  { label: "Export",     subtitle: "Download PDF"  },
];

export default function ProgressStepper({ phase }: { phase: Phase }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const stepNum = (i + 1) as Phase;
          const isDone    = stepNum < phase;
          const isCurrent = stepNum === phase;

          return (
            <li key={step.label} className="flex flex-1 flex-col items-center gap-1.5 relative">
              {/* connector */}
              {i < STEPS.length - 1 && (
                <span
                  className={`absolute left-1/2 top-4 h-0.5 w-full translate-x-[1.5rem] transition-colors duration-300
                    ${isDone ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                />
              )}

              {/* circle */}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300
                  ${isDone    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900" : ""}
                  ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-200 dark:ring-blue-900 dark:shadow-blue-900" : ""}
                  ${!isDone && !isCurrent ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:border-slate-600" : ""}`}
              >
                {isDone ? "✓" : stepNum}
              </span>

              <span className={`text-xs font-semibold leading-tight text-center
                ${isCurrent ? "text-blue-600 dark:text-blue-400"
                : isDone    ? "text-slate-700 dark:text-slate-200"
                :             "text-slate-400 dark:text-slate-500"}`}>
                {step.label}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
                {step.subtitle}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
