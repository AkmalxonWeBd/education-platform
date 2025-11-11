from pydantic import BaseModel
from typing import List, Optional
from datetime import time

class ScheduleDay(BaseModel):
    day: str  # "monday", "tuesday", etc.
    start_time: str  # "14:00"
    end_time: str  # "16:00"

class GroupBase(BaseModel):
    name: str
    teacher_id: str
    schedule: List[ScheduleDay]  # Hafta kunlari va vaqtlar
    description: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    schedule: Optional[List[ScheduleDay]] = None
    description: Optional[str] = None

class Group(GroupBase):
    id: str
    student_ids: List[str] = []
    created_at: str
    updated_at: str
