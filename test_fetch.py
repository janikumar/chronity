from backend.services.email_service import EmailService
import os

def test_emails():
    print(f"DEBUG: EMAIL_USER={os.getenv('EMAIL_USER')}")
    emails = EmailService.fetch_latest_emails(limit=50)
    print(f"DEBUG: Fetched {len(emails)} emails")
    for e in emails:
        print(f"SUBJECT: {e['subject']}")
        print(f"BODY_PREVIEW: {e['body'][:100]}...")
        print("-" * 20)

if __name__ == "__main__":
    test_emails()
