import pytest
import numpy as np
import pandas as pd
from app.data.validators import (
    validate_paysim_leakage_safety,
    validate_customer_baselines,
    validate_feature_matrix,
    validate_labels,
)
from app.data.loaders import load_paysim, load_amlsim, load_sentinel_mfs
from app.features.pipeline import FeaturePipeline
from app.features.behavioral_features import extract_behavioral_features
from app.inference.predictor import SentinelPredictor

def test_paysim_leakage_safety_validator():
    # DataFrame with leakage field should raise ValueError
    leaky_df = pd.DataFrame({"step": [1], "amount": [5000], "newbalanceOrig": [0.0]})
    with pytest.raises(ValueError, match="CRITICAL LEAKAGE DETECTED"):
        validate_paysim_leakage_safety(leaky_df)

    # Safe DataFrame without future balances should pass
    safe_df = pd.DataFrame({"step": [1], "amount": [5000], "type": ["TRANSFER"]})
    assert validate_paysim_leakage_safety(safe_df) is True

def test_paysim_loader_leakage_safe():
    df = load_paysim(leakage_safe=True)
    assert "newbalanceOrig" not in df.columns
    assert "newbalanceDest" not in df.columns
    assert "oldbalanceOrg" not in df.columns
    assert "oldbalanceDest" not in df.columns
    assert "amount" in df.columns
    assert "hour" in df.columns

def test_sentinel_mfs_customer_baselines_loader():
    baselines, events_df = load_sentinel_mfs()
    assert len(baselines) > 0
    assert len(events_df) > 0
    assert "U-0001" in baselines or list(baselines.keys())[0].startswith("U-")
    sample_profile = list(baselines.values())[0]
    assert "median_amount" in sample_profile
    assert "primary_district" in sample_profile
    assert "primary_device" in sample_profile
    assert validate_customer_baselines(baselines) is True

def test_amlsim_loader():
    aml_df = load_amlsim()
    assert len(aml_df) > 0
    assert "is_laundering" in aml_df.columns
    assert "pattern_type" in aml_df.columns

def test_customer_behavioral_deviation_math():
    # Customer baseline: median = 2150 BDT, primary district = Kushtia, primary device = DEV-001
    baseline = {
        "median_amount": 2150.0,
        "primary_district": "Kushtia",
        "primary_device": "DEV-001",
        "usual_hours": list(range(9, 21)),
        "usual_counterparties": ["U-0010", "U-0011"],
    }

    # Attack transaction: 38,000 BDT, 2:17 AM, Sylhet, Device DEV-999, New Recipient
    raw_attack = {
        "amount": 38000.0,
        "hour": 2,
        "district": "Sylhet",
        "device_id": "DEV-999",
        "recipient": "U-8831",
        "transaction_type": "cash_out",
    }

    b_feats = extract_behavioral_features(raw_attack, customer_baseline=baseline)
    assert b_feats["amount_vs_customer_baseline"] == pytest.approx(38000.0 / 2150.0, 0.1)
    assert b_feats["device_change"] == 1.0
    assert b_feats["location_change"] == 1.0
    assert b_feats["night_transaction"] == 1.0
    assert b_feats["new_counterparty"] == 1.0

def test_sentinel_predictor_end_to_end():
    predictor = SentinelPredictor.load_from_artifacts()
    assert predictor.classifier is not None
    assert predictor.anomaly_detector is not None

    # Benign transaction
    res_benign = predictor.predict_transaction({
        "amount": 1500,
        "hour": 14,
        "transaction_type": "merchant_payment",
        "customer_median_amount": 1500,
    })
    assert res_benign["prediction"] == "LEGITIMATE"
    assert res_benign["ensemble_score"] < 0.40

    # Attacked transaction (ATO + Mule 17)
    res_attack = predictor.predict_transaction({
        "amount": 48500,
        "hour": 2,
        "isNewDevice": True,
        "recipient": "U-8831",
        "transaction_type": "send_money",
        "ato_detected": True,
        "customer_median_amount": 2150,
    })
    assert res_attack["prediction"] in ["CRITICAL", "SUSPICIOUS"]
    assert res_attack["ensemble_score"] >= 0.70
    assert res_attack["network_risk"] > 0.50
