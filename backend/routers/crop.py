from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.auth_service import get_current_user
from services.ml_service import predict_crop

router = APIRouter(prefix="/api", tags=["Crop Recommendation"])

@router.post("/predict", response_model=schemas.CropPredictResponse)
def predict(
    req: schemas.CropPredictRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = predict_crop(
            N=req.N,
            P=req.P,
            K=req.K,
            temperature=req.temperature,
            humidity=req.humidity,
            ph=req.ph,
            rainfall=req.rainfall
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Log to prediction history
    try:
        pred_record = models.Prediction(
            user_id=current_user.id,
            type="crop_recommendation",
            input_data=req.model_dump(),
            result_data=result
        )
        db.add(pred_record)
        db.commit()
    except Exception as e:
        print(f"⚠️ Failed to log crop prediction: {e}")

    return result
