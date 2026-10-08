import joblib
from pathlib import Path
import numpy as np
from sklearn.ensemble import IsolationForest
from app.config.settings import settings

class AnomalyDetector:
    """Unsupervised IsolationForest anomaly detector for novel fraud behaviors."""

    def __init__(self, model: IsolationForest = None):
        self.model = model or IsolationForest(
            n_estimators=100,
            contamination=0.08,
            max_samples="auto",
            random_state=42,
            n_jobs=-1,
        )
        self.is_trained = model is not None

    def fit(self, X: np.ndarray):
        self.model.fit(X)
        self.is_trained = True

    def score_anomaly(self, X: np.ndarray) -> np.ndarray:
        """
        Compute normalized anomaly score between 0.0 (normal) and 1.0 (highly anomalous).
        IsolationForest decision_function returns negative values for anomalies.
        """
        if not self.is_trained:
            raise RuntimeError("AnomalyDetector is not trained yet.")
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        # decision_function: lower means more anomalous (typically in range [-0.5, 0.5])
        raw_scores = self.model.decision_function(X)
        # Normalize into [0, 1] range: 0 -> normal, 1 -> maximum anomaly
        # sigmoid-like normalization: 1 / (1 + exp(10 * raw_score))
        normalized = 1.0 / (1.0 + np.exp(6.0 * raw_scores))
        return np.clip(normalized, 0.05, 0.99)

    def predict_anomaly_score(self, X: np.ndarray) -> float:
        scores = self.score_anomaly(X)
        return float(scores[0])

    def save(self, filepath: Path = settings.ANOMALY_PATH):
        filepath.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, filepath)

    @classmethod
    def load(cls, filepath: Path = settings.ANOMALY_PATH) -> "AnomalyDetector":
        if not filepath.exists():
            raise FileNotFoundError(f"Anomaly detector artifact not found at {filepath}")
        model = joblib.load(filepath)
        instance = cls(model=model)
        instance.is_trained = True
        return instance
