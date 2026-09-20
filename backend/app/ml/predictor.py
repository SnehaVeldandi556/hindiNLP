"""
Complaint Classification and Priority Analysis Engine for ShikayatAI.
Predicts complaint category, confidence score, and determines
severity score and priority using transparent, explainable rule logic.
"""

import re
from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import numpy as np

from backend.app.ml.preprocessor import clean_and_preprocess_text

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_FILE = ARTIFACTS_DIR / "best_model.joblib"

# Department mapping matching dataset exactly
CATEGORY_DEPARTMENT_MAP = {
    "Water Supply": "Water Department",
    "Electricity": "Electricity Department",
    "Roads": "Public Works Department",
    "Garbage Collection": "Sanitation Department",
    "Drainage": "Drainage Department",
    "Street Lights": "Electrical Maintenance",
    "Sewage": "Sewerage Department",
    "Public Transport": "Transport Department"
}

# Base severity score heuristics aligned with dataset distribution (1-10)
BASE_CATEGORY_SEVERITY = {
    "Electricity": 6,       # High safety risk, power outage
    "Sewage": 6,            # Health hazard, biohazard overflow
    "Water Supply": 6,      # Essential utility outage
    "Drainage": 5,          # Flooding risk, vector breeding
    "Roads": 5,             # Traffic hazard, pothole damage
    "Garbage Collection": 5,# Hygiene issue, disease vector
    "Street Lights": 4,     # Night visibility, safety
    "Public Transport": 4   # Commute delay
}

class ComplaintPredictor:
    def __init__(self):
        self._load_model()

    def _load_model(self):
        if not MODEL_FILE.exists():
            raise FileNotFoundError(f"Trained model artifact not found at {MODEL_FILE}. Run train.py first.")
        
        data = joblib.load(MODEL_FILE)
        self.pipeline = data["pipeline"]
        self.model_name = data.get("model_name", "Logistic Regression")
        self.categories = data.get("categories", [])

    def calculate_severity_and_priority(self, raw_text: str, category: str) -> Dict[str, Any]:
        """
        Determines severity score (1-10) and priority (Low, Medium, High)
        using transparent, explainable rule logic backed by the dataset.
        """
        base_score = BASE_CATEGORY_SEVERITY.get(category, 5)
        modifier = 0
        reasons = [f"Base severity for {category}: {base_score}/10"]

        # 1. Duration check in Hindi and Hinglish
        # Matches patterns like '6 दिनों से', '5 दिन', '7 hours', '4 घंटों से'
        day_match = re.search(r'(\d+)\s*(दिनों|दिन|din|days?)', raw_text, re.IGNORECASE)
        hour_match = re.search(r'(\d+)\s*(घंटों|घंटे|ghante|hours?)', raw_text, re.IGNORECASE)

        if day_match:
            days = int(day_match.group(1))
            if days >= 5:
                modifier += 3
                reasons.append(f"Critical duration detected ({days} days unresolved): +3")
            elif days >= 3:
                modifier += 2
                reasons.append(f"Extended duration detected ({days} days unresolved): +2")
            elif days >= 1:
                modifier += 1
                reasons.append(f"Ongoing duration detected ({days} days unresolved): +1")
        elif hour_match:
            hours = int(hour_match.group(1))
            if hours >= 12:
                modifier += 2
                reasons.append(f"Prolonged outage ({hours} hours): +2")
            elif hours >= 4:
                modifier += 1
                reasons.append(f"Outage duration ({hours} hours): +1")

        # 2. Critical danger or emergency keywords (checked across raw and normalized text)
        combined_text = f"{raw_text} {clean_and_preprocess_text(raw_text)}"
        critical_patterns = [
            (r'(ट्रांसफार्मर खराब|शॉर्ट सर्किट|करंट|करंट आ रहा|आग|स्पार्क)', 3, "High-voltage electrical hazard"),
            (r'(गंदा पानी सड़क|सीवर ओवरफ्लो|पीने का गंदा पानी|बीमारी)', 3, "Public health and contamination risk"),
            (r'(जलभराव|बाढ़|डूबा हुआ|पानी भरा)', 2, "Severe waterlogging risk"),
            (r'(बड़े गड्ढे|गड्ढे|हादसा|दुर्घटना|टूट गई|pothole|khadde|gaddhe)', 2, "Road accident and traffic hazard"),
            (r'(पूरी गली में अंधेरा|रात में अंधेरा)', 2, "Public night safety and security hazard")
        ]

        for pattern, mod, explanation in critical_patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                modifier += mod
                reasons.append(f"{explanation}: +{mod}")
                break

        # Calculate bounded score (1 to 10)
        final_score = max(1, min(10, base_score + modifier))

        # Map to Priority according to dataset thresholds
        if final_score <= 3:
            priority = "Low"
        elif final_score <= 7:
            priority = "Medium"
        else:
            priority = "High"

        return {
            "severity_score": final_score,
            "priority": priority,
            "explanation": reasons
        }

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Classifies complaint text, returns category, confidence %, department,
        and rule-based severity and priority analysis.
        """
        cleaned = clean_and_preprocess_text(text)
        if not cleaned:
            # Fallback for empty text
            return {
                "category": "Other",
                "department": "General Administration",
                "confidence_score": 0.0,
                "model_name": self.model_name,
                "severity_score": 3,
                "priority": "Low",
                "explanation": ["Empty or invalid complaint text"]
            }

        # Predict category
        pred_category = self.pipeline.predict([cleaned])[0]

        # Calculate confidence score
        confidence = 0.95
        if hasattr(self.pipeline, "predict_proba"):
            probs = self.pipeline.predict_proba([cleaned])[0]
            classes = list(self.pipeline.classes_)
            if pred_category in classes:
                confidence = float(probs[classes.index(pred_category)])
        
        # Round confidence to 4 decimals
        confidence_pct = round(confidence * 100, 2)

        # Department
        department = CATEGORY_DEPARTMENT_MAP.get(pred_category, "Municipal Administration")

        # Severity & Priority
        sev_prio = self.calculate_severity_and_priority(text, pred_category)

        return {
            "category": pred_category,
            "department": department,
            "confidence_score": confidence_pct,
            "model_name": self.model_name,
            "severity_score": sev_prio["severity_score"],
            "priority": sev_prio["priority"],
            "explanation": sev_prio["explanation"]
        }

# Global predictor singleton
_predictor_instance = None

def get_predictor() -> ComplaintPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = ComplaintPredictor()
    return _predictor_instance
