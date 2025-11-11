from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class AssessmentElement(BaseModel):
    name: str
    weight: int

class LessonBase(BaseModel):
    title: str
    subject: Optional[str] = None
    description: Optional[str] = None
    assessmentElements: Optional[List[AssessmentElement]] = None

class LessonCreate(LessonBase):
    groupId: Optional[str] = None
    teacherId: Optional[str] = None

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    assessmentElements: Optional[List[AssessmentElement]] = None

class LessonResponse(LessonBase):
    id: str
    groupId: Optional[str] = None
    teacherId: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True
