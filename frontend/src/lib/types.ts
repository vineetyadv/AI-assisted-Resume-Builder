export interface ContextHandshake {
  targetRole: string;
  experienceLevel: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  summary?: string;
  work_experience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  certifications?: string[];
}

export interface MatchAnalysis {
  found_keywords: string[];
  missing_keywords: string[];
  critical_gaps: string[];
}

export interface ImprovementSuggestion {
  section: string;
  advice: string;
  example: string;
}

export interface AtsResult {
  ats_score: number;
  match_analysis: MatchAnalysis;
  formatting_feedback: string;
  improvement_suggestions: ImprovementSuggestion[];
  is_ready_for_application: boolean;
}

export type Phase = 1 | 2 | 3 | 4 | 5;
