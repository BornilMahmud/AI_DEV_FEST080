from typing import Dict, Any, List
import numpy as np
import pandas as pd

def validate_paysim_leakage_safety(df: pd.DataFrame) -> bool:
    """
    Verifies that PaySim future balance fields (which cause synthetic simulator leakage)
    are NOT present in the training feature columns.
    """
    leakage_fields = {"newbalanceOrig", "newbalanceDest"}
    present_leaks = leakage_fields.intersection(set(df.columns))
    if present_leaks:
        raise ValueError(f"CRITICAL LEAKAGE DETECTED: Features contain post-authorization balance fields: {present_leaks}")
    return True

def validate_customer_baselines(baselines: Dict[str, Any]) -> bool:
    """
    Validates structural integrity of customer behavioral baseline profiles.
    """
    if not baselines:
        raise ValueError("Customer baselines dictionary cannot be empty")

    for cust_id, profile in baselines.items():
        if "median_amount" not in profile or profile["median_amount"] <= 0:
            raise ValueError(f"Invalid median_amount for customer {cust_id}")
        if "primary_district" not in profile:
            raise ValueError(f"Missing primary_district for customer {cust_id}")
        if "usual_hours" not in profile or not isinstance(profile["usual_hours"], list):
            raise ValueError(f"Invalid usual_hours for customer {cust_id}")
    return True

def validate_feature_matrix(X: np.ndarray, expected_dim: int = 20) -> bool:
    """
    Validates numerical soundness of extracted features (no NaNs, no Infs, correct dimensionality).
    """
    if X.ndim != 2:
        raise ValueError(f"Feature matrix must be 2-dimensional, got ndim={X.ndim}")
    if X.shape[1] != expected_dim:
        raise ValueError(f"Expected {expected_dim} features, got {X.shape[1]}")
    if np.isnan(X).any():
        raise ValueError("Feature matrix contains NaN values")
    if np.isinf(X).any():
        raise ValueError("Feature matrix contains infinite values")
    return True

def validate_labels(y: np.ndarray) -> bool:
    """
    Validates target fraud labels.
    """
    if y.ndim != 1:
        raise ValueError(f"Label array must be 1-dimensional, got {y.ndim}")
    unique_vals = set(np.unique(y))
    if not unique_vals.issubset({0, 1}):
        raise ValueError(f"Labels must be binary {0, 1}, got {unique_vals}")
    fraud_rate = float(np.mean(y))
    if fraud_rate == 0.0 or fraud_rate >= 0.50:
        raise ValueError(f"Unrealistic fraud class ratio: {fraud_rate:.4f} (expected 0.01 - 0.40)")
    return True
