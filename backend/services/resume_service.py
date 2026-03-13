import fitz  # PyMuPDF
from typing import Dict, Any, List

class ResumeService:
    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        """
        Extracts all text from a PDF resume.
        """
        text = ""
        try:
            doc = fitz.open(pdf_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
        return text

    @staticmethod
    def analyze_resume(resume_text: str, opportunity_skills: List[str]) -> Dict[str, Any]:
        """
        Uses Gemini (with multi-key fallback) to analyze a resume against opportunity skills.
        """
        from backend.services.ai_service import AIService
        import json
        
        prompt = f"""
        Compare this resume text against the required skills.
        
        Resume Text: {resume_text[:5000]}
        Required Skills: {", ".join(opportunity_skills)}
        
        Return exactly and only a JSON object with this format:
        {{
            "matching_skills": ["string"],
            "missing_skills": ["string"]
        }}
        """
        
        res = AIService._call_gemini_http(prompt)
        if not res:
            matching = [s for s in opportunity_skills if s.lower() in resume_text.lower()]
            missing = [s for s in opportunity_skills if s.lower() not in resume_text.lower()]
            return {"matching_skills": matching, "missing_skills": missing}
            
        try:
            import re
            cleaned = res.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            return json.loads(cleaned)
        except Exception:
            matching = [s for s in opportunity_skills if s.lower() in resume_text.lower()]
            missing = [s for s in opportunity_skills if s.lower() not in resume_text.lower()]
            return {"matching_skills": matching, "missing_skills": missing}
