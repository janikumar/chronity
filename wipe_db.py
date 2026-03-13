from backend.database import supabase
import sys

def wipe_database():
    print("🚀 Initiating Granular Database Wipe Procedure...")
    
    # 1. Clear Opportunities
    try:
        print("🗑️ Clearing 'opportunities' table...")
        res = supabase.table("opportunities").delete().neq("id", 0).execute()
        print(f"   Done. {len(res.data) if res.data else 0} nodes removed.")
    except Exception as e:
        print(f"   ⚠️ Could not clear opportunities: {e}")
        
    # 2. Clear Work Plans
    try:
        print("🗑️ Clearing 'work_plans' table...")
        res = supabase.table("work_plans").delete().neq("id", 0).execute()
        print(f"   Done. {len(res.data) if res.data else 0} plans removed.")
    except Exception as e:
        # It's possible the table doesn't exist yet
        print(f"   ⚠️ Could not clear work_plans (may not exist): {e}")
        
    # 3. Reset User Profile (ID: 1)
    # We'll try full update first, then fallback to minimal
    print("👤 Resetting 'users' (ID: 1)...")
    full_payload = {
        "name": "",
        "skills": "",
        "resume_path": "",
        "qualification": "",
        "summary": ""
    }
    
    try:
        supabase.table("users").update(full_payload).eq("id", 1).execute()
        print("   Done. Advanced Profile data purged.")
    except Exception as e:
        print(f"   ⚠️ Advanced reset failed ({e}). Falling back to basic reset...")
        basic_payload = {
            "name": "",
            "skills": "",
            "resume_path": ""
        }
        try:
            supabase.table("users").update(basic_payload).eq("id", 1).execute()
            print("   Done. Basic Profile data purged.")
        except Exception as e2:
            print(f"   ❌ Critical failure resetting user: {e2}")

    print("\n✅ Database Wipe Operation Finished.")

if __name__ == "__main__":
    wipe_database()
