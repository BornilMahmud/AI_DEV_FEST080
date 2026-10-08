# Machine Learning & Risk Fusion Architecture

## 1. System Topology

```text
                        TRANSACTION STREAM
                                │
                                ▼
                      ┌───────────────────┐
                      │  EXPRESS BACKEND  │  (Port 3001)
                      └─────────┬─────────┘
                                │
                      ┌─────────▼─────────┐
                      │ FEATURE EXTRACTION │  (20 MFS features)
                      └─────────┬─────────┘
                                │
                        HTTP REST (1.5s timeout)
                                │
                      ┌─────────▼─────────┐
                      │ PYTHON ML SERVICE │  (FastAPI Port 8000)
                      └─────────┬─────────┘
                                │
           ┌────────────────────┼────────────────────┐
           ▼                    ▼                    ▼
     Model A (Supervised)  Model B (Anomaly)   Model C (Neural)
     HistGradientBoosting   IsolationForest      PyTorch MLP
           │                    │                    │
           └────────────────────┼────────────────────┘
                                ▼
                       ML Ensemble Score
                                │
                                ▼
                      ┌───────────────────┐
                      │    RISK FUSION    │
                      │ 70% Deterministic │
                      │   + 30% Python ML │
                      └─────────┬─────────┘
                                │
                                ▼
                      FINAL RISK SCORE [8 - 99]
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
           CRITICAL (≥85)   HIGH (≥70)     LOW (<45)
          Settlement HOLD  2FA Challenge     ALLOW
                │               │               │
                └───────────────┼───────────────┘
                                ▼
                      SUPABASE POSTGRESQL &
                      IMMUTABLE AUDIT TRAIL
```

---

## 2. Models Specification

### Model A: HistGradientBoostingClassifier (scikit-learn)
- **Input**: 20 numerical & encoded transaction features.
- **Parameters**: `max_iter=150`, `learning_rate=0.08`, `l2_regularization=1.5`, `min_samples_leaf=20`.
- **Output**: Calibrated `fraud_probability` ∈ [0.0, 1.0].
- **Artifact**: `ml-service/artifacts/fraud_classifier_v1.joblib`

### Model B: IsolationForest (scikit-learn)
- **Input**: 20 features.
- **Parameters**: `n_estimators=100`, `contamination=0.08`, `random_state=42`.
- **Output**: Normalized `anomaly_score` ∈ [0.05, 0.99].
- **Artifact**: `ml-service/artifacts/anomaly_detector_v1.joblib`

### Model C: SentinelMLP (PyTorch)
- **Architecture**:
  - `Linear(20, 64) -> BatchNorm1d(64) -> ReLU() -> Dropout(0.2)`
  - `Linear(64, 32) -> ReLU()`
  - `Linear(32, 1) -> Sigmoid()`
- **Output**: `neural_score` ∈ [0.01, 0.99].
- **Artifact**: `ml-service/artifacts/neural_model_v1.pt`

---

## 3. Authoritative Risk Fusion

The Express backend merges deterministic fraud detection with Python ML inference:

```text
Final Risk Score = Round(0.70 * Deterministic_Score + 0.30 * (ML_Ensemble * 100))
```

### Regulatory Compliance Guardrails:
1. **Bangladesh Bank Circular 25/2023 Scrutiny Threshold**: If transaction amount ≥ ৳50,000 BDT, score floor is enforced at `75`.
2. **Mule Syndicate Cluster #17 Linkage**: If counterparty is confirmed conduit wallet (`U-8831`), score floor is enforced at `85` (`Critical`).
3. **Score Boundaries**: Clamped between `8` and `99`.

---

## 4. Resilience & Fallback

If the Python ML service is offline or takes longer than 1500ms:
- The Express backend **does not crash or drop transactions**.
- An intelligent deterministic heuristic fallback is activated automatically.
- The assessment payload explicitly records:
  ```json
  {
    "ml_available": false,
    "fallback_used": true,
    "fallback_reason": "TIMEOUT_EXCEEDED" | "SERVICE_UNAVAILABLE"
  }
  ```
- Full auditability is maintained without fabricating artificial ML scores.
