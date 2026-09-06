"""
ModelMetric model storing training metrics (Accuracy, Precision, Recall, F1, Macro-F1)
and confusion matrices for comparing ML models in the dashboard.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from backend.app.database import Base

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    accuracy = Column(Float, nullable=False)
    precision_macro = Column(Float, nullable=False)
    recall_macro = Column(Float, nullable=False)
    f1_macro = Column(Float, nullable=False)
    f1_weighted = Column(Float, nullable=False)
    is_best = Column(Boolean, default=False)
    details = Column(JSON, nullable=True)
    confusion_matrix = Column(JSON, nullable=True)

    trained_at = Column(DateTime, default=datetime.utcnow, nullable=False)
