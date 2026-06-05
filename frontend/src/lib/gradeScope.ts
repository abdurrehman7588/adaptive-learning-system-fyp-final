import type { RecommendedQuiz } from '../api/recommendations';
import type { Quiz } from '../types';

const GRADE_ENUMS = [
    'pre_k',
    'kindergarten',
    'grade_1',
    'grade_2',
    'grade_3',
    'grade_4',
    'grade_5',
    'grade_6',
] as const;

export type GradeLevelEnum = (typeof GRADE_ENUMS)[number];

const DISPLAY_TO_ENUM: Record<string, GradeLevelEnum> = {
    'pre-k': 'pre_k',
    'pre k': 'pre_k',
    prek: 'pre_k',
    pre_k: 'pre_k',
    kindergarten: 'kindergarten',
    k: 'kindergarten',
    'grade 1': 'grade_1',
    grade_1: 'grade_1',
    'grade 2': 'grade_2',
    grade_2: 'grade_2',
    'grade 3': 'grade_3',
    grade_3: 'grade_3',
    'grade 4': 'grade_4',
    grade_4: 'grade_4',
    'grade 5': 'grade_5',
    grade_5: 'grade_5',
    'grade 6': 'grade_6',
    grade_6: 'grade_6',
};

export function normalizeGradeEnum(raw?: string | null): GradeLevelEnum | null {
    if (!raw?.trim()) return null;
    const key = raw.trim().toLowerCase();
    if ((GRADE_ENUMS as readonly string[]).includes(key)) {
        return key as GradeLevelEnum;
    }
    return DISPLAY_TO_ENUM[key] ?? null;
}

/**
 * Client-side safety net. Student quiz APIs are already scoped by JWT + DB grade;
 * when grade is unknown, keep the server payload instead of hiding everything.
 */
export function filterQuizzesByGrade(quizzes: Quiz[], grade: GradeLevelEnum | null): Quiz[] {
    if (!grade) return quizzes;
    return quizzes.filter((quiz) => normalizeGradeEnum(quiz.grade) === grade);
}

export function filterRecommendationsByGrade(
    recommendations: RecommendedQuiz[],
    grade: GradeLevelEnum | null,
): RecommendedQuiz[] {
    if (!grade) return recommendations;
    return recommendations.filter(
        (rec) => normalizeGradeEnum(rec.gradeLevel ?? null) === grade,
    );
}
