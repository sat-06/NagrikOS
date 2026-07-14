# NagrikOS Deployment Guide

## Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo `sat-06/NagrikOS`
3. Use these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Add a PostgreSQL database (Render will auto-set `DATABASE_URL`)
5. Set environment variables:
   - `JWT_SECRET_KEY`: a long random string
   - `CORS_ORIGINS`: `https://nagrik-os.vercel.app`

## Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) and import the repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g., `https://nagrikos-api.onrender.com`)
4. Deploy

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Backend runs at `http://localhost:8000`, frontend at `http://localhost:5173`
