"""
Complaint model storing all municipal complaint data, matching the 2000 dataset schema
and tracking operational lifecycle.
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    complaint_text = Column(Text, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    department = Column(String(150), nullable=False)
    ward = Column(String(50), index=True, nullable=False)

    month = Column(Integer, nullable=True)
    season = Column(String(50), nullable=True)
    severity_score = Column(Integer, nullable=False, default=5)
    priority = Column(String(20), index=True, nullable=False, default="Medium")  # Low, Medium, High

    pending_complaints = Column(Integer, default=0)
    assigned_officer = Column(String(50), nullable=True)
    response_time_hours = Column(Integer, nullable=True)
    resolution_time_days = Column(Integer, nullable=True)
    action_taken = Column(String(255), nullable=True, default="Pending")
    status = Column(String(50), index=True, nullable=False, default="Open")  # Open, In Progress, Closed
    citizen_rating = Column(Integer, nullable=True)

    complaint_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="complaints")
    prediction = relationship("Prediction", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    resolution = relationship("Resolution", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
