"""
Analytics API Router for ShikayatAI.
Queries PostgreSQL directly to deliver live operational metrics and chart data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from backend.app.database import get_db
from backend.app.models.complaint import Complaint
from backend.app.models.user import User
from backend.app.schemas.analytics import (
    AnalyticsDashboard,
    OverviewStats,
    CategoryStatItem,
    PriorityStatItem,
    TrendStatItem,
    WardStatItem
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewStats)
def get_overview(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()
    open_cnt = db.query(Complaint).filter(Complaint.status == "Open").count()
    in_prog_cnt = db.query(Complaint).filter(Complaint.status == "In Progress").count()
    closed_cnt = db.query(Complaint).filter(Complaint.status == "Closed").count()

    res_rate = round((closed_cnt / total * 100), 2) if total > 0 else 0.0

    avg_days_result = db.query(func.avg(Complaint.resolution_time_days))\
        .filter(Complaint.status == "Closed").scalar()
    avg_days = round(float(avg_days_result), 1) if avg_days_result is not None else 0.0

    avg_resp_result = db.query(func.avg(Complaint.response_time_hours))\
        .filter(Complaint.response_time_hours.isnot(None)).scalar()
    avg_resp = round(float(avg_resp_result), 1) if avg_resp_result is not None else 0.0

    total_citizens = db.query(User).filter(User.role == "citizen").count()

    return {
        "total_complaints": total,
        "open_complaints": open_cnt,
        "in_progress_complaints": in_prog_cnt,
        "closed_complaints": closed_cnt,
        "resolution_rate": res_rate,
        "avg_resolution_days": avg_days,
        "avg_response_hours": avg_resp,
        "total_citizens": total_citizens
    }

@router.get("/categories")
def get_category_stats(db: Session = Depends(get_db)):
    results = db.query(
        Complaint.category,
        Complaint.department,
        func.count(Complaint.id).label("total"),
        func.count(case((Complaint.status == "Closed", 1))).label("closed"),
        func.count(case((Complaint.status == "Open", 1))).label("open"),
        func.count(case((Complaint.status == "In Progress", 1))).label("in_progress"),
        func.avg(case((Complaint.status == "Closed", Complaint.resolution_time_days))).label("avg_days")
    ).group_by(Complaint.category, Complaint.department).order_by(func.count(Complaint.id).desc()).all()

    items = []
    for r in results:
        tot = r.total
        cls = r.closed
        rate = round((cls / tot * 100), 1) if tot > 0 else 0.0
        avg_d = round(float(r.avg_days), 1) if r.avg_days is not None else 0.0
        items.append({
            "category": r.category,
            "department": r.department,
            "total": tot,
            "closed": cls,
            "open": r.open,
            "in_progress": r.in_progress,
            "avg_days": avg_d,
            "resolution_rate": rate
        })
    return items

@router.get("/priorities")
def get_priority_stats(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()
    results = db.query(
        Complaint.priority,
        func.count(Complaint.id).label("count"),
        func.avg(Complaint.severity_score).label("avg_severity")
    ).group_by(Complaint.priority).all()

    items = []
    # Consistent order: High, Medium, Low
    order = {"High": 1, "Medium": 2, "Low": 3}
    sorted_results = sorted(results, key=lambda x: order.get(x.priority, 4))

    for r in sorted_results:
        pct = round((r.count / total * 100), 1) if total > 0 else 0.0
        avg_s = round(float(r.avg_severity), 1) if r.avg_severity is not None else 0.0
        items.append({
            "priority": r.priority,
            "count": r.count,
            "percentage": pct,
            "avg_severity": avg_s
        })
    return items

@router.get("/dashboard", response_model=AnalyticsDashboard)
def get_full_dashboard(db: Session = Depends(get_db)):
    overview = get_overview(db)
    categories = get_category_stats(db)
    priorities = get_priority_stats(db)

    # Monthly / Season Trend
    monthly = db.query(
        Complaint.month,
        func.count(Complaint.id).label("total"),
        func.count(case((Complaint.status == "Closed", 1))).label("closed"),
        func.count(case((Complaint.status == "Open", 1))).label("open")
    ).filter(Complaint.month.isnot(None))\
     .group_by(Complaint.month)\
     .order_by(Complaint.month).all()

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    trends = []
    for m in monthly:
        m_idx = m.month - 1
        label = month_names[m_idx] if 0 <= m_idx < len(month_names) else f"Month {m.month}"
        trends.append({
            "label": label,
            "total": m.total,
            "closed": m.closed,
            "open": m.open
        })

    # Top wards
    top_wards_res = db.query(
        Complaint.ward,
        func.count(Complaint.id).label("total"),
        func.count(case((Complaint.status == "Closed", 1))).label("closed")
    ).group_by(Complaint.ward)\
     .order_by(func.count(Complaint.id).desc())\
     .limit(10).all()

    top_wards = []
    for w in top_wards_res:
        rate = round((w.closed / w.total * 100), 1) if w.total > 0 else 0.0
        top_wards.append({
            "ward": w.ward,
            "total": w.total,
            "resolution_rate": rate
        })

    return {
        "overview": overview,
        "categories": categories,
        "priorities": priorities,
        "trends": trends,
        "top_wards": top_wards
    }
