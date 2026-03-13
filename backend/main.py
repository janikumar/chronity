from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import shutil
import backend.models as models
from backend.database import supabase
from backend.services.ai_service import AIService
from backend.services.email_service import EmailService
from backend.services.scraping_service import ScrapingService
from backend.services.resume_service import ResumeService
import asyncio


app = FastAPI(title="Chronity API")

@app.on_event("startup")
async def startup_event():
    try:
        # Check for default user
        res = supabase.table("users").select("*").eq("id", 1).execute()
        if not res.data:
            supabase.table("users").insert({
                "id": 1,
                "name": "Demo User",
                "email": "demo@example.com",
                "skills": "Python, React, FastAPI, SQL"
            }).execute()
            print("Success: Default user created/verified.")
    except Exception as e:
        print(f"⚠️ Warning: Could not connect to Supabase on startup: {e}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily using wildcard to rule out origin mismatch
    allow_credentials=False, # Credentials can't be used with wildcard, disabling for stability
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Chronity - Opportunity Intelligence Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/opportunities", response_model=List[dict])
def get_opportunities():
    # Fetch user skills for matching
    user_res = supabase.table("users").select("skills").eq("id", 1).single().execute()
    user_skills = set()
    if user_res.data and user_res.data.get("skills"):
        user_skills = {s.strip().lower() for s in user_res.data["skills"].split(",") if s.strip()}
        
    # Fetch opportunities
    res = supabase.table("opportunities").select("*").order("extracted_at", desc=True).execute()
    opportunities = res.data or []
    
    # Calculate match scores
    for opp in opportunities:
        opp_skills_str = opp.get("skills") or ""
        if opp_skills_str:
            opp_skills = {s.strip().lower() for s in opp_skills_str.split(",") if s.strip()}
            if opp_skills:
                matching = user_skills.intersection(opp_skills)
                # Score is % of required skills met, or 50% base if user has high overlap
                score = int((len(matching) / len(opp_skills)) * 100) if len(opp_skills) > 0 else 0
                opp["match_score"] = score
            else:
                opp["match_score"] = 0
        else:
            opp["match_score"] = 0
            
    return opportunities

@app.post("/sync-emails")
async def sync_emails():
    print("Initiating Email Intelligence Pulse (Target: 10 node scan)...")
    emails = EmailService.fetch_latest_emails(limit=10)
    processed_count = 0

    if not emails:
        print("No emails found in inbox scan range.")
        return {"status": "success", "processed": 0}

    print(f"Beginning sequential analysis of {len(emails)} emails...")
    for email in emails:
        try:
            await asyncio.sleep(1) # Asynchronous pacing
            print(f"Scanning: {email['subject'][:60]}")
            
            # Combine classification/extraction with sender context
            dna = AIService.extract_opportunity_dna(email['subject'], email['body'])
            
            # If AI fails, use the enhanced heuristic with sender context
            if not dna.get('company'):
                dna = AIService.heuristic_fallback(email['subject'], email['body'], email['sender'])
                
            company_name = dna.get('company', '')
            role_name = dna.get('role', '')
            
            if company_name or role_name:
                skills = dna.get('skills', [])
                if not isinstance(skills, list):
                    skills = []
                    
                # Deduplication Check
                query = supabase.table("opportunities").select("id").eq("company", company_name).eq("role", role_name)
                if not company_name:
                    query = query.filter("description", "ilike", f"%{email['subject'][:20]}%")
                
                existing = query.execute()
                if existing.data:
                    print(f"  - Skip: Duplicate detected for {role_name} at {company_name}")
                    continue
                    
                supabase.table("opportunities").insert({
                    "company": company_name,
                    "role": role_name,
                    "type": dna.get('type', 'Opportunity'),
                    "skills": ", ".join(skills),
                    "deadline": dna.get('deadline', ''),
                    "link": dna.get('link', ''),
                    "source": "Email",
                    "description": email['body']
                }).execute()
                
                print(f"  + New Discovery: {role_name} at {company_name}")
                processed_count += 1
            else:
                print(f"  . Pass: No clear opportunity detected.")
        except Exception as e:
            print(f"  ! Error processing email: {e}")
            
    print(f"Deep Scan Finished. Acquired {processed_count} new nodes.")
    return {"status": "success", "processed": processed_count}

@app.post("/intel-upload")
async def intel_upload(payload: dict):
    """
    Accepts pasted text (job description, opportunity notice, etc.),
    uses AI to extract structured data, and saves it as an opportunity.
    """
    text = payload.get("text", "").strip()
    if not text or len(text) < 20:
        raise HTTPException(status_code=400, detail="Text too short to analyze.")

    # Use AI to extract opportunity DNA from the pasted text
    dna = AIService.extract_opportunity_dna(subject="", body=text)

    # Fallback to heuristic if AI returns empty
    if not dna.get("company") and not dna.get("role"):
        dna = AIService.heuristic_fallback(subject="", body=text, sender="")

    company_name = dna.get("company", "").strip()
    role_name    = dna.get("role", "").strip()

    if not company_name and not role_name:
        raise HTTPException(status_code=422, detail="Could not extract opportunity details from the text. Try adding more context.")

    skills = dna.get("skills", [])
    if not isinstance(skills, list):
        skills = []

    result = supabase.table("opportunities").insert({
        "company":     company_name,
        "role":        role_name,
        "type":        dna.get("type", "Opportunity"),
        "skills":      ", ".join(skills),
        "deadline":    dna.get("deadline", ""),
        "link":        dna.get("link", ""),
        "source":      "Intel Upload",
        "description": text[:3000],
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save opportunity to database.")

    return {
        "status": "success",
        "opportunity": result.data[0],
        "extracted": {
            "company":  company_name,
            "role":     role_name,
            "type":     dna.get("type"),
            "deadline": dna.get("deadline"),
            "skills":   skills,
        }
    }

@app.get("/profile")
def get_profile():
    # Fetch default user (id=1)
    res = supabase.table("users").select("*").eq("id", 1).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data

@app.post("/profile/resume")
async def upload_profile_resume(file: UploadFile = File(...)):
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_path = os.path.join(upload_dir, file.filename)
    
    try:
        # Save file
        with open(file_path, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Extract text from the PDF
        resume_text = ResumeService.extract_text_from_pdf(file_path)
        
        # Perform deep AI analysis
        resume_data = AIService.analyze_personal_resume(resume_text)
        
        # Extract fields
        name = resume_data.get("name", "")
        qualification = resume_data.get("qualification", "")
        skills_list = resume_data.get("skills", [])
        summary = resume_data.get("summary", "")
        
        # Prepare skills string
        skills_string = ", ".join(skills_list) if isinstance(skills_list, list) else str(skills_list)
        
        # Store in users table with resilience for missing columns
        update_payload = {
            "name": name,
            "resume_path": file_path,
            "skills": skills_string
        }
        
        # Only try adding new columns if they might exist
        try:
            # First attempt: Full update
            full_payload = {**update_payload, "qualification": qualification, "summary": summary}
            supabase.table("users").update(full_payload).eq("id", 1).execute()
        except Exception:
            # Fallback: Basic update for legacy schema
            print("Warning: Advanced identity columns (qualification/summary) missing. Falling back to basic update.")
            supabase.table("users").update(update_payload).eq("id", 1).execute()
        
        return {
            "status": "success", 
            "message": "Resume uploaded and identity matrix synthesized successfully",
            "data": {
                "name": name,
                "qualification": qualification,
                "skills": skills_string,
                "summary": summary
            },
            "path": file_path
        }
    except Exception as e:
        # Cleanup if failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-resume/{opportunity_id}")
async def analyze_resume(opportunity_id: int, file: UploadFile = None, use_profile: bool = False):
    file_location = None
    try:
        if use_profile:
            # Fetch stored resume path from DB
            user_res = supabase.table("users").select("resume_path").eq("id", 1).single().execute()
            if not user_res.data or not user_res.data.get("resume_path"):
                raise HTTPException(status_code=400, detail="No stored resume found. Please upload one in Profile first.")
            file_location = user_res.data["resume_path"]
        else:
            if not file:
                raise HTTPException(status_code=400, detail="No file payload provided.")
            file_location = f"temp_{file.filename}"
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
        
        # Extract text
        resume_text = ResumeService.extract_text_from_pdf(file_location)
        
        # Get opportunity requirements
        res = supabase.table("opportunities").select("skills").eq("id", opportunity_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Opportunity node not found")
            
        skills_list = [s.strip() for s in res.data['skills'].split(",") if s.strip()]
        
        # Cross-analyze
        return ResumeService.analyze_resume(resume_text, skills_list)
    finally:
        # Cleanup only if it's a temporary upload
        if file_location and file_location.startswith("temp_") and os.path.exists(file_location):
            os.remove(file_location)

@app.post("/generate-plan/{opportunity_id}")
def generate_plan(opportunity_id: int):
    # Fetch opportunity target
    res = supabase.table("opportunities").select("*").eq("id", opportunity_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Opportunity node not found")
    opp = res.data

    # Fetch candidate profile
    user_res = supabase.table("users").select("*").eq("id", 1).single().execute()
    user_data = user_res.data if user_res.data else {}

    # Parse candidate skills
    raw_skills = user_data.get("skills", "") or ""
    candidate_skills = [s.strip() for s in raw_skills.split(",") if s.strip()]

    # Parse opportunity skills
    opp_skills_raw = opp.get("skills", "") or ""
    opp_skills_list = [s.strip() for s in opp_skills_raw.split(",") if s.strip()]
    candidate_lower = {s.lower() for s in candidate_skills}
    matched_skills = [s for s in opp_skills_list if s.lower() in candidate_lower]
    missing_skills = [s for s in opp_skills_list if s.lower() not in candidate_lower]

    # Calculate days remaining from deadline
    import datetime, re as _re
    days_remaining = 14  # default
    deadline_str = opp.get("deadline", "") or ""
    if deadline_str:
        try:
            # Try common date formats
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d %B %Y", "%B %d, %Y"]:
                try:
                    dl = datetime.datetime.strptime(deadline_str.strip(), fmt)
                    diff = (dl - datetime.datetime.utcnow()).days
                    days_remaining = max(1, diff)
                    break
                except ValueError:
                    continue
            # Extract number if text like "in 21 days"
            if days_remaining == 14:
                m = _re.search(r"(\d+)\s*day", deadline_str, _re.IGNORECASE)
                if m:
                    days_remaining = max(1, int(m.group(1)))
        except Exception:
            pass

    # Run deep skill-gap AI analysis
    opportunity_data = {
        "company": opp.get("company", ""),
        "role": opp.get("role", ""),
        "skills": opp.get("skills", ""),
        "type": opp.get("type", ""),
    }
    analysis = AIService.analyze_skill_gap(candidate_skills, opportunity_data, days_remaining)

    match_pct = int((len(matched_skills) / len(opp_skills_list)) * 100) if opp_skills_list else 0

    result = {
        "company": opp.get("company"),
        "role": opp.get("role"),
        "deadline": deadline_str,
        "days_remaining": days_remaining,
        "match_score": match_pct,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "candidate_skills": candidate_skills,
        "strategy": analysis.get("strategy", ""),
        "interview_tips": analysis.get("interview_tips", []),
        "daily_plan": analysis.get("daily_plan", []),
        "resources": analysis.get("resources", []),
    }

    # Also persist as a legacy work plan
    try:
        supabase.table("work_plans").insert({
            "user_id": 1,
            "opportunity_id": opportunity_id,
            "preparation_plan": analysis.get("strategy", ""),
            "schedule": str(analysis.get("daily_plan", ""))
        }).execute()
    except Exception:
        pass

    return result


@app.get("/notifications")
def get_notifications():
    """
    Returns opportunities whose deadline falls within the next 7 days.
    For each, generates an AI 'why you should apply' pitch.
    """
    import datetime, re as _re

    # Fetch all opportunities
    res = supabase.table("opportunities").select("*").execute()
    all_opps = res.data or []

    # Fetch user skills for personalised pitch
    user_res = supabase.table("users").select("skills,name").eq("id", 1).single().execute()
    user_data = user_res.data if user_res.data else {}
    candidate_skills = [s.strip() for s in (user_data.get("skills") or "").split(",") if s.strip()]

    now = datetime.datetime.utcnow()
    urgent = []

    for opp in all_opps:
        deadline_str = (opp.get("deadline") or "").strip()
        if not deadline_str:
            continue

        days_left = None
        # Try parsing known date formats
        for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d %B %Y", "%B %d, %Y", "%d-%m-%Y"]:
            try:
                dl = datetime.datetime.strptime(deadline_str, fmt)
                days_left = (dl - now).days
                break
            except ValueError:
                continue

        # Try extracting plain numbers like "in 5 days"
        if days_left is None:
            m = _re.search(r"(\d+)\s*day", deadline_str, _re.IGNORECASE)
            if m:
                days_left = int(m.group(1))

        if days_left is None or days_left < 0 or days_left > 7:
            continue

        # Skill match score
        opp_skills_raw = opp.get("skills") or ""
        opp_skills = [s.strip() for s in opp_skills_raw.split(",") if s.strip()]
        candidate_lower = {s.lower() for s in candidate_skills}
        matched = [s for s in opp_skills if s.lower() in candidate_lower]
        match_pct = int((len(matched) / len(opp_skills)) * 100) if opp_skills else 0

        urgent.append({
            "id": opp["id"],
            "company": opp.get("company", ""),
            "role": opp.get("role", ""),
            "type": opp.get("type", ""),
            "deadline": deadline_str,
            "days_left": days_left,
            "link": opp.get("link", ""),
            "skills": opp_skills,
            "matched_skills": matched,
            "match_score": match_pct,
            "why_apply": _generate_why_apply(opp, candidate_skills, days_left),
        })

    # Sort by urgency (fewest days first)
    urgent.sort(key=lambda x: x["days_left"])
    return {"count": len(urgent), "notifications": urgent}


def _generate_why_apply(opp: dict, candidate_skills: list, days_left: int) -> str:
    """Uses AI to generate a personalised reason to apply. Falls back to a template."""
    opp_skills_raw = opp.get("skills") or ""
    opp_skills = [s.strip() for s in opp_skills_raw.split(",") if s.strip()]

    prompt = f"""
You are a career coach writing to a candidate. Convince them in 2-3 persuasive sentences why they should apply NOW to this opportunity (deadline in {days_left} days).

Opportunity:
- Company: {opp.get('company', '')}
- Role: {opp.get('role', '')}
- Type: {opp.get('type', '')}
- Required Skills: {', '.join(opp_skills) if opp_skills else 'Not specified'}
- Candidate's Skills: {', '.join(candidate_skills) if candidate_skills else 'Not available'}

Be specific, motivating, and urgent. Mention the deadline urgency. Keep it under 60 words.
"""
    text = AIService._call_gemini_http(prompt).strip()
    if text and len(text) > 20:
        return text

    # Inline fallback
    skill_note = f"You already have {len([s for s in opp_skills if s.lower() in {c.lower() for c in candidate_skills}])} of the required skills." if opp_skills else ""
    return (
        f"This {opp.get('type','opportunity')} at {opp.get('company','')} is a strong match for your profile. "
        f"{skill_note} With only {days_left} day{'s' if days_left != 1 else ''} left, apply now before the window closes!"
    )


