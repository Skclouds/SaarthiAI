# SaarthiAI Server

Express + TypeScript API for SaarthiAI. Deploy to **Render**.

## Setup

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

## Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `PORT` | No | Server port (default: 5000) |
| `CLIENT_URL` | No | Frontend origin for CORS (default: http://localhost:3000) |
| `GEMINI_API_KEY` | Yes* | Gemini embeddings (`gemini-embedding-001`) and chat (`gemini-2.5-flash`) |
| `PINECONE_API_KEY` | Yes* | Vector storage for document chunks |
| `PINECONE_INDEX` | Yes* | Pinecone index name (1536 dimensions) |
| `UPLOAD_DIR` | No | Local file storage for re-indexing (default: `uploads`) |
| `ANTHROPIC_API_KEY` | No | For future AI features |

\* Required for Knowledge Base document ingestion.

## Bot Config (ADMIN)

- `GET /bot-config` — Get or create config for the business
- `PUT /bot-config` — Update botName, welcomeMessage, personality, escalationRules, suggestedQuestions

## Chat (public)

- `POST /chat` — RAG chat (businessId in body)
- `GET /chat/suggested-questions?businessId=` — Suggested question chips
- `GET /chat/config?businessId=` — Public bot name + welcome message

## Stats & Analytics (ADMIN/AGENT)

- `GET /stats/overview` — Dashboard overview metrics
- `GET /analytics?from=&to=` — Date-ranged analytics (default last 30 days)

## Conversations (ADMIN/AGENT)

- `GET /conversations` — Paginated list (`?page=&limit=`)
- `GET /conversations/search?q=` — Search message content
- `GET /conversations/:id` — Full transcript + escalation/ticket timeline

## Tickets & Escalations (ADMIN/AGENT)

- `GET /tickets` — List tickets (filter `?status=` & `?priority=`)
- `GET /tickets/:id` — Ticket detail
- `PATCH /tickets/:id` — Update status
- `POST /tickets` — Manual create
- `GET /escalations/summary` — Open ticket counts by priority
- `GET /escalations/tickets` — Open tickets grouped by priority

Chat (`POST /chat`) runs escalation detection after each response. Public chat routes
allow CORS from any origin for the embeddable widget.

## Documents (Knowledge Base)

All routes require auth. Upload, delete, and re-index require `ADMIN` role. Scoped to `req.user.businessId`.

- `POST /documents/upload` — Multipart upload (PDF, DOCX, TXT, MD, max 10MB)
- `GET /documents` — List business documents
- `DELETE /documents/:id` — Delete document, chunks, and Pinecone vectors
- `POST /documents/:id/reindex` — Re-run ingestion pipeline

## Auth

JWT is returned in the response body. Clients send it as `Authorization: Bearer <token>` — no cookies.

- `POST /auth/register` — Create business + admin user
- `POST /auth/login` — Login
- `POST /auth/forgot-password` — Stub (always returns success message)
