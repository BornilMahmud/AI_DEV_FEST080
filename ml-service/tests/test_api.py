import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes import load_models_at_startup

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def init_models():
    load_models_at_startup()

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["models_loaded"]["classifier"] is True

def test_ready_endpoint():
    res = client.get("/ready")
    assert res.status_code == 200
    assert res.json()["status"] == "ready"

def test_model_info():
    res = client.get("/model-info")
    assert res.status_code == 200
    data = res.json()
    assert "HistGradientBoostingClassifier" in data["model_name"]
    assert data["classifier_trained"] is True

def test_predict_benign_transaction():
    payload = {
        "transaction_id": "TXN-BENIGN-01",
        "raw_transaction": {
            "amount": 1250,
            "hour": 14,
            "isNewDevice": False,
            "transaction_type": "merchant_payment"
        }
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["transaction_id"] == "TXN-BENIGN-01"
    assert data["fraud_probability"] < 0.30
    assert data["prediction"] == "LEGITIMATE"

def test_predict_critical_mule_transaction():
    payload = {
        "transaction_id": "TXN-CRIT-MULE",
        "raw_transaction": {
            "amount": 48500,
            "hour": 2,
            "isNewDevice": True,
            "recipient": "U-8831",
            "transaction_type": "send_money"
        }
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["fraud_probability"] >= 0.70
    assert data["prediction"] in ["CRITICAL", "SUSPICIOUS"]
    assert len(data["top_risk_factors"]) >= 1

def test_batch_prediction():
    payload = {
        "transactions": [
            {"transaction_id": "TXN-1", "raw_transaction": {"amount": 500}},
            {"transaction_id": "TXN-2", "raw_transaction": {"amount": 49000, "recipient": "U-8831"}}
        ]
    }
    res = client.post("/batch-predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 2
    assert len(data["predictions"]) == 2
