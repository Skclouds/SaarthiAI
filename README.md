# SaarthiAI — AI Customer Support Assistant Platform

> **Smarter support. Better experience.**
> A multi-tenant SaaS platform that lets any business deploy an AI support assistant trained on its own knowledge base — answering customer queries, creating and prioritizing tickets, escalating to humans, and embedding anywhere as a chat widget.

---

## Live Links

| Resource | URL |
|---|---|
| **Live App (Admin Portal)** | https://saarthi-ai-alpha-five.vercel.app |
| **Customer Chat Widget (demo)** | https://saarthi-ai-alpha-five.vercel.app/chat?businessId=6a2852c35be34d45b9e438d2 |
| **Backend API** | https://saarthiai-6zp4.onrender.com |
| **GitHub Repository** | https://github.com/Skclouds/SaarthiAI |

> **Cold-start note:** the backend runs on Render's free tier, which spins down after ~15 minutes of inactivity. The **first** request after idle can take up to **~50 seconds** to wake the server — please allow a moment on the first load. Every request after that is fast.

---

## Demo & Admin Access

Sign in to the admin dashboard at **https://saarthi-ai-alpha-five.vercel.app/login**:

```
Email:    admin@saarthi-demo.com
Password: Saarthi@2026
```

This account is a fully set-up tenant with a sample knowledge base already loaded (a fictional online store, **Lumio** — source files in `/sample-data`), so you can test the assistant immediately.

### Try it in 60 seconds
1. **Open the chat widget** (no login required): the Customer Chat Widget link above. Ask **"What is your refund policy?"** — the assistant answers from the Lumio docs and cites its sources.
2. **Trigger an escalation:** send **"I need a refund"** — it routes for human follow-up and auto-creates a prioritized support ticket.
3. **Log in to the dashboard** to see the new conversation, the auto-created ticket, the live notification, and the analytics update.

---

## Overview

SaarthiAI gives support teams an AI assistant grounded entirely in their own documents using **retrieval-augmented generation (RAG)**. A business admin uploads their knowledge base, configures the bot's personality and escalation rules, and embeds a chat widget on any website. Customers get instant, accurate answers; anything the AI can't or shouldn't handle is escalated into a structured ticket. Everything — conversations, tickets, escalations, analytics — is isolated per business in a true multi-tenant model.

---

## Features

### Core
- **Admin portal** — register/login/forgot-password; dashboard with total conversations, open/resolved/escalated tickets, and AI resolution rate.
- **Knowledge base management** — upload PDF, DOCX, TXT, and Markdown; view, delete, and re-index documents (parsed -> chunked -> embedded -> stored).
- **AI configuration** — bot name, welcome message, personality (Professional / Friendly / Technical), suggested questions, and escalation rules.
- **AI chat (RAG)** — answers generated only from the business's documents, formatted in Markdown (headings, lists, tables, links), with source citations.
- **Ticket management** — captures name, email, query, priority; statuses Open -> In Progress -> Resolved -> Closed.
- **Intelligent escalation** — detects refunds, payment failures, legal issues, outages, and human requests; auto-creates prioritized tickets shown on an escalation dashboard.
- **Conversation history** — full transcripts with an escalation/ticket timeline, plus search.
- **Analytics** — chat metrics (volume, avg response time, resolution & escalation rates) and KB metrics (most-referenced docs, failed/unanswered queries).

### Bonus (also implemented)
- **Multi-tenant SaaS** — every record scoped by `businessId`; isolated Pinecone namespace per business.
- **Embeddable widget** — a self-contained `widget.js` any website can install with one script tag.
- **CSAT answer ratings** — customers rate AI answers; satisfaction surfaced in analytics.
- **Real-time notifications** — dashboard bell for new conversations, tickets, and escalations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Vector DB | Pinecone (namespace per business) |
| AI | Google Gemini — `gemini-embedding-001` (1536-dim) + `gemini-2.5-flash` |
| Auth | JWT (bcrypt) + Google OAuth; RBAC (ADMIN / AGENT) |
| Hosting | Vercel (frontend) · Render (backend) |

