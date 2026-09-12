# AI Interview Coach

Type a technical topic, pick a difficulty, and get interviewed one question at a time by an AI
interviewer (Groq + `llama-3.3-70b-versatile` by default). The interviewer decides when to end the
interview, then you get a scored report with a Pass/Fail verdict.

- `frontend/` — Next.js (App Router, TypeScript, Tailwind)
- `backend/` — FastAPI (Python)

## 1. Backend setup

```powershell
cd backend
py -3.11 -m venv venv        # use a working Python 3.11/3.12 install
.\venv\Scripts\pip.exe install -r requirements.txt
copy .env.example .env       # then edit .env and set GROQ_API_KEY
```

`.env` keys:

- `GROQ_API_KEY` — your Groq API key from https://console.groq.com/keys
- `GROQ_MODEL` — defaults to `llama-3.3-70b-versatile`. If your account doesn't have access to
  that model, set this to another chat model available to your key (e.g. `openai/gpt-oss-120b`).
- `CORS_ORIGINS` — comma separated list of origins allowed to call the API, defaults to
  `http://localhost:3000`. Add your deployed frontend's URL here once you have it.

## 2. Frontend setup

```powershell
cd frontend
npm install
```

`frontend/.env.local` already points at `NEXT_PUBLIC_API_URL=http://localhost:8000`.

## 3. Run both parts

Backend (from `backend/`):

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Frontend (from `frontend/`):

```powershell
npm run dev
```

Then open http://localhost:3000. Backend health check: http://localhost:8000/api/health

## 4. Deploying

The backend is a normal FastAPI app (no hardcoded host/port — the process manager passes
`--port $PORT`) and the frontend reads the backend URL from `NEXT_PUBLIC_API_URL` instead of
assuming `localhost`, so both are ready to deploy as-is.

### Render (backend)

- New → Web Service → connect the `ai-interview-coach` GitHub repo
- **Name**: `ai-interview-coach-backend`
- **Root Directory**: `backend`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: Free
- **Environment variables**:
  - `GROQ_API_KEY` = your Groq key
  - `CORS_ORIGINS` = `http://localhost:3000,https://<your-vercel-app>.vercel.app` (update once you
    know your Vercel URL — this is what lets the deployed frontend call the API)

After it deploys, open the Render URL — you should see `{"status":"ok"}` at `/api/health`.

### Vercel (frontend)

- Add New → Project → import `ai-interview-coach`
- **Root Directory**: `frontend`
- Build settings: leave defaults (Next.js is auto-detected)
- **Environment variable**: `NEXT_PUBLIC_API_URL` = your Render URL, no trailing slash
  (e.g. `https://ai-interview-coach-backend.onrender.com`)

After deploying, open the Vercel URL and start an interview. If the interviewer replies, it's wired
up correctly.
