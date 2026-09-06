"""
Analytics Pydantic schemas.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class OverviewStats(BaseModel):
    total_complaints: int
    open_complaints: int
    in_progress_complaints: int
    closed_complaints: int
    resolution_rate: float
    avg_resolution_days: float
    avg_response_hours: float
    total_citizens: int

class CategoryStatItem(BaseModel):
    category: str
    department: str
    total: int
    closed: int
    open: int
    in_progress: int
    avg_days: float
    resolution_rate: float

class PriorityStatItem(BaseModel):
    priority: str
    count: int
    percentage: float
    avg_severity: float

class TrendStatItem(BaseModel):
    label: str
    total: int
    closed: int
    open: int

class WardStatItem(BaseModel):
    ward: str
    total: int
    resolution_rate: float

class AnalyticsDashboard(BaseModel):
    overview: OverviewStats
    categories: List[CategoryStatItem]
    priorities: List[PriorityStatItem]
    trends: List[TrendStatItem]
    top_wards: List[WardStatItem]
