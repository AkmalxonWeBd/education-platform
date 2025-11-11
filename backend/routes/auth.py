from fastapi import APIRouter, HTTPException, status
from database import JSONDatabase
from models.user import LoginRequest, LoginResponse, UserCreate, UserResponse
from security import create_access_token, verify_password, get_password_hash
from datetime import timedelta, datetime

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login user and return JWT token"""
    db = JSONDatabase()
    users = db.find("users", {"email": credentials.email})
    
    if not users or not verify_password(credentials.password, users[0].get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user = users[0]
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    if "created_at" not in user:
        user["created_at"] = datetime.utcnow().isoformat()
        db.update_by_id("users", user["id"], {"created_at": user["created_at"]})
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        phone=user.get("phone"),
        school_id=user.get("school_id"),
        group_id=user.get("group_id"),
        created_at=user["created_at"]
    )
    
    return LoginResponse(token=access_token, user=user_response)

@router.post("/reset-password")
async def reset_password(data: dict):
    """Reset password endpoint (simplified)"""
    db = JSONDatabase()
    users = db.find("users", {"email": data.get("email")})
    
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # In production, send email with reset link
    return {"success": True, "message": "Password reset link sent to email"}

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate):
    """Create new user"""
    db = JSONDatabase()
    
    existing_user = db.find("users", {"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "password": get_password_hash(user_data.password),
        "role": user_data.role,
        "phone": user_data.phone,
        "school_id": user_data.school_id,
        "group_id": user_data.group_id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = db.insert("users", user_dict)
    
    return UserResponse(
        id=result["id"],
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        phone=user_data.phone,
        school_id=user_data.school_id,
        group_id=user_data.group_id,
        created_at=user_dict["created_at"]
    )
