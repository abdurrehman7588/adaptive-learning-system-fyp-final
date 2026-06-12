"""
Train a RandomForestClassifier on student_dataset.csv.

Run: python train_model.py
"""

from __future__ import annotations

import shutil
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

RANDOM_SEED = 42
ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "student_dataset.csv"
MODEL_PATH = ROOT / "recommendation_model.pkl"
LABEL_ENCODER_PATH = ROOT / "label_encoder.pkl"
BACKEND_ML_DIR = ROOT / "backend" / "ml"

FEATURE_COLUMNS = [
    "average_score",
    "quiz_attempts",
    "completion_rate",
    "emotional_score",
]
TARGET_COLUMN = "recommendation_level"


def print_feature_importances(model: RandomForestClassifier, feature_names: list[str]) -> None:
    importances = model.feature_importances_
    total = float(importances.sum()) or 1.0
    pairs = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)

    print("\nFeature importances:")
    print("-" * 44)
    for name, value in pairs:
        pct = 100.0 * value / total
        print(f"  {name:18s}  {pct:6.2f}%")
    print("-" * 44)

    avg_importance = next(v for n, v in pairs if n == "average_score")
    avg_pct = 100.0 * avg_importance / total
    completion_pct = 100.0 * next(v for n, v in pairs if n == "completion_rate") / total
    emotional_pct = 100.0 * next(v for n, v in pairs if n == "emotional_score") / total

    if avg_pct > 80:
        print(
            "\nWARNING: average_score accounts for >80% of importance — "
            "label generation may still be too score-dominated."
        )
    else:
        print("\nOK: average_score is not dominating feature importance (>80% threshold).")

    if completion_pct < 5 or emotional_pct < 5:
        print(
            "WARNING: completion_rate or emotional_score contributes <5% — "
            "check independent feature generation and label weights."
        )
    else:
        print(
            f"OK: completion_rate ({completion_pct:.2f}%) and "
            f"emotional_score ({emotional_pct:.2f}%) contribute meaningfully."
        )


def sync_backend_artifacts() -> None:
    """Keep backend/ml predict script working (expects model.pkl)."""
    BACKEND_ML_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(MODEL_PATH, ROOT / "model.pkl")
    shutil.copy2(MODEL_PATH, BACKEND_ML_DIR / "model.pkl")
    shutil.copy2(LABEL_ENCODER_PATH, BACKEND_ML_DIR / "label_encoder.pkl")


def main() -> None:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}. Run generate_dataset.py first."
        )

    df = pd.read_csv(DATASET_PATH)
    missing = [c for c in FEATURE_COLUMNS + [TARGET_COLUMN] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    X = df[FEATURE_COLUMNS]
    y_raw = df[TARGET_COLUMN].astype(str)

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=2,
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred, labels=range(len(label_encoder.classes_)))
    class_names = list(label_encoder.classes_)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)
    sync_backend_artifacts()

    print(f"Dataset: {DATASET_PATH.name} ({len(df)} rows)")
    print(f"Train size: {len(X_train)} | Test size: {len(X_test)}")
    print(f"\nAccuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")
    print("\nConfusion matrix (rows = actual, cols = predicted):")
    print(f"{'':>12s}", end="")
    for name in class_names:
        print(f"{name:>10s}", end="")
    print()
    for i, actual_name in enumerate(class_names):
        print(f"{actual_name:>12s}", end="")
        for j in range(len(class_names)):
            print(f"{cm[i, j]:>10d}", end="")
        print()

    print_feature_importances(model, FEATURE_COLUMNS)

    print(f"\nSaved model: {MODEL_PATH}")
    print(f"Saved label encoder: {LABEL_ENCODER_PATH}")
    print(f"Synced copies: {ROOT / 'model.pkl'}, {BACKEND_ML_DIR / 'model.pkl'}")
    print(f"Classes: {class_names}")


if __name__ == "__main__":
    main()
