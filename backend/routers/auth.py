from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api", tags=["Authentication & Profile"])

@router.post("/auth/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if username or email exists
    if db.query(models.User).filter(models.User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(models.User).filter(models.User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        username=req.username,
        email=req.email,
        password_hash=get_password_hash(req.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})
    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/auth/login", response_model=schemas.TokenResponse)
def login(req: schemas.UserLogin, db: Session = Depends(get_db)):
    identifier = (req.username or req.email or "").strip().lower()
    if not identifier or not req.password:
        raise HTTPException(status_code=400, detail="Username/email and password are required")

    user = db.query(models.User).filter(
        (models.User.username.ilike(identifier)) | (models.User.email.ilike(identifier))
    ).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id)})
    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/auth/profile", response_model=dict)
def get_auth_profile(current_user: models.User = Depends(get_current_user)):
    return {"user": schemas.UserResponse.model_validate(current_user)}

@router.post("/auth/logout")
def logout(current_user: models.User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.get("/profile", response_model=dict)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return {"user": schemas.UserResponse.model_validate(current_user)}

@router.put("/profile", response_model=dict)
def update_profile(req: schemas.UserProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.username and req.username != current_user.username:
        if db.query(models.User).filter(models.User.username == req.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")
        current_user.username = req.username

    if req.email and req.email != current_user.email:
        if db.query(models.User).filter(models.User.email == req.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = req.email

    if req.phone is not None:
        current_user.phone = req.phone
    if req.location is not None:
        current_user.location = req.location
    if req.about is not None:
        current_user.about = req.about

    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "user": schemas.UserResponse.model_validate(current_user)}
