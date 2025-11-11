from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class GradeBase(BaseModel):
    studentId: str
    lessonId: str
    score: float
    element: str

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    score: Optional[float] = None
    element: Optional[str] = None
    status: Optional[Literal["graded", "pending"]] = None

class GradeResponse(GradeBase):
    id: str
    status: Literal["graded", "pending"]
    createdAt: datetime

    class Config:
        from_attributes = True
