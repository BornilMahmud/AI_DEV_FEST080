import pytest
import numpy as np
from app.features.pipeline import FeaturePipeline, FEATURE_NAMES

def test_feature_pipeline_length():
    assert len(FEATURE_NAMES) == 20

def test_feature_extraction_defaults():
    raw = {}
    features = FeaturePipeline.extract_from_raw(raw)
    assert len(features) == 20
    assert "amount" in features
    assert features["amount"] == 0.0

def test_feature_vector_conversion():
    raw = {
        "amount": 48500.0,
        "hour": 2,
        "isNewDevice": True,
        "recipient": "U-8831",
        "transaction_type": "send_money",
    }
    features = FeaturePipeline.extract_from_raw(raw)
    vec = FeaturePipeline.to_vector(features)
    assert isinstance(vec, np.ndarray)
    assert vec.shape == (20,)
    assert vec[0] == 48500.0
    assert vec[1] == 2.0  # hour
    assert vec[9] == 0.0  # device_known = 0
    assert vec[10] == 1.0 # device_change = 1
    assert vec[13] == 1.0 # mule_cluster_link = 1
