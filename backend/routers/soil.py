import os
import re
import difflib
from typing import Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from services.auth_service import get_optional_user

router = APIRouter(prefix="/api", tags=["Soil Restoration"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "india_crop_rotation_200_plus.csv")

soil_df = None
if os.path.exists(CSV_PATH):
    try:
        soil_df = pd.read_csv(CSV_PATH, encoding="utf-8", encoding_errors="replace")
        soil_df.columns = [c.strip().lower().replace(' ', '_').replace(')', '') for c in soil_df.columns]
    except Exception as e:
        print(f"❌ Error loading soil CSV: {e}")

def _normalize(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9 ]', '', s or '').strip().lower()

def _get_recommendations(last_crop: str):
    if soil_df is None:
        return []
    norm_input = _normalize(last_crop)
    crops = soil_df['harvested'].astype(str).tolist()
    norm_crops = [_normalize(c) for c in crops]

    # Exact or substring match
    matches_idx = [i for i, name in enumerate(norm_crops) if norm_input in name or name in norm_input]

    # Fuzzy match top 3 if nothing found
    if not matches_idx:
        close = difflib.get_close_matches(norm_input, norm_crops, n=3, cutoff=0.55)
        matches_idx = [i for i, name in enumerate(norm_crops) if name in close]

    if not matches_idx:
        return []

    # Replace NaN with empty string
    matched_df = soil_df.iloc[matches_idx].fillna("")
    return matched_df.to_dict(orient="records")

@router.post("/soil-restoration", response_model=schemas.SoilRestorationResponse)
def get_soil_restoration(
    req: schemas.SoilRestorationRequest,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    last_crop = req.last_crop.strip()
    if not last_crop:
        raise HTTPException(status_code=400, detail="Missing last_crop parameter.")

    results = _get_recommendations(last_crop)
    if not results:
        return {"recommendations": [], "message": "No suitable rotation found for the given crop."}

    # Log to history if user is authenticated
    if current_user:
        try:
            pred_record = models.Prediction(
                user_id=current_user.id,
                type="soil_restoration",
                input_data={"last_crop": last_crop},
                result_data={"recommendations": results[:5], "total_matches": len(results)}
            )
            db.add(pred_record)
            db.commit()
        except Exception as e:
            print(f"⚠️ Failed to log soil restoration: {e}")

    return {"recommendations": results}
