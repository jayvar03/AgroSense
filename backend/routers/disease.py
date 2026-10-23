from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, GEMINI_API_KEY
from services.auth_service import get_current_user
from services.gemini_service import analyze_leaf

router = APIRouter(prefix="/api", tags=["Disease Detection"])

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/jpg", 
    "image/heic", "image/heif", "application/octet-stream"
}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB
FREE_SCANS_LIMIT = 3

def is_payments_configured():
    return bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)

def is_user_pro(user: models.User) -> bool:
    if not user.is_pro:
        return False
    if user.pro_expires_at is None:
        return True
    return user.pro_expires_at > datetime.utcnow()

@router.post("/disease-detection", response_model=schemas.DiseaseDetectionResponse)
async def detect_disease(
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mime_type = (image.content_type or "").lower()
    # Permit common image extensions even if browser sends octet-stream
    filename = (image.filename or "").lower()
    is_valid_ext = filename.endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'))

    if mime_type not in ALLOWED_TYPES and not is_valid_ext:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported image type. Please upload a JPG, PNG or WEBP image."
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds maximum 10 MB limit.")

    # Free quota gating (only if Razorpay keys are configured)
    is_gated = is_payments_configured() and not is_user_pro(current_user)
    if is_gated:
        if current_user.disease_detection_uses >= FREE_SCANS_LIMIT:
            raise HTTPException(
                status_code=402,
                detail={"error": "free_limit_reached", "uses_remaining": 0}
            )

    try:
        # Pass a normalized mime_type
        clean_mime = mime_type if mime_type.startswith("image/") else "image/jpeg"
        analysis = analyze_leaf(image_bytes, clean_mime)
    except Exception as e:
        print(f"❌ Disease detection analysis failed: {e}")
        raise HTTPException(
            status_code=502, 
            detail=f"Gemini Vision analysis failed: {str(e)}"
        )

    # Increment usage counter
    current_user.disease_detection_uses += 1
    db.commit()

    # Log to prediction history
    try:
        pred_record = models.Prediction(
            user_id=current_user.id,
            type="disease_detection",
            input_data={"mime_type": clean_mime, "size_bytes": len(image_bytes)},
            result_data=analysis
        )
        db.add(pred_record)
        db.commit()
    except Exception as e:
        print(f"⚠️ Failed to log disease detection: {e}")

    return analysis
