"""
Inference Predictor Module for upay Sentinel.
Executes the multi-model prediction pipeline:
- Model 1: Scikit-learn HistGradientBoostingClassifier (Supervised Fraud Probability)
- Model 2: Scikit-learn Isolation Forest (Behavioral Anomaly Score)
- Model 3: AMLSim Network Graph Rule-Weighting (Mule / Syndicate Network Risk)
- Model 4: PyTorch MLP (Tabular Deep Learning Score, optional)
- Risk Fusion: Blended Multi-Model Score (5 - 99 scale)
"""

from typing import Dict, Any, List, Optional
import numpy as np
from app.config.settings import settings
from app.features.pipeline import FeaturePipeline
from app.models.classifier import FraudClassifier
from app.models.anomaly import AnomalyDetector
from app.models.neural import NeuralFraudModel

class SentinelPredictor:
    """Production predictor instance managing loaded ML model artifacts."""

    def __init__(
        self,
        classifier: Optional[FraudClassifier] = None,
        anomaly_detector: Optional[AnomalyDetector] = None,
        neural_model: Optional[NeuralFraudModel] = None,
    ):
        self.classifier = classifier
        self.anomaly_detector = anomaly_detector
        self.neural_model = neural_model

    @classmethod
    def load_from_artifacts(cls) -> "SentinelPredictor":
        """Factory method to load all available artifacts from disk."""
        clf = None
        if settings.CLASSIFIER_PATH.exists():
            clf = FraudClassifier.load(settings.CLASSIFIER_PATH)

        anomaly_det = None
        if settings.ANOMALY_PATH.exists():
            anomaly_det = AnomalyDetector.load(settings.ANOMALY_PATH)

        neural_mod = None
        if settings.NEURAL_PATH.exists():
            try:
                neural_mod = NeuralFraudModel.load(settings.NEURAL_PATH)
            except Exception as e:
                print(f"[Predictor] Note: Neural model not loaded: {e}")

        return cls(classifier=clf, anomaly_detector=anomaly_det, neural_model=neural_mod)

    def predict_transaction(
        self,
        raw_transaction: Dict[str, Any],
        customer_baseline: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end inference on a single transaction payload.
        """
        # 1. Real-time Feature Extraction (Leakage-Safe)
        feat_dict = FeaturePipeline.extract_from_raw(raw_transaction, customer_baseline=customer_baseline)
        x_vec = FeaturePipeline.to_vector(feat_dict)

        # 2. Model 1: Supervised Fraud Probability
        fraud_prob = 0.50
        if self.classifier:
            fraud_prob = float(self.classifier.predict_fraud_score(x_vec))

        # 3. Model 2: Behavioral Anomaly Score (Isolation Forest)
        anomaly_score = 0.15
        if self.anomaly_detector:
            anomaly_score = float(self.anomaly_detector.predict_anomaly_score(x_vec))

        # 4. Model 3: Network / Mule Graph Risk
        mule_link = feat_dict.get("mule_cluster_link", 0.0)
        micro_struct = feat_dict.get("micro_structuring_indicator", 0.0)
        high_val = feat_dict.get("high_value_indicator", 0.0)
        network_risk = float(np.clip(0.65 * mule_link + 0.20 * micro_struct + 0.15 * high_val, 0.0, 1.0))

        # 5. Model 4: Neural Tabular Model (Optional)
        neural_score = None
        if self.neural_model:
            neural_score = float(self.neural_model.predict_score(x_vec))

        # 6. Unified Multi-Model Risk Fusion
        if neural_score is not None:
            ensemble_score = (
                0.45 * fraud_prob +
                0.25 * anomaly_score +
                0.15 * network_risk +
                0.15 * neural_score
            )
        else:
            ensemble_score = (
                0.55 * fraud_prob +
                0.25 * anomaly_score +
                0.20 * network_risk
            )

        ensemble_score = float(np.clip(ensemble_score, 0.05, 0.99))

        # 7. Classification Tier
        if ensemble_score >= 0.75:
            decision = "CRITICAL"
        elif ensemble_score >= 0.50:
            decision = "SUSPICIOUS"
        else:
            decision = "LEGITIMATE"

        # 8. Explainability: Top Feature Contributions
        top_factors = []
        if self.classifier:
            top_factors = self.classifier.explain(x_vec, top_k=4)

        return {
            "fraud_probability": round(fraud_prob, 4),
            "anomaly_score": round(anomaly_score, 4),
            "network_risk": round(network_risk, 4),
            "neural_score": round(neural_score, 4) if neural_score is not None else None,
            "ensemble_score": round(ensemble_score, 4),
            "prediction": decision,
            "top_risk_factors": top_factors,
            "features_extracted": feat_dict,
        }
