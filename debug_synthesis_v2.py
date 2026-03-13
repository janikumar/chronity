import os
from backend.services.ai_service import AIService
from backend.services.resume_service import ResumeService

# Get current working directory
cwd = os.getcwd()
print(f"Current Working Directory: {cwd}")

# List root contents
print(f"Root contents: {os.listdir('.')}")

# Try to find uploads
target_dir = "uploads"
if os.path.exists(target_dir):
    print(f"'{target_dir}' found. Contents: {os.listdir(target_dir)}")
    files = os.listdir(target_dir)
    if files:
        pdf_path = os.path.join(target_dir, files[0])
        print(f"Trying to extract from: {pdf_path}")
        text = ResumeService.extract_text_from_pdf(pdf_path)
        print(f"Extracted text length: {len(text)}")
        if text:
            print(f"First 200 chars: {text[:200]}")
            res = AIService.analyze_personal_resume(text)
            print("Analysis result:")
            print(res)
        else:
            print("No text extracted from PDF!")
    else:
        print("Uploads directory is empty.")
else:
    print(f"'{target_dir}' NOT found.")
