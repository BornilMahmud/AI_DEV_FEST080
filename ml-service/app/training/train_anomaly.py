"""
Training Pipeline for Model 2: Isolation Forest Anomaly Detector.
Trains an unsupervised behavioral baseline model on normal customer transactions
to detect novel attacks (unusual hours, extreme amount multiples, novel devices/locations, velocity surges).
"""

import numpy as np
from app.config.settings import settings
from app.models.anomaly import AnomalyDetector
from app.data.loaders import load_sentinel_mfs, load_paysim
from app.features.pipeline import FeaturePipeline

def train_and_save_anomaly_detector():
    print("=" * 60)
    print("[1/3] Extracting customer behavioral baseline transactions...")
    print("=" * 60)

    baselines, sentinel_df = load_sentinel_mfs()

    # Filter primarily normal transactions for unsupervised background modeling
    normal_txns = sentinel_df[sentinel_df["is_fraud"] == 0]
    attack_txns = sentinel_df[sentinel_df["is_fraud"] == 1]

    train_rows = []
    for _, row in normal_txns.iterrows():
        cust_id = row["customer_id"]
        b = baselines.get(cust_id, {
            "median_amount": 2200.0,
            "primary_district": "Dhaka",
            "usual_hours": list(range(9, 21)),
        })
        feat_dict = FeaturePipeline.extract_from_raw(dict(row), customer_baseline=b)
        train_rows.append(FeaturePipeline.to_vector(feat_dict))

    # Add a small set of background PaySim normal transactions
    paysim_df = load_paysim(leakage_safe=True)
    paysim_normal = paysim_df[paysim_df["isFraud"] == 0].sample(n=min(1000, len(paysim_df)), random_state=42)
    for _, row in paysim_normal.iterrows():
        raw_dict = {
            "amount": float(row["amount"]),
            "hour": int(row["hour"]),
            "day_of_week": int(row["day_of_week"]),
            "transaction_type": str(row["type"]).lower(),
            "channel": "app",
        }
        feat_dict = FeaturePipeline.extract_from_raw(raw_dict)
        train_rows.append(FeaturePipeline.to_vector(feat_dict))

    X_train = np.array(train_rows, dtype=np.float32)
    print(f"Fitting IsolationForest on {len(X_train)} normal background transactions (contamination=0.05)...")

    detector = AnomalyDetector()
    detector.fit(X_train)

    print("\n[2/3] Evaluating Anomaly Discrimination on Legitimate vs Attacked Transactions...")
    normal_scores = detector.score_anomaly(X_train[:200])
    print(f"Mean Anomaly Score on Legitimate Customer History: {np.mean(normal_scores):.4f} (target: < 0.35)")

    attack_rows = []
    for _, row in attack_txns.iterrows():
        cust_id = row["customer_id"]
        b = baselines.get(cust_id, {})
        feat_dict = FeaturePipeline.extract_from_raw(dict(row), customer_baseline=b)
        attack_rows.append(FeaturePipeline.to_vector(feat_dict))

    if attack_rows:
        X_attack = np.array(attack_rows, dtype=np.float32)
        attack_scores = detector.score_anomaly(X_attack)
        print(f"Mean Anomaly Score on Injected Behavioral Attacks: {np.mean(attack_scores):.4f} (target: > 0.65)")

    print("\n[3/3] Serializing Anomaly Detector...")
    detector.save(settings.ANOMALY_PATH)
    print(f"Saved anomaly detector artifact to: {settings.ANOMALY_PATH}")

if __name__ == "__main__":
    train_and_save_anomaly_detector()
