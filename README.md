# SaarthiAI

AI-powered customer support platform — monorepo with separate client and server.

```
SaarthiAI/
├── client/   # Next.js 14 + Tailwind → Vercel
└── server/   # Express + MongoDB → Render
```

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Quick Start

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

API: `http://localhost:5000`

### 2. Client

```bash
cd client
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

App: `http://localhost:3000`

## Deployment

| Service | Platform | Folder |
|---------|----------|--------|
| Frontend | Vercel | `client/` |
| Backend | Render | `server/` |

Set `CLIENT_URL` on Render to your Vercel URL. Set `NEXT_PUBLIC_API_URL` on Vercel to your Render URL.

## Phase 1

- Monorepo foundation
- JWT auth (register, login, forgot-password stub)
- Dashboard shell with placeholder pages
- Mongoose models for all entities

## Phase 2

- Knowledge Base: upload, list, delete, re-index documents
- Ingestion pipeline: parse → chunk → embed (Gemini) → Pinecone upsert
- Dashboard UI with drag-and-drop upload, status polling, and document table

### Pinecone index setup

Create an index with **1536 dimensions** (for `gemini-embedding-001` with `outputDimensionality: 1536`). Serverless or pod-based both work; namespaces are set per `businessId`.

## Phase 3 (current)

- AI Config dashboard (`/dashboard/ai-config`) with live preview
- RAG chat endpoint (`POST /chat`) using Gemini embeddings + `gemini-2.5-flash`
- Customer chat widget (`/chat` demo page)
