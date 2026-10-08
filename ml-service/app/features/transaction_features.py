"""
Transaction-Level Feature Extractor (Grounded on PaySim Mobile Money Patterns).
Strictly leakage-safe: excludes all post-authorization balance fields (newbalanceOrig, newbalanceDest).
Extracts real-time signals available at authorization millisecond.
"""

from typing import Dict, Any

TRANSACTION_TYPE_MAP = {
    "send_money": 0,
    "cash_out": 1,
    "merchant_payment": 2,
    "airtime": 3,
    "bank_transfer": 4,
    "wallet transfer": 0,
    "p2p": 0,
    "otc": 1,
    "payment": 2,
    "transfer": 0,
    "debit": 3,
    "cash_in": 4,
}

CHANNEL_MAP = {
    "app": 0,
    "ussd": 1,
    "qr": 2,
    "agent_pos": 3,
}

def extract_transaction_features(raw: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts transaction-level baseline features without simulator balance leakage.
    """
    amount = float(raw.get("amount", 0.0))
    hour = int(raw.get("hour", raw.get("timestamp_hour", 14)))
    day_of_week = int(raw.get("day_of_week", 2))

    raw_type = str(raw.get("transaction_type", raw.get("type", "send_money"))).lower()
    t_type = float(TRANSACTION_TYPE_MAP.get(raw_type, 0))

    raw_channel = str(raw.get("channel", "app")).lower()
    channel = float(CHANNEL_MAP.get(raw_channel, 0))

    return {
        "amount": amount,
        "hour": float(hour),
        "day_of_week": float(day_of_week),
        "transaction_type": t_type,
        "channel": channel,
    }
