"""
Database Seeding Script for ShikayatAI.
- Creates all database tables.
- Seeds default Admin and Citizen accounts.
- Seeds all 2,000 complaints from complaints_dataset_2000.csv.
- Seeds Model Metrics and Confusion Matrix.
- Pre-populates AI Predictions and Resolutions for historical complaints.
"""

import sys
import json
import logging
from pathlib import Path
from datetime import datetime, date
import pandas as pd

# Setup sys.path
CURRENT_DIR = Path(__file__).resolve().parent
APP_DIR = CURRENT_DIR.parent
PROJECT_DIR = APP_DIR.parent
WORKSPACE_ROOT = PROJECT_DIR.parent
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from backend.app.database import engine, SessionLocal, Base
from backend.app.models import User, Complaint, Prediction, Resolution, ModelMetric
from backend.app.utils.security import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed")

DATASET_PATH = WORKSPACE_ROOT / "complaints_dataset_2000.csv"
if not DATASET_PATH.exists():
    DATASET_PATH = PROJECT_DIR / "complaints_dataset_2000.csv"

ARTIFACTS_DIR = APP_DIR / "ml" / "artifacts"

def seed_database():
    logger.info("Connecting to PostgreSQL and creating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("All database tables verified/created successfully.")

    db = SessionLocal()
    try:
        # 1. Seed Users
        admin_user = db.query(User).filter(User.email == "admin@shikayatai.gov.in").first()
        if not admin_user:
            logger.info("Creating default admin user: admin@shikayatai.gov.in")
            admin_user = User(
                name="Municipal Admin Officer",
                email="admin@shikayatai.gov.in",
                hashed_password=hash_password("Admin@12345"),
                role="admin",
                ward="HQ Central"
            )
            db.add(admin_user)

        citizen_user = db.query(User).filter(User.email == "citizen@shikayatai.in").first()
        if not citizen_user:
            logger.info("Creating default citizen user: citizen@shikayatai.in")
            citizen_user = User(
                name="Rajesh Sharma",
                email="citizen@shikayatai.in",
                hashed_password=hash_password("Citizen@12345"),
                role="citizen",
                ward="Ward 38"
            )
            db.add(citizen_user)

        db.commit()
        db.refresh(citizen_user)

        # 2. Seed Complaints
        existing_complaints_count = db.query(Complaint).count()
        logger.info("Current complaint count in DB: %d", existing_complaints_count)

        if existing_complaints_count < 2000 and DATASET_PATH.exists():
            logger.info("Reading dataset from %s...", DATASET_PATH)
            df = pd.read_csv(DATASET_PATH)
            logger.info("Found %d records in dataset. Preparing bulk insert...", len(df))

            # Fetch existing complaint codes to avoid duplicate key conflicts
            existing_codes = set(code[0] for code in db.query(Complaint.complaint_code).all())

            complaints_to_add = []
            for _, row in df.iterrows():
                code = str(row["Complaint_ID"]).strip()
                if code in existing_codes:
                    continue

                # Parse date
                try:
                    c_date = datetime.strptime(str(row["Complaint_Date"]), "%Y-%m-%d").date()
                except Exception:
                    c_date = date.today()

                # Assign some citizen complaints to demo citizen user
                assigned_user_id = citizen_user.id if code in ["C00001", "C00002", "C00003", "C00004", "C00005"] else None

                complaint_obj = Complaint(
                    complaint_code=code,
                    user_id=assigned_user_id,
                    complaint_text=str(row["Complaint_Text"]).strip(),
                    category=str(row["Category"]).strip(),
                    department=str(row["Department"]).strip(),
                    ward=str(row["Ward"]).strip(),
                    month=int(row["Month"]) if pd.notnull(row["Month"]) else None,
                    season=str(row["Season"]).strip() if pd.notnull(row["Season"]) else None,
                    severity_score=int(row["Severity_Score"]) if pd.notnull(row["Severity_Score"]) else 5,
                    priority=str(row["Priority"]).strip() if pd.notnull(row["Priority"]) else "Medium",
                    pending_complaints=int(row["Pending_Complaints"]) if pd.notnull(row["Pending_Complaints"]) else 0,
                    assigned_officer=str(row["Assigned_Officer"]).strip() if pd.notnull(row["Assigned_Officer"]) else None,
                    response_time_hours=int(row["Response_Time_Hours"]) if pd.notnull(row["Response_Time_Hours"]) else None,
                    resolution_time_days=int(row["Resolution_Time_Days"]) if pd.notnull(row["Resolution_Time_Days"]) else None,
                    action_taken=str(row["Action_Taken"]).strip() if pd.notnull(row["Action_Taken"]) else "Pending",
                    status=str(row["Status"]).strip() if pd.notnull(row["Status"]) else "Open",
                    citizen_rating=int(row["Citizen_Rating"]) if pd.notnull(row["Citizen_Rating"]) else None,
                    complaint_date=c_date,
                    created_at=datetime.combine(c_date, datetime.min.time())
                )
                complaints_to_add.append(complaint_obj)

            if complaints_to_add:
                db.bulk_save_objects(complaints_to_add)
                db.commit()
                logger.info("Successfully seeded %d complaints into PostgreSQL.", len(complaints_to_add))

        # 3. Seed Model Metrics
        metrics_file = ARTIFACTS_DIR / "model_metrics.json"
        cm_file = ARTIFACTS_DIR / "confusion_matrix.json"

        if metrics_file.exists():
            logger.info("Seeding model metrics from %s...", metrics_file)
            with open(metrics_file, "r", encoding="utf-8") as f:
                metrics_data = json.load(f)

            cm_data = None
            if cm_file.exists():
                with open(cm_file, "r", encoding="utf-8") as f:
                    cm_data = json.load(f)

            best_model_name = metrics_data.get("best_model", "Logistic Regression")

            for item in metrics_data.get("comparison", []):
                name = item["model"]
                existing_metric = db.query(ModelMetric).filter(ModelMetric.model_name == name).first()
                
                is_best = (name == best_model_name)
                cm_val = cm_data if is_best else None
                details = metrics_data["models"].get(name, {}).get("report")

                if not existing_metric:
                    metric_record = ModelMetric(
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
                    db.add(metric_record)
                else:
                    existing_metric.accuracy = item["accuracy"]
                    existing_metric.precision_macro = item["precision"]
                    existing_metric.recall_macro = item["recall"]
                    existing_metric.f1_macro = item["f1_macro"]
                    existing_metric.f1_weighted = item["f1_weighted"]
                    existing_metric.is_best = is_best
                    existing_metric.details = details
                    existing_metric.confusion_matrix = cm_val

            db.commit()
            logger.info("Model metrics seeded successfully.")

        # 4. Seed sample AI predictions and resolutions for initial complaints
        sample_complaints = db.query(Complaint).limit(10).all()
        for c in sample_complaints:
            existing_pred = db.query(Prediction).filter(Prediction.complaint_id == c.id).first()
            if not existing_pred:
                db.add(Prediction(
                    complaint_id=c.id,
                    predicted_category=c.category,
                    confidence_score=99.1,
                    model_name="Logistic Regression",
                    calculated_severity=c.severity_score,
                    priority_assigned=c.priority,
                    explanation=[f"Verified category match for {c.category}", f"Severity evaluated at {c.severity_score}/10"]
                ))

            existing_res = db.query(Resolution).filter(Resolution.complaint_id == c.id).first()
            if not existing_res:
                db.add(Resolution(
                    complaint_id=c.id,
                    recommended_action=c.action_taken if c.action_taken and c.action_taken != "Pending" else f"Resolve {c.category} Issue",
                    estimated_resolution_days=float(c.resolution_time_days or 5.0),
                    action_steps=[f"Investigate {c.category} at {c.ward}", "Execute required maintenance or replacement", "Close complaint with citizen verification"],
                    similar_complaints=[]
                ))
        db.commit()
        logger.info("Sample AI predictions and resolutions seeded.")

        total_users = db.query(User).count()
        total_complaints = db.query(Complaint).count()
        total_metrics = db.query(ModelMetric).count()
        logger.info("DATABASE SEED SUMMARY: Users=%d, Complaints=%d, ModelMetrics=%d",
                    total_users, total_complaints, total_metrics)

    except Exception as e:
        db.rollback()
        logger.error("Error seeding database: %s", e, exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
