from fastapi import APIRouter, Depends, HTTPException, status, Query
from database import JSONDatabase
from models.lesson import LessonResponse, LessonCreate, LessonUpdate
from routes.users import get_current_user
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("", response_model=List[LessonResponse])
def get_lessons(
    groupId: Optional[str] = Query(None),
    teacherId: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get all lessons"""
    db = JSONDatabase()
    
    query = {}
    if groupId:
        query["groupId"] = groupId
    if teacherId:
        query["teacherId"] = teacherId
    
    lessons = db.find("lessons", query)
    
    return [
        LessonResponse(
            id=lesson["id"],
            title=lesson["title"],
            subject=lesson["subject"],
            description=lesson.get("description"),
            assessmentElements=lesson.get("assessmentElements", []),
            groupId=lesson.get("groupId"),
            teacherId=lesson.get("teacherId"),
            createdAt=lesson.get("createdAt")
        )
        for lesson in lessons
    ]

@router.post("", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(
    lesson_data: LessonCreate,
    current_user = Depends(get_current_user)
):
    """Create new lesson"""
    db = JSONDatabase()
    
    lesson_dict = {
        "title": lesson_data.title,
        "subject": lesson_data.subject,
        "description": lesson_data.description,
        "assessmentElements": [elem.dict() for elem in lesson_data.assessmentElements] if lesson_data.assessmentElements else [],
        "groupId": lesson_data.groupId,
        "teacherId": lesson_data.teacherId or current_user.get("id"),
        "createdAt": datetime.utcnow().isoformat()
    }
    
    created_lesson = db.insert("lessons", lesson_dict)
    
    return LessonResponse(**created_lesson)

@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: str,
    lesson_data: LessonUpdate,
    current_user = Depends(get_current_user)
):
    """Update lesson"""
    db = JSONDatabase()
    
    lesson = db.find_one("lessons", {"id": lesson_id})
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    update_data = {}
    if lesson_data.title:
        update_data["title"] = lesson_data.title
    if lesson_data.date:
        update_data["date"] = lesson_data.date
    if lesson_data.time:
        update_data["time"] = lesson_data.time
    if lesson_data.subject:
        update_data["subject"] = lesson_data.subject
    if hasattr(lesson_data, 'description') and lesson_data.description:
        update_data["description"] = lesson_data.description
    if hasattr(lesson_data, 'assessmentElements') and lesson_data.assessmentElements:
        update_data["assessmentElements"] = lesson_data.assessmentElements
    
    if update_data:
        db.update("lessons", lesson_id, update_data)
    
    updated_lesson = db.find_one("lessons", {"id": lesson_id})
    
    return LessonResponse(**updated_lesson)

@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: str,
    current_user = Depends(get_current_user)
):
    """Delete lesson"""
    db = JSONDatabase()
    
    lesson = db.find_one("lessons", {"id": lesson_id})
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    db.delete("lessons", lesson_id)
    
    return {"success": True, "message": "Lesson deleted successfully"}
