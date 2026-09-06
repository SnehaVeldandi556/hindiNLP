"""
Resolution model storing recommended historical actions, estimated resolution days,
retrieved similar complaints, and workflow steps.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Resolution(Base):
    __tablename__ = "resolutions"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, unique=True)

    recommended_action = Column(String(255), nullable=False)
    estimated_resolution_days = Column(Float, nullable=False)
    action_steps = Column(JSON, nullable=True)
    similar_complaints = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="resolution")
