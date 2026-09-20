"""
Model Training and Comparison Module for ShikayatAI.
Trains:
1. TF-IDF + Logistic Regression
2. TF-IDF + Linear SVM (Calibrated for probabilities)
3. TF-IDF + Naive Bayes (MultinomialNB)

Prevents data leakage via stratified 80/20 split.
Compares models on Accuracy, Precision (Macro), Recall (Macro), F1 (Weighted), F1 (Macro).
Saves best model pipeline, model metrics, confusion matrix, and historical TF-IDF index.
"""

import os
import sys
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Ensure workspace root and current dir are accessible
CURRENT_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = CURRENT_DIR.parent.parent.parent
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from backend.app.ml.preprocessor import clean_and_preprocess_text
except ImportError:
    from preprocessor import clean_and_preprocess_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train")

ARTIFACTS_DIR = CURRENT_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
DATASET_PATH = WORKSPACE_ROOT / "complaints_dataset_2000.csv"

def train_and_evaluate():
    logger.info("Loading dataset from: %s", DATASET_PATH)
    df = pd.read_csv(DATASET_PATH)
    logger.info("Dataset shape: %s", df.shape)

    # 1. Clean and preprocess texts
    logger.info("Preprocessing Hindi/Hinglish complaint texts...")
    df["cleaned_text"] = df["Complaint_Text"].apply(clean_and_preprocess_text)

    X = df["cleaned_text"]
    y = df["Category"]

    categories = sorted(y.unique().tolist())
    logger.info("Categories found (%d): %s", len(categories), categories)

    # 2. Prevent data leakage using stratified train/test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    logger.info("Train samples: %d, Test samples: %d", len(X_train), len(X_test))

    # Candidate models
    # Note: Wrap LinearSVC in CalibratedClassifierCV to provide calibrated probabilities
    candidates = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            C=1.0,
            random_state=42,
            solver="lbfgs"
        ),
        "Linear SVM": CalibratedClassifierCV(
            LinearSVC(C=1.0, random_state=42, dual=True, max_iter=2000)
        ),
        "Naive Bayes": MultinomialNB(alpha=0.5)
    }

    results = {}
    best_name = None
    best_score = -1.0
    best_pipeline = None

    for name, clf in candidates.items():
        logger.info("Training pipeline for %s...", name)
        
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                token_pattern=r'(?u)[\u0900-\u097Fa-zA-Z0-9_]+',
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=True
            )),
            ("classifier", clf)
        ])

        # Fit on training data ONLY
        pipeline.fit(X_train, y_train)

        # Predict on holdout test set
        y_pred = pipeline.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
        rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
        f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        report = classification_report(y_test, y_pred, target_names=categories, output_dict=True)

        results[name] = {
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "recall_macro": round(rec_macro, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "report": report
        }

        logger.info("%s -> Accuracy: %.4f | F1-Macro: %.4f | Precision-Macro: %.4f | Recall-Macro: %.4f",
                    name, acc, f1_macro, prec_macro, rec_macro)

        # Selection criterion: Composite F1-Macro and Accuracy
        composite = (f1_macro + acc) / 2.0
        if composite > best_score:
            best_score = composite
            best_name = name
            best_pipeline = pipeline

    logger.info("Selected Best Model: %s (Composite Score: %.4f)", best_name, best_score)

    # Compute detailed confusion matrix for the best model on the holdout test set
    y_test_pred = best_pipeline.predict(X_test)
    cm = confusion_matrix(y_test, y_test_pred, labels=categories)
    
    cm_data = {
        "best_model": best_name,
        "categories": categories,
        "matrix": cm.tolist(),
        "total_test_samples": len(y_test),
        "row_labels": categories,
        "col_labels": categories
    }

    # Save model artifacts
    best_model_path = ARTIFACTS_DIR / "best_model.joblib"
    metrics_path = ARTIFACTS_DIR / "model_metrics.json"
    cm_path = ARTIFACTS_DIR / "confusion_matrix.json"

    joblib.dump({
        "pipeline": best_pipeline,
        "model_name": best_name,
        "categories": categories
    }, best_model_path)
    logger.info("Saved best model pipeline to: %s", best_model_path)

    metrics_output = {
        "best_model": best_name,
        "models": results,
        "comparison": [
            {
                "model": name,
                "accuracy": results[name]["accuracy"],
                "precision": results[name]["precision_macro"],
                "recall": results[name]["recall_macro"],
                "f1_macro": results[name]["f1_macro"],
                "f1_weighted": results[name]["f1_weighted"],
                "is_best": (name == best_name)
            }
            for name in results
        ]
    }

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_output, f, indent=2, ensure_ascii=False)
    logger.info("Saved metrics to: %s", metrics_path)

    with open(cm_path, "w", encoding="utf-8") as f:
        json.dump(cm_data, f, indent=2, ensure_ascii=False)
    logger.info("Saved confusion matrix to: %s", cm_path)

    # 3. Fit TF-IDF Vectorizer and Matrix for Historical Recommendation Engine
    logger.info("Building historical TF-IDF similarity index for all %d complaints...", len(df))
    rec_vectorizer = TfidfVectorizer(
        token_pattern=r'(?u)[\u0900-\u097Fa-zA-Z0-9_]+',
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    historical_tfidf_matrix = rec_vectorizer.fit_transform(df["cleaned_text"])

    # Store necessary fields for recommendation
    historical_corpus = df[[
        "Complaint_ID", "Complaint_Text", "Category", "Department", "Ward",
        "Severity_Score", "Priority", "Status", "Action_Taken",
        "Resolution_Time_Days", "Citizen_Rating"
    ]].to_dict(orient="records")

    rec_index_path = ARTIFACTS_DIR / "historical_tfidf.joblib"
    joblib.dump({
        "vectorizer": rec_vectorizer,
        "matrix": historical_tfidf_matrix,
        "corpus": historical_corpus
    }, rec_index_path)
    logger.info("Saved historical TF-IDF index to: %s", rec_index_path)

    return metrics_output, cm_data

if __name__ == "__main__":
    train_and_evaluate()
