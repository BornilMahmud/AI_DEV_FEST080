"""
Supervised Fraud Classifier Training Entrypoint.
Delegates to train_fraud.py using the unified multi-tier dataset.
"""

from app.training.train_fraud import train_and_save_fraud_model

def train_and_save_classifier():
    return train_and_save_fraud_model()

if __name__ == "__main__":
    train_and_save_classifier()
