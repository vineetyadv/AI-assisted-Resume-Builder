# AI-Assisted Resume Builder & ATS Analyzer

An end-to-end AI application that helps you build a professional resume from scratch or refine an existing one, with real-time ATS (Applicant Tracking System) scoring and a clean PDF export.

---

## Features

- **Context Handshake** — Set your target role and experience level to personalise every AI output
- **Dual Ingestion Modes** — Upload an existing PDF resume or paste raw notes; the AI structures it either way
- **AI Synthesis** — Converts unstructured input into a fully structured resume schema
- **ATS Scoring** — Paste any job description and get a 0–100 ATS score with keyword gap analysis and improvement suggestions
- **PDF Export** — Download a clean, single-column, ATS-friendly PDF generated on the server
- **Dark Mode** — Full light/dark theme support

---

## Tech Stack

| Layer | Technology |
|-------  |----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript |
| Backend | Java 24, Spring Boot 3.4, Spring AI 1.0 |
| AI Engine | Groq (Llama 3.3 70B) or Google Gemini 2.0 Flash via OpenAI-compatible API |
| PDF Ingestion | Spring AI PDF Document Reader (ETL pipeline) |
| PDF Export | OpenPDF |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│  Context → Ingest → AI Synthesis → ATS Review → Export  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST (JSON / multipart)
┌──────────────────────▼──────────────────────────────────┐
│               Spring Boot Backend (:8080)               │
│                                                         │
│  ResumeController                                       │
│    POST /api/parse-pdf      ← PDF upload                │
│    POST /api/generate-draft ← raw text notes            │
│    POST /api/predict-ats    ← resume + job description  │
│    POST /api/export-pdf     ← final resume JSON         │
│                                                         │
│  GeminiService (Spring AI ChatClient)                   │
│    ETL: PagePdfDocumentReader → TokenTextSplitter       │
│    Output: BeanOutputConverter → ResumeData / AtsResult │
└──────────────────────┬──────────────────────────────────┘
                       │ OpenAI-compatible REST
                 Groq / Gemini API
```

---

## Getting Started

### Prerequisites

- Java 24+
- Apache Maven 3.9+
- Node.js 20+
- An API key from [Groq](https://console.groq.com/keys) (free, 14,400 req/day) or [Google AI Studio](https://aistudio.google.com/apikey)

---

### Backend Setup

**1. Configure your API key**

Copy the template and fill in your credentials:

```bash
cp backend/src/main/resources/application.properties.template \
   backend/src/main/resources/application.properties
```

Open `application.properties` and set your provider:

```properties
# Option A: Groq (recommended — free tier)
spring.ai.openai.api-key=your_groq_api_key_here
spring.ai.openai.base-url=https://api.groq.com/openai
spring.ai.openai.chat.options.model=llama-3.3-70b-versatile

# Option B: Google Gemini
# spring.ai.openai.api-key=your_google_ai_studio_key_here
# spring.ai.openai.base-url=https://generativelanguage.googleapis.com/v1beta/openai
# spring.ai.openai.chat.options.model=gemini-2.0-flash
```

> `application.properties` is gitignored — your key will never be committed.

**2. Run the backend**

```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

---

### Frontend Setup

**1. Configure the API base URL**

```bash
cp frontend/.env.local.example frontend/.env.local
```

The default value (`http://localhost:8080`) works out of the box for local development.

**2. Install dependencies and start**

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:3000` (or `3001` if 3000 is in use).

---

## Application Workflow

The UI follows a linear five-phase state machine:

```
Phase 1: Context Handshake
  └─ Enter target role and experience level

Phase 2: Data Ingestion
  ├─ Option A: Upload existing PDF resume
  └─ Option B: Paste raw notes / bullet points

Phase 3: AI Synthesis
  └─ AI generates a structured resume from your input

Phase 4: ATS Review
  └─ Paste a job description → get a score, keyword gaps, and suggestions

Phase 5: PDF Export
  └─ Download a polished, ATS-friendly PDF
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/parse-pdf` | Upload a PDF resume (`multipart/form-data`) |
| `POST` | `/api/generate-draft` | Generate resume from raw text notes |
| `POST` | `/api/predict-ats` | Score resume against a job description |
| `POST` | `/api/export-pdf` | Export final resume as a downloadable PDF |

### ATS Score Response Shape

```json
{
  "ats_score": 82,
  "match_analysis": {
    "found_keywords": ["Java", "Spring Boot", "REST API"],
    "missing_keywords": ["Kubernetes", "CI/CD"],
    "critical_gaps": ["No mention of cloud platform experience"]
  },
  "formatting_feedback": "Clean single-column layout. No tables or graphics detected.",
  "improvement_suggestions": [
    {
      "section": "Experience",
      "advice": "Quantify impact with metrics",
      "example": "Reduced API response time by 40% through connection pool tuning"
    }
  ],
  "is_ready_for_application": true
}
```

---

## Project Structure

```
.
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/resumebuilder/
│       ├── controller/     # REST endpoints
│       ├── service/        # Spring AI orchestration & PDF export
│       ├── model/          # ResumeData, AtsResult, etc.
│       ├── dto/            # Request DTOs
│       └── config/         # CORS configuration
│
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        ├── components/     # UI components (stepper, modals, preview)
        └── lib/            # API client, shared types
```

---

## Switching AI Providers

Because the backend uses Spring AI's OpenAI-compatible interface, switching providers requires changing only three lines in `application.properties` — no Java code changes needed.

| Provider | base-url | Model |
|---|---|---|
| Groq | `https://api.groq.com/openai` | `llama-3.3-70b-versatile` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` |
| OpenRouter | `https://openrouter.ai/api` | any OpenRouter model |

---
