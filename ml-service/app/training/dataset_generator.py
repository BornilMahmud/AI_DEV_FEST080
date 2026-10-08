import numpy as np
from pathlib import Path
from app.features.pipeline import FEATURE_NAMES

def generate_mfs_dataset(n_samples: int = 5000, fraud_ratio: float = 0.12, random_seed: int = 42):
    """
    Generate synthetic yet statistically grounded Bangladesh MFS transactions dataset
    reflecting real typologies: legitimate baseline, ATO, mule rings, structuring, SIM swap.
    """
    np.random.seed(random_seed)
    n_fraud = int(n_samples * fraud_ratio)
    n_legit = n_samples - n_fraud

    X = np.zeros((n_samples, len(FEATURE_NAMES)), dtype=np.float32)
    y = np.zeros(n_samples, dtype=np.int32)

    # -------------------------------------------------------------
    # 1. LEGITIMATE TRANSACTIONS (n_legit)
    # Typical: BDT 500 - 4,500, Daytime, trusted hardware, low velocity
    # -------------------------------------------------------------
    for i in range(n_legit):
        amount = float(np.random.exponential(scale=2200) + 150)
        amount = min(amount, 35000.0) # rare high legit
        hour = int(np.random.choice(range(7, 23))) # daytime
        day = int(np.random.randint(0, 7))
        t_type = float(np.random.choice([0, 1, 2, 3], p=[0.45, 0.20, 0.25, 0.10])) # send, cashout, merchant, airtime
        channel = float(np.random.choice([0, 1, 2], p=[0.70, 0.20, 0.10]))
        baseline_ratio = float(np.random.uniform(0.5, 2.0))
        v_10m = float(np.random.poisson(lam=0.1))
        v_1h = float(np.random.poisson(lam=0.4))
        v_24h = float(np.random.poisson(lam=1.5))
        device_known = 1.0 if np.random.rand() > 0.05 else 0.0
        device_change = 1.0 - device_known
        loc_change = 1.0 if np.random.rand() < 0.08 else 0.0
        new_cp = 1.0 if np.random.rand() < 0.20 else 0.0

        X[i] = [
            amount, hour, day, t_type, channel, baseline_ratio,
            v_10m, v_1h, v_24h, device_known, device_change,
            loc_change, new_cp, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        ]
        y[i] = 0

    # -------------------------------------------------------------
    # 2. FRAUD TRANSACTIONS (n_fraud)
    # Typologies:
    # A) ATO (Account Takeover)
    # B) Mule Ring Syndicate
    # C) Structuring / Smurfing
    # D) SIM Swap Nocturnal Drain
    # -------------------------------------------------------------
    for i in range(n_legit, n_samples):
        typology = np.random.choice(["ato", "mule", "structuring", "sim_swap"])
        day = int(np.random.randint(0, 7))

        if typology == "ato":
            amount = float(np.random.uniform(25000, 75000))
            hour = int(np.random.choice([1, 2, 3, 4, 5, 23])) # midnight
            t_type = 1.0 # cashout
            channel = 1.0 # USSD reset
            baseline_ratio = float(np.random.uniform(5.0, 15.0))
            v_10m = 1.0
            v_1h = 2.0
            v_24h = 4.0
            device_known = 0.0
            device_change = 1.0
            loc_change = 1.0
            new_cp = 1.0
            mule = 0.0
            sim_swap = 0.0
            ato = 1.0
            night = 1.0
            high_val = 1.0 if amount >= 50000 else 0.0
            struct = 0.0
            rapid_drain = 1.0

        elif typology == "mule":
            amount = float(np.random.uniform(40000, 49500))
            hour = int(np.random.choice(range(0, 24)))
            t_type = 0.0 # send_money / layering
            channel = 0.0 # App
            baseline_ratio = float(np.random.uniform(3.0, 8.0))
            v_10m = float(np.random.choice([3, 4, 5]))
            v_1h = float(np.random.choice([6, 7, 8]))
            v_24h = float(np.random.choice([10, 12, 15]))
            device_known = 0.0
            device_change = 1.0
            loc_change = float(np.random.choice([0, 1]))
            new_cp = 1.0
            mule = 1.0
            sim_swap = 0.0
            ato = 0.0
            night = 1.0 if (hour < 6 or hour >= 23) else 0.0
            high_val = 1.0 if amount >= 50000 else 0.0
            struct = 0.0
            rapid_drain = 1.0

        elif typology == "structuring":
            amount = float(np.random.uniform(24000, 24900)) # just beneath 25k
            hour = int(np.random.choice(range(10, 22)))
            t_type = 0.0
            channel = 0.0
            baseline_ratio = float(np.random.uniform(4.0, 10.0))
            v_10m = float(np.random.choice([2, 3, 4]))
            v_1h = float(np.random.choice([5, 6, 7]))
            v_24h = float(np.random.choice([8, 10, 12]))
            device_known = 1.0
            device_change = 0.0
            loc_change = 0.0
            new_cp = 1.0
            mule = float(np.random.choice([0, 1]))
            sim_swap = 0.0
            ato = 0.0
            night = 0.0
            high_val = 0.0
            struct = 1.0
            rapid_drain = 0.0

        else: # sim_swap
            amount = float(np.random.uniform(45000, 95000))
            hour = int(np.random.choice([0, 1, 2, 3, 4]))
            t_type = 1.0 # cashout
            channel = 0.0
            baseline_ratio = float(np.random.uniform(6.0, 20.0))
            v_10m = 1.0
            v_1h = 2.0
            v_24h = 3.0
            device_known = 0.0
            device_change = 1.0
            loc_change = 1.0
            new_cp = 1.0
            mule = 0.0
            sim_swap = 1.0
            ato = 1.0
            night = 1.0
            high_val = 1.0 if amount >= 50000 else 0.0
            struct = 0.0
            rapid_drain = 1.0

        X[i] = [
            amount, float(hour), float(day), t_type, channel, baseline_ratio,
            v_10m, v_1h, v_24h, device_known, device_change,
            loc_change, new_cp, mule, sim_swap, ato, night, high_val, struct, rapid_drain
        ]
        y[i] = 1

    # Shuffle dataset
    perm = np.random.permutation(n_samples)
    X = X[perm]
    y = y[perm]

    return X, y
