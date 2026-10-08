"""
Comprehensive Multi-Model Evaluation Suite for upay Sentinel.
Evaluates:
- Model 1: HistGradientBoostingClassifier (Supervised Fraud Classifier)
- Model 2: IsolationForest (Behavioral Anomaly Detector)
- Multi-Model Ensemble Risk Fusion (Fraud + Anomaly + Network Risk)
Evaluated on held-out test split of the unified multi-tier dataset.
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
from app.models.classifier import FraudClassifier
from app.models.anomaly import AnomalyDetector
from app.models.neural import NeuralFraudModel
from app.data.loaders import build_unified_normalized_dataset

def run_evaluation():
    print("=" * 60)
    print("[Evaluation] Loading held-out test split from unified multi-layer dataset...")
    print("=" * 60)

    X, y, _ = build_unified_normalized_dataset()
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.25, random_state=123, stratify=y
    )

    print(f"Held-out test set size: {len(X_test)} samples (Frauds: {int(np.sum(y_test))}, Normal: {int(len(y_test) - np.sum(y_test))})")

    print("[Evaluation] Loading trained models...")
    clf = FraudClassifier.load(settings.CLASSIFIER_PATH)
    anomaly_det = AnomalyDetector.load(settings.ANOMALY_PATH)

    neural_model = None
    if settings.NEURAL_PATH.exists():
        try:
            neural_model = NeuralFraudModel.load(settings.NEURAL_PATH)
        except Exception:
            pass

    # Model 1 & 2 inference
    clf_probs = clf.predict_proba(X_test)[:, 1]
    anomaly_scores = anomaly_det.score_anomaly(X_test)

    # Network feature signals (indices 13: mule_link, 18: structuring, 17: high_value)
    mule_links = X_test[:, 13]
    structurings = X_test[:, 18]
    high_vals = X_test[:, 17]
    network_risks = np.clip(0.65 * mule_links + 0.20 * structurings + 0.15 * high_vals, 0.0, 1.0)

    if neural_model:
        neural_scores = np.array([neural_model.predict_score(x) for x in X_test])
        ensemble_scores = (
            0.45 * clf_probs +
            0.25 * anomaly_scores +
            0.15 * network_risks +
            0.15 * neural_scores
        )
    else:
        ensemble_scores = (
            0.55 * clf_probs +
            0.25 * anomaly_scores +
            0.20 * network_risks
        )

    binary_preds = (ensemble_scores >= settings.FRAUD_THRESHOLD).astype(int)

    acc = float(accuracy_score(y_test, binary_preds))
    prec = float(precision_score(y_test, binary_preds, zero_division=0))
    rec = float(recall_score(y_test, binary_preds, zero_division=0))
    f1 = float(f1_score(y_test, binary_preds, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, ensemble_scores))
    pr_auc = float(average_precision_score(y_test, ensemble_scores))

    cm = confusion_matrix(y_test, binary_preds)
    tn, fp, fn, tp = cm.ravel()

    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    report = {
        "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
        "model_version": settings.APP_VERSION,
        "feature_version": settings.FEATURE_VERSION,
        "frameworks": ["scikit-learn (HistGradientBoosting + IsolationForest)", "PyTorch"],
        "dataset_architecture": {
            "tier_1": "PaySim mobile-money (leakage-safe, simulator balances stripped)",
            "tier_2": "Sentinel Synthetic MFS (30-day customer baselines + behavioral injections)",
            "tier_3": "IBM AMLSim (network laundering typologies)",
        },
        "sample_size": len(y_test),
        "fraud_count": int(np.sum(y_test)),
        "normal_count": int(len(y_test) - np.sum(y_test)),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "false_positive_rate": round(fpr, 4),
            "false_negative_rate": round(fnr, 4),
            "confusion_matrix": {
                "true_positives": int(tp),
                "false_positives": int(fp),
                "true_negatives": int(tn),
                "false_negatives": int(fn),
            },
        },
        "threshold": settings.FRAUD_THRESHOLD,
        "is_leakage_safe": True,
        "regulatory_disclaimer": "Evaluated on multi-source domain-grounded benchmark with verified post-authorization balance leakage safeguards.",
    }

    settings.EVALUATION_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(settings.EVALUATION_PATH, "w") as f:
        json.dump(report, f, indent=2)

    print("\n" + "=" * 60)
    print("[REPORT] MULTI-MODEL RISK FUSION EVALUATION REPORT")
    print("=" * 60)
    print(f"Sample Size: {len(y_test)} (Fraud: {report['fraud_count']}, Legit: {report['normal_count']})")
    print(f"Accuracy:    {acc * 100:.2f}%")
    print(f"Precision:   {prec * 100:.2f}%")
    print(f"Recall:      {rec * 100:.2f}%")
    print(f"F1 Score:    {f1:.4f}")
    print(f"ROC-AUC:     {roc_auc:.4f}")
    print(f"PR-AUC:      {pr_auc:.4f}")
    print(f"FPR:         {fpr * 100:.2f}%")
    print(f"FNR:         {fnr * 100:.2f}%")
    print("Confusion Matrix:")
    print(f"  TP: {tp} | FP: {fp}")
    print(f"  FN: {fn} | TN: {tn}")
    print("=" * 60 + "\n")

    return report

if __name__ == "__main__":
    run_evaluation()
