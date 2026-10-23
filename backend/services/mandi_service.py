import time
from datetime import datetime
import requests
from config import DATA_GOV_IN_API_KEY

MANDI_RESOURCE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

MANDI_COMMODITY_NAMES = {
    "rice": ["Rice", "Paddy(Dhan)(Common)"],
    "maize": ["Maize"],
    "chickpea": ["Bengal Gram(Gram)(Whole)"],
    "kidneybeans": ["Rajma"],
    "pigeonpeas": ["Arhar (Tur/Red Gram)(Whole)", "Arhar(Tur/Red Gram)(Whole)"],
    "mothbeans": ["Moath Dal", "Moth Beans"],
    "mungbean": ["Green Gram (Moong)(Whole)"],
    "blackgram": ["Black Gram (Urd Beans)(Whole)"],
    "lentil": ["Lentil (Masur)(Whole)"],
    "pomegranate": ["Pomegranate"],
    "banana": ["Banana"],
    "mango": ["Mango"],
    "grapes": ["Grapes"],
    "watermelon": ["Water Melon"],
    "muskmelon": ["Musk Melon"],
    "apple": ["Apple"],
    "orange": ["Orange"],
    "papaya": ["Papaya"],
    "coconut": ["Coconut"],
    "cotton": ["Cotton"],
    "jute": ["Jute"],
    "coffee": ["Coffee"],
}

_mandi_cache = {}
CACHE_OK_SECONDS = 6 * 3600
CACHE_MISS_SECONDS = 300

def _to_price(val):
    try:
        return float(str(val).replace(",", "").strip())
    except (TypeError, ValueError):
        return None

def fetch_mandi_price(crop: str) -> dict:
    crop = crop.strip().lower()
    if not crop:
        return {"crop": crop, "price": None, "message": "Missing crop name"}
    if not DATA_GOV_IN_API_KEY:
        return {"crop": crop, "price": None, "message": "Price data unavailable (API key not configured)"}

    cached = _mandi_cache.get(crop)
    if cached and cached[0] > time.time():
        return cached[1]

    payload = {"crop": crop, "price": None, "message": "Price data unavailable"}
    ttl = CACHE_MISS_SECONDS

    try:
        commodities = MANDI_COMMODITY_NAMES.get(crop, [crop.title()])
        for commodity in commodities:
            resp = requests.get(
                MANDI_RESOURCE_URL,
                params={
                    "api-key": DATA_GOV_IN_API_KEY,
                    "format": "json",
                    "limit": 100,
                    "filters[commodity]": commodity,
                },
                timeout=10,
            )
            if resp.status_code == 200:
                records = resp.json().get("records") or []
                valid = []
                for r in records:
                    p = _to_price(r.get("modal_price"))
                    if p and p > 0:
                        try:
                            when = datetime.strptime(str(r.get("arrival_date", "")).strip(), "%d/%m/%Y")
                        except ValueError:
                            when = datetime.min
                        valid.append((when, p, r))
                if valid:
                    latest_date = max(v[0] for v in valid)
                    todays = sorted([v for v in valid if v[0] == latest_date], key=lambda x: x[1])
                    picked = todays[len(todays) // 2]
                    rec = picked[2]
                    payload = {
                        "crop": crop,
                        "price": round(picked[1], 2),
                        "unit": "₹/quintal",
                        "market": rec.get("market", ""),
                        "state": rec.get("state", ""),
                    }
                    ttl = CACHE_OK_SECONDS
                    break
    except Exception as e:
        print(f"⚠️ Mandi fetch error for {crop}: {e}")

    _mandi_cache[crop] = (time.time() + ttl, payload)
    return payload