---

## Architecture

![SaarthiAI System Architecture](docs/architecture.png)

The Next.js admin portal and the embeddable chat widget both call the Express REST API, which handles auth, RBAC, the RAG pipeline, and escalation. MongoDB stores all application data; Pinecone stores vector embeddings; Google Gemini powers both embeddings and chat.

### How it works

**Ingestion (when a document is uploaded):**
```
upload (PDF / DOCX / TXT / MD)  ->  parse  ->  chunk  ->  embed with Gemini
->  upsert vectors to Pinecone (namespace = businessId)
```

**Query (RAG — when a customer asks something):**
```
question  ->  embed with Gemini  ->  similarity search in the business's namespace
->  top chunks + bot config  ->  Gemini  ->  grounded answer + sources
```

**Escalation:** every chat turn runs rule- and intent-based detection (refunds, payments, legal, outages, "talk to a human"). When triggered, a prioritized ticket is created and the conversation is flagged.

**Multi-tenancy:** isolation is enforced at two levels — `businessId` on every MongoDB record, and a dedicated Pinecone namespace per business — so no business can ever access another's data.

---

## Project Structure

```
SaarthiAI/
├── client/        # Next.js frontend (admin portal + chat widget + demo page)
├── server/        # Express API (auth, RBAC, RAG, tickets, analytics) - see server/README.md for full API reference
├── sample-data/   # Sample knowledge base (Lumio) for testing
├── docs/          # Architecture diagram
└── README.md
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- MongoDB connection string (Atlas free tier works)
- A Pinecone index — dimension **1536**, metric **cosine**
- A Google Gemini API key (Google AI Studio — free tier)

### Install

```bash
git clone https://github.com/Skclouds/SaarthiAI.git
cd SaarthiAI

cd server && npm install
cd ../client && npm install
```

### Configure environment variables

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

### Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open http://localhost:3000, register a business, and upload the files in `/sample-data` to start chatting.

---

## Using the Embeddable Widget

From the **Install Widget** page (after logging in) copy your snippet — your `businessId` is pre-filled — and paste it into any website before `</body>`:

```html
<script
  src="https://saarthi-ai-alpha-five.vercel.app/widget.js"
  data-business-id="YOUR_BUSINESS_ID"
  data-api-url="https://saarthiai-6zp4.onrender.com"
></script>
```

Customers can chat without logging in, and every conversation, ticket, and escalation appears in that business's dashboard.

---

## Deployment

- **Frontend (Vercel):** root directory `client`; set `NEXT_PUBLIC_API_URL` to the Render API URL.
- **Backend (Render):** root directory `server`; build `npm install && npm run build`; start `npm start`; set env vars including `CLIENT_URL` = the Vercel URL (for CORS). The server reads `process.env.PORT` (Render injects it).
- **MongoDB Atlas:** allow network access from anywhere (`0.0.0.0/0`).
- **Pinecone:** index dimension 1536, metric cosine.

---

## Requirement Coverage

| Requirement | Status |
|---|---|
| Admin auth (login / register / forgot password) + dashboard metrics | Done |
| Knowledge base (upload PDF/DOCX/TXT/MD, view, delete, re-index) | Done |
| AI processing (parse -> chunk -> embed -> vector store) | Done |
| AI configuration (bot name, welcome, personality, escalation rules) | Done |
| Chat widget (Markdown, tables, links + suggested questions) | Done |
| Ticket management (fields + statuses) | Done |
| Intelligent escalation + escalation dashboard | Done |
| Conversation history + search | Done |
| Analytics (chat + KB metrics) | Done |
| Backend: Auth, RBAC, REST API; MongoDB; Pinecone; Gemini | Done |
| Bonus: multi-tenant, embeddable widget, CSAT ratings, notifications | Done |

---

_Built with Next.js, Express, MongoDB, Pinecone, and Google Gemini._