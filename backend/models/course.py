from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Video(BaseModel):
    id: str
    title: str
    description: str
    url: str
    duration: float
    testId: Optional[str] = None

class CourseBase(BaseModel):
    title: str
    description: str
    isPaid: bool
    groupIds: List[str]
    videos: List[Video]

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: str
    createdAt: datetime

    class Config:
        from_attributes = True

class CourseProgressBase(BaseModel):
    courseId: str
    studentId: str
    videosWatched: List[str]
    testsCompleted: List[str]

class CourseProgressCreate(CourseProgressBase):
    pass

class CourseProgressUpdate(BaseModel):
    videosWatched: Optional[List[str]] = None
    testsCompleted: Optional[List[str]] = None

class CourseProgressResponse(CourseProgressBase):
    id: str
    progress: float

    class Config:
        from_attributes = True
