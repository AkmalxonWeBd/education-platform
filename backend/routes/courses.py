from fastapi import APIRouter, Depends, HTTPException, status
from database import JSONDatabase
from models.course import CourseResponse, CourseCreate, CourseProgressResponse, CourseProgressUpdate
from routes.users import get_current_user
from datetime import datetime
from typing import List

router = APIRouter(tags=["courses"])

@router.get("", response_model=List[CourseResponse])
def get_courses(
    current_user = Depends(get_current_user)
):
    """Get all courses"""
    db = JSONDatabase()
    
    courses = db.find("courses", {})
    
    return [
        CourseResponse(
            id=course["id"],
            title=course["title"],
            description=course["description"],
            isPaid=course["isPaid"],
            groupIds=course["groupIds"],
            videos=course.get("videos", []),
            createdAt=course.get("createdAt")
        )
        for course in courses
    ]

@router.post("", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    current_user = Depends(get_current_user)
):
    """Create new course"""
    db = JSONDatabase()
    
    course_dict = {
        "title": course_data.title,
        "description": course_data.description,
        "isPaid": course_data.isPaid,
        "groupIds": course_data.groupIds,
        "videos": [v.model_dump() for v in course_data.videos],
        "createdAt": datetime.utcnow().isoformat()
    }
    
    result = db.insert("courses", course_dict)
    
    return CourseResponse(
        id=result["id"],
        title=course_data.title,
        description=course_data.description,
        isPaid=course_data.isPaid,
        groupIds=course_data.groupIds,
        videos=course_data.videos,
        createdAt=course_dict["createdAt"]
    )

@router.delete("/{course_id}")
def delete_course(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Delete course"""
    db = JSONDatabase()
    
    course = db.find_one("courses", {"id": course_id})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    db.delete("courses", course_id)
    return {"success": True, "message": "Course deleted"}

@router.get("/{course_id}/progress/{student_id}", response_model=CourseProgressResponse)
def get_course_progress(
    course_id: str,
    student_id: str,
    current_user = Depends(get_current_user)
):
    """Get course progress for student"""
    db = JSONDatabase()
    
    progress = db.find_one("course_progress", {
        "courseId": course_id,
        "studentId": student_id
    })
    
    if not progress:
        progress_dict = {
            "courseId": course_id,
            "studentId": student_id,
            "videosWatched": [],
            "testsCompleted": [],
            "progress": 0,
            "createdAt": datetime.utcnow().isoformat()
        }
        result = db.insert("course_progress", progress_dict)
        progress = result
    
    videos_watched = len(progress.get("videosWatched", []))
    total_videos = 1
    progress_percent = (videos_watched / total_videos * 100) if total_videos > 0 else 0
    
    return CourseProgressResponse(
        id=progress["id"],
        courseId=progress["courseId"],
        studentId=progress["studentId"],
        videosWatched=progress.get("videosWatched", []),
        testsCompleted=progress.get("testsCompleted", []),
        progress=progress_percent
    )

@router.put("/{course_id}/progress/{student_id}", response_model=CourseProgressResponse)
def update_course_progress(
    course_id: str,
    student_id: str,
    progress_data: CourseProgressUpdate,
    current_user = Depends(get_current_user)
):
    """Update course progress for student"""
    db = JSONDatabase()
    
    progress = db.find_one("course_progress", {
        "courseId": course_id,
        "studentId": student_id
    })
    
    if not progress:
        progress_dict = {
            "courseId": course_id,
            "studentId": student_id,
            "videosWatched": progress_data.videosWatched or [],
            "testsCompleted": progress_data.testsCompleted or [],
            "progress": 0,
            "createdAt": datetime.utcnow().isoformat()
        }
        result = db.insert("course_progress", progress_dict)
        progress = result
    else:
        update_dict = {}
        if progress_data.videosWatched is not None:
            update_dict["videosWatched"] = progress_data.videosWatched
        if progress_data.testsCompleted is not None:
            update_dict["testsCompleted"] = progress_data.testsCompleted
        
        db.update("course_progress", progress["id"], update_dict)
        progress = db.find_one("course_progress", {"id": progress["id"]})
    
    videos_watched = len(progress.get("videosWatched", []))
    total_videos = 1
    progress_percent = (videos_watched / total_videos * 100) if total_videos > 0 else 0
    
    return CourseProgressResponse(
        id=progress["id"],
        courseId=progress["courseId"],
        studentId=progress["studentId"],
        videosWatched=progress.get("videosWatched", []),
        testsCompleted=progress.get("testsCompleted", []),
        progress=progress_percent
    )
