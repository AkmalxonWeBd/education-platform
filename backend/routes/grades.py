from fastapi import APIRouter, Depends, HTTPException, status, Query
from database import JSONDatabase
from models.grade import GradeResponse, GradeCreate, GradeUpdate
from routes.users import get_current_user
from datetime import datetime
from typing import List, Optional

router = APIRouter(tags=["grades"])

@router.get("", response_model=List[GradeResponse])
def get_grades(
    studentId: Optional[str] = Query(None),
    lessonId: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get all grades"""
    db = JSONDatabase()
    
    query = {}
    if studentId:
        query["studentId"] = studentId
    if lessonId:
        query["lessonId"] = lessonId
    
    grades = db.find("grades", query)
    
    return [
        GradeResponse(
            id=grade["id"],
            studentId=grade["studentId"],
            lessonId=grade["lessonId"],
            score=grade["score"],
            element=grade["element"],
            status=grade.get("status", "pending"),
            createdAt=grade.get("createdAt")
        )
        for grade in grades
    ]

@router.post("", response_model=GradeResponse)
def create_grade(
    grade_data: GradeCreate,
    current_user = Depends(get_current_user)
):
    """Create new grade"""
    db = JSONDatabase()
    
    grade_dict = {
        "studentId": grade_data.studentId,
        "lessonId": grade_data.lessonId,
        "score": grade_data.score,
        "element": grade_data.element,
        "status": "graded",
        "createdAt": datetime.utcnow().isoformat()
    }
    
    result = db.insert("grades", grade_dict)
    
    return GradeResponse(
        id=result["id"],
        studentId=grade_data.studentId,
        lessonId=grade_data.lessonId,
        score=grade_data.score,
        element=grade_data.element,
        status="graded",
        createdAt=grade_dict["createdAt"]
    )

@router.put("/{grade_id}", response_model=GradeResponse)
def update_grade(
    grade_id: str,
    grade_data: GradeUpdate,
    current_user = Depends(get_current_user)
):
    """Update grade"""
    db = JSONDatabase()
    
    grade = db.find_one("grades", {"id": grade_id})
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    update_data = {}
    if grade_data.score is not None:
        update_data["score"] = grade_data.score
    if grade_data.element:
        update_data["element"] = grade_data.element
    if grade_data.status:
        update_data["status"] = grade_data.status
    
    if update_data:
        db.update("grades", grade_id, update_data)
    
    updated_grade = db.find_one("grades", {"id": grade_id})
    
    return GradeResponse(
        id=updated_grade["id"],
        studentId=updated_grade["studentId"],
        lessonId=updated_grade["lessonId"],
        score=updated_grade["score"],
        element=updated_grade["element"],
        status=updated_grade.get("status", "pending"),
        createdAt=updated_grade.get("createdAt")
    )

@router.delete("/{grade_id}")
def delete_grade(
    grade_id: str,
    current_user = Depends(get_current_user)
):
    """Delete grade"""
    db = JSONDatabase()
    
    grade = db.find_one("grades", {"id": grade_id})
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    db.delete("grades", grade_id)
    return {"success": True, "message": "Grade deleted"}
