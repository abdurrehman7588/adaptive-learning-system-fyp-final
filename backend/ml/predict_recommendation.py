"""
Load trained Random Forest artifacts and predict recommendation level.

Usage (stdin JSON):
  echo '{"average_score":55,"quiz_attempts":5,"completion_rate":80,"emotional_score":62}' | python predict_recommendation.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np

ML_DIR = Path(__file__).resolve().parent
REPO_ROOT = ML_DIR.parent.parent

FEATURE_COLUMNS = [
    "average_score",
    "quiz_attempts",
    "completion_rate",
    "emotional_score",
]


def resolve_artifact(name: str) -> Path:
    candidates = [
        ML_DIR / name,
        REPO_ROOT / name,
    ]
    for path in candidates:
        if path.is_file():
            return path
    raise FileNotFoundError(f"Missing artifact: {name}")


def load_artifacts():
    model = joblib.load(resolve_artifact("model.pkl"))
    encoder = joblib.load(resolve_artifact("label_encoder.pkl"))
    return model, encoder


def predict(features: dict) -> dict:
    model, encoder = load_artifacts()
    row = [[float(features[col]) for col in FEATURE_COLUMNS]]
    probabilities = model.predict_proba(row)[0]
    pred_index = int(np.argmax(probabilities))
    label = encoder.inverse_transform([pred_index])[0]
    confidence = round(float(probabilities[pred_index]), 4)
    return {
        "recommendation": str(label),
        "confidence": confidence,
    }


def main() -> int:
    payload = json.load(sys.stdin)
    result = predict(payload)
    json.dump(result, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
