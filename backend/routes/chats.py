from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.chat import MessageCreate, Message
from database import JSONDatabase
from security import get_current_user
from datetime import datetime

router = APIRouter()
db = JSONDatabase()

@router.post("", response_model=Message)
def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    message_dict = message.model_dump()
    message_dict["is_read"] = False
    message_dict["created_at"] = datetime.now().isoformat()
    
    result = db.insert_one("messages", message_dict)
    return result

@router.get("/conversations/{user_id}", response_model=List[Message])
def get_conversation(user_id: str, current_user: dict = Depends(get_current_user)):
    messages = db.find("messages", {
        "$or": [
            {"sender_id": current_user["id"], "receiver_id": user_id},
            {"sender_id": user_id, "receiver_id": current_user["id"]}
        ]
    })
    
    for msg in messages:
        if msg["receiver_id"] == current_user["id"] and not msg["is_read"]:
            db.update_one("messages", {"id": msg["id"]}, {"is_read": True})
    
    return sorted(messages, key=lambda x: x["created_at"])

@router.get("/unread")
def get_unread_count(current_user: dict = Depends(get_current_user)):
    unread_messages = db.find("messages", {
        "receiver_id": current_user["id"],
        "is_read": False
    })
    return {"count": len(unread_messages)}
