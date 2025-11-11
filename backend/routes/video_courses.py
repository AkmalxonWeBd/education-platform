from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.video_course import (
    VideoCourseCreate, VideoCourseUpdate, VideoCourse,
    Video, VideoCreate, Quiz, QuizCreate, CourseAccessRequest
)
from database import JSONDatabase
from security import get_current_user
from datetime import datetime
import uuid

router = APIRouter()
db = JSONDatabase()

@router.post("", response_model=VideoCourse)
def create_video_course(course: VideoCourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create courses")
    
    course_dict = course.model_dump()
    course_dict["teacher_id"] = current_user["id"]
    course_dict["videos"] = []
    course_dict["created_at"] = datetime.now().isoformat()
    course_dict["updated_at"] = datetime.now().isoformat()
    
    result = db.insert_one("video_courses", course_dict)
    return result

@router.get("", response_model=List[VideoCourse])
def get_video_courses(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "teacher":
        courses = db.find("video_courses", {"teacher_id": current_user["id"]})
    elif current_user["role"] == "student":
        user = db.find_one("users", {"id": current_user["id"]})
        group_id = user.get("group_id")
        
        free_courses = db.find("video_courses", {
            "is_free": True,
            "allowed_group_ids": {"$in": [group_id]} if group_id else []
        })
        
        approved_requests = db.find("course_access_requests", {
            "student_id": current_user["id"],
            "status": "approved"
        })
        approved_course_ids = [req["course_id"] for req in approved_requests]
        
        paid_courses = db.find("video_courses", {
            "id": {"$in": approved_course_ids}
        })
        
        courses = free_courses + paid_courses
    else:
        courses = db.find("video_courses")
    
    return courses

@router.get("/{course_id}", response_model=VideoCourse)
def get_video_course_by_id(course_id: str, current_user: dict = Depends(get_current_user)):
    course = db.find_one("video_courses", {"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check access permissions
    if current_user["role"] == "teacher":
        if course["teacher_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user["role"] == "student":
        user = db.find_one("users", {"id": current_user["id"]})
        group_id = user.get("group_id")
        
        # Check if student has access (free course with allowed group or approved paid course)
        has_access = False
        if course["is_free"] and group_id in course.get("allowed_group_ids", []):
            has_access = True
        else:
            # Check if there's an approved access request
            approved_request = db.find_one("course_access_requests", {
                "course_id": course_id,
                "student_id": current_user["id"],
                "status": "approved"
            })
            if approved_request:
                has_access = True
        
        if not has_access:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return course

@router.post("/{course_id}/videos", response_model=Video)
def add_video_to_course(course_id: str, video: VideoCreate, current_user: dict = Depends(get_current_user)):
    course = db.find_one("video_courses", {"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user["role"] != "teacher" or course["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    video_dict = video.model_dump()
    video_dict["id"] = str(uuid.uuid4())
    video_dict["quizzes"] = []
    video_dict["order"] = len(course.get("videos", [])) + 1
    
    if "videos" not in course:
        course["videos"] = []
    
    course["videos"].append(video_dict)
    course["updated_at"] = datetime.now().isoformat()
    db.update_one("video_courses", {"id": course_id}, {"videos": course["videos"], "updated_at": course["updated_at"]})
    
    return video_dict

@router.delete("/{course_id}/videos/{video_id}")
def delete_video_from_course(course_id: str, video_id: str, current_user: dict = Depends(get_current_user)):
    course = db.find_one("video_courses", {"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user["role"] != "teacher" or course["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course["videos"] = [v for v in course.get("videos", []) if v["id"] != video_id]
    course["updated_at"] = datetime.now().isoformat()
    db.update_one("video_courses", {"id": course_id}, {"videos": course["videos"], "updated_at": course["updated_at"]})
    
    return {"message": "Video deleted successfully"}

@router.post("/{course_id}/videos/{video_id}/quizzes", response_model=Quiz)
def add_quiz_to_video(course_id: str, video_id: str, quiz: QuizCreate, current_user: dict = Depends(get_current_user)):
    course = db.find_one("video_courses", {"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user["role"] != "teacher" or course["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    video = next((v for v in course.get("videos", []) if v["id"] == video_id), None)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    quiz_dict = quiz.model_dump()
    
    if "quizzes" not in video:
        video["quizzes"] = []
    
    video["quizzes"].append(quiz_dict)
    course["updated_at"] = datetime.now().isoformat()
    db.update_one("video_courses", {"id": course_id}, {"videos": course["videos"], "updated_at": course["updated_at"]})
    
    return quiz_dict

@router.delete("/{course_id}/videos/{video_id}/quizzes/{quiz_index}")
def delete_quiz_from_video(course_id: str, video_id: str, quiz_index: int, current_user: dict = Depends(get_current_user)):
    course = db.find_one("video_courses", {"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user["role"] != "teacher" or course["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    video = next((v for v in course.get("videos", []) if v["id"] == video_id), None)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if "quizzes" in video and 0 <= quiz_index < len(video["quizzes"]):
        video["quizzes"].pop(quiz_index)
        course["updated_at"] = datetime.now().isoformat()
        db.update_one("video_courses", {"id": course_id}, {"videos": course["videos"], "updated_at": course["updated_at"]})
    
    return {"message": "Quiz deleted successfully"}

@router.post("/{course_id}/request-access")
def request_course_access(course_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can request access")
    
    course = db.find_one("video_courses", {"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing_request = db.find_one("course_access_requests", {
        "course_id": course_id,
        "student_id": current_user["id"]
    })
    
    if existing_request:
        raise HTTPException(status_code=400, detail="Request already exists")
    
    request_data = {
        "course_id": course_id,
        "student_id": current_user["id"],
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    db.insert_one("course_access_requests", request_data)
    
    from models.chat import MessageCreate
    message = MessageCreate(
        sender_id=current_user["id"],
        receiver_id=course["teacher_id"],
        content=f"Ruxsat so'rovi: {course['title']}",
        message_type="course_access_request"
    )
    
    message_dict = message.model_dump()
    message_dict["is_read"] = False
    message_dict["created_at"] = datetime.now().isoformat()
    db.insert_one("messages", message_dict)
    
    return {"message": "Access request sent successfully"}

@router.put("/access-requests/{request_id}")
def update_access_request(request_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can approve requests")
    
    request = db.find_one("course_access_requests", {"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db.update_one("course_access_requests", {"id": request_id}, {"status": status})
    
    return {"message": f"Request {status} successfully"}
