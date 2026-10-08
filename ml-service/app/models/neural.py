from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from app.config.settings import settings

class SentinelMLP(nn.Module):
    """Lightweight 3-layer MLP for neural transaction representation & scoring."""

    def __init__(self, input_dim: int = 20, hidden_dim: int = 64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)

class NeuralFraudModel:
    """Wrapper for PyTorch MLP model inference & serialization."""

    def __init__(self, model: SentinelMLP = None, input_dim: int = 20):
        self.model = model or SentinelMLP(input_dim=input_dim)
        self.model.eval()
        self.is_trained = model is not None

    def fit(self, X: np.ndarray, y: np.ndarray, epochs: int = 20, batch_size: int = 64):
        self.model.train()
        criterion = nn.BCELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.003, weight_decay=1e-4)

        X_t = torch.tensor(X, dtype=torch.float32)
        y_t = torch.tensor(y, dtype=torch.float32).unsqueeze(1)

        dataset = torch.utils.data.TensorDataset(X_t, y_t)
        loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

        for epoch in range(epochs):
            for batch_x, batch_y in loader:
                optimizer.zero_grad()
                preds = self.model(batch_x)
                loss = criterion(preds, batch_y)
                loss.backward()
                optimizer.step()

        self.model.eval()
        self.is_trained = True

    def predict_score(self, X: np.ndarray) -> float:
        self.model.eval()
        if X.ndim == 1:
            X = X.reshape(1, -1)
        with torch.no_grad():
            X_t = torch.tensor(X, dtype=torch.float32)
            score = self.model(X_t).item()
        return float(np.clip(score, 0.01, 0.99))

    def save(self, filepath: Path = settings.NEURAL_PATH):
        filepath.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.model.state_dict(), filepath)

    @classmethod
    def load(cls, filepath: Path = settings.NEURAL_PATH, input_dim: int = 20) -> "NeuralFraudModel":
        if not filepath.exists():
            raise FileNotFoundError(f"Neural model artifact not found at {filepath}")
        model = SentinelMLP(input_dim=input_dim)
        model.load_state_dict(torch.load(filepath, map_location="cpu"))
        model.eval()
        instance = cls(model=model, input_dim=input_dim)
        instance.is_trained = True
        return instance
