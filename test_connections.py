import os
from dotenv import load_dotenv
from backend.services.email_service import EmailService
from backend.services.ai_service import AIService

load_dotenv('backend/.env')

print("--- Testing IMAP Connection ---")
try:
    emails = EmailService.fetch_latest_emails(limit=1)
    print(f"Success: Fetched {len(emails)} email(s)")
except Exception as e:
    print(f"IMAP Error: {e}")

print("\n--- Testing Gemini Multi-Key Rotation ---")
try:
    res = AIService._call_gemini_http("Hello, respond with 'System Online'.")
    if res:
        print(f"Success: Gemini Response: {res.strip()}")
    else:
        print("Failure: Gemini returned empty response.")
except Exception as e:
    print(f"Gemini Error: {e}")
