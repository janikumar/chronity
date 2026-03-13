import google.generativeai as genai
from typing import List, Dict, Any
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AIService:
    @staticmethod
    @staticmethod
    def heuristic_fallback(subject: str, body: str, sender: str = "") -> Dict[str, Any]:
        """
        Extracts basic opportunity details using basic keyword matching if Gemini fails.
        """
        import re
        
        # Combine subject and body for analysis
        search_text = f"{subject} {body}"
        
        # Heuristic Company Name
        company = ""
        # 1. Try finding "at [Company]" or "[Company] Internship" (case-insensitive)
        subj_matches = re.findall(r"(?:at|from|with|in)\s+([a-zA-Z\s]+?)(?:\s+Internship|\s+Opportunity|\s+Role|$)", subject, re.IGNORECASE)
        if subj_matches:
            company = subj_matches[0].strip().title()
        
        # 2. Try subdomain/domain if company is still missing
        if not company and sender and "@" in sender:
            try:
                domain = sender.split("@")[1].split(".")[0]
                if domain not in ["gmail", "outlook", "yahoo", "hotmail", "protonmail"]:
                    company = domain.title()
            except Exception:
                pass
                
        # 3. Fallback to first word of subject
        if not company:
            brand_match = re.search(r"^([a-zA-Z]+)", subject)
            if brand_match:
                company = brand_match.group(1).title()

        # Heuristic Role
        role_keywords = ["Internship", "Intern", "Software Engineer", "Developer", "Designer", "Associate", "Analyst", "Product Manager"]
        role = ""
        for k in role_keywords:
            if k.lower() in search_text.lower():
                role = k
                break
        
        # Refine role title
        if company and (not role or len(role) < 3):
            role = f"Opportunity at {company}"
        elif company and company.lower() not in role.lower():
             role = f"{role} at {company}"
        elif not role:
            role = "Career Opportunity"

        # Heuristic Type
        opp_type = "Opportunity"
        if "intern" in search_text.lower(): opp_type = "Internship"
        elif "hackathon" in search_text.lower(): opp_type = "Hackathon"
        elif "scholarship" in search_text.lower(): opp_type = "Scholarship"
        elif "full-time" in search_text.lower() or "job" in search_text.lower(): opp_type = "Full-time"

        # Heuristic Skills
        common_skills = ["Python", "JavaScript", "React", "C++", "Java", "SQL", "Cloud", "AI"]
        skills = [s for s in common_skills if s.lower() in search_text.lower()]

        return {
            "company": company,
            "role": role,
            "type": opp_type,
            "eligibility": "Refer to description",
            "skills": skills,
            "deadline": "See email",
            "link": f"https://www.google.com/search?q={company.replace(' ', '+')}+careers" if company else "",
            "location": "Specified in email",
            "description": body[:1000] if body else ""
        }

    @staticmethod
    def _call_gemini_http(prompt: str) -> str:
        """
        Calls Gemini API via direct HTTP request to bypass library version issues.
        Supports automatic fallback over multiple API keys.
        """
        import requests
        import json
        
        # Dynamic key collection (supports GEMINI_API_KEY_1, _2, _3, _4, etc.)
        keys = []
        for i in range(1, 11):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key and key not in keys:
                keys.append(key)
            
        # Legacy fallback
        if not keys and os.getenv("GEMINI_API_KEY"):
            keys.append(os.getenv("GEMINI_API_KEY"))

        if not keys:
            print("Error: No Gemini API keys found configured in environment.")
            return ""

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        for idx, api_key in enumerate(keys):
            key_id = idx + 1
            # Using the futuristic 2.5-flash discovered in model list
            # Correct model URL format
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            try:
                print(f"DEBUG: Attempting Gemini Key {key_id}...")
                response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'candidates' in data and len(data['candidates']) > 0:
                        return data['candidates'][0]['content']['parts'][0]['text']
                    print(f"DEBUG: Key {key_id} returned 200 but no candidates found.")
                else:
                    print(f"DEBUG: Key {key_id} failed with status {response.status_code}: {response.text[:200]}")
                    if idx < len(keys) - 1:
                        print(f"Fallback: Trying next key...")
                        continue
            except Exception as e:
                print(f"DEBUG: Error with key {key_id}: {e}")
                continue
        return ""

    @staticmethod
    def classify_email(subject: str, body: str) -> Dict[str, Any]:
        """
        Classifies an email to determine if it's a career opportunity.
        """
        prompt = f"""
        Analyze the following email and determine if it is a career opportunity (internship, job, hackathon, scholarship, competition, etc.).
        
        Subject: {subject}
        Body: {body[:2000]}
        
        Return exactly and only a JSON object with this format:
        {{
            "is_opportunity": bool,
            "opportunity_type": "string or null",
            "company": "string or null"
        }}
        """
        
        text = AIService._call_gemini_http(prompt)
        
        try:
            # Robust JSON extraction
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception:
            pass

        # Heuristic classification for fallback if AI fails
        keywords = ["intern", "hackathon", "hiring", "job", "opportunity", "application", "deadline"]
        is_opp = any(k in subject.lower() or k in body.lower() for k in keywords)
        return {
            "is_opportunity": is_opp, 
            "opportunity_type": None,
            "company": ""
        }

    @staticmethod
    def extract_opportunity_dna(subject: str, body: str) -> Dict[str, Any]:
        """
        Extracts structured data (Opportunity DNA) from unstructured text.
        """
        prompt = f"""
        Extract structured details from this opportunity description.
        IF the text is NOT a career opportunity (internship, job, hackathon, competition), return "Unknown" for company and role.
        
        Subject: {subject}
        Body: {body[:3000]}
        
        Return exactly and only a JSON object with this format:
        {{
            "company": "string",
            "role": "string",
            "type": "string",
            "eligibility": "string",
            "skills": ["string"],
            "deadline": "string",
            "link": "string",
            "location": "string",
            "description": "string"
        }}
        """
        
        text = AIService._call_gemini_http(prompt)
        
        try:
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception:
            pass

        return AIService.heuristic_fallback(subject, body)

    @staticmethod
    def extract_core_skills(resume_text: str) -> str:
        """
        Extracts a consolidated, comma-separated list of core skills from a resume.
        """
        prompt = f"""
        Analyze this resume text and extract the top 10-15 most important professional skills, both technical and soft skills.
        Return ONLY a single comma-separated string of these skills, exactly like this format:
        JavaScript, Python, Project Management, React, Data Analysis
        
        Do not include any other text, markdown blocks, or quotes.
        
        Resume text:
        {resume_text[:4000]}
        """
        
        text = AIService._call_gemini_http(prompt)
        if text:
            # Clean up the response in case Gemini includes markdown formatting
            cleaned_text = text.replace('"', '').replace('```', '').replace('\\n', '').strip()
            if cleaned_text.lower().startswith('skills:'):
                cleaned_text = cleaned_text[7:].strip()
            return cleaned_text
        return ""

    @staticmethod
    def generate_work_plan(opportunity: Dict[str, Any], days_remaining: int, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generates a personalized preparation plan for the given opportunity.
        """
        user_context = ""
        if user_data:
            user_context = f"""
            Candidate Profile:
            - Name: {user_data.get('name')}
            - Current Skills: {user_data.get('skills')}
            - Qualification: {user_data.get('qualification')}
            """

        prompt = f"""
        Generate a personalized preparation plan for this opportunity in {days_remaining} days:
        {json.dumps(opportunity)}
        
        {user_context}
        
        Focus the plan on bridging the gap between the candidate's current profile and the role requirements.
        
        Return exactly and only a JSON object with this format:
        {{
            "preparation_plan": "string (strategy summary)",
            "schedule": "string (day-by-day breakdown)"
        }}
        """
        
        text = AIService._call_gemini_http(prompt)
        
        try:
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception:
            pass

        return {
            "preparation_plan": "Personalized strategy synthesis failed. Fallback to standard review.",
            "schedule": f"Focus on core requirements over the next {days_remaining} days."
        }

    @staticmethod
    def analyze_personal_resume(resume_text: str) -> Dict[str, Any]:
        """
        Performs a deep analysis of a resume to extract candidate identity and summary.
        """
        import json
        
        prompt = f"""
        Perform a high-fidelity intelligence extraction on this candidate's resume.
        Identify their Name, Highest Qualification (Degree/Education), Core Skills, and a concise Professional Summary.
        
        Return ONLY a JSON object with this format:
        {{
            "name": "Full Name",
            "qualification": "B.Tech in CS / MBA / etc.",
            "skills": ["Skill 1", "Skill 2"],
            "summary": "A 2-sentence professional bio highlighting their core value."
        }}
        
        Resume:
        {resume_text[:6000]}
        """
        
        # Default data if AI fails
        identity = {
            "name": "",
            "qualification": "",
            "skills": [],
            "summary": ""
        }
        
        res = AIService._call_gemini_http(prompt)
        if not res:
            return AIService._heuristic_identity_extraction(resume_text)
            
        try:
            # Clean JSON response
            import re
            cleaned = res.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            
            data = json.loads(cleaned)
            # Ensure keys exist
            for key in identity:
                if key not in data:
                    data[key] = identity[key]
            return data
        except Exception as e:
            print(f"Error parsing resume JSON: {e}")
            return AIService._heuristic_identity_extraction(resume_text)

    @staticmethod
    def _heuristic_identity_extraction(resume_text: str) -> Dict[str, Any]:
        """
        Extracts identity data using simple pattern matching if AI fails.
        """
        identity = {
            "name": "",
            "qualification": "",
            "skills": [],
            "summary": "Profile synthesized via heuristic analysis (AI Quota Reached)."
        }
        
        # 1. Heuristic Skills
        common_matrix = [
            "Python", "JavaScript", "React", "Next.js", "FastAPI", "SQL", "Postgres", 
            "Docker", "AWS", "Machine Learning", "AI", "C++", "Java", "Go", "Git",
            "HTML", "CSS", "TypeScript", "Node.js", "MongoDB", "Linux", "Cloud"
        ]
        identity["skills"] = [s for s in common_matrix if s.lower() in resume_text.lower()][:12]
        
        # 2. Simple Name Extraction (First non-empty line usually contains name)
        lines = [l.strip() for l in resume_text.split('\n') if l.strip()]
        if lines:
            # Often names are short and at the top
            for line in lines[:5]:
                if 2 < len(line) < 40 and any(c.isupper() for c in line):
                    identity["name"] = line
                    break
        
        # 3. Qualification Guess
        edu_keywords = ["B.Tech", "M.Tech", "B.E.", "B.S.", "M.S.", "PhD", "MBA", "Bachelor", "Master"]
        for k in edu_keywords:
            if k.lower() in resume_text.lower():
                identity["qualification"] = k
                break
                
        return identity

    @staticmethod
    def extract_core_skills(resume_text: str) -> List[str]:
        # Legacy support
        data = AIService.analyze_personal_resume(resume_text)
        return data.get("skills", [])

    @staticmethod
    def analyze_skill_gap(
        candidate_skills: List[str],
        opportunity: Dict[str, Any],
        days_remaining: int
    ) -> Dict[str, Any]:
        """
        Computes skill gap between candidate and opportunity, then generates
        a structured preparation plan with matched skills, missing skills,
        a day-wise study schedule, and interview prep tips.
        """
        # Quick local set math so we always have data even if AI fails
        opp_skills_raw = opportunity.get("skills", "") or ""
        opp_skills = [s.strip() for s in opp_skills_raw.split(",") if s.strip()]
        candidate_lower = {s.lower() for s in candidate_skills}

        matched = [s for s in opp_skills if s.lower() in candidate_lower]
        missing = [s for s in opp_skills if s.lower() not in candidate_lower]
        match_pct = int((len(matched) / len(opp_skills)) * 100) if opp_skills else 0

        prompt = f"""
You are an expert career coach. A candidate is preparing for this role:
- Company: {opportunity.get('company', '')}
- Role: {opportunity.get('role', '')}
- Required Skills: {', '.join(opp_skills) if opp_skills else 'Not specified'}
- Deadline/Days Left: {days_remaining} days

Candidate's current skills: {', '.join(candidate_skills) if candidate_skills else 'Not provided'}
Already matched skills: {', '.join(matched) if matched else 'None'}
Skills to learn/improve: {', '.join(missing) if missing else 'None – great match!'}

Create a highly specific, actionable plan. Return ONLY a JSON object with this exact format:
{{
  "strategy": "One paragraph summarising the overall approach given the time and skill gap.",
  "interview_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "daily_plan": [
    {{"day_range": "Day 1-2", "focus": "Topic", "tasks": ["Task 1", "Task 2"]}},
    {{"day_range": "Day 3-5", "focus": "Topic", "tasks": ["Task 1", "Task 2"]}}
  ],
  "resources": [
    {{"title": "Resource name", "type": "Course/Book/Practice", "url": "https://...", "priority": "High/Medium"}}
  ]
}}
Make the daily_plan cover all {days_remaining} days in logical chunks. If days_remaining > 30 use weekly groups.
"""
        text = AIService._call_gemini_http(prompt)

        try:
            import re
            # Strip markdown fences
            cleaned = text.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception as e:
            print(f"Skill gap JSON parse error: {e}")

        # Safe fallback
        return {
            "strategy": f"Focus on acquiring the {len(missing)} missing skills over {days_remaining} days while reinforcing the {len(matched)} you already have.",
            "interview_tips": [
                "Research the company's products and culture thoroughly.",
                "Prepare STAR-format answers for behavioural questions.",
                "Practice coding problems on LeetCode or HackerRank.",
                "Revise fundamentals for every required skill.",
                "Prepare 3 thoughtful questions to ask the interviewer."
            ],
            "daily_plan": [
                {"day_range": f"Day 1-{max(1, days_remaining//3)}", "focus": "Core skill reinforcement", "tasks": [f"Study: {s}" for s in (missing[:2] if missing else matched[:2])]},
                {"day_range": f"Day {max(2, days_remaining//3+1)}-{max(2, days_remaining//3*2)}", "focus": "Practice & Projects", "tasks": ["Build a small project using required skills", "Solve 5 relevant problems"]},
                {"day_range": f"Day {max(3, days_remaining//3*2+1)}-{days_remaining}", "focus": "Interview Preparation", "tasks": ["Mock interviews", "Research company", "Revise all topics"]}
            ],
            "resources": [
                {"title": "LeetCode", "type": "Practice", "url": "https://leetcode.com", "priority": "High"},
                {"title": "freeCodeCamp", "type": "Course", "url": "https://freecodecamp.org", "priority": "High"}
            ]
        }


