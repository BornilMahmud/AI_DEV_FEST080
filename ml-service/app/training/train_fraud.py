"""
Training Pipeline for Model 1: Supervised Fraud Classifier.
Trained on the unified multi-tier dataset:
- PaySim (Leakage-Safe Mobile-Money Distributions)
- Sentinel Synthetic MFS (Customer Baseline Profiling & Behavioral Attack Injections)
- IBM AMLSim (Network & Laundering Typologies)
"""

import json
from datetime import datetime, timezone
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)

from app.config.settings import settings
from app.features.pipeline import FeaturePipeline
from app.models.classifier import FraudClassifier
from app.data.loaders import build_unified_normalized_dataset

def train_and_save_fraud_model():
    print("=" * 60)
    print("[1/4] Loading and assembling unified multi-tier dataset...")
    print("      - PaySim (Leakage-Safe, Simulator Balances Stripped)")
    print("      - Sentinel Synthetic MFS (Customer 30-Day Baselines)")
    print("      - IBM AMLSim (Network & Typology Signals)")
    print("=" * 60)

    X, y, feature_names = build_unified_normalized_dataset()
    print(f"Dataset Shape: X={X.shape}, y={y.shape}. Positive Fraud Rate: {np.mean(y)*100:.2f}%")

    print("\n[2/4] Performing Stratified Train-Test Split (80% Train, 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    print("\n[3/4] Fitting Scikit-learn HistGradientBoostingClassifier...")
    clf = FraudClassifier()
    clf.fit(X_train, y_train)

    # Evaluate on held-out test split
    probs = clf.predict_proba(X_test)[:, 1]
    preds = (probs >= settings.FRAUD_THRESHOLD).astype(int)

    acc = float(accuracy_score(y_test, preds))
    prec = float(precision_score(y_test, preds, zero_division=0))
    rec = float(recall_score(y_test, preds, zero_division=0))
    f1 = float(f1_score(y_test, preds, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, probs))
    pr_auc = float(average_precision_score(y_test, probs))
    cm = confusion_matrix(y_test, preds).tolist()

    print("\n" + "=" * 60)
    print("--- MODEL 1 TEST EVALUATION METRICS (LEAKAGE-FREE) ---")
    print("=" * 60)
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"PR-AUC:    {pr_auc:.4f}")
    print(f"Confusion Matrix: {cm}")

    print("\n[4/4] Serializing model and metadata artifacts...")
    clf.save(settings.CLASSIFIER_PATH)
    print(f"Saved classifier artifact to: {settings.CLASSIFIER_PATH}")

    metadata = {
        "model_name": "HistGradientBoostingClassifier",
        "model_version": settings.APP_VERSION,
        "feature_version": settings.FEATURE_VERSION,
        "framework": "scikit-learn",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "data_sources": [
            "PaySim (Leakage-Safe Mobile-Money Synthetic)",
            "Sentinel Synthetic MFS (30-Day Customer Baselines + Attack Injections)",
            "IBM AMLSim (Network & Hawala/Structuring Typologies)"
        ],
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "confusion_matrix": cm,
        },
        "threshold": settings.FRAUD_THRESHOLD,
    }

    settings.METADATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(settings.METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to: {settings.METADATA_PATH}")

    FeaturePipeline.save_schema(settings.SCHEMA_PATH)
    print(f"Saved feature schema to: {settings.SCHEMA_PATH}")

    return metadata

if __name__ == "__main__":
    train_and_save_fraud_model()
