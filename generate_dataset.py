"""
Generate synthetic student records for recommendation-level modeling.

Output: student_dataset.csv (1000 rows)

Run: python generate_dataset.py
"""

from __future__ import annotations

import csv
import random
from pathlib import Path

RANDOM_SEED = 42
NUM_RECORDS = 1000
OUTPUT_FILE = Path(__file__).resolve().parent / "student_dataset.csv"

# Label weights (must sum to 1.0)
WEIGHT_AVERAGE_SCORE = 0.50
WEIGHT_COMPLETION_RATE = 0.25
WEIGHT_EMOTIONAL_SCORE = 0.15
WEIGHT_QUIZ_ATTEMPTS = 0.10

# Independent feature distributions (not derived from average_score)
COMPLETION_MEAN = 65.0
COMPLETION_STD = 18.0
EMOTIONAL_MEAN = 60.0
EMOTIONAL_STD = 20.0
ATTEMPTS_MEAN = 8.0
ATTEMPTS_STD = 4.0


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def normalize_quiz_attempts(quiz_attempts: int) -> float:
    """Map quiz_attempts in [1, 20] to [0, 100]."""
    return clamp((quiz_attempts - 1) / 19 * 100, 0, 100)


def combined_recommendation_score(
    average_score: float,
    completion_rate: float,
    emotional_score: float,
    quiz_attempts: int,
) -> float:
    norm_attempts = normalize_quiz_attempts(quiz_attempts)
    return (
        WEIGHT_AVERAGE_SCORE * average_score
        + WEIGHT_COMPLETION_RATE * completion_rate
        + WEIGHT_EMOTIONAL_SCORE * emotional_score
        + WEIGHT_QUIZ_ATTEMPTS * norm_attempts
    )


def recommendation_from_combined(combined: float) -> str:
    if combined < 40:
        return "Easy"
    if combined <= 72:
        return "Medium"
    return "Hard"


def generate_record() -> dict[str, int | float | str]:
    band = random.choices(
        ["struggling", "developing", "strong"],
        weights=[0.28, 0.44, 0.28],
        k=1,
    )[0]

    if band == "struggling":
        base = random.gauss(32, 12)
    elif band == "developing":
        base = random.gauss(58, 14)
    else:
        base = random.gauss(82, 10)

    average_score = clamp(base + random.gauss(0, 6), 0, 100)

    # Independently sampled — not derived from average_score
    completion_rate = clamp(random.gauss(COMPLETION_MEAN, COMPLETION_STD), 0, 100)
    emotional_score = clamp(random.gauss(EMOTIONAL_MEAN, EMOTIONAL_STD), 0, 100)
    quiz_attempts = int(clamp(random.gauss(ATTEMPTS_MEAN, ATTEMPTS_STD), 1, 20))

    combined = combined_recommendation_score(
        average_score,
        completion_rate,
        emotional_score,
        quiz_attempts,
    )

    return {
        "average_score": round(average_score, 2),
        "quiz_attempts": quiz_attempts,
        "completion_rate": round(completion_rate, 2),
        "emotional_score": round(emotional_score, 2),
        "recommendation_level": recommendation_from_combined(combined),
    }


def main() -> None:
    random.seed(RANDOM_SEED)

    fieldnames = [
        "average_score",
        "quiz_attempts",
        "completion_rate",
        "emotional_score",
        "recommendation_level",
    ]

    rows = [generate_record() for _ in range(NUM_RECORDS)]

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved {NUM_RECORDS} records to {OUTPUT_FILE}")

    counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    for row in rows:
        counts[str(row["recommendation_level"])] += 1

    print("\nClass distribution (recommendation_level):")
    print("-" * 40)
    for label in ("Easy", "Medium", "Hard"):
        n = counts[label]
        pct = 100.0 * n / NUM_RECORDS
        print(f"  {label:6s}  {n:4d}  ({pct:5.1f}%)")
    print("-" * 40)
    print(f"  Total   {NUM_RECORDS:4d}  (100.0%)")


if __name__ == "__main__":
    main()
