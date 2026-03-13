# Chronity - Deployment & Setup Guide

Chronity is an autonomous opportunity intelligence platform built with a **FastAPI** backend and a **Next.js** frontend. This guide will help you get the system running locally.

---

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **Python** (v3.9 or higher)
- **Git**

---

## 🚀 Quick Start

### 1. Backend Setup (AI & Database)
```powershell
# Navigate to backend
cd backend

# Create Virtual Environment
python -m venv venv

# Activate Environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Configure Environment
# Create a .env file and add your Gemini Key:
# GEMINI_API_KEY="your_actual_api_key_here"

# Start Server
uvicorn main:app --reload
```
*API is live at: [http://localhost:8000](http://localhost:8000)*

---

### 2. Frontend Setup (UI & Dashboard)
```powershell
# Navigate to frontend (in a new terminal)
cd frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev
```
*Web dashboard is live at: [http://localhost:3000](http://localhost:3000)*

---

## 🛠️ Troubleshooting

### Gemini API Key
If the platform feels "empty," ensure your `GEMINI_API_KEY` is valid. You can get one for free from the [Google AI Studio](https://aistudio.google.com/).

### Backend Diagnostic
Run the included verification script to check your environment:
```powershell
python backend/check_env.py
```

### Python Interpreter (VS Code)
If you see import errors in your editor:
1. Press `Ctrl + Shift + P`.
2. Search for **Python: Select Interpreter**.
3. Select the one inside `./backend/venv/`.

---

## 🔍 Verification
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/](http://localhost:8000/)
