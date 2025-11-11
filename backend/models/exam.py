from pydantic import BaseModel
from typing import List, Optional

class ExamOption(BaseModel):
    name: str  # "O'qish", "Eshitish", etc.
    score: float

class ExamResult(BaseModel):
    student_id: str
    options: List[ExamOption]
    total_score: float
    exam_date: str

class ExamBase(BaseModel):
    name: str
    frequency: str  # "weekly", "monthly", "yearly"
    day_of_week: Optional[str] = None  # For weekly: "monday", "tuesday", etc.
    day_of_month: Optional[int] = None  # For monthly: 1-31
    specific_date: Optional[str] = None  # For yearly: "2024-03-15"
    teacher_id: str
    group_ids: List[str]

class ExamCreate(ExamBase):
    pass

class ExamUpdate(BaseModel):
    name: Optional[str] = None
    group_ids: Optional[List[str]] = None

class Exam(ExamBase):
    id: str
    results: List[ExamResult] = []
    option_names: List[str] = []  # First time entry defines these
    created_at: str
    updated_at: str
