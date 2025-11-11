from fastapi import APIRouter, Depends, HTTPException, status, Query
from database import get_db
from models.user import UserResponse, UserCreate, UserUpdate
from security import get_password_hash, decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from typing import List, Optional

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db = Depends(get_db)):
    """Verify JWT token and return current user"""
    token_data = decode_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    users = db.find("users", {"email": token_data.email})
    
    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return users[0]

@router.get("", response_model=List[UserResponse])
def get_users(
    role: Optional[str] = Query(None),
    school_id: Optional[str] = Query(None),
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all users with optional filtering"""
    query = {}
    if role:
        query["role"] = role
    if school_id:
        query["school_id"] = school_id
    
    users = db.find("users", query)
    
    return [
        UserResponse(
            id=str(user["id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"],
            phone=user.get("phone"),
            school_id=user.get("school_id"),
            group_id=user.get("group_id"),
            created_at=user.get("created_at")
        )
        for user in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user by ID"""
    user = db.find_by_id("users", user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["id"]),
        email=user["email"],
        name=user["name"],
        role=user["role"],
        phone=user.get("phone"),
        school_id=user.get("school_id"),
        group_id=user.get("group_id"),
        created_at=user.get("created_at")
    )

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new user"""
    try:
        print(f"[v0] Creating user with data: {user_data.model_dump()}")
        print(f"[v0] Current user: {current_user}")
        
        existing = db.find("users", {"email": user_data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
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
        
        print(f"[v0] Inserting user_dict: {user_dict}")
        
        result = db.insert_one("users", user_dict)
        
        print(f"[v0] Insert result: {result}")
        
        return UserResponse(
            id=str(result["id"]),
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            phone=user_data.phone,
            school_id=user_data.school_id,
            group_id=user_data.group_id,
            created_at=user_dict["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[v0] Error creating user: {str(e)}")
        print(f"[v0] Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_data: UserUpdate,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update user"""
    user = db.find_by_id("users", user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = {}
    if user_data.email:
        update_data["email"] = user_data.email
    if user_data.name:
        update_data["name"] = user_data.name
    if user_data.phone:
        update_data["phone"] = user_data.phone
    if user_data.role:
        update_data["role"] = user_data.role
    if user_data.school_id:
        update_data["school_id"] = user_data.school_id
    if user_data.group_id:
        update_data["group_id"] = user_data.group_id
    
    if update_data:
        db.update_by_id("users", user_id, update_data)
    
    updated_user = db.find_by_id("users", user_id)
    
    return UserResponse(
        id=str(updated_user["id"]),
        email=updated_user["email"],
        name=updated_user["name"],
        role=updated_user["role"],
        phone=updated_user.get("phone"),
        school_id=updated_user.get("school_id"),
        group_id=updated_user.get("group_id"),
        created_at=updated_user.get("created_at")
    )

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete user"""
    result = db.delete_by_id("users", user_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"success": True}
