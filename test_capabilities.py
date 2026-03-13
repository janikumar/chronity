import requests
import os
import json
from dotenv import load_dotenv

load_dotenv(os.path.join("backend", ".env"))
api_key = os.getenv("GEMINI_API_KEY")

# Check model capabilities
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)
if response.status_code == 200:
    models = response.json().get('models', [])
    for m in models:
        # Check if generateContent is supported
        if 'generateContent' in m.get('supportedGenerationMethods', []):
            print(f"AVAILABLE: {m['name']}")
            # Try a test call for the first one that works
            test_url = f"https://generativelanguage.googleapis.com/v1beta/{m['name']}:generateContent?key={api_key}"
            test_data = {"contents": [{"parts":[{"text": "ping"}]}]}
            test_res = requests.post(test_url, json=test_data)
            if test_res.status_code == 200:
                print(f"✅ VERIFIED: {m['name']}")
                break
            else:
                print(f"❌ FAILED {m['name']}: {test_res.status_code} {test_res.text[:100]}")
else:
    print(f"ERROR: {response.status_code} {response.text}")
