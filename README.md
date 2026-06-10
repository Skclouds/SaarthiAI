## Live Links

| Resource | URL |
|---|---|
| **Live app (Admin Portal)** | https://saarthi-ai-alpha-five.vercel.app |
| **Customer Chat Widget (demo)** | https://saarthi-ai-alpha-five.vercel.app/chat?businessId=6a2852c35be34d45b9e438d2 |
| **Backend API** | https://saarthiai-6zp4.onrender.com |
| **GitHub Repository** | https://github.com/Skclouds/SaarthiAI |

> **Heads-up on cold starts:** the backend runs on Render's free tier, which spins down after
> ~15 minutes of inactivity. The **first** request after idle can take up to **~50 seconds** to
> wake the server — please give it a moment on the first load. Every request after that is fast.

## Demo & Admin Access

Sign in to the admin dashboard at **https://saarthi-ai-alpha-five.vercel.app/login** using the
demo administrator account below:

```
Email:    admin@saarthi-demo.com
Password: Saarthi@2026
```

This account is a fully set-up tenant: it already has a sample knowledge base loaded (a fictional
online store called **Lumio** — the source files are in `/sample-data`). That means you can test
the AI assistant immediately, without uploading anything.

### Try it in 60 seconds

1. **Open the customer chat widget** (no login needed):
   https://saarthi-ai-alpha-five.vercel.app/chat?businessId=6a2852c35be34d45b9e438d2
   Ask **"What is your refund policy?"** — the assistant answers from the Lumio documents and
   shows its sources.
2. **Trigger an escalation:** send **"I need a refund"** — the assistant routes it for human
   follow-up and automatically creates a prioritized support ticket.
3. **Log in to the dashboard** with the credentials above to see the new conversation, the
   auto-created ticket, the live notification, and the analytics update in real time.

> **Multi-tenancy:** you can also register a brand-new business from the app — each business gets
> its own isolated knowledge base, chatbot, tickets, and analytics (vectors are isolated per
> business via a dedicated Pinecone namespace).