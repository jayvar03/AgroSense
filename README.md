# AgroSense 🌱 — Smart Agriculture Platform

AgroSense is a modern full-stack agriculture intelligence system designed to help farmers, agronomists, and agricultural researchers optimize crop yield, restore soil health, monitor Mandi market prices, and diagnose crop diseases using multimodal artificial intelligence.

---

## 🚀 Key Features

- **Crop Recommendation Engine**: Machine learning model (Random Forest) predicting optimal crops based on soil N-P-K nutrient ratios, temperature, humidity, pH, and rainfall.
- **Live Gemini Vision Leaf Diagnosis**: Multimodal AI diagnosis powered by Google's Gemini Vision API with detailed disease identification, severity score, and numbered action plans.
- **Soil Restoration & Crop Rotation**: Rule-based intelligence matching over 200+ Indian crop rotation sequences to replenish soil nitrogen and prevent pests.
- **Live Mandi (APMC) Market Prices**: Real-time integration with Agmarknet / Data.gov.in price indices for Indian agricultural commodities.
- **Modern User Experience**: Built with React 18, Vite, and Tailwind CSS. Bento-grid layouts, Lucide React vector icons, SVG vector branding, and PDF report downloads.
- **Cloud Database**: Neon Serverless PostgreSQL with declarative SQLAlchemy 2.0 models and automated table initialization.
- **Subscription Engine**: Integrated with Razorpay payment gateway to upgrade farmers to the AgroSense Pro plan.

---

## 🏗️ Architecture & Workflow

```mermaid
flowchart LR
    User(["Farmer"]) --> Frontend["React Frontend (Vite)"]
    Frontend <--> Backend["FastAPI Backend Server"]
    Backend <--> DB[("Neon PostgreSQL")]
    Backend --> AI["ML Models & Gemini AI"]
```

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons.
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy 2.0, JWT + bcrypt auth.
- **AI / ML**: Scikit-learn (Random Forest Crop Predictor), Google Gemini Vision (Leaf Pathology).
- **Database**: Neon Serverless PostgreSQL (`users`, `predictions`, `orders`).

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Python**: Version `3.11+`
- **Node.js**: Version `18+` & `npm`
- **PostgreSQL**: Neon connection string (or local PostgreSQL)
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd new/backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\activate

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your values:
   ```ini
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   SECRET_KEY=your_secure_random_jwt_secret_key_at_least_32_chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=43200
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
   # Optional:
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   ```

5. **Start backend server**:
   ```bash
   uvicorn main:app --reload --port 5000
   ```
   - **Service Check**: [http://localhost:5000/](http://localhost:5000/)
   - **Interactive API Docs (Swagger)**: [http://localhost:5000/docs](http://localhost:5000/docs)
   - **ReDoc**: [http://localhost:5000/redoc](http://localhost:5000/redoc)

---

### 3. Frontend Setup

1. **Navigate to frontend directory** (in a separate terminal):
   ```bash
   cd new/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Verify `.env` has:
   ```ini
   VITE_API_URL=http://localhost:5000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API service health check | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with username/email & password | No |
| `GET` | `/api/auth/profile` | Current authenticated user profile | Yes |
| `PUT` | `/api/profile` | Update profile details | Yes |
| `POST` | `/api/predict` | ML Crop Recommendation from soil params | Yes |
| `GET` | `/api/mandi-price` | APMC mandi market commodity prices | Optional |
| `POST` | `/api/soil-restoration` | Soil rotation plan from harvested crop | Optional |
| `POST` | `/api/disease-detection` | Gemini Vision leaf disease scanner | Yes |
| `GET` | `/api/history` | Historical predictions & diagnosis scans | Yes |
| `GET` | `/api/payment-status` | Check if Razorpay keys are configured | No |
| `POST` | `/api/create-order` | Create Razorpay payment order | Yes |
| `POST` | `/api/verify-payment` | Verify Razorpay HMAC signature | Yes |

---

## 🧪 Production Build Verification

```bash
# Verify Python syntax across all backend modules
python -m py_compile new/backend/main.py new/backend/routers/*.py new/backend/services/*.py

# Build frontend production bundle
cd new/frontend
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
