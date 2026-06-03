import { useCallback, useMemo } from 'react';
import { useActiveLearnerProfile } from './useActiveLearnerProfile';
import {
    filterQuizzesByGrade,
    filterRecommendationsByGrade,
    normalizeGradeEnum,
    type GradeLevelEnum,
} from '../lib/gradeScope';
import type { RecommendedQuiz } from '../api/recommendations';
import type { Quiz } from '../types';

export function useStudentGradeScope() {
    const { profile, loading } = useActiveLearnerProfile();

    const gradeEnum = useMemo(
        () =>
            normalizeGradeEnum(profile?.grade_level_enum ?? profile?.grade_level ?? null),
        [profile?.grade_level, profile?.grade_level_enum],
    );

    const gradeLabel = profile?.grade_level ?? null;

    const scopeQuizzes = useCallback(
        (quizzes: Quiz[]) => filterQuizzesByGrade(quizzes, gradeEnum),
        [gradeEnum],
    );

    const scopeRecommendations = useCallback(
        (recommendations: RecommendedQuiz[]) =>
            filterRecommendationsByGrade(recommendations, gradeEnum),
        [gradeEnum],
    );

    return {
        gradeEnum: gradeEnum as GradeLevelEnum | null,
        gradeLabel,
        loading,
        scopeQuizzes,
        scopeRecommendations,
    };
}
