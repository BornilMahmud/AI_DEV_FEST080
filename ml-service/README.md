# upay Sentinel — Python Machine Learning Service

Production-grade Python ML inference and training microservice for the **upay Sentinel** MFS fraud & scam intelligence platform (DIU CPC × upay AI Hackathon 2026).

---

## ⚡ Architecture & Models

The service runs on **FastAPI** (`http://localhost:8000`) and serves three distinct models:

1. **Model A — Supervised Fraud Classifier**:
   - Algorithm: `HistGradientBoostingClassifier` (scikit-learn)
   - Purpose: Predicts calibrated `fraud_probability` from non-linear tabular interactions.
   - Explainability: Extracts top risk factors and impacts per transaction.

2. **Model B — Unsupervised Anomaly Detector**:
   - Algorithm: `IsolationForest` (scikit-learn)
   - Purpose: Computes normalized `anomaly_score` [0, 1] to detect novel typologies and zero-day attack patterns without relying on known fraud labels.

3. **Model C — Lightweight Neural Model**:
   - Architecture: PyTorch `SentinelMLP` (3-layer feedforward network with BatchNorm, Dropout, and Sigmoid)
   - Purpose: Neural embedding and non-linear representation scoring.

4. **Composite ML Ensemble**:
   - Weighted blend: `0.55 * Classifier + 0.25 * Anomaly + 0.20 * Neural`

---

## 📊 Feature Pipeline (20 Engineered Features)

Defined in [`app/features/pipeline.py`](app/features/pipeline.py):

| Index | Feature Name | Description |
|---|---|---|
| 0 | `amount` | Transaction value in BDT |
| 1 | `hour` | Hour of transaction (0–23) |
| 2 | `day_of_week` | Day of week (0–6) |
| 3 | `transaction_type` | Encoded type (send_money, cash_out, merchant, airtime) |
| 4 | `channel` | Encoded channel (App, USSD, QR, Agent POS) |
| 5 | `amount_vs_customer_baseline` | Ratio of amount to customer 30-day median (~৳2,200) |
| 6 | `customer_velocity_10m` | Transaction count in 10-minute window |
| 7 | `customer_velocity_1h` | Transaction count in 1-hour window |
| 8 | `customer_velocity_24h` | Transaction count in 24-hour window |
| 9 | `device_known` | 1 if hardware fingerprint is recognized; 0 if novel |
| 10 | `device_change` | 1 if new hardware detected |
| 11 | `location_change` | 1 if location deviates from registered district |
| 12 | `new_counterparty` | 1 if recipient wallet is first-time contact |
| 13 | `mule_cluster_link` | 1 if recipient is linked to Mule Syndicate Cluster #17 |
| 14 | `sim_swap_indicator` | 1 if SIM replacement detected within last 24h |
| 15 | `account_takeover_indicator`| 1 if PIN reset preceded transaction within 60m |
| 16 | `night_transaction` | 1 if nocturnal transfer (23:00 – 06:00) |
| 17 | `high_value_indicator` | 1 if amount ≥ ৳50,000 regulatory scrutiny threshold |
| 18 | `micro_structuring_indicator`| 1 if structured between ৳24,000 and ৳24,999 beneath ৳25,000 threshold |
| 19 | `rapid_drain_indicator` | 1 if rapid full-balance cash-out |

---

## 🚀 Running the Service

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Retraining & Evaluation
```bash
# Train supervised classifier
python -m app.training.train_classifier

# Train unsupervised anomaly detector
python -m app.training.train_anomaly

# Train PyTorch neural model
python -m app.training.train_neural

# Evaluate against held-out benchmark
python -m app.evaluation.evaluate
```

### 3. Start Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Run Tests
```bash
python -m pytest tests/
```

---

## 📡 API Endpoints

- `GET /health`: Service health and model status
- `GET /ready`: Readiness probe
- `GET /model-info`: Model architecture, version, and training metrics
- `POST /predict`: Single transaction prediction with feature extraction and XAI
- `POST /batch-predict`: Batch inference for multi-transaction streams
