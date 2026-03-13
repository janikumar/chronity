import os
from backend.services.resume_service import ResumeService

pdf_path = r"uploads\Hemanth_Resume.pdf"
if os.path.exists(pdf_path):
    text = ResumeService.extract_text_from_pdf(pdf_path)
    print(f"Extracted text from '{pdf_path}':")
    print(f"Length: {len(text)}")
    if text:
        print(f"First 200 chars: {text[:200]}")
    else:
        print("EXTRACTION FAILED: Returned empty string.")
else:
    print(f"File not found: {pdf_path}")
