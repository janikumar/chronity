from backend.services.email_service import EmailService
from backend.services.ai_service import AIService
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env"))

def test_sync():
    print("🚀 Starting manual sync test...")
    emails = EmailService.fetch_latest_emails(limit=5)
    if not emails:
        print("❌ No emails fetched. Check IMAP settings.")
        return

    print(f"✅ Fetched {len(emails)} emails.")
    for email in emails:
        print(f"\n--- Checking: {email['subject']} ---")
        classification = AIService.classify_email(email['subject'], email['body'])
        print(f"AI Classification: {classification}")
        
        if classification.get('is_opportunity'):
            print("✅ Opportunity detected. Extracting DNA...")
            dna = AIService.extract_opportunity_dna(email['subject'], email['body'])
            print(f"Extracted DNA: {dna}")

if __name__ == "__main__":
    test_sync()
