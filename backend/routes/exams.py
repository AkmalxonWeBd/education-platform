from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.exam import ExamCreate, ExamUpdate, Exam, ExamResult, ExamOption
from database import JSONDatabase
from security import get_current_user
from datetime import datetime

router = APIRouter()
db = JSONDatabase()

@router.post("", response_model=Exam)
def create_exam(exam: ExamCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create exams")
    
    exam_dict = exam.model_dump()
    exam_dict["results"] = []
    exam_dict["option_names"] = []
    exam_dict["created_at"] = datetime.now().isoformat()
    exam_dict["updated_at"] = datetime.now().isoformat()
    
    result = db.insert_one("exams", exam_dict)
    return result

@router.get("", response_model=List[Exam])
def get_exams(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "teacher":
        exams = db.find("exams", {"teacher_id": current_user["id"]})
    elif current_user["role"] == "student":
        user = db.find_one("users", {"id": current_user["id"]})
        group_id = user.get("group_id")
        exams = db.find("exams", {"group_ids": {"$in": [group_id]}}) if group_id else []
    else:
        exams = db.find("exams")
    return exams

@router.post("/{exam_id}/results")
def add_exam_result(exam_id: str, result: ExamResult, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can add results")
    
    exam = db.find_one("exams", {"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if not exam.get("option_names"):
        exam["option_names"] = [opt.name for opt in result.options]
    
    exam["results"].append(result.model_dump())
    db.update_one("exams", {"id": exam_id}, {
        "results": exam["results"],
        "option_names": exam["option_names"]
    })
    
    return {"message": "Result added successfully"}
