from pydantic import BaseModel
from typing import List, Optional

class QuizAnswer(BaseModel):
    text: str
    is_correct: bool

class Quiz(BaseModel):
    question: str
    answers: List[QuizAnswer]

class Video(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    video_url: str
    quizzes: List[Quiz] = []
    order: int

class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str

class VideoCourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_free: bool
    allowed_group_ids: List[str] = []

class VideoCourseCreate(VideoCourseBase):
    pass

class VideoCourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_free: Optional[bool] = None
    allowed_group_ids: Optional[List[str]] = None

class VideoCourse(VideoCourseBase):
    id: str
    teacher_id: str
    videos: List[Video] = []
    created_at: str
    updated_at: str

class CourseAccessRequest(BaseModel):
    id: str
    course_id: str
    student_id: str
    status: str
    created_at: str

class QuizCreate(BaseModel):
    question: str
    answers: List[QuizAnswer]
