import type { AtsResult, ContextHandshake, ResumeData } from "./types";

const BASE = "/api";

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function generateDraft(
  context: ContextHandshake,
  rawNotes: string
): Promise<ResumeData> {
  const res = await fetch(`${BASE}/generate-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, rawNotes }),
  });
  return unwrap<ResumeData>(res);
}

export async function parsePdf(
  file: File,
  context: ContextHandshake
): Promise<ResumeData> {
  const form = new FormData();
  form.append("file", file);
  form.append("context", JSON.stringify(context));

  const res = await fetch(`${BASE}/parse-pdf`, { method: "POST", body: form });
  return unwrap<ResumeData>(res);
}

export async function predictAts(
  context: ContextHandshake,
  resumeData: ResumeData,
  jobDescription: string
): Promise<AtsResult> {
  const res = await fetch(`${BASE}/predict-ats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, resumeData, jobDescription }),
  });
  return unwrap<AtsResult>(res);
}

export async function exportPdf(resumeData: ResumeData): Promise<Blob> {
  const res = await fetch(`${BASE}/export-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resumeData),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
  return res.blob();
}
