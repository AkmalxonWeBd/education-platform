from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.group import GroupCreate, GroupUpdate, Group
from database import JSONDatabase
from security import get_current_user
from datetime import datetime

router = APIRouter()
db = JSONDatabase()

@router.post("", response_model=Group)
def create_group(group: GroupCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["teacher"]:
        raise HTTPException(status_code=403, detail="Only teachers can create groups")
    
    group_dict = group.model_dump()
    group_dict["teacher_id"] = current_user["id"]
    group_dict["student_ids"] = []
    group_dict["created_at"] = datetime.now().isoformat()
    group_dict["updated_at"] = datetime.now().isoformat()
    
    result = db.insert_one("groups", group_dict)
    return result

@router.get("", response_model=List[Group])
def get_groups(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "teacher":
        groups = db.find("groups", {"teacher_id": current_user["id"]})
    elif current_user["role"] == "student":
        groups = db.find("groups", {"student_ids": {"$in": [current_user["id"]]}})
    else:
        groups = db.find("groups")
    return groups

@router.get("/{group_id}", response_model=Group)
def get_group(group_id: str, current_user: dict = Depends(get_current_user)):
    group = db.find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.put("/{group_id}", response_model=Group)
def update_group(group_id: str, group_update: GroupUpdate, current_user: dict = Depends(get_current_user)):
    existing_group = db.find_one("groups", {"id": group_id})
    if not existing_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["role"] != "teacher" or existing_group["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in group_update.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now().isoformat()
    
    updated_group = db.update_one("groups", {"id": group_id}, update_data)
    return updated_group

@router.delete("/{group_id}")
def delete_group(group_id: str, current_user: dict = Depends(get_current_user)):
    existing_group = db.find_one("groups", {"id": group_id})
    if not existing_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["role"] != "teacher" or existing_group["teacher_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete_one("groups", {"id": group_id})
    return {"message": "Group deleted successfully"}

@router.post("/{group_id}/students/{student_id}")
def add_student_to_group(group_id: str, student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can add students")
    
    group = db.find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if student_id not in group.get("student_ids", []):
        group["student_ids"].append(student_id)
        db.update_one("groups", {"id": group_id}, {"student_ids": group["student_ids"]})
    
    db.update_one("users", {"id": student_id}, {"group_id": group_id})
    
    return {"message": "Student added to group successfully"}

@router.delete("/{group_id}/students/{student_id}")
def remove_student_from_group(group_id: str, student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can remove students")
    
    group = db.find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if student_id in group.get("student_ids", []):
        group["student_ids"].remove(student_id)
        db.update_one("groups", {"id": group_id}, {"student_ids": group["student_ids"]})
    
    db.update_one("users", {"id": student_id}, {"group_id": None})
    
    return {"message": "Student removed from group successfully"}
