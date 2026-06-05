import { useCallback, useMemo } from 'react';
import { useActiveLearnerProfile } from './useActiveLearnerProfile';
import {
    filterQuizzesByGrade,
    filterRecommendationsByGrade,
    normalizeGradeEnum,
    type GradeLevelEnum,
} from '../lib/gradeScope';
import { getAuthRoleFromToken } from '../lib/jwtSession';
import { getStoredAuthUser } from '../lib/tokenStorage';
import type { RecommendedQuiz } from '../api/recommendations';
import type { Quiz, Student, User } from '../types';

function gradeEnumFromAuthUser(): GradeLevelEnum | null {
    const user = getStoredAuthUser<User>();
    if (!user || user.role !== 'student') return null;
    const student = user as Student;
    return normalizeGradeEnum(student.grade ?? null);
}

export function useStudentGradeScope() {
    const { profile, loading } = useActiveLearnerProfile();

    const gradeEnum = useMemo(() => {
        const fromProfile = normalizeGradeEnum(
            profile?.grade_level_enum ?? profile?.grade_level ?? null,
        );
        return fromProfile ?? gradeEnumFromAuthUser();
    }, [profile?.grade_level, profile?.grade_level_enum]);

    const gradeLabel = profile?.grade_level ?? null;

    // Student quiz/recommendation APIs are already scoped by JWT + DB grade.
    // Re-filtering here caused empty "learning paths" when profile grade lagged or drifted.
    const isStudentSession = getAuthRoleFromToken() === 'student';

    const scopeQuizzes = useCallback(
        (quizzes: Quiz[]) =>
            isStudentSession ? quizzes : filterQuizzesByGrade(quizzes, gradeEnum),
        [gradeEnum, isStudentSession],
    );

    const scopeRecommendations = useCallback(
        (recommendations: RecommendedQuiz[]) =>
            isStudentSession
                ? recommendations
                : filterRecommendationsByGrade(recommendations, gradeEnum),
        [gradeEnum, isStudentSession],
    );

    return {
        gradeEnum: gradeEnum as GradeLevelEnum | null,
        gradeLabel,
        loading,
        scopeQuizzes,
        scopeRecommendations,
    };
}
