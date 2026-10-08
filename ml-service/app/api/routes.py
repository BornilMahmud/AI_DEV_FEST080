import json
import time
from typing import Dict, Any, List
import numpy as np
from fastapi import APIRouter, HTTPException, status

from app.config.settings import settings
from app.features.pipeline import FeaturePipeline
from app.models.classifier import FraudClassifier
from app.models.anomaly import AnomalyDetector
from app.models.neural import NeuralFraudModel
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelInfoResponse,
    RiskFactor,
)

router = APIRouter()

# Global Model Registry (loaded once at startup)
models_registry: Dict[str, Any] = {
    "classifier": None,
    "anomaly_detector": None,
    "neural_model": None,
    "startup_time": time.time(),
}

def load_models_at_startup():
    """Load trained artifacts into memory once at service boot."""
    try:
        if settings.CLASSIFIER_PATH.exists():
            models_registry["classifier"] = FraudClassifier.load(settings.CLASSIFIER_PATH)
            print(f"[ML Service] Loaded FraudClassifier from {settings.CLASSIFIER_PATH}")
        else:
            print(f"[ML Service] Warning: Classifier artifact not found at {settings.CLASSIFIER_PATH}")

        if settings.ANOMALY_PATH.exists():
            models_registry["anomaly_detector"] = AnomalyDetector.load(settings.ANOMALY_PATH)
            print(f"[ML Service] Loaded AnomalyDetector from {settings.ANOMALY_PATH}")
        else:
            print(f"[ML Service] Warning: Anomaly detector artifact not found at {settings.ANOMALY_PATH}")

        if settings.NEURAL_PATH.exists():
            models_registry["neural_model"] = NeuralFraudModel.load(settings.NEURAL_PATH)
            print(f"[ML Service] Loaded NeuralFraudModel from {settings.NEURAL_PATH}")
    except Exception as e:
        print(f"[ML Service] Error loading models: {e}")

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {
        "status": "operational",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "feature_version": settings.FEATURE_VERSION,
        "models_loaded": {
            "classifier": models_registry["classifier"] is not None,
            "anomaly_detector": models_registry["anomaly_detector"] is not None,
            "neural_model": models_registry["neural_model"] is not None,
        },
        "uptime_seconds": round(time.time() - models_registry["startup_time"], 2),
    }

@router.get("/ready", status_code=status.HTTP_200_OK)
def readiness_check():
    if not models_registry["classifier"]:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Classifier not loaded")
    return {"status": "ready"}

@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    metrics = {}
    if settings.METADATA_PATH.exists():
        try:
            with open(settings.METADATA_PATH, "r") as f:
                metrics = json.load(f).get("metrics", {})
        except Exception:
            pass

    return ModelInfoResponse(
        model_name="HistGradientBoostingClassifier + IsolationForest + PyTorch MLP",
        model_version=settings.APP_VERSION,
        feature_version=settings.FEATURE_VERSION,
        framework="scikit-learn / PyTorch",
        classifier_trained=models_registry["classifier"] is not None,
        anomaly_detector_trained=models_registry["anomaly_detector"] is not None,
        neural_model_trained=models_registry["neural_model"] is not None,
        metrics=metrics,
    )

def _predict_single(req: PredictionRequest) -> PredictionResponse:
    clf: FraudClassifier = models_registry["classifier"]
    anomaly_det: AnomalyDetector = models_registry["anomaly_detector"]
    neural_mod: NeuralFraudModel = models_registry["neural_model"]

    if not clf:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model not loaded. Service is not ready."
        )

    # 1. Feature extraction
    if req.features:
        feat_dict = req.features
    elif req.raw_transaction:
        feat_dict = FeaturePipeline.extract_from_raw(req.raw_transaction)
    else:
        # Default empty extraction
        feat_dict = FeaturePipeline.extract_from_raw({})

    x_vec = FeaturePipeline.to_vector(feat_dict)

    # 2. Supervised Fraud Probability
    fraud_prob = clf.predict_fraud_score(x_vec)

    # 3. Anomaly Score
    anomaly_score = 0.15
    if anomaly_det:
        anomaly_score = anomaly_det.predict_anomaly_score(x_vec)

    # 4. Neural Model Score
    neural_score = None
    if neural_mod:
        neural_score = neural_mod.predict_score(x_vec)

    # 5. Composite ML Ensemble Score
    if neural_score is not None:
        ensemble = 0.55 * fraud_prob + 0.25 * anomaly_score + 0.20 * neural_score
    else:
        ensemble = 0.70 * fraud_prob + 0.30 * anomaly_score

    ensemble = round(float(np.clip(ensemble, 0.05, 0.99)), 4)

    # 6. Classification
    if ensemble >= 0.75:
        prediction_label = "CRITICAL"
    elif ensemble >= 0.50:
        prediction_label = "SUSPICIOUS"
    else:
        prediction_label = "LEGITIMATE"

    # 7. Explainability
    raw_factors = clf.explain(x_vec, top_k=4)
    top_factors = [RiskFactor(**f) for f in raw_factors]

    return PredictionResponse(
        success=True,
        transaction_id=req.transaction_id,
        model_version=settings.APP_VERSION,
        feature_version=settings.FEATURE_VERSION,
        fraud_probability=round(fraud_prob, 4),
        anomaly_score=round(anomaly_score, 4),
        neural_score=round(neural_score, 4) if neural_score is not None else None,
        ensemble_score=ensemble,
        prediction=prediction_label,
        top_risk_factors=top_factors,
    )

@router.post("/predict", response_model=PredictionResponse)
def predict_transaction(request: PredictionRequest):
    return _predict_single(request)

@router.post("/batch-predict", response_model=BatchPredictionResponse)
def batch_predict(request: BatchPredictionRequest):
    results = [_predict_single(tx) for tx in request.transactions]
    return BatchPredictionResponse(
        success=True,
        model_version=settings.APP_VERSION,
        count=len(results),
        predictions=results,
    )
