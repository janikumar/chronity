import requests
import json

def diagnose_sync():
    print("--- 1. Testing /sync-emails ---")
    try:
        response = requests.post("http://localhost:8000/sync-emails")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error calling /sync-emails: {e}")

    print("\n--- 2. Checking Supabase Database ---")
    try:
        from backend.database import supabase
        res = supabase.table("opportunities").select("*").execute()
        print(f"Total opportunities in DB: {len(res.data)}")
        for opp in res.data[:3]:
            print(f"- {opp.get('role')} at {opp.get('company')}")
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    diagnose_sync()
