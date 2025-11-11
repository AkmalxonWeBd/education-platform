from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.attendance import AttendanceCreate, AttendanceUpdate, Attendance
from database import JSONDatabase
from security import get_current_user
from datetime import datetime

router = APIRouter()
db = JSONDatabase()

@router.post("", response_model=Attendance)
def create_attendance_request(attendance: AttendanceCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can mark attendance")
    
    attendance_dict = attendance.model_dump()
    attendance_dict["created_at"] = datetime.now().isoformat()
    attendance_dict["updated_at"] = datetime.now().isoformat()
    
    result = db.insert_one("attendances", attendance_dict)
    
    group = db.find_one("groups", {"id": attendance.group_id})
    if group:
        from models.chat import MessageCreate
        message = MessageCreate(
            sender_id=current_user["id"],
            receiver_id=group["teacher_id"],
            content=f"Davomat: {attendance.lesson_date} - {attendance.lesson_time}",
            message_type="attendance_request"
        )
        
        message_dict = message.model_dump()
        message_dict["is_read"] = False
        message_dict["created_at"] = datetime.now().isoformat()
        db.insert_one("messages", message_dict)
    
    return result

@router.put("/{attendance_id}", response_model=Attendance)
def update_attendance(attendance_id: str, update: AttendanceUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can approve attendance")
    
    attendance = db.find_one("attendances", {"id": attendance_id})
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    update_data = {k: v for k, v in update.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now().isoformat()
    
    updated_attendance = db.update_one("attendances", {"id": attendance_id}, update_data)
    return updated_attendance

@router.get("", response_model=List[Attendance])
def get_attendances(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "student":
        attendances = db.find("attendances", {"student_id": current_user["id"]})
    elif current_user["role"] == "teacher":
        groups = db.find("groups", {"teacher_id": current_user["id"]})
        group_ids = [g["id"] for g in groups]
        attendances = db.find("attendances", {"group_id": {"$in": group_ids}})
    else:
        attendances = db.find("attendances")
    return attendances
