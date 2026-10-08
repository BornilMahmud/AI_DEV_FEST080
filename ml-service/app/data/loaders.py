import json
from pathlib import Path
from typing import Dict, Any, Tuple, List
import pandas as pd
import numpy as np

from app.data.validators import (
    validate_paysim_leakage_safety,
    validate_customer_baselines,
    validate_feature_matrix,
    validate_labels,
)

DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "datasets"

def load_paysim(leakage_safe: bool = True) -> pd.DataFrame:
    """
    Loads PaySim dataset.
    CRITICAL METHODOLOGY NOTE:
    If leakage_safe is True, strictly validates and drops post-authorization balance fields
    (newbalanceOrig, newbalanceDest) which cause simulator artifact leakage.
    """
    csv_path = DATASETS_DIR / "external" / "paysim" / "paysim_sample.csv"
    if not csv_path.exists():
        from app.data.generator import generate_paysim_data
        generate_paysim_data()

    df = pd.read_csv(csv_path)

    if leakage_safe:
        # Exclude simulator balance leakage artifacts
        leakage_cols = ["newbalanceOrig", "newbalanceDest", "oldbalanceOrg", "oldbalanceDest"]
        df_safe = df.drop(columns=[c for c in leakage_cols if c in df.columns])
        validate_paysim_leakage_safety(df_safe)
        df_safe["hour"] = df_safe["step"] % 24
        df_safe["day_of_week"] = (df_safe["step"] // 24) % 7
        return df_safe

    return df

def load_amlsim() -> pd.DataFrame:
    """
    Loads IBM AMLSim network intelligence and money laundering typologies.
    """
    csv_path = DATASETS_DIR / "external" / "amlsim" / "amlsim_sample.csv"
    if not csv_path.exists():
        from app.data.generator import generate_amlsim_data
        generate_amlsim_data()

    return pd.read_csv(csv_path)

def load_sentinel_mfs() -> Tuple[Dict[str, Any], pd.DataFrame]:
    """
    Loads Dataset B: Customer 30-day baseline profiles & transaction history.
    """
    base_dir = DATASETS_DIR / "synthetic" / "sentinel_mfs"
    baselines_path = base_dir / "customer_baselines.json"
    events_path = base_dir / "sentinel_mfs_events.csv"

    if not baselines_path.exists() or not events_path.exists():
        from app.data.generator import generate_sentinel_mfs_data
        generate_sentinel_mfs_data()

    with open(baselines_path, "r", encoding="utf-8") as f:
        baselines = json.load(f)

    validate_customer_baselines(baselines)
    events_df = pd.read_csv(events_path)
    return baselines, events_df

def build_unified_normalized_dataset() -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Builds the unified 20-feature matrix incorporating:
    - Layer 1: PaySim mobile-money transaction foundations (leakage-safe)
    - Layer 2: Sentinel MFS customer behavioral deviations (30-day baselines, ATO, SIM swap)
    - Layer 3: IBM AMLSim network typologies (Mule Cluster 17, rapid structuring)
    - Guarantees 100% train-inference feature alignment and zero target leakage.
    """
    from app.features.pipeline import FeaturePipeline, FEATURE_NAMES

    baselines, sentinel_df = load_sentinel_mfs()
    paysim_df = load_paysim(leakage_safe=True)
    aml_df = load_amlsim()

    rows_X = []
    rows_y = []

    # 1. Process Sentinel MFS behavioral transactions (with baselines)
    for _, row in sentinel_df.iterrows():
        cust_id = row["customer_id"]
        b = baselines.get(cust_id, {
            "median_amount": 2200.0,
            "primary_district": "Dhaka",
            "usual_hours": list(range(9, 21)),
        })
        feat_dict = FeaturePipeline.extract_from_raw(dict(row), customer_baseline=b)
        rows_X.append(FeaturePipeline.to_vector(feat_dict))
        rows_y.append(int(row["is_fraud"]))

    # 2. Integrate PaySim mobile-money samples (using standard baseline)
    sample_paysim = paysim_df.sample(n=min(2000, len(paysim_df)), random_state=42)
    for _, row in sample_paysim.iterrows():
        raw_dict = {
            "amount": float(row["amount"]),
            "hour": int(row["hour"]),
            "day_of_week": int(row["day_of_week"]),
            "transaction_type": str(row["type"]).lower(),
            "channel": "app",
            "recipient": str(row.get("nameDest", "")),
        }
        feat_dict = FeaturePipeline.extract_from_raw(raw_dict)
        rows_X.append(FeaturePipeline.to_vector(feat_dict))
        rows_y.append(int(row["isFraud"]))

    # 3. Integrate AMLSim network typology samples
    sample_aml = aml_df.sample(n=min(1000, len(aml_df)), random_state=42)
    for _, row in sample_aml.iterrows():
        raw_dict = {
            "amount": float(row["amount"]),
            "hour": int(row["step"] % 24),
            "day_of_week": int((row["step"] // 24) % 7),
            "transaction_type": str(row["tran_type"]).lower(),
            "channel": "app",
            "recipient": str(row["dest_account"]),
            "pattern_type": str(row["pattern_type"]),
        }
        feat_dict = FeaturePipeline.extract_from_raw(raw_dict)
        rows_X.append(FeaturePipeline.to_vector(feat_dict))
        rows_y.append(int(row["is_laundering"]))

    X = np.array(rows_X, dtype=np.float32)
    y = np.array(rows_y, dtype=np.int32)

    # Validate mathematical soundness and class ratios
    validate_feature_matrix(X, expected_dim=len(FEATURE_NAMES))
    validate_labels(y)

    # Cache processed dataset
    proc_dir = DATASETS_DIR / "processed"
    proc_dir.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(proc_dir / "unified_dataset.npz", X=X, y=y, feature_names=FEATURE_NAMES)
    print(f"[Loaders] Built unified dataset: {len(X)} samples, {int(np.sum(y))} frauds ({np.mean(y)*100:.1f}%), {X.shape[1]} features.")

    return X, y, FEATURE_NAMES
