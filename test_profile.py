import requests
import json
import os

def create_dummy_pdf(filename="test_resume.pdf"):
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(filename)
    c.drawString(100, 750, "Jane Doe - Software Engineer")
    c.drawString(100, 730, "Email: jane@example.com")
    c.drawString(100, 700, "Experience: 5 years building scalable web applications.")
    c.drawString(100, 680, "Skills: Python, TypeScript, React, Next.js, FastAPI, PostgreSQL.")
    c.drawString(100, 660, "Soft Skills: Agile, Leadership, Technical Writing.")
    c.save()
    print(f"Created {filename}")
    return True

def test_profile_upload():
    try:
        import reportlab
    except ImportError:
        import subprocess
        subprocess.run(["pip", "install", "reportlab"])
        
    create_dummy_pdf()
        
    url = "http://localhost:8000/profile/resume"
    files = {'file': open('test_resume.pdf', 'rb')}
    
    print("\n--- Sending request to /profile/resume ---")
    response = requests.post(url, files=files)
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2) if response.status_code == 200 else response.text}")
    
    print("\n--- Verifying Database ---")
    from backend.database import supabase
    res = supabase.table('users').select('*').eq('id', 1).single().execute()
    print(f"DB Skills: {res.data.get('skills')}")
    print(f"DB Resume Path: {res.data.get('resume_path')}")

if __name__ == "__main__":
    test_profile_upload()
