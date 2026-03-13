import google.generativeai as genai
import os
import imaplib
from dotenv import load_dotenv

load_dotenv(os.path.join("backend", ".env"))

def diagnose():
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")
    api_key = os.getenv("GEMINI_API_KEY")
    
    print(f"--- Configuration Check ---")
    print(f"Email User: {user}")
    print(f"Password set: {'Yes' if password else 'No'}")
    print(f"API Key set: {'Yes' if api_key else 'No'}")
    
    # 1. Test IMAP
    print(f"\n--- Testing IMAP Connection ---")
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(user, password)
        mail.select("inbox")
        status, messages = mail.search(None, 'ALL')
        mail_ids = messages[0].split()
        print(f"✅ IMAP Success! Found {len(mail_ids)} total emails.")
        mail.logout()
    except Exception as e:
        print(f"❌ IMAP Failure: {e}")

    # 2. Test AI
    print(f"\n--- Testing Gemini AI (models/gemini-1.5-flash) ---")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content("Is this an internship opportunity? Subject: SWE Intern Role")
        print(f"✅ AI Success! Response: {response.text[:50]}...")
    except Exception as e:
        print(f"❌ AI Failure: {e}")

if __name__ == "__main__":
    diagnose()
