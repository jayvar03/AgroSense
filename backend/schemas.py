from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    # accepts username or email
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_pro: bool
    pro_expires_at: Optional[datetime] = None
    disease_detection_uses: int
    phone: Optional[str] = ""
    location: Optional[str] = ""
    about: Optional[str] = ""
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    about: Optional[str] = None

# ----------------- CROP PREDICT SCHEMAS -----------------
class CropPredictRequest(BaseModel):
    N: float = Field(..., ge=0, description="Nitrogen content in soil")
    P: float = Field(..., ge=0, description="Phosphorus content in soil")
    K: float = Field(..., ge=0, description="Potassium content in soil")
    temperature: float = Field(..., ge=10, le=45, description="Temperature in °C")
    humidity: float = Field(..., ge=14, le=95, description="Relative humidity in %")
    ph: float = Field(..., ge=4.5, le=9.0, description="Soil pH")
    rainfall: float = Field(..., ge=20, le=400, description="Rainfall in mm")

class CropPredictResponse(BaseModel):
    crop: str
    tip: str

# ----------------- SOIL RESTORATION SCHEMAS -----------------
class SoilRestorationRequest(BaseModel):
    last_crop: str

class SoilRestorationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    message: Optional[str] = None

# ----------------- DISEASE DETECTION SCHEMAS -----------------
class DiseaseDetectionResponse(BaseModel):
    plant_name: str
    disease_name: str
    severity: str
    solution: str

# ----------------- MANDI PRICE SCHEMAS -----------------
class MandiPriceResponse(BaseModel):
    crop: str
    price: Optional[float] = None
    unit: Optional[str] = None
    market: Optional[str] = None
    state: Optional[str] = None
    message: Optional[str] = None

# ----------------- HISTORY SCHEMAS -----------------
class HistoryItemResponse(BaseModel):
    id: int
    type: str
    input: Dict[str, Any]
    result: Dict[str, Any]
    created_at: datetime

class HistoryListResponse(BaseModel):
    items: List[HistoryItemResponse]

# ----------------- PAYMENT SCHEMAS -----------------
class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class VerifyPaymentResponse(BaseModel):
    success: bool
    is_pro: bool
    error: Optional[str] = None
