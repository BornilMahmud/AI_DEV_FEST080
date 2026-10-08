import pytest
import numpy as np
from app.config.settings import settings
from app.models.classifier import FraudClassifier
from app.models.anomaly import AnomalyDetector
from app.models.neural import NeuralFraudModel

def test_classifier_prediction_bounds():
    clf = FraudClassifier.load(settings.CLASSIFIER_PATH)
    dummy_x = np.zeros(20, dtype=np.float32)
    score = clf.predict_fraud_score(dummy_x)
    assert 0.0 <= score <= 1.0

def test_anomaly_detector_bounds():
    det = AnomalyDetector.load(settings.ANOMALY_PATH)
    dummy_x = np.zeros(20, dtype=np.float32)
    score = det.predict_anomaly_score(dummy_x)
    assert 0.0 <= score <= 1.0

def test_neural_model_bounds():
    if settings.NEURAL_PATH.exists():
        neural = NeuralFraudModel.load(settings.NEURAL_PATH)
        dummy_x = np.zeros(20, dtype=np.float32)
        score = neural.predict_score(dummy_x)
        assert 0.0 <= score <= 1.0

def test_classifier_explainability():
    clf = FraudClassifier.load(settings.CLASSIFIER_PATH)
    suspicious_x = np.zeros(20, dtype=np.float32)
    suspicious_x[13] = 1.0 # mule link
    suspicious_x[15] = 1.0 # ATO
    factors = clf.explain(suspicious_x)
    assert isinstance(factors, list)
    assert len(factors) >= 1
    features_found = [f["feature"] for f in factors]
    assert "mule_cluster_link" in features_found or "account_takeover_indicator" in features_found
