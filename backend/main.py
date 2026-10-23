from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import ALLOWED_ORIGINS
import models

from routers import auth, crop, soil, disease, mandi, history, payment

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables automatically on startup
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Neon PostgreSQL tables initialized successfully.")
    except Exception as e:
        print(f"⚠️ Could not auto-create tables (check your DATABASE_URL in .env): {e}")
    yield

app = FastAPI(
    title="AgroSense API",
    description="Modern Smart Agriculture API powered by FastAPI & Neon PostgreSQL",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular routers
app.include_router(auth.router)
app.include_router(crop.router)
app.include_router(soil.router)
app.include_router(disease.router)
app.include_router(mandi.router)
app.include_router(history.router)
app.include_router(payment.router)

@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgroSense FastAPI Server",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
