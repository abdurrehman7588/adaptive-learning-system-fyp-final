import type { RecommendedQuiz } from '../api/recommendations';
import type { Quiz } from '../types';
import {
    getCategoryDef,
    LEARNING_CATEGORIES,
    normalizeLearningCategory,
    type LearningCategoryId,
} from './learningCategories';

export type CategoryCatalogEntry = {
    categoryId: LearningCategoryId;
    label: string;
    description: string;
    emoji: string;
    quiz: Quiz | null;
    isRecommended: boolean;
    recommendationReason?: string;
};

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

function pickQuizForCategory(quizzes: Quiz[], categoryId: LearningCategoryId): Quiz | null {
    const matches = quizzes.filter((q) => q.category === categoryId);
    return matches[0] ?? null;
}

/**
 * Six learning-path cards (one per category). Tier-pilot grades surface the
 * adaptive recommendation quiz per category, not every easy/medium/hard variant.
 */
export function buildCategoryCatalog(
    quizzes: Quiz[],
    recommendations: RecommendedQuiz[],
): CategoryCatalogEntry[] {
    const recByQuizId = new Map(recommendations.map((r) => [String(r.quizId), r]));
    const pickForYouIds = new Set(
        [...recommendations]
            .sort(
                (a, b) =>
                    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
                    a.attemptCount - b.attemptCount,
            )
            .filter((r) => r.priority === 'high' || r.matchType === 'weak_subject')
            .map((r) => String(r.quizId)),
    );

    return LEARNING_CATEGORIES.map((def) => {
        const categoryQuizzes = quizzes.filter((q) => q.category === def.id);
        let quiz = pickQuizForCategory(quizzes, def.id);

        const recInCategory = categoryQuizzes
            .map((q) => recByQuizId.get(q.id))
            .filter((r): r is RecommendedQuiz => Boolean(r))
            .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])[0];

        if (recInCategory) {
            quiz =
                categoryQuizzes.find((q) => q.id === String(recInCategory.quizId)) ?? quiz;
        }

        const isRecommended = Boolean(quiz && pickForYouIds.has(quiz.id));

        return {
            categoryId: def.id,
            label: def.label,
            description: def.description,
            emoji: def.emoji,
            quiz,
            isRecommended,
            recommendationReason: recInCategory?.reason,
        };
    });
}

export function attachCategoryToQuiz(quiz: Quiz, rawCategory?: string | null): Quiz {
    const category = normalizeLearningCategory(rawCategory);
    if (!category) return quiz;
    const def = getCategoryDef(category);
    return {
        ...quiz,
        category,
        categoryLabel: def.label,
    };
}
