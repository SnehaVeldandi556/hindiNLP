"""
Historical Complaint Similarity Search and Resolution Recommendation Engine.
Uses TF-IDF + Cosine Similarity over the 2,000 historical municipal complaints.
Extracts top 3-5 similar historical cases and synthesizes realistic,
data-grounded resolution recommendations.
"""

from pathlib import Path
from typing import List, Dict, Any
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from backend.app.ml.preprocessor import clean_and_preprocess_text

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
INDEX_FILE = ARTIFACTS_DIR / "historical_tfidf.joblib"

# Standard procedural guidelines mapped to actual historical actions
ACTION_WORKFLOW_MAP = {
    "Pipeline repaired": [
        "Deploy leak detection team to inspect pipeline pressure.",
        "Isolate damaged pipeline section and replace ruptured sleeve.",
        "Perform water quality and pressure test prior to full restoration."
    ],
    "Valve replaced": [
        "Inspect distribution control valve for physical wear or calcification.",
        "Shut sub-line valve and install standard municipal valve unit.",
        "Verify uninterrupted water pressure to citizen connections."
    ],
    "Transformer repaired": [
        "Despatch junior electrical engineer for thermal imaging of coils.",
        "Replace damaged step-down coils and replenish transformer oil.",
        "Ground lines and conduct phased voltage restoration test."
    ],
    "Fuse replaced": [
        "Inspect distribution pillar box for blown high-rupturing-capacity (HRC) fuse.",
        "Replace burnt fuse wire with correct amperage rating.",
        "Confirm phase balance across local consumer connections."
    ],
    "Potholes filled": [
        "Deploy road maintenance crew with cold-mix / asphalt patch material.",
        "Clean pothole cavity, compact base aggregate, and apply bituminous layer.",
        "Roller-compact surface flush with adjacent road level."
    ],
    "Road repaired": [
        "Assess structural sub-base damage and mark repair boundary.",
        "Excavate damaged section, refill gravel sub-base, and resurface asphalt.",
        "Erect temporary safety signage until bitumen sets completely."
    ],
    "Garbage collected": [
        "Dispatch secondary municipal refuse collection vehicle with sanitation workers.",
        "Clear road-side waste piles and empty overflowing community bins.",
        "Disinfect collection point using lime powder / germicidal spray."
    ],
    "Waste removed": [
        "Mobilize backhoe loader and dump truck for unauthorized waste dump clearance.",
        "Transfer accumulated municipal solid waste to designated landfill/processing site.",
        "Sanitize spot and notify ward sanitary inspector."
    ],
    "Drain cleaned": [
        "Deploy drainage desilting crew with suction/rod equipment.",
        "Extract silt, plastic debris, and sediment choking the open drain.",
        "Clear stormwater culvert to ensure unimpeded gravity runoff."
    ],
    "Blockage removed": [
        "Use high-pressure jetting machine to flush out subterranean blockage.",
        "Extract solidified grease and debris causing backflow.",
        "Inspect downstream manhole flow velocity."
    ],
    "Bulb replaced": [
        "Dispatch cherry-picker vehicle with LED luminaire kit.",
        "Test fixture electrical supply, replace damaged 70W/120W LED lamp.",
        "Inspect photocell sensor for dusk-to-dawn automatic switching."
    ],
    "Wiring repaired": [
        "Trace aerial bundled cables (ABC) or underground conduit for short circuit.",
        "Splice or replace damaged conductor segment and waterproof joints.",
        "Conduct line insulation test and restore street illumination circuit."
    ],
    "Overflow cleared": [
        "Deploy super-sucker vacuum tanker to relieve hydrostatic pressure in sewer line.",
        "De-silt manhole and clear grease blockages from main sewer barrel.",
        "Spray disinfectant around affected road surface."
    ],
    "Sewer cleaned": [
        "Mechanized rodding and high-flow sewer flushing through connected manholes.",
        "Extract heavy sediment build-up and check sewer gradient.",
        "Seal manhole cover properly and confirm normal gravity flow."
    ],
    "Schedule updated": [
        "Review fleet GPS logs and identify route bottleneck timings.",
        "Recalibrate headway timings and inform transit depot dispatch.",
        "Update digital passenger information display at key bus stops."
    ],
    "Extra bus deployed": [
        "Authorize standby municipal bus from nearest regional depot.",
        "Deploy reinforcement service during peak commute hours.",
        "Monitor passenger occupancy and adjust route schedule frequency."
    ]
}

class ResolutionRecommender:
    def __init__(self):
        self._load_index()

    def _load_index(self):
        if not INDEX_FILE.exists():
            raise FileNotFoundError(f"TF-IDF index not found at {INDEX_FILE}. Run train.py first.")
        
        data = joblib.load(INDEX_FILE)
        self.vectorizer = data["vectorizer"]
        self.tfidf_matrix = data["matrix"]
        self.corpus = data["corpus"]

    def find_similar_complaints(self, text: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Calculates cosine similarity and retrieves top_k most similar historical complaints.
        """
        cleaned = clean_and_preprocess_text(text)
        if not cleaned:
            return []

        query_vec = self.vectorizer.transform([cleaned])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Get top indices
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(scores[idx])
            item = self.corpus[idx].copy()
            item["similarity_score"] = round(score * 100, 1)  # percentage
            results.append(item)

        return results

    def recommend_resolution(self, text: str, predicted_category: str) -> Dict[str, Any]:
        """
        Generates resolution recommendation based on retrieved historical resolutions.
        Strictly derived from historical dataset facts.
        """
        similar = self.find_similar_complaints(text, top_k=5)

        # Filter resolved historical complaints
        resolved_cases = [c for c in similar if c.get("Status") == "Closed" and c.get("Action_Taken") != "Pending"]
        
        if not resolved_cases:
            # Fallback to category cases in corpus
            resolved_cases = [c for c in self.corpus if c.get("Category") == predicted_category and c.get("Status") == "Closed"][:5]

        # Extract dominant action taken
        action_counts = {}
        resolution_days_list = []

        for case in resolved_cases:
            action = case.get("Action_Taken")
            if action and action != "Pending":
                action_counts[action] = action_counts.get(action, 0) + 1
            
            res_days = case.get("Resolution_Time_Days")
            if res_days and isinstance(res_days, (int, float)):
                resolution_days_list.append(res_days)

        top_action = max(action_counts, key=action_counts.get) if action_counts else "Standard Municipal Investigation"
        avg_days = round(float(np.mean(resolution_days_list)), 1) if resolution_days_list else 5.0

        recommended_steps = ACTION_WORKFLOW_MAP.get(
            top_action,
            [
                f"Inspect site with {predicted_category} field response team.",
                "Execute corrective repair according to standard municipal operating procedures.",
                "Verify resolution with ward supervisor and close complaint ticket."
            ]
        )

        return {
            "recommended_action": top_action,
            "estimated_resolution_days": avg_days,
            "action_steps": recommended_steps,
            "similar_complaints": similar,
            "based_on_resolved_cases_count": len(resolved_cases)
        }

# Global recommender singleton
_recommender_instance = None

def get_recommender() -> ResolutionRecommender:
    global _recommender_instance
    if _recommender_instance is None:
        _recommender_instance = ResolutionRecommender()
    return _recommender_instance
