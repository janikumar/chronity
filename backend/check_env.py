import sys
import os

def check_environment():
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    try:
        import google.generativeai as genai
        print(f"✅ Gemini (google-generativeai) package found. Version: {genai.__version__}")
    except ImportError:
        print("❌ Gemini package NOT found.")

    try:
        import dotenv
        print("✅ python-dotenv package found.")
        from dotenv import load_dotenv
        load_dotenv()
        if os.getenv("GEMINI_API_KEY"):
            print("✅ GEMINI_API_KEY found in .env")
        else:
            print("⚠️ GEMINI_API_KEY NOT found in .env")
    except ImportError:
        print("❌ python-dotenv package NOT found.")

    try:
        import fastapi
        print(f"✅ FastAPI package found. Version: {fastapi.__version__}")
    except ImportError:
        print("❌ FastAPI package NOT found.")

if __name__ == "__main__":
    check_environment()
