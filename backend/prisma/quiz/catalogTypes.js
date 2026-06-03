/**
 * @typedef {import('@prisma/client').GradeLevel} GradeLevel
 * @typedef {import('@prisma/client').DifficultyLevel} DifficultyLevel
 * @typedef {import('@prisma/client').LearningCategory} LearningCategory
 */

/**
 * @typedef {{
 *   text: string,
 *   options: string[],
 *   correctIndex: number,
 *   topic?: string,
 *   difficultyLevel?: DifficultyLevel,
 *   skillArea?: LearningCategory,
 *   estimatedTimeSeconds?: number,
 * }} CatalogQuestionSpec
 */

/**
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   description: string,
 *   category: LearningCategory,
 *   gradeLevel: GradeLevel,
 *   difficultyLevel: DifficultyLevel,
 *   timeLimitMinutes?: number,
 *   passPercentage?: number,
 *   isPublished?: boolean,
 *   subject?: string | null,
 *   questions: CatalogQuestionSpec[],
 * }} QuizCatalogEntry
 */

export {};
