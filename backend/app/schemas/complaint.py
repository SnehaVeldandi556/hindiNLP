"""
Complaint Pydantic schemas.
"""

from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class ComplaintCreate(BaseModel):
    complaint_text: str = Field(..., min_length=3)
    ward: str = Field(..., min_length=2)
    # Citizen can optionally override or let AI determine category
    category: Optional[str] = None

class ComplaintUpdateStatus(BaseModel):
    status: str = Field(..., description="Open, In Progress, or Closed")
    action_taken: Optional[str] = None
    assigned_officer: Optional[str] = None
    resolution_time_days: Optional[int] = None
    citizen_rating: Optional[int] = None

class PredictionSchema(BaseModel):
    predicted_category: str
    confidence_score: float
    model_name: str
    calculated_severity: int
    priority_assigned: str
    explanation: Optional[List[str]] = None

    class Config:
        from_attributes = True

class ResolutionSchema(BaseModel):
    recommended_action: str
    estimated_resolution_days: float
    action_steps: Optional[List[str]] = None
    similar_complaints: Optional[List[Any]] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintResponse(BaseModel):
    id: int
    complaint_code: str
    user_id: Optional[int]
    complaint_text: str
    category: str
    department: str
    ward: str
    severity_score: int
    priority: str
    status: str
    assigned_officer: Optional[str]
    response_time_hours: Optional[int]
    resolution_time_days: Optional[int]
    action_taken: Optional[str]
    citizen_rating: Optional[int]
    complaint_date: Optional[date]
    created_at: datetime
    prediction: Optional[PredictionSchema] = None
    resolution: Optional[ResolutionSchema] = None

    class Config:
        from_attributes = True

class ComplaintListResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[ComplaintResponse]
