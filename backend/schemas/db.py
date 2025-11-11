from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId

class DBModel:
    """Base class for database models"""
    
    def __init__(self, **data):
        self._id: Optional[ObjectId] = data.get('_id')
        for key, value in data.items():
            if key != '_id':
                setattr(self, key, value)
    
    @property
    def id(self) -> str:
        return str(self._id) if self._id else None
    
    def to_dict(self) -> dict:
        data = {}
        for key, value in self.__dict__.items():
            if key.startswith('_'):
                continue
            if isinstance(value, ObjectId):
                data[key.lstrip('_')] = str(value)
            else:
                data[key] = value
        return data

class UserDB(DBModel):
    email: str
    password: str
    name: str
    role: str
    phone: Optional[str] = None
    schoolId: Optional[str] = None
    createdAt: datetime = None

class LessonDB(DBModel):
    title: str
    groupId: str
    date: str
    time: str
    subject: str
    teacherId: str
    createdAt: datetime = None

class GradeDB(DBModel):
    studentId: str
    lessonId: str
    score: float
    element: str
    status: str = "pending"
    createdAt: datetime = None

class TestDB(DBModel):
    title: str
    groupId: str
    subject: str
    questions: List[dict]
    scheduledDate: Optional[str] = None
    status: str = "draft"
    createdAt: datetime = None

class TestResultDB(DBModel):
    testId: str
    studentId: str
    score: float
    totalPoints: float
    status: str = "pending"
    createdAt: datetime = None

class CourseDB(DBModel):
    title: str
    description: str
    isPaid: bool
    groupIds: List[str]
    videos: List[dict]
    createdAt: datetime = None

class CourseProgressDB(DBModel):
    courseId: str
    studentId: str
    videosWatched: List[str] = []
    testsCompleted: List[str] = []
    progress: float = 0
    createdAt: datetime = None

class AttendanceDB(DBModel):
    studentId: str
    date: str
    status: str
    photo: Optional[str] = None
    similarity: Optional[float] = None
    createdAt: datetime = None
