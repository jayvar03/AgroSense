import os
import pickle
import warnings
import numpy as np

# Suppress scikit-learn version mismatch warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

def _load_pickle(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print(f"⚠️ Model file not found: {path}")
        return None
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except Exception as e:
        print(f"❌ Failed to load {path}: {e}")
        return None

# Load model and scalers
model = _load_pickle("model.pkl")
mx_scaler = _load_pickle("minmaxscaler.pkl")
std_scaler = _load_pickle("standscaler.pkl")

crop_dict = {
    'rice': 1, 'maize': 2, 'chickpea': 3, 'kidneybeans': 4, 'pigeonpeas': 5,
    'mothbeans': 6, 'mungbean': 7, 'blackgram': 8, 'lentil': 9, 'pomegranate': 10,
    'banana': 11, 'mango': 12, 'grapes': 13, 'watermelon': 14, 'muskmelon': 15,
    'apple': 16, 'orange': 17, 'papaya': 18, 'coconut': 19, 'cotton': 20,
    'jute': 21, 'coffee': 22
}
inv_crop_dict = {v: k for k, v in crop_dict.items()}

TIPS = {
    "rice": "🌾 Needs heavy rainfall & humid conditions.",
    "maize": "🌽 Grows best in warm weather with well-drained soil and moderate rainfall.",
    "chickpea": "🫘 Thrives in cool, dry conditions; avoid waterlogged soil.",
    "kidneybeans": "🫘 Prefers mild temperatures and well-drained loamy soil; protect from frost.",
    "pigeonpeas": "🌱 Drought-tolerant legume that does well in warm weather and well-drained soil.",
    "mothbeans": "🌱 Very hardy in hot, arid regions; suits sandy soil with little rainfall.",
    "mungbean": "🌱 Quick-maturing crop that likes warm weather and light, well-drained soil.",
    "blackgram": "🌱 Grows well in warm, humid weather on loamy soil with good drainage.",
    "lentil": "🌱 A cool-season crop that prefers well-drained loamy soil and modest rainfall.",
    "pomegranate": "🌳 Loves hot, dry summers; needs well-drained soil and careful watering at fruiting.",
    "banana": "🍌 Needs warm, humid weather, rich soil and steady moisture.",
    "mango": "🥭 Prefers a warm climate with a dry spell before flowering and deep, well-drained soil.",
    "grapes": "🍇 Needs warm, dry weather and well-drained soil; prune regularly for a better yield.",
    "watermelon": "🍉 Loves hot weather and sandy loam; water regularly until the fruits set.",
    "muskmelon": "🍈 Grows best in warm, dry weather on sandy loam; ease off watering as fruits ripen.",
    "apple": "🍎 Needs a cool climate with chilling winters and well-drained loamy soil.",
    "orange": "🍊 Suits subtropical climates; needs well-drained soil and regular watering.",
    "papaya": "🌱 Needs warm weather, frost protection and well-drained soil; avoid waterlogging.",
    "coconut": "🥥 Thrives in hot, humid coastal conditions with plenty of rainfall and sandy soil.",
    "cotton": "🌿 Needs a long, warm, sunny season with moderate rainfall; black soil works well.",
    "jute": "🌿 Requires warm, humid weather with heavy rainfall and fertile alluvial soil.",
    "coffee": "☕ Prefers shaded, humid highland areas with well-drained, slightly acidic soil.",
}

def predict_crop(N: float, P: float, K: float, temperature: float, humidity: float, ph: float, rainfall: float):
    if not model or not mx_scaler or not std_scaler:
        raise RuntimeError("ML model or scalers are not loaded.")

    features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    scaled_mx = mx_scaler.transform(features)
    scaled_std = std_scaler.transform(scaled_mx)

    pred = model.predict(scaled_std)[0]
    crop_name = inv_crop_dict.get(pred, "Unknown")
    tip = TIPS.get(crop_name, "No tip available.")
    return {"crop": crop_name, "tip": tip}
