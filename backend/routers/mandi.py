from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
import models
import schemas
from services.auth_service import get_optional_user
from services.mandi_service import fetch_mandi_price

router = APIRouter(prefix="/api", tags=["Mandi Prices"])

@router.get("/mandi-price", response_model=schemas.MandiPriceResponse)
def get_mandi_price(
    crop: str = Query(..., min_length=1),
    current_user: Optional[models.User] = Depends(get_optional_user)
):
    result = fetch_mandi_price(crop)
    return result
