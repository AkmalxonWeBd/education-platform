"""Script to clean all mock data and keep only empty collections"""
import os
import json
from pathlib import Path

DATA_DIR = "data"

def clean_all_data():
    """Remove all data files and recreate empty collections"""
    collections = [
        "users",
        "lessons",
        "grades",
        "tests",
        "test_results",
        "courses",
        "course_progress",
        "attendance"
    ]
    
    print("🧹 Barcha mock ma'lumotlarni tozalash boshlandi...")
    print("=" * 60)
    
    # Create data directory if not exists
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Clean each collection
    for collection in collections:
        file_path = os.path.join(DATA_DIR, f"{collection}.json")
        
        # Write empty array to file
        with open(file_path, "w") as f:
            json.dump([], f, indent=2)
        
        print(f"✓ {collection}.json tozalandi")
    
    print("=" * 60)
    print("✅ Barcha ma'lumotlar tozalandi!")
    print("")
    print("Keyingi qadam:")
    print("1. Backend'ni ishga tushiring: python main.py")
    print("2. Super Admin avtomatik yaratiladi")
    print("3. admin@education.uz / admin123 bilan kiring")
    print("=" * 60)

if __name__ == "__main__":
    clean_all_data()
