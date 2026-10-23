from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    is_active = Column(Boolean, default=True)
    is_pro = Column(Boolean, default=False)
    pro_expires_at = Column(DateTime, nullable=True)
    disease_detection_uses = Column(Integer, default=0)
    
    phone = Column(String(30), nullable=True, default="")
    location = Column(String(255), nullable=True, default="")
    about = Column(Text, nullable=True, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String(50), nullable=False)  # 'crop_recommendation', 'soil_restoration', 'disease_detection'
    input_data = Column(JSON, nullable=False)
    result_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="predictions")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)  # in paise (e.g. 9900 = ₹99)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="created")  # 'created', 'paid', 'failed'
    payment_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="orders")
