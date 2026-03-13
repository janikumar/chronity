# Chronity Deployment Guide 🚀

Chronity is split into a **Next.js Frontend** and a **FastAPI Backend**. For production, these must be deployed and configured to talk to each other correctly.

---

## 🏗️ 1. Backend Deployment (FastAPI)

Since Vercel is optimized for frontend, we recommend deploying the Python backend to a service like **Render**, **Railway**, or **DigitalOcean**.

### Step-by-Step (Render.com example):
1. **Connect your GitHub repo**.
2. **Select "Web Service"**.
3. **Environment**: `Python 3`.
4. **Build Command**: `pip install -r requirements.txt`.
5. **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
6. **Add Environment Variables**:
   - `DATABASE_URL`, `SUPABASE_PROJECT_ID`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY_1`, `EMAIL_USER`, `EMAIL_PASS`, etc. (Copy from your local `.env`).

---

## ⚡ 2. Frontend Deployment (Vercel)

Vercel is the best place for your Next.js app.

### Step-by-Step:
1. **Import your repository** to Vercel.
2. **Root Directory**: Select the `frontend` folder (or set the workspace if using a monorepo).
3. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: **IMPORTANT**. Set this to your live Backend URL (e.g., `https://chronity-api.onrender.com`).
4. **Deploy**.

---

## 🔐 3. Security & Connectivity (CORS)

For the frontend to successfully fetch data from the backend, the backend must "allow" your Vercel domain.

1. Locate `backend/main.py`.
2. Find the `CORSMiddleware` configuration.
3. Update `allow_origins` to include your Vercel URL:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "https://your-project-name.vercel.app"
   ]
   ```

---

## ❓ Common Deployment Errors

### "Failed to fetch" on Vercel
- **Reason**: The frontend is trying to call `127.0.0.1:8000` (local) instead of your live API.
- **Fix**: Ensure `NEXT_PUBLIC_API_URL` is set in Vercel settings and redeploy.

### "ModuleNotFoundError" on Backend
- **Reason**: The build command is missing dependencies.
- **Fix**: Ensure `requirements.txt` is updated and the build command is correct.

### "Invalid API Key"
- **Reason**: Environment variables missing in the hosting provider's dashboard.
- **Fix**: Double-check all keys in your hosting provider's "Environment Variables" section.
