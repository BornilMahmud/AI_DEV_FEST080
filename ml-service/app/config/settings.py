import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "upay Sentinel ML Inference Service"
    APP_VERSION: str = "sentinel-ml-v1.0.0"
    FEATURE_VERSION: str = "features-v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "production"
    
    # Artifact paths
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts"
    CLASSIFIER_PATH: Path = ARTIFACTS_DIR / "fraud_classifier_v1.joblib"
    ANOMALY_PATH: Path = ARTIFACTS_DIR / "anomaly_detector_v1.joblib"
    NEURAL_PATH: Path = ARTIFACTS_DIR / "neural_model_v1.pt"
    SCHEMA_PATH: Path = ARTIFACTS_DIR / "feature_schema_v1.json"
    METADATA_PATH: Path = ARTIFACTS_DIR / "model_metadata_v1.json"
    EVALUATION_PATH: Path = ARTIFACTS_DIR / "evaluation_report.json"
    
    # Thresholds
    FRAUD_THRESHOLD: float = 0.50
    ANOMALY_THRESHOLD: float = 0.65
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
