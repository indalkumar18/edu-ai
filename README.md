# EduXai

AI tutor and adaptive assessment platform. React + Vite frontend, Express + MongoDB backend, Groq-hosted LLM.

## What's included

- Marketing landing page with navbar, features, product tour and FAQ
- Login and sign-up with validation, password visibility toggle and strength meter
- AI Tutor with streaming replies, saved conversations, Markdown and code blocks
- Assessments with question navigation, timer, mark-for-review, scoring and answer review
- Dashboard, progress history and settings

## Requirements

- Node.js 22 or newer
- MongoDB Atlas (needed for login, quizzes and progress)
- Groq API key (needed for AI answers)

## Setup

1. Create `backend/.env`:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=a-random-string-of-32-or-more-characters
GROQ_API_KEY=your-groq-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

2. Create `eduadapt-ai/.env` (optional when using the local backend):

```env
VITE_API_URL=http://localhost:5000/api
```

3. Install both applications from the repository root:

```bash
npm run install:all
```

4. Start the applications in separate terminals from the repository root:

```bash
npm run backend
npm run frontend
```

5. Seed sample questions once MongoDB is connected:

```bash
npm run seed
```

Open <http://localhost:5173>.

## Automated testing and quality checks

Run the complete backend and frontend test suites from the repository root:

```bash
npm test
```

Run the backend suite alone:

```bash
npm run test:backend
```

Generate the backend unit-utility coverage summary:

```bash
npm run coverage:backend
```

Run the frontend suite alone:

```bash
npm run test:frontend
```

Run all local release checks—tests, ESLint and a production Vite build:

```bash
npm run check
```

### What is tested

- **Backend unit tests:** quiz grading, score feedback thresholds, authentication input validation and assessment submission validation
- **Backend HTTP integration tests:** health endpoints, AI request validation, missing provider configuration, database-unavailable behavior, CORS, invalid JSON, oversized request bodies and 404 handling
- **Frontend unit tests:** quiz helpers, password strength, email validation and chat grouping
- **Frontend API tests:** bearer-token handling, session persistence, API failures, network failures, streaming chunks, CRLF event boundaries, aborts and malformed stream events
- **Markdown safety tests:** HTTP(S)-only link allowlisting and checks that rendered model text does not use raw HTML injection
- **Build/lint checks:** ESLint and a production Vite build

A GitHub Actions workflow runs tests, lint and the production build on every push and pull request. See `TESTING.md` for the test matrix and manual end-to-end checklist.

> The backend HTTP tests use an ephemeral local port and do not need a live MongoDB database or a real Groq API key. The app can be imported by tests without opening a server or connecting to MongoDB.

## Deployment notes

- Set `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `CLIENT_URL` and `PORT` in the backend hosting provider's environment settings.
- Set `VITE_API_URL` in the frontend build environment to the deployed backend API URL ending in `/api`.
- Keep `.env` files and real API keys out of GitHub. Only commit `.env.example` files.
- Use a long, random `JWT_SECRET` (at least 32 characters) and restrict `CLIENT_URL` to the deployed frontend origin.

## Notes

- The tutor streams from `POST /api/ai/teach/stream` (Server-Sent Events). `POST /api/ai/teach` is also available as a non-streaming fallback.
- Tutor conversations are stored in browser localStorage, per user.
