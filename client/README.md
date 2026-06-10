# SaarthiAI Client

Next.js 14 (App Router) + TypeScript + Tailwind frontend. Deploy to **Vercel**.

## Setup

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your API (e.g. http://localhost:5000)
npm install
```

## Development

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

Other keys (`MONGODB_URI`, `JWT_SECRET`, AI keys) belong on the **server** (Render), not Vercel.

## Auth

JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>`. No cross-domain cookies.
