from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    transaction_id: Optional[str] = Field(default=None, description="Unique transaction identifier or reference")
    features: Optional[Dict[str, float]] = Field(default=None, description="Direct pre-extracted 20-feature dictionary")
    raw_transaction: Optional[Dict[str, Any]] = Field(default=None, description="Raw transaction payload for automatic feature extraction")

class RiskFactor(BaseModel):
    feature: str
    value: float
    impact: float
    description: str

class PredictionResponse(BaseModel):
    success: bool = True
    transaction_id: Optional[str] = None
    model_version: str
    feature_version: str
    fraud_probability: float
    anomaly_score: float
    neural_score: Optional[float] = None
    ensemble_score: float
    prediction: str  # "LEGITIMATE", "SUSPICIOUS", "CRITICAL"
    top_risk_factors: List[RiskFactor] = []

class BatchPredictionRequest(BaseModel):
    transactions: List[PredictionRequest]

class BatchPredictionResponse(BaseModel):
    success: bool = True
    model_version: str
    count: int
    predictions: List[PredictionResponse]

class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    feature_version: str
    framework: str
    classifier_trained: bool
    anomaly_detector_trained: bool
    neural_model_trained: bool
    metrics: Dict[str, Any] = {}
