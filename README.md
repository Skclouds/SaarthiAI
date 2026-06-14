# SaarthiAI — Human Readiness & Competency Platform

> **From Knowledge to Readiness.**
> SaarthiAI turns SOPs, manuals, policies, and training material into measurable competency,
> readiness scores, risk intelligence, and automated retraining — so organizations know their
> people are *truly ready* before performing critical tasks.

**PaviqLabs · FAR AWAY 2026** · Themes: Railways · Examinations · Logistics & Transit

---

## Live Links

| Resource | URL |
|---|---|
| **Live App (Admin Portal)** | https://saarthi-ai-alpha-five.vercel.app |
| **Customer / Learner Chat Widget (demo)** | https://saarthi-ai-alpha-five.vercel.app/chat?businessId=6a2852c35be34d45b9e438d2 |
| **Backend API** | https://saarthiai-6zp4.onrender.com |
| **GitHub Repository** | https://github.com/Skclouds/SaarthiAI |

> **Cold-start note:** the backend runs on Render's free tier and spins down after ~15 minutes of
> inactivity. The **first** request after idle can take up to **~50 seconds** to wake the server —
> please allow a moment on first load. Every request after that is fast.

---

## Demo & Admin Access

Sign in to the dashboard at **https://saarthi-ai-alpha-five.vercel.app/login**:

```
Email:    kaushalsingh1715@gmail.com
Password: <your-password-here>
```

This account is a fully set-up tenant with sample knowledge bases already loaded (see
`/sample-data`), so you can generate assessments and test the readiness loop immediately.

### Try it in 60 seconds
1. **Upload a document** (or use the loaded ones) in **Knowledge Base** — e.g. a railway safety
   SOP, an exam study guide, or a logistics driver manual.
2. **Generate an assessment** from that document with one click.
3. **Take it as a learner** (open the public learner link in an incognito window) — answer a few
   questions wrong on purpose.
4. **See the result:** a competency score, a **Ready / Partially Ready / Not Ready** status, the
   weak topics detected, and an **auto-assigned retraining task** — all visible on the
   **Readiness Insights** dashboard.

---

## The Problem

Organizations across railways, logistics, healthcare, manufacturing, and education spend heavily
to train people — but have no reliable way to prove they are actually ready.

- **Completion is not competency.** Course completion is tracked, but understanding, retention,
  and real-world ability are never measured.
- **No risk visibility.** There is no early warning before an untrained person causes an accident,
  failure, or compliance breach.
- **Manual and reactive.** Assessments, gap analysis, and retraining are slow, manual, and happen
  only after something goes wrong.

The core question shifts from *"Did they complete training?"* to *"Are they actually ready?"*

---

## The Solution — A Closed Readiness Loop

SaarthiAI turns any organizational document into an automated readiness loop:

```
Upload SOP / training material
   -> AI extracts knowledge (RAG over a private vector store)
   -> AI generates an assessment (MCQ / scenario)
   -> Learner is evaluated -> competency score (per topic)
   -> Readiness status: Ready / Partially Ready / Not Ready
   -> Knowledge gaps + at-risk learners detected
   -> Retraining auto-assigned + managers notified
```

Instead of simply managing training, **SaarthiAI proves readiness and predicts risk before
failures happen.**

---

## Key Features

- **AI Assessment Generator** — converts document content into grounded MCQ / scenario assessments.
- **Competency & Readiness Engine** — auto-grades attempts, scores per topic, and assigns
  Ready / Partially Ready / Not Ready.
- **Gap Detection & Risk** — pinpoints weak topics and surfaces at-risk learners on a dashboard.
- **Autonomous Retraining** — low scores automatically create retraining tasks and notify managers.
- **AI Mentor (RAG)** — document-grounded Q&A available to every learner.
- **Multi-Tenant SaaS** — each organization gets isolated documents, learners, scores, and analytics.
- **Embeddable Widget** — a single `widget.js` to deploy the assistant on any site.

---

## One Platform, Every Theme

SaarthiAI is industry-agnostic by design — upload a different document, get a different readiness
program.

| Theme | Use case | Example |
|---|---|---|
| **Railways** | Operator safety readiness | Signal protocols, emergency braking & speed rules → prove operators are ready before duty |
| **Examinations** | Certification / exam readiness | Study material → adaptive assessments, competency scores & exam-readiness indicators |
| **Logistics & Transit** | Driver & compliance readiness | Hazmat, hours-of-service & inspection SOPs → driver competency and risk detection |

Sample documents for each theme are included in `/sample-data`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Vector DB | Pinecone (one namespace per tenant) |
| AI | Google Gemini — `gemini-embedding-001` (1536-dim) + `gemini-2.5-flash` |
| Security | JWT (bcrypt) + RBAC, rate-limiting, helmet, tenant isolation |
| Hosting | Vercel (frontend) · Render (backend) |

---

## Architecture

![SaarthiAI System Architecture](docs/architecture.png)

The admin portal and the embeddable widget call the Express REST API, which handles auth, RBAC,
the RAG pipeline, assessment generation, and the readiness engine. MongoDB stores application data;
Pinecone stores vector embeddings (isolated per tenant); Google Gemini powers embeddings, chat, and
assessment generation.

**Ingestion:** `upload -> parse -> chunk -> embed (Gemini) -> upsert to Pinecone (namespace = businessId)`
**Query (RAG):** `question -> embed -> similarity search in tenant namespace -> top chunks + config -> Gemini -> grounded answer`
**Readiness:** `assessment attempt -> grade -> competency score -> readiness status -> gap detection -> auto-retraining`

---

## Project Structure

```
SaarthiAI/
├── client/        # Next.js frontend (admin portal, readiness pages, learner page, widget)
├── server/        # Express API (auth, RAG, assessments, readiness, tickets, analytics)
├── sample-data/   # Sample SOPs / study material for each theme
├── docs/          # Architecture diagram
└── README.md
```

See `server/README.md` for the full API reference.

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- MongoDB connection string (Atlas free tier)
- Pinecone index — dimension **1536**, metric **cosine**
- Google Gemini API key (Google AI Studio — free tier)

### Install & run

```bash
git clone https://github.com/Skclouds/SaarthiAI.git
cd SaarthiAI

cd server && npm install
cd ../client && npm install
```

**`server/.env`**
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=support-kb
CLIENT_URL=http://localhost:3000
```

**`client/.env`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Terminal 1 — backend
cd server && npm run dev
# Terminal 2 — frontend
cd client && npm run dev
```

Open http://localhost:3000, register an organization, upload a document from `/sample-data`, and
generate your first assessment.

---

## Deployment

- **Frontend (Vercel):** root directory `client`; set `NEXT_PUBLIC_API_URL` to the Render API URL.
- **Backend (Render):** root directory `server`; build `npm install && npm run build`; start
  `npm start`; set env vars including `CLIENT_URL` = the Vercel URL. The server reads
  `process.env.PORT`.
- **MongoDB Atlas:** allow network access from anywhere (`0.0.0.0/0`).
- **Pinecone:** index dimension 1536, metric cosine.

---

## What's Next

- **Risk Intelligence** — predict workforce risk from competency trends and compliance history.
- **Vernacular + WhatsApp** — Hindi and regional languages; readiness delivered over WhatsApp.
- **Digital Competency Passport** — a living, portable readiness profile per individual.
- **Deeper compliance** — DPDP-ready data handling, audit trails, and role-based analytics.

---

## Team

**Kaushal Singh** · **Rohan Mane** — PaviqLabs

_Built for FAR AWAY 2026 with Next.js, Express, MongoDB, Pinecone, and Google Gemini._
