"""
Prediction model storing ML category inferences, confidence scores,
and severity scoring explanations.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    predicted_category = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    model_name = Column(String(100), nullable=False)
    calculated_severity = Column(Integer, nullable=False)
    priority_assigned = Column(String(20), nullable=False)
    explanation = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="prediction")
