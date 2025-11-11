from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from config import settings
from routes import auth, users, lessons, grades, tests, courses, groups, video_courses, exams, chats, attendances
from database import JSONDatabase
from security import get_password_hash
from datetime import datetime

# Create data directory
os.makedirs("data", exist_ok=True)

def initialize_default_data():
    """Initialize default super admin user if not exists"""
    db = JSONDatabase()
    users = db.find("users", {})
    
    # Check if super admin exists
    super_admin_exists = any(user.get("role") == "super_admin" for user in users)
    
    if not super_admin_exists:
        # Create default super admin
        default_admin = {
            "email": "admin@education.uz",
            "name": "Super Admin",
            "password": get_password_hash("admin123"),
            "role": "super_admin",
            "phone": "+998901234567",
            "school_id": None,
            "group_id": None,
            "created_at": datetime.utcnow().isoformat()
        }
        db.insert("users", default_admin)
        print("=" * 60)
        print("✅ TOZA SAYT - FAQAT SUPER ADMIN YARATILDI!")
        print("=" * 60)
        print("📧 Email: admin@education.uz")
        print("🔑 Parol: admin123")
        print("")
        print("ℹ️  Super Admin orqali:")
        print("  - School Admin'larni qo'shing")
        print("  - School Admin'lar Teacher'larni qo'shadi")
        print("  - Teacher'lar Student'larni qo'shadi")
        print("=" * 60)
    else:
        print("✅ Super Admin allaqachon mavjud")
        print("📧 Email: admin@education.uz")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    initialize_default_data()
    yield
    # Shutdown (if needed)

app = FastAPI(
    title="Education Platform API",
    description="Professional backend for education management system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(groups.router, prefix="/api/groups", tags=["Groups"])
app.include_router(video_courses.router, prefix="/api/video-courses", tags=["Video Courses"])
app.include_router(exams.router, prefix="/api/exams", tags=["Exams"])
app.include_router(chats.router, prefix="/api/chats", tags=["Chats"])
app.include_router(attendances.router, prefix="/api/attendances", tags=["Attendances"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Lessons"])
app.include_router(grades.router, prefix="/api/grades", tags=["Grades"])
app.include_router(tests.router, prefix="/api/tests", tags=["Tests"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])

@app.get("/")
async def root():
    return {
        "message": "Education Platform API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
