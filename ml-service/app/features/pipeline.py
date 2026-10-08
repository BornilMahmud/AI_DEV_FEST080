import json
from typing import Dict, Any, List, Tuple
import numpy as np
from app.config.settings import settings
from app.features.transaction_features import extract_transaction_features, TRANSACTION_TYPE_MAP, CHANNEL_MAP
from app.features.behavioral_features import extract_behavioral_features
from app.features.network_features import extract_network_features

FEATURE_NAMES = [
    "amount",
    "hour",
    "day_of_week",
    "transaction_type",
    "channel",
    "amount_vs_customer_baseline",
    "customer_velocity_10m",
    "customer_velocity_1h",
    "customer_velocity_24h",
    "device_known",
    "device_change",
    "location_change",
    "new_counterparty",
    "mule_cluster_link",
    "sim_swap_indicator",
    "account_takeover_indicator",
    "night_transaction",
    "high_value_indicator",
    "micro_structuring_indicator",
    "rapid_drain_indicator",
]

class FeaturePipeline:
    """
    Authoritative Feature Engineering & Extraction Pipeline for Bangladesh MFS Fraud Detection.
    Combines:
    - Transaction features (PaySim mobile money distributions, leakage-safe)
    - Behavioral deviation features (Sentinel MFS customer 30-day baseline)
    - Network / AML graph features (IBM AMLSim typology indicators)
    """
    
    version: str = settings.FEATURE_VERSION
    feature_names: List[str] = FEATURE_NAMES

    @classmethod
    def extract_from_raw(cls, raw: Dict[str, Any], customer_baseline: Dict[str, Any] = None) -> Dict[str, float]:
        """Extract all 20 engineered features using modular extractors."""
        t_feats = extract_transaction_features(raw)
        b_feats = extract_behavioral_features(raw, customer_baseline)
        n_feats = extract_network_features(raw)

        # Merge into single feature dictionary
        features = {**t_feats, **b_feats, **n_feats}

        # Return strictly ordered dictionary conforming to FEATURE_NAMES
        return {name: float(features.get(name, 0.0)) for name in cls.feature_names}

    @classmethod
    def to_vector(cls, features_dict: Dict[str, float]) -> np.ndarray:
        """Convert features dictionary to ordered numpy array vector."""
        return np.array([features_dict.get(name, 0.0) for name in cls.feature_names], dtype=np.float32)

    @classmethod
    def get_schema(cls) -> Dict[str, Any]:
        """Return schema metadata for client contract validation."""
        return {
            "version": cls.version,
            "features_count": len(cls.feature_names),
            "features": [
                {"name": name, "type": "float", "index": i}
                for i, name in enumerate(cls.feature_names)
            ]
        }

    @classmethod
    def save_schema(cls, filepath=None):
        target = filepath or settings.SCHEMA_PATH
        with open(target, "w") as f:
            json.dump(cls.get_schema(), f, indent=2)
