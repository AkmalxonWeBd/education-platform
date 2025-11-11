from fastapi import APIRouter, Depends, HTTPException, status, Query
from database import JSONDatabase
from models.attendance import AttendanceResponse, AttendanceCreate
from routes.users import get_current_user
from datetime import datetime
from typing import List, Optional

router = APIRouter(tags=["attendance"])

@router.get("", response_model=List[AttendanceResponse])
def get_attendance(
    studentId: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get attendance records"""
    db = JSONDatabase()
    
    query = {}
    if studentId:
        query["studentId"] = studentId
    if date:
        query["date"] = date
    
    records = db.find("attendance", query)
    
    return [
        AttendanceResponse(
            id=record["id"],
            studentId=record["studentId"],
            date=record["date"],
            status=record["status"],
            photo=record.get("photo"),
            similarity=record.get("similarity"),
            createdAt=record.get("createdAt")
        )
        for record in records
    ]

@router.post("", response_model=AttendanceResponse)
def record_attendance(
    attendance_data: AttendanceCreate,
    current_user = Depends(get_current_user)
):
    """Record attendance"""
    db = JSONDatabase()
    
    attendance_dict = {
        "studentId": attendance_data.studentId,
        "date": attendance_data.date,
        "status": attendance_data.status,
        "photo": attendance_data.photo,
        "similarity": attendance_data.similarity,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    result = db.insert("attendance", attendance_dict)
    
    return AttendanceResponse(
        id=result["id"],
        studentId=attendance_data.studentId,
        date=attendance_data.date,
        status=attendance_data.status,
        photo=attendance_data.photo,
        similarity=attendance_data.similarity,
        createdAt=attendance_dict["createdAt"]
    )

@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: str,
    current_user = Depends(get_current_user)
):
    """Delete attendance record"""
    db = JSONDatabase()
    
    record = db.find_one("attendance", {"id": attendance_id})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    db.delete("attendance", attendance_id)
    return {"success": True, "message": "Attendance record deleted"}
