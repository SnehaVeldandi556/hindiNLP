"""
Complaints API Router.
Handles complaint submission, lifecycle status transitions, filtering, and retrieval.
"""

from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from backend.app.database import get_db
from backend.app.models.complaint import Complaint
from backend.app.models.prediction import Prediction
from backend.app.models.resolution import Resolution
from backend.app.models.user import User
from backend.app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdateStatus,
    ComplaintResponse,
    ComplaintListResponse
)
from backend.app.api.deps import get_optional_current_user, get_current_user, get_current_admin
from backend.app.ml.predictor import get_predictor
from backend.app.ml.recommender import get_recommender

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def generate_next_complaint_code(db: Session) -> str:
    """Generates next unique complaint ID code (e.g. C02001)."""
    last_complaint = db.query(Complaint.complaint_code)\
        .filter(Complaint.complaint_code.like("C%"))\
        .order_by(desc(Complaint.id))\
        .first()

    if last_complaint and last_complaint[0].startswith("C") and last_complaint[0][1:].isdigit():
        num = int(last_complaint[0][1:]) + 1
        return f"C{num:05d}"
    
    count = db.query(Complaint).count() + 1
    return f"C{count:05d}"

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(
    comp_in: ComplaintCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a new civic complaint:
    1. Preprocesses Hindi/Hinglish text
    2. Runs ML category classification and confidence scoring
    3. Evaluates rule-based severity and priority
    4. Retrieves top 3-5 similar complaints and derives resolution recommendation
    5. Stores Complaint, Prediction, and Resolution atomically in PostgreSQL.
    """
    predictor = get_predictor()
    recommender = get_recommender()

    # Step 1 & 2: ML Prediction
    pred = predictor.predict(comp_in.complaint_text)
    category = comp_in.category if comp_in.category else pred["category"]
    department = pred["department"]

    # Step 3: Priority & Severity
    severity_score = pred["severity_score"]
    priority = pred["priority"]

    # Step 4: Resolution Recommendation & Similar Cases
    rec = recommender.recommend_resolution(comp_in.complaint_text, category)

    code = generate_next_complaint_code(db)
    user_id = current_user.id if current_user else None

    # Step 5: Save to PostgreSQL
    complaint = Complaint(
        complaint_code=code,
        user_id=user_id,
        complaint_text=comp_in.complaint_text.strip(),
        category=category,
        department=department,
        ward=comp_in.ward.strip(),
        month=datetime.utcnow().month,
        season="Monsoon" if datetime.utcnow().month in [6, 7, 8, 9] else ("Winter" if datetime.utcnow().month in [11, 12, 1, 2] else "Summer"),
        severity_score=severity_score,
        priority=priority,
        pending_complaints=0,
        status="Open",
        action_taken="Pending",
        complaint_date=date.today()
    )
    db.add(complaint)
    db.flush()  # get complaint.id

    # Create Prediction record
    prediction_record = Prediction(
        complaint_id=complaint.id,
        predicted_category=pred["category"],
        confidence_score=pred["confidence_score"],
        model_name=pred["model_name"],
        calculated_severity=severity_score,
        priority_assigned=priority,
        explanation=pred["explanation"]
    )
    db.add(prediction_record)

    # Create Resolution record
    resolution_record = Resolution(
        complaint_id=complaint.id,
        recommended_action=rec["recommended_action"],
        estimated_resolution_days=rec["estimated_resolution_days"],
        action_steps=rec["action_steps"],
        similar_complaints=rec["similar_complaints"]
    )
    db.add(resolution_record)

    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("", response_model=ComplaintListResponse)
def list_complaints(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    my_only: bool = False,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists complaints with filtering, search, and pagination.
    """
    query = db.query(Complaint)

    if my_only:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required to view your complaints.")
        query = query.filter(Complaint.user_id == current_user.id)

    if status and status.lower() != "all":
        query = query.filter(Complaint.status == status)

    if category and category.lower() != "all":
        query = query.filter(Complaint.category == category)

    if priority and priority.lower() != "all":
        query = query.filter(Complaint.priority == priority)

    if ward and ward.lower() != "all":
        query = query.filter(Complaint.ward == ward)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_text.ilike(term),
                Complaint.complaint_code.ilike(term),
                Complaint.department.ilike(term),
                Complaint.action_taken.ilike(term)
            )
        )

    total = query.count()
    total_pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit

    items = query.order_by(desc(Complaint.id)).offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": total_pages,
        "items": items
    }

@router.get("/{id_or_code}", response_model=ComplaintResponse)
def get_complaint(id_or_code: str, db: Session = Depends(get_db)):
    """
    Retrieves a single complaint with its AI prediction and resolution details.
    """
    if id_or_code.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(id_or_code)).first()
    else:
        complaint = db.query(Complaint).filter(Complaint.complaint_code == id_or_code.strip()).first()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID or code '{id_or_code}' not found."
        )

    return complaint

@router.patch("/{id_or_code}/status", response_model=ComplaintResponse)
def update_complaint_status(
    id_or_code: str,
    update_in: ComplaintUpdateStatus,
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin updates complaint lifecycle status, action taken, and assigned officer.
    """
    if id_or_code.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(id_or_code)).first()
    else:
        complaint = db.query(Complaint).filter(Complaint.complaint_code == id_or_code.strip()).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = update_in.status
    if update_in.action_taken is not None:
        complaint.action_taken = update_in.action_taken
    if update_in.assigned_officer is not None:
        complaint.assigned_officer = update_in.assigned_officer
    if update_in.resolution_time_days is not None:
        complaint.resolution_time_days = update_in.resolution_time_days
    if update_in.citizen_rating is not None:
        complaint.citizen_rating = update_in.citizen_rating

    complaint.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint
