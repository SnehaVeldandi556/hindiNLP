"""
Machine Learning API Router for ShikayatAI.
Endpoints for:
- Live Complaint Classification, Confidence Scoring & Resolution Recommendation
- ML Model Comparison Metrics & Confusion Matrix
- Model Retraining Trigger
"""

import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.model_metric import ModelMetric
from backend.app.schemas.ml import (
    ClassifyRequest,
    ClassifyResponse,
    ModelMetricsResponse,
    ModelComparisonItem
)
from backend.app.ml.predictor import get_predictor
from backend.app.ml.recommender import get_recommender
from backend.app.ml.train import train_and_evaluate
from backend.app.api.deps import get_current_admin

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "ml" / "artifacts"

@router.post("/classify", response_model=ClassifyResponse)
def classify_complaint(req: ClassifyRequest):
    """
    Analyzes new Hindi/Hinglish complaint text:
    - Predicts category & confidence score %
    - Computes transparent rule-based severity (1-10) and priority (Low/Medium/High)
    - Retrieves top 3-5 similar historical complaints using TF-IDF + Cosine Similarity
    - Derives resolution recommendation based on historical data.
    """
    if not req.complaint_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint text cannot be empty."
        )

    predictor = get_predictor()
    recommender = get_recommender()

    # Predict category and priority
    pred = predictor.predict(req.complaint_text)

    # Resolution recommendation and historical similar complaints
    rec = recommender.recommend_resolution(req.complaint_text, pred["category"])

    return {
        "category": pred["category"],
        "department": pred["department"],
        "confidence_score": pred["confidence_score"],
        "model_name": pred["model_name"],
        "severity_score": pred["severity_score"],
        "priority": pred["priority"],
        "explanation": pred["explanation"],
        "recommended_action": rec["recommended_action"],
        "estimated_resolution_days": rec["estimated_resolution_days"],
        "action_steps": rec["action_steps"],
        "similar_complaints": rec["similar_complaints"]
    }

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_metrics(db: Session = Depends(get_db)):
    """
    Returns actual evaluation metrics (Accuracy, Precision, Recall, F1, Macro-F1)
    for Logistic Regression, Linear SVM, and Naive Bayes, along with
    the confusion matrix for the best performing model.
    """
    # First check database records
    db_metrics = db.query(ModelMetric).all()
    if db_metrics:
        comparison = []
        best_model = "Logistic Regression"
        models_dict = {}
        cm_data = None

        for m in db_metrics:
            comparison.append(ModelComparisonItem(
                model=m.model_name,
                accuracy=m.accuracy,
                precision=m.precision_macro,
                recall=m.recall_macro,
                f1_macro=m.f1_macro,
                f1_weighted=m.f1_weighted,
                is_best=m.is_best
            ))
            models_dict[m.model_name] = {
                "accuracy": m.accuracy,
                "precision_macro": m.precision_macro,
                "recall_macro": m.recall_macro,
                "f1_macro": m.f1_macro,
                "f1_weighted": m.f1_weighted,
                "report": m.details
            }
            if m.is_best:
                best_model = m.model_name
                cm_data = m.confusion_matrix

        return {
            "best_model": best_model,
            "models": models_dict,
            "comparison": comparison,
            "confusion_matrix": cm_data
        }

    # Fallback to saved JSON files
    metrics_file = ARTIFACTS_DIR / "model_metrics.json"
    cm_file = ARTIFACTS_DIR / "confusion_matrix.json"

    if not metrics_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics have not been computed yet. Please trigger training."
        )

    with open(metrics_file, "r", encoding="utf-8") as f:
        metrics_data = json.load(f)

    cm_data = None
    if cm_file.exists():
        with open(cm_file, "r", encoding="utf-8") as f:
            cm_data = json.load(f)

    metrics_data["confusion_matrix"] = cm_data
    return metrics_data

@router.post("/retrain")
def retrain_models(admin_user=Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    Triggers complete retraining and evaluation pipeline on dataset.
    Requires Admin privileges.
    """
    try:
        metrics_output, cm_data = train_and_evaluate()

        # Update database records
        best_name = metrics_output.get("best_model", "Logistic Regression")
        for item in metrics_output.get("comparison", []):
            name = item["model"]
            m_rec = db.query(ModelMetric).filter(ModelMetric.model_name == name).first()
            is_best = (name == best_name)
            cm_val = cm_data if is_best else None
            details = metrics_output["models"].get(name, {}).get("report")

            if not m_rec:
                m_rec = ModelMetric(
                    model_name=name,
                    accuracy=item["accuracy"],
                    precision_macro=item["precision"],
                    recall_macro=item["recall"],
                    f1_macro=item["f1_macro"],
                    f1_weighted=item["f1_weighted"],
                    is_best=is_best,
                    details=details,
                    confusion_matrix=cm_val
                )
                db.add(m_rec)
            else:
                m_rec.accuracy = item["accuracy"]
                m_rec.precision_macro = item["precision"]
                m_rec.recall_macro = item["recall"]
                m_rec.f1_macro = item["f1_macro"]
                m_rec.f1_weighted = item["f1_weighted"]
                m_rec.is_best = is_best
                m_rec.details = details
                m_rec.confusion_matrix = cm_val

        db.commit()

        # Reload predictors
        get_predictor()._load_model()
        get_recommender()._load_index()

        return {
            "message": "Models successfully retrained and updated in database.",
            "best_model": best_name,
            "metrics": metrics_output
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining failed: {str(e)}"
        )
