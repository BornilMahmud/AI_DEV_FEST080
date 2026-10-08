"""
Network Graph & AML Typology Feature Extractor (IBM AMLSim Grounded).
Identifies network-level money laundering and mule ring patterns:
- Mule Cluster 17 linkage & known syndicates
- High-value transaction threshold alerts (>= 50,000 BDT)
- Smurfing / micro-structuring under Bangladesh Bank scrutiny caps (24,000 - 24,999 BDT)
- Rapid liquidity drain typologies
"""

from typing import Dict, Any

MULE_CLUSTER_17_NODES = {"U-8831", "ACCT-MULE-17", "MULE-8831"}

def extract_network_features(raw: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts graph and money-laundering typology indicators.
    """
    amount = float(raw.get("amount", 0.0))
    hour = int(raw.get("hour", raw.get("timestamp_hour", 14)))
    raw_type = str(raw.get("transaction_type", raw.get("type", "send_money"))).lower()
    recipient = str(raw.get("recipient", raw.get("receiver_name", raw.get("recipient_id", raw.get("dest_account", "")))))

    # Mule Cluster 17 Syndicate Flag
    is_mule = 1.0 if (
        recipient in MULE_CLUSTER_17_NODES or
        "MULE" in recipient.upper() or
        raw.get("mule_cluster_link") or
        raw.get("is_mule_cluster")
    ) else 0.0

    # High-Value Bangladesh Bank Alert
    high_val = 1.0 if amount >= 50000.0 else 0.0

    # Micro-structuring (smurfing below 25,000 BDT reporting limit)
    is_structuring = 1.0 if (
        (24000.0 <= amount < 25000.0) or
        raw.get("is_micro_structuring") or
        raw.get("pattern_type") == "Smurfing_Structuring"
    ) else 0.0

    # Rapid drain indicator
    is_night = (hour < 6 or hour >= 23)
    rapid_drain = 1.0 if (
        raw.get("rapid_drain_indicator") or
        (raw_type in ["cash_out", "transfer"] and amount > 30000.0 and is_night) or
        raw.get("pattern_type") in ["Mule_Layering", "Cycle_Hawala"]
    ) else 0.0

    return {
        "mule_cluster_link": is_mule,
        "high_value_indicator": high_val,
        "micro_structuring_indicator": is_structuring,
        "rapid_drain_indicator": rapid_drain,
    }
