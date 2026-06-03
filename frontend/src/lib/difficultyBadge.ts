export type QuizDifficultyLevel = 'easy' | 'medium' | 'hard';

const DIFFICULTY_ORDER: QuizDifficultyLevel[] = ['easy', 'medium', 'hard'];

/** Badge label (styled uppercase in UI → EASY / MEDIUM / HARD). */
export function difficultyBadgeLabel(
    level: string | null | undefined,
): string | null {
    if (!level) return null;
    const normalized = level.toLowerCase();
    if (normalized === 'easy' || normalized === 'medium' || normalized === 'hard') {
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
    return null;
}

export function difficultySortIndex(level: string | null | undefined): number {
    const idx = DIFFICULTY_ORDER.indexOf((level ?? 'medium') as QuizDifficultyLevel);
    return idx >= 0 ? idx : DIFFICULTY_ORDER.length;
}
