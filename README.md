# EduXai

AI tutor and adaptive assessment platform. React + Vite frontend, Express + MongoDB backend, Groq-hosted LLM.

## What's included

- Marketing landing page with navbar, features, product tour, FAQ
- Login and sign-up with validation, password visibility toggle and strength meter
- ChatGPT-style AI Tutor: streaming replies, saved conversations, Markdown and code blocks with copy, stop and regenerate
- Assessments: topic cards, question navigator, timer, mark-for-review, scored results with per-question review
- Dashboard, progress history and settings

## Requirements

Node.js 22+, a MongoDB Atlas cluster, and a Groq API key.

## Setup

1. Create `backend/.env`:

```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=a-random-string-of-32-or-more-characters
GROQ_API_KEY=your-groq-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

2. Install and run (three terminals, from the project root):

```powershell
cd backend ; npm install ; npm run dev
cd backend ; npm run seed          # once, after MongoDB shows connected
cd eduadapt-ai ; npm install ; npm run dev
```

Open http://localhost:5173.

## Notes

- The tutor streams from `POST /api/ai/teach/stream` (Server-Sent Events). The original `POST /api/ai/teach` still works and is used as a fallback.
- Tutor conversations are stored in the browser (localStorage), per user.
- Fonts (Instrument Serif, Geist) load from Google Fonts.
