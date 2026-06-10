# SaarthiAI — AI Customer Support Assistant Platform

> Smarter support. Better experience.

SaarthiAI is a multi-tenant SaaS platform that lets any business create and deploy an AI-powered customer support assistant trained on its own knowledge base. The assistant answers customer queries from the business's documents, creates and prioritizes support tickets, intelligently escalates important issues to humans, and ships as an embeddable chat widget for any website.

## Live Links

- **Live app:** https://saarthi-ai-alpha-five.vercel.app
- **API (backend):** https://saarthiai-6zp4.onrender.com
- **Repository:** https://github.com/Skclouds/SaarthiAI

> Note: the backend runs on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after idle can take up to ~50 seconds to wake the server; subsequent requests are fast.

## Demo / Admin Access

Use the credentials provided with the submission to log in, or register a new business from the live app. Each registration creates an isolated workspace (its own documents, chatbot, tickets, and analytics).

```
Email:    <provided in submission>
Password: <provided in submission>
```

A ready-to-use knowledge base for a fictional store ("Lumio") is included in `/sample-data` — upload these to test the assistant immediately.

## Features

### Core
- **Business admin portal** — authentication (login, registration, forgot password) and a dashboard showing total conversations, open / resolved / escalated tickets, and AI resolution rate.
- **Knowledge base management** — upload PDF, DOCX, TXT, and Markdown files; view, delete, and re-index documents. Each document is parsed, chunked, embedded, and stored in a vector database.
- **AI configuration** — customize bot name, welcome message, personality (Professional / Friendly / Technical), suggested questions, and escalation rules.
- **AI chat (RAG)** — answers are generated only from the business's own documents using retrieval-augmented generation, formatted in Markdown (headings, bullet lists, tables, links), with source citations.
- **Ticket management** — captures customer name, email, query, and priority; tickets move through Open → In Progress → Resolved → Closed.
- **Intelligent escalation** — rule- and intent-based detection (refunds, payment failures, legal, outages, human requests) auto-creates and prioritizes tickets, surfaced on an escalation dashboard by Urgent / High / Medium / Low.
- **Conversation history** — full transcripts with escalation and ticket-creation events on a timeline, plus search across conversations.
- **Analytics** — chat metrics (total conversations, average response time, resolution rate, escalation rate) and knowledge-base metrics (most-referenced documents, failed/unanswered queries).

### Bonus features implemented
- **Multi-tenant SaaS** — every record is scoped by `businessId`, and each business gets an isolated Pinecone namespace, so businesses never see each other's data.
- **Embeddable widget** — a self-contained `widget.js` that any external website can install with a single script tag (no framework required).
- **Answer ratings + CSAT** — customers rate AI answers (thumbs up/down); a satisfaction score is surfaced in analytics.
- **Real-time notifications** — the dashboard bell shows new conversations, tickets, and escalations.
- **Google OAuth** — "Continue with Google" alongside email/password sign-in.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Vector database | Pinecone (namespace per business) |
| AI | Google Gemini — `gemini-embedding-001` (1536-dim embeddings) and `gemini-2.5-flash` (chat) |
| Auth | JWT (bcrypt) + Google OAuth; role-based access control (ADMIN / AGENT) |
| Hosting | Vercel (frontend) · Render (backend) |

## Architecture

![SaarthiAI architecture](docs/architecture.png)

The Next.js admin portal and the embeddable chat widget both call the Express REST API. The API handles authentication, RBAC, and the RAG pipeline. On document upload, files are parsed, chunked, embedded with Gemini, and upserted into Pinecone under the business's namespace. On a customer query, the question is embedded, matched against that namespace, and the top chunks plus the bot configuration are sent to Gemini to generate a grounded answer. Escalation detection runs on each turn and creates tickets when triggered. MongoDB stores all application data (businesses, users, documents, conversations, messages, tickets, notifications, feedback).

**Multi-tenancy:** isolation is enforced at two levels — `businessId` on every MongoDB record, and a dedicated Pinecone namespace per business for vector retrieval.

## Project Structure

```
SaarthiAI/
├── client/        # Next.js frontend (admin portal + chat widget + demo)
├── server/        # Express API (auth, RBAC, RAG, tickets, analytics)
├── sample-data/   # Sample knowledge base (Lumio) for testing
├── docs/          # Architecture diagram
└── README.md
```

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- A MongoDB connection string (MongoDB Atlas free tier works)
- A Pinecone index (dimension **1536**, metric **cosine**)
- A Google Gemini API key (Google AI Studio — free tier)
- (Optional) A Google OAuth client ID for "Continue with Google"

### 1. Clone and install

```bash
git clone https://github.com/Skclouds/SaarthiAI.git
cd SaarthiAI

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

**`server/.env`**

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=support-kb
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id   # optional
PORT=5000                                       # local only; Render sets its own
```

**`client/.env`**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id   # optional
```

### 3. Run

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open http://localhost:3000, register a business, and upload the documents in `/sample-data` to start chatting.

## Using the Embeddable Widget

After logging in, open the **Install Widget** page to copy your snippet (your `businessId` is pre-filled). Paste it into any website before `</body>`:

```html
<script
  src="https://saarthi-ai-alpha-five.vercel.app/widget.js"
  data-business-id="YOUR_BUSINESS_ID"
  data-api-url="https://saarthiai-6zp4.onrender.com"
></script>
```

Customers can then chat without logging in, and every conversation, ticket, and escalation appears in that business's dashboard.

## Deployment

- **Frontend (Vercel):** root directory `client`, `NEXT_PUBLIC_API_URL` set to the Render API URL.
- **Backend (Render):** root directory `server`, build `npm install && npm run build`, start `npm start`; environment variables as above, with `CLIENT_URL` set to the Vercel URL for CORS.
- **MongoDB Atlas:** allow network access from anywhere (`0.0.0.0/0`) so the backend can connect.
- **Pinecone:** index dimension 1536, metric cosine.

## Evaluation Mapping

| Requirement | Where |
|---|---|
| Admin auth + dashboard metrics | `client` auth pages, `server` `/auth`, `/stats` |
| Knowledge base + AI processing | `/documents` ingestion (parse → chunk → embed → Pinecone) |
| AI configuration | `/bot-config`, AI Config page |
| Chat widget + suggested questions | ChatWidget, `widget.js`, `/chat` |
| Ticket management | `/tickets`, Tickets page |
| Intelligent escalation | escalation service, Escalations page |
| Conversation history + search | `/conversations` |
| Analytics | `/analytics`, Analytics page |
| Auth / RBAC / REST API | JWT + Google OAuth, ADMIN/AGENT roles |
| Bonus: multi-tenant, embeddable widget, CSAT, notifications | as described above |