import base64
import json
import re
import requests
from config import GEMINI_API_KEY

SYSTEM_INSTRUCTION = """
You are an expert plant pathologist and agronomist for AgroSense.
Analyze the provided crop leaf image carefully.

You must respond with ONLY valid JSON adhering strictly to this schema:
{
  "plant_name": "Identified plant/crop name (e.g., Tomato, Rice, Wheat)",
  "disease_name": "Precise disease name or 'Healthy'",
  "severity": "Low | Moderate | High | Critical | None",
  "solution": "Clear, actionable step-by-step treatment instructions formatted as numbered points separated by newlines (e.g., 1. Remove infected leaves.\\n2. Apply neem oil...)"
}

Do not include markdown codeblocks (```json), conversational commentary, or explanations outside the JSON object.
"""

def analyze_leaf(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env")

    # Encode image to base64
    b64_image = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_INSTRUCTION},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_image
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024
        }
    }

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest"
    ]

    last_error = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        try:
            resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            if resp.status_code == 200:
                result_json = resp.json()
                try:
                    raw_text = result_json["candidates"][0]["content"]["parts"][0]["text"]
                    cleaned_text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip())
                    cleaned_text = re.sub(r"\s*```$", "", cleaned_text.strip())
                    parsed = json.loads(cleaned_text)

                    return {
                        "plant_name": parsed.get("plant_name", "Unknown Plant"),
                        "disease_name": parsed.get("disease_name", "Unidentified Condition"),
                        "severity": parsed.get("severity", "Moderate"),
                        "solution": parsed.get("solution", "Consult local agricultural extension officer.")
                    }
                except (KeyError, IndexError, json.JSONDecodeError) as parse_err:
                    raise ValueError(f"Could not parse Gemini response: {parse_err}. Raw: {raw_text[:200]}")
            else:
                last_error = f"{model_name} returned status {resp.status_code}: {resp.text[:200]}"
        except requests.RequestException as req_err:
            last_error = f"{model_name} request failed: {req_err}"

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")
