import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:placeholder@ep-cool-cloud.neon.tech/neondb?sslmode=require"
)

# SQLAlchemy 2.0 defaults 'postgresql://' to psycopg 3.
# Normalize to 'postgresql+psycopg2://' so psycopg2-binary is used seamlessly.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-agrosense-2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DATA_GOV_IN_API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip().rstrip("/") for origin in FRONTEND_URL.split(",") if origin.strip()]
