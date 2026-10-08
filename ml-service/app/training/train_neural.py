import numpy as np
from sklearn.model_selection import train_test_split

from app.config.settings import settings
from app.models.neural import NeuralFraudModel
from app.training.dataset_generator import generate_mfs_dataset

def train_and_save_neural():
    print("[1/2] Generating MFS dataset for PyTorch neural model...")
    X, y = generate_mfs_dataset(n_samples=4000, fraud_ratio=0.12, random_seed=77)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("[2/2] Training PyTorch SentinelMLP...")
    model = NeuralFraudModel(input_dim=X.shape[1])
    model.fit(X_train, y_train, epochs=15, batch_size=64)

    test_score = model.predict_score(X_test[0])
    print(f"Sample test prediction: {test_score:.4f}")

    model.save(settings.NEURAL_PATH)
    print(f"Saved neural model artifact to: {settings.NEURAL_PATH}")

if __name__ == "__main__":
    train_and_save_neural()
