from backend.services.ai_service import AIService
from backend.services.resume_service import ResumeService
import os

pdf_path = r"c:\Users\heman\OneDrive\Desktop\gem\Aadhrita\chronity\uploads\Hemanth_Resume.pdf"
if not os.path.exists(pdf_path):
    print(f"File not found: {pdf_path}")
    exit(1)

text = ResumeService.extract_text_from_pdf(pdf_path)
print(f"Extracted text length: {len(text)}")
print(f"First 500 chars: {text[:500]}")

res = AIService.analyze_personal_resume(text)
print("Analysis result:")
print(res)
