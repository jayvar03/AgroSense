import hmac
import hashlib
import time
from datetime import datetime, timedelta
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["Payments"])

PRO_PRICE_PAISE = 9900  # ₹99 in paise
PRO_DURATION_DAYS = 30
RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"

def payments_enabled():
    return bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)

@router.get("/payment-status")
def get_payment_status():
    return {
        "payments_enabled": payments_enabled(),
        "price_inr": 99,
        "key_id": RAZORPAY_KEY_ID if payments_enabled() else None
    }

@router.post("/create-order", response_model=schemas.CreateOrderResponse)
def create_payment_order(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payments_enabled():
        raise HTTPException(status_code=503, detail="Razorpay payment gateway is not configured on the server.")

    try:
        resp = requests.post(
            RAZORPAY_ORDERS_URL,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={
                "amount": PRO_PRICE_PAISE,
                "currency": "INR",
                "receipt": f"as_{current_user.id}_{int(time.time())}"[-40:],
                "notes": {"user_id": str(current_user.id), "plan": "pro_monthly"},
            },
            timeout=15,
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=502, detail="Failed to create Razorpay order")

        order_data = resp.json()
        order_id = order_data["id"]

        new_order = models.Order(
            order_id=order_id,
            user_id=current_user.id,
            amount=PRO_PRICE_PAISE,
            currency="INR",
            status="created",
        )
        db.add(new_order)
        db.commit()

        return {
            "order_id": order_id,
            "amount": PRO_PRICE_PAISE,
            "currency": "INR",
            "key_id": RAZORPAY_KEY_ID,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating payment order: {e}")
        raise HTTPException(status_code=500, detail="Could not create payment order")

@router.post("/verify-payment", response_model=schemas.VerifyPaymentResponse)
def verify_payment(
    req: schemas.VerifyPaymentRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payments_enabled():
        raise HTTPException(status_code=503, detail="Payments are not enabled")

    order = db.query(models.Order).filter(
        models.Order.order_id == req.razorpay_order_id,
        models.Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=400, detail="Unknown order")

    if order.status == "paid":
        return {"success": True, "is_pro": True}

    # Verify HMAC-SHA256 signature
    msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # Mark order as paid
    order.status = "paid"
    order.payment_id = req.razorpay_payment_id
    order.paid_at = datetime.utcnow()

    # Extend pro duration
    now = datetime.utcnow()
    base = current_user.pro_expires_at if (current_user.is_pro and current_user.pro_expires_at and current_user.pro_expires_at > now) else now
    current_user.is_pro = True
    current_user.pro_expires_at = base + timedelta(days=PRO_DURATION_DAYS)

    db.commit()
    return {"success": True, "is_pro": True}
