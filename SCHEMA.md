# Chronity Database Schema

Chronity uses **SQLAlchemy** for Object-Relational Mapping (ORM). The schema is defined in `backend/models.py` and is **automatically generated** on application startup.

## Table: orders (users)
Stores user-specific settings and primary data.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique identifier |
| `name` | String(255) | Full name |
| `email` | String(255) | Unique email address |
| `resume_path`| String(511) | Path to uploaded resume file |
| `skills` | Text | Captured skills (comma-separated) |

## Table: opportunities
Stores identified career opportunities (extracted from email/web).
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique identifier |
| `company` | String(255) | Company name |
| `role` | String(255) | Position name |
| `type` | String(50) | Internship, Full-time, etc. |
| `deadline` | String(100) | Application deadline |
| `link` | String(511) | Direct application link |
| `description`| Text | Raw source text/email body |
| `status` | String(50) | Progress status (Detected, Applied, etc.) |
| `priority` | String(20) | Lead priority (High, Medium, Low) |
| `extracted_at`| DateTime | Time of identification |

## Table: work_plans
Stores AI-generated preparation strategies.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique identifier |
| `user_id` | Integer (FK) | Reference to the user |
| `opportunity_id` | Integar (FK)| Reference to the opportunity |
| `preparation_plan`| Text | High-level strategy |
| `schedule` | Text | Day-by-day plan |

---

## How to Initialize/Run Schema

1. **Configure Credentials**: Ensure `backend/.env` has your `DATABASE_URL` with the correct password.
2. **Start Backend**: Run the FastAPI server.
   ```powershell
   cd backend
   .\venv\Scripts\python -m uvicorn main:app --reload
   ```
3. **Auto-Generation**: On startup, the line `models.Base.metadata.create_all(bind=engine)` in `main.py` checks your Supabase instance. If these tables don't exist, it creates them instantly.

## Verification
You can verify the tables directly in the **Supabase Table Editor** after the first run.
