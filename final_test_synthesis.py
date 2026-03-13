from backend.services.ai_service import AIService
from backend.services.resume_service import ResumeService
import os

pdf_path = r"uploads\Hemanth_Resume.pdf"
if os.path.exists(pdf_path):
    text = ResumeService.extract_text_from_pdf(pdf_path)
    print(f"Extracted text length: {len(text)}")
    print(f"First 100 chars: {text[:100]}")
    
    # This should now trigger the heuristic fallback if API fails
    res = AIService.analyze_personal_resume(text)
    print("Final result (Heuristic or AI):")
    print(res)
else:
    print(f"File not found: {pdf_path}")
