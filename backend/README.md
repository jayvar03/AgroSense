# AgroSense FastAPI Backend

Clean, lightweight, and modular backend powered by **FastAPI** and **Neon PostgreSQL**.

---

## Folder Structure

```text
backend/
├── main.py              # Application entry, CORS, and router registration
├── config.py            # Environment configuration (.env)
├── database.py          # SQLAlchemy engine & session for Neon PostgreSQL
├── models.py            # PostgreSQL tables (User, Prediction, Order)
├── schemas.py           # Pydantic validation schemas
│
├── routers/             # Endpoint handlers (1 file per domain)
│   ├── auth.py          # /api/auth/register, /api/auth/login, /api/profile
│   ├── crop.py          # /api/predict (ML crop recommendation)
│   ├── soil.py          # /api/soil-restoration (CSV rotation lookup)
│   ├── disease.py       # /api/disease-detection (Gemini leaf scanner)
│   ├── mandi.py         # /api/mandi-price (Government Agmarknet prices)
│   ├── history.py       # /api/history (Unified prediction logs)
│   └── payment.py       # /api/create-order, /api/verify-payment (Razorpay)
│
├── services/            # Business & AI logic
│   ├── auth_service.py  # Password hashing, JWT creation & token verification
│   ├── ml_service.py    # Loads model.pkl & preprocessing scalers
│   ├── gemini_service.py# Vision leaf disease detection via Gemini
│   └── mandi_service.py # data.gov.in live prices with in-memory cache
│
└── data/                # Machine learning models & datasets
    ├── model.pkl
    ├── minmaxscaler.pkl
    ├── standscaler.pkl
    ├── Crop_recommendation.csv
    └── india_crop_rotation_200_plus.csv
```

---

## Quick Setup

### 1. Create a virtual environment & install dependencies
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Neon database URL:
```env
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
SECRET_KEY=your-jwt-secret-key
GEMINI_API_KEY=your-gemini-key
```

### 3. Run the Development Server
```bash
uvicorn main:app --reload --port 5000
```

- **Interactive API Docs (Swagger UI)**: `http://localhost:5000/docs`
- **Alternative Docs (ReDoc)**: `http://localhost:5000/redoc`
