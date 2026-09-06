"""
ML Pydantic schemas.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ClassifyRequest(BaseModel):
    complaint_text: str = Field(..., min_length=3, description="Complaint text in Hindi or Hinglish")
    ward: Optional[str] = "Ward 1"

class SimilarComplaintItem(BaseModel):
    Complaint_ID: str
    Complaint_Text: str
    Category: str
    Department: str
    Ward: str
    Status: str
    Action_Taken: Optional[str]
    Resolution_Time_Days: Optional[int]
    Citizen_Rating: Optional[int]
    similarity_score: float

class ClassifyResponse(BaseModel):
    category: str
    department: str
    confidence_score: float
    model_name: str
    severity_score: int
    priority: str
    explanation: List[str]
    recommended_action: str
    estimated_resolution_days: float
    action_steps: List[str]
    similar_complaints: List[SimilarComplaintItem]

class ModelComparisonItem(BaseModel):
    model: str
    accuracy: float
    precision: float
    recall: float
    f1_macro: float
    f1_weighted: float
    is_best: bool

class ModelMetricsResponse(BaseModel):
    best_model: str
    models: Dict[str, Any]
    comparison: List[ModelComparisonItem]
    confusion_matrix: Optional[Dict[str, Any]] = None
