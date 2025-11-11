from pydantic import BaseModel
from typing import Optional

class MessageBase(BaseModel):
    sender_id: str
    receiver_id: str
    content: str
    image_url: Optional[str] = None
    message_type: str  # "text", "image", "attendance_request", "course_access_request"

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    is_read: bool = False
    created_at: str
