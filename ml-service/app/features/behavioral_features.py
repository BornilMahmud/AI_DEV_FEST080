"""
Customer Behavioral Profile & Deviation Feature Extractor (Sentinel Synthetic MFS).
Measures deviation from 30-day learned customer habit:
- Usual transaction amounts (median)
- Habitual operating hours
- Primary trusted device
- Geographic primary district
- Trusted counterparty whitelist
- Telecom SIM Swap & ATO flags
"""

from typing import Dict, Any

def extract_behavioral_features(raw: Dict[str, Any], customer_baseline: Dict[str, Any] = None) -> Dict[str, float]:
    """
    Computes behavioral deviation metrics against the customer's 30-day baseline profile.
    """
    amount = float(raw.get("amount", 0.0))
    hour = int(raw.get("hour", raw.get("timestamp_hour", 14)))

    # Fallback to general Bangladesh MFS median if baseline not provided
    if customer_baseline is None:
        customer_baseline = {}

    baseline_median = float(raw.get("customer_median_amount", customer_baseline.get("median_amount", 2200.0)))
    amount_ratio = amount / max(baseline_median, 100.0)

    # Velocity features
    v_10m = float(raw.get("customer_velocity_10m", raw.get("velocity_10m", 0)))
    v_1h = float(raw.get("customer_velocity_1h", raw.get("velocity_1h", 1)))
    v_24h = float(raw.get("customer_velocity_24h", raw.get("velocity_24h", 2)))

    # Device analysis
    is_new_device = 1.0 if (
        raw.get("isNewDevice") or 
        raw.get("device_new") or 
        raw.get("is_new_device") or
        (raw.get("device_id") and customer_baseline.get("primary_device") and raw.get("device_id") != customer_baseline.get("primary_device"))
    ) else 0.0
    device_known = 0.0 if is_new_device > 0 else 1.0
    device_change = is_new_device

    # Geographic location leap
    primary_district = customer_baseline.get("primary_district")
    raw_district = raw.get("district")
    if raw.get("isNewLocation") or raw.get("location_change"):
        location_change = 1.0
    elif primary_district and raw_district and primary_district != raw_district:
        location_change = 1.0
    else:
        location_change = 0.0

    # Counterparty novelty
    usual_counterparties = customer_baseline.get("usual_counterparties", [])
    recipient = str(raw.get("recipient", raw.get("receiver_name", raw.get("recipient_id", ""))))
    if raw.get("beneficiary_new") or raw.get("new_counterparty") or raw.get("is_new_recipient"):
        new_counterparty = 1.0
    elif usual_counterparties and recipient and recipient not in usual_counterparties:
        new_counterparty = 1.0
    else:
        new_counterparty = 0.0

    # Telecom & ATO
    sim_swap = 1.0 if (raw.get("sim_swap_detected") or raw.get("sim_swap_indicator") or raw.get("sim_swap")) else 0.0
    ato = 1.0 if (raw.get("ato_detected") or raw.get("account_takeover_indicator") or raw.get("ato")) else 0.0

    # Nocturnal activity
    habitual_hours = customer_baseline.get("usual_hours", list(range(9, 21)))
    is_night = 1.0 if (hour not in habitual_hours or hour < 6 or hour >= 23 or raw.get("night_transaction")) else 0.0

    return {
        "amount_vs_customer_baseline": amount_ratio,
        "customer_velocity_10m": v_10m,
        "customer_velocity_1h": v_1h,
        "customer_velocity_24h": v_24h,
        "device_known": device_known,
        "device_change": device_change,
        "location_change": location_change,
        "new_counterparty": new_counterparty,
        "sim_swap_indicator": sim_swap,
        "account_takeover_indicator": ato,
        "night_transaction": is_night,
    }
