import joblib
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from app.config.settings import settings
from app.features.pipeline import FEATURE_NAMES

class FraudClassifier:
    """Supervised HistGradientBoosting fraud classifier for MFS transactions."""

    def __init__(self, model: HistGradientBoostingClassifier = None):
        self.model = model or HistGradientBoostingClassifier(
            max_iter=150,
            learning_rate=0.08,
            max_leaf_nodes=31,
            min_samples_leaf=20,
            l2_regularization=1.5,
            random_state=42,
        )
        self.is_trained = model is not None

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.model.fit(X, y)
        self.is_trained = True

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Return fraud probabilities [P(legit), P(fraud)]."""
        if not self.is_trained:
            raise RuntimeError("Classifier is not trained yet.")
        if X.ndim == 1:
            X = X.reshape(1, -1)
        return self.model.predict_proba(X)

    def predict_fraud_score(self, X: np.ndarray) -> float:
        """Return fraud probability for single transaction."""
        probs = self.predict_proba(X)
        return float(probs[0, 1])

    def explain(self, x: np.ndarray, top_k: int = 4) -> List[Dict[str, Any]]:
        """Compute approximate feature contributions for explainability."""
        if x.ndim == 1:
            x = x.reshape(1, -1)
        
        contributions = []
        # Key high-risk risk factors heuristic mapping
        factor_weights = {
            "mule_cluster_link": 0.35,
            "account_takeover_indicator": 0.30,
            "sim_swap_indicator": 0.25,
            "amount_vs_customer_baseline": 0.22,
            "device_change": 0.20,
            "rapid_drain_indicator": 0.20,
            "night_transaction": 0.15,
            "high_value_indicator": 0.15,
            "customer_velocity_10m": 0.18,
            "micro_structuring_indicator": 0.15,
        }

        row = x[0]
        for name, weight in factor_weights.items():
            if name in FEATURE_NAMES:
                idx = FEATURE_NAMES.index(name)
                val = row[idx]
                if val > 0:
                    impact = float(val * weight if name != "amount_vs_customer_baseline" else min(1.0, val / 10.0) * weight)
                    contributions.append({
                        "feature": name,
                        "value": float(val),
                        "impact": round(impact, 3),
                        "description": f"Elevated {name.replace('_', ' ')} detected (value: {round(val, 2)})"
                    })

        contributions.sort(key=lambda c: c["impact"], reverse=True)
        return contributions[:top_k]

    def save(self, filepath: Path = settings.CLASSIFIER_PATH):
        filepath.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, filepath)

    @classmethod
    def load(cls, filepath: Path = settings.CLASSIFIER_PATH) -> "FraudClassifier":
        if not filepath.exists():
            raise FileNotFoundError(f"Model artifact not found at {filepath}")
        model = joblib.load(filepath)
        instance = cls(model=model)
        instance.is_trained = True
        return instance
