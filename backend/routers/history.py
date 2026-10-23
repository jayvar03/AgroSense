from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["History"])

@router.get("/history")
def get_user_history(
    limit: int = Query(default=100, ge=1, le=200),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = (
        db.query(models.Prediction)
        .filter(models.Prediction.user_id == current_user.id)
        .order_by(models.Prediction.created_at.desc())
        .limit(limit)
        .all()
    )

    items = [
        {
            "id": r.id,
            "type": r.type,
            "input": r.input_data,
            "result": r.result_data,
            "created_at": r.created_at.isoformat() + "Z" if r.created_at else None
        }
        for r in records
    ]
    return {"items": items}
