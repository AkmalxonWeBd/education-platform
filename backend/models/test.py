from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime

class Question(BaseModel):
    id: str
    question: str
    answers: List[str]
    correctAnswer: str
    points: float

class TestBase(BaseModel):
    title: str
    groupId: str
    subject: str
    questions: List[Question]
    scheduledDate: Optional[str] = None

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    questions: Optional[List[Question]] = None
    scheduledDate: Optional[str] = None
    status: Optional[Literal["draft", "published"]] = None

class TestResponse(TestBase):
    id: str
    status: Literal["draft", "published"]
    createdAt: datetime

    class Config:
        from_attributes = True

class TestResultBase(BaseModel):
    testId: str
    studentId: str
    score: float
    totalPoints: float

class TestResultCreate(TestResultBase):
    pass

class TestResultResponse(TestResultBase):
    id: str
    status: Literal["completed", "pending"]
    createdAt: datetime

    class Config:
        from_attributes = True
