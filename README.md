# EduAdapt AI

A React + Express + MongoDB + Gemini AI learning tutor project.

## Features in this repaired version

- Student registration and login (bcrypt password hashing + JWT)
- Protected dashboard pages
- Gemini AI Tutor with English/Hindi and three explanation styles
- Topic-based MCQ assessments with server-side marking
- MongoDB quiz-attempt history and performance dashboard
- Sample questions for DBMS, DSA, HTML & CSS, and JavaScript

## Requirements

- Node.js 22 or newer (Node.js 24 is fine)
- npm
- MongoDB Atlas account/cluster
- Gemini API key from Google AI Studio

## 1. Configure backend settings

Copy `backend/.env.example` to a new file named `backend/.env`.

Fill these values:

- `MONGO_URI`: copy from MongoDB Atlas → Cluster → Connect → Drivers. Replace the database username/password. URL-encode special characters in the password.
- `JWT_SECRET`: use a random secret of at least 32 characters.
- `GEMINI_API_KEY`: create a key in Google AI Studio.
- Keep `PORT=5000` and `CLIENT_URL=http://localhost:5173` for local testing.

Do not upload or share `.env`.

## 2. Install backend packages

Open Terminal 1 at the project root:

```powershell
cd backend
npm install
```

## 3. Start backend

Keep Terminal 1 open:

```powershell
npm run dev
```

Open `http://localhost:5000/api/health`. It should show `status: "ok"`. `database` should be `connected` before using login, quiz and progress.

## 4. Add sample quiz questions

After MongoDB shows connected, open Terminal 2 at the project root:

```powershell
cd backend
npm run seed
```

This adds or updates the sample quiz questions without deleting other question records. You can safely run it again if needed.

## 5. Install and start frontend

Open Terminal 3 at the project root:

```powershell
cd eduadapt-ai
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Test the app

1. Create a student account.
2. Open AI Tutor; choose Hindi/English and an explanation style; ask a question.
3. Open Assessment; choose a topic and complete a quiz.
4. Open Dashboard or My Progress to view saved results.

## API routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/ai/teach`
- `GET /api/assessment/topics` (Bearer token)
- `GET /api/assessment/questions/:topic` (Bearer token)
- `POST /api/assessment/submit` (Bearer token)
- `GET /api/performance/me` (Bearer token)

The backend remains available for health/AI testing if MongoDB is not configured, but login, assessment and progress require a working MongoDB connection.
