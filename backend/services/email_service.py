import imaplib
import email
from email.header import decode_header
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class EmailService:
    @staticmethod
    def fetch_latest_emails(limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetches the latest emails from a configured IMAP server.
        """
        user = os.getenv("EMAIL_USER")
        password = os.getenv("EMAIL_PASS")
        imap_server = os.getenv("IMAP_SERVER", "imap.gmail.com")

        if not user or not password:
            print("Error: Email credentials missing in .env")
            return []

        print(f"📡 Connecting to {imap_server} for {user}...")
        emails = []
        try:
            # Connect to the server
            mail = imaplib.IMAP4_SSL(imap_server)
            mail.login(user, password)
            mail.select("inbox")
            print("Success: IMAP Login Successful")

            # Search for all emails
            status, messages = mail.search(None, 'ALL')
            if status != 'OK':
                print("Error: Failed to search emails")
                return []

            # Get the list of email IDs and take the latest ones
            mail_ids = messages[0].split()
            latest_ids = mail_ids[-limit:]
            print(f"📥 Processing {len(latest_ids)} latest emails...")

            # Blocklist for non-career noise
            blocklist = ["security alert", "verification code", "critical security", "2-Step Verification"]

            for mail_id in reversed(latest_ids):
                status, data = mail.fetch(mail_id, '(RFC822)')
                if status != 'OK':
                    continue

                for response_part in data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        
                        # Decode subject
                        subject_raw = msg.get("Subject")
                        subject = ""
                        if subject_raw:
                            decoded_parts = decode_header(subject_raw)
                            subject = ""
                            for content, encoding in decoded_parts:
                                if isinstance(content, bytes):
                                    subject += content.decode(encoding if encoding else "utf-8", errors="ignore")
                                else:
                                    subject += content
                        
                        # Filter noise instantly
                        if any(b.lower() in subject.lower() for b in blocklist):
                            continue
                        
                        # Decode sender
                        sender_raw = msg.get("From")
                        sender = ""
                        if sender_raw:
                            decoded_parts = decode_header(sender_raw)
                            sender = ""
                            for content, encoding in decoded_parts:
                                if isinstance(content, bytes):
                                    sender += content.decode(encoding if encoding else "utf-8", errors="ignore")
                                else:
                                    sender += content

                        # Get body
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                content_disposition = str(part.get("Content-Disposition"))
                                if content_type == "text/plain" and "attachment" not in content_disposition:
                                    payload = part.get_payload(decode=True)
                                    if payload:
                                        body = payload.decode(errors="ignore")
                                        break
                        else:
                            payload = msg.get_payload(decode=True)
                            if payload:
                                body = payload.decode(errors="ignore")

                        emails.append({
                            "id": mail_id.decode(),
                            "subject": subject,
                            "body": body,
                            "sender": sender
                        })

            print(f"📊 Fetched {len(emails)} emails total")
            mail.logout()
            return emails

        except Exception as e:
            print(f"Error fetching emails: {e}")
            return []

    @staticmethod
    def process_new_emails(db_session: Any):
        """
        Fetches new emails, detects opportunities, and stores them in DB.
        """
        # This will combine EmailService and AIService
        pass
