import imaplib
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

user = os.getenv("EMAIL_USER")
password = os.getenv("EMAIL_PASS")
server = os.getenv("IMAP_SERVER", "imap.gmail.com")

print(f"Testing IMAP: user={user}, server={server}")
print(f"Password (first 4 chars): {password[:4] if password else 'MISSING'}...")

try:
    mail = imaplib.IMAP4_SSL(server, 993)
    print("Connected to IMAP server OK")
    result = mail.login(user, password)
    print(f"Login result: {result}")
    mail.select("inbox")
    status, msgs = mail.search(None, 'ALL')
    ids = msgs[0].split()
    print(f"SUCCESS: Found {len(ids)} emails in inbox")
    mail.logout()
except imaplib.IMAP4.error as e:
    print(f"IMAP AUTH ERROR: {e}")
    print(">>> Fix: Go to https://myaccount.google.com/apppasswords and generate a new App Password")
except Exception as e:
    print(f"CONNECTION ERROR: {e}")
