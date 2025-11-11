from pydantic import BaseModel
from typing import Optional

class AttendanceBase(BaseModel):
    student_id: str
    group_id: str
    lesson_date: str
    lesson_time: str
    check_in_time: Optional[str] = None
    status: str  # "pending", "approved", "absent"
    
class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None

class Attendance(AttendanceBase):
    id: str
    created_at: str
    updated_at: str

class AttendanceResponse(Attendance):
    pass
