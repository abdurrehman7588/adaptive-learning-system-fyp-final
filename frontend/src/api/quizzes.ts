import { isAxiosError } from 'axios';
import { attachCategoryToQuiz } from '../lib/catalogGrouping';
import { normalizeLearningCategory } from '../lib/learningCategories';
import type { Question, Quiz, QuizDifficultyLevel, QuizType } from '../types';
import { apiClient } from './client';

type BackendOption = {
    id?: number | string;
    option_text?: string;
    order_index?: number;
    is_correct?: boolean;
};

type BackendQuestion = {
    id?: number | string;
    question_text?: string;
    text?: string;
    question?: string;
    options?: BackendOption[] | string[];
    correct_index?: number;
    correctIndex?: number;
};

type BackendQuiz = {
    id?: number | string;
    title?: string;
    name?: string;
    description?: string;
    subject?: string;
    category?: string;
    category_label?: string;
    difficulty_level?: string;
    difficulty_label?: string;
    grade_level?: string;
    grade_level_label?: string;
    time_limit_minutes?: number;
    durationMinutes?: number;
    type?: string;
    quizType?: string;
    questions?: BackendQuestion[];
    questionCount?: number;
};

type QuizDetailResponse = {
    quiz: BackendQuiz;
    questions: BackendQuestion[];
};

function subjectToQuizType(subject?: string | null): QuizType {
    if (!subject) return 'cognitive';
    const lower = subject.toLowerCase();
    if (lower.includes('iq') || lower.includes('logic') || lower.includes('reasoning')) {
        return 'iq';
    }
    if (
        lower.includes('gk') ||
        lower.includes('general') ||
        lower.includes('science') ||
        lower.includes('social') ||
        lower.includes('world')
    ) {
        return 'gk';
    }
    if (lower.includes('math') || lower.includes('cognitive') || lower.includes('pattern')) {
        return 'cognitive';
    }
    return 'cognitive';
}

function mapBackendOptions(
    options: BackendQuestion['options'],
    includeCorrect: boolean,
): Pick<Question, 'options' | 'optionIds' | 'correctIndex'> {
    if (!Array.isArray(options) || options.length === 0) {
        return { options: [], optionIds: [], correctIndex: 0 };
    }

    if (typeof options[0] === 'string') {
        return {
            options: options as string[],
            optionIds: [],
            correctIndex: 0,
        };
    }

    const sorted = [...(options as BackendOption[])].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );

    const optionTexts = sorted.map((option) => option.option_text ?? '');
    const optionIds = sorted
        .map((option) => option.id)
        .filter((id): id is number | string => id !== undefined)
        .map((id) => Number(id));

    let correctIndex = 0;
    if (includeCorrect) {
        const found = sorted.findIndex((option) => option.is_correct);
        if (found >= 0) correctIndex = found;
    }

    return { options: optionTexts, optionIds, correctIndex };
}

function mapBackendQuestion(raw: BackendQuestion, index: number, includeCorrect: boolean): Question {
    const id = raw.id !== undefined ? String(raw.id) : `q-${index}`;
    const text = raw.question_text ?? raw.text ?? raw.question ?? `Question ${index + 1}`;
    const mappedOptions = mapBackendOptions(raw.options, includeCorrect);

    return {
        id,
        text,
        options: mappedOptions.options,
        optionIds: mappedOptions.optionIds,
        correctIndex: raw.correctIndex ?? raw.correct_index ?? mappedOptions.correctIndex,
    };
}

function normalizeDifficultyLevel(
    raw?: string | null,
): QuizDifficultyLevel | undefined {
    const level = raw?.toLowerCase();
    if (level === 'easy' || level === 'medium' || level === 'hard') {
        return level;
    }
    return undefined;
}

function mapBackendQuiz(raw: BackendQuiz, questions: Question[] = []): Quiz {
    const id = raw.id !== undefined ? String(raw.id) : '';
    if (!id) {
        throw new Error('Quiz response did not include an id.');
    }

    const base: Quiz = {
        id,
        type: subjectToQuizType(
            raw.category ?? raw.type ?? raw.quizType ?? raw.subject,
        ),
        title: raw.title ?? raw.name ?? 'Untitled Quiz',
        description: raw.description,
        grade: raw.grade_level,
        gradeLabel: raw.grade_level_label,
        difficultyLevel: normalizeDifficultyLevel(raw.difficulty_level),
        difficultyLabel: raw.difficulty_label,
        questions,
        questionCount: raw.questionCount ?? questions.length,
        durationMinutes: raw.time_limit_minutes ?? raw.durationMinutes,
    };

    return attachCategoryToQuiz(
        base,
        raw.category ?? normalizeCategoryFromSubject(raw.subject),
    );
}

function normalizeCategoryFromSubject(subject?: string | null): string | null {
    if (!subject) return null;
    const lower = subject.toLowerCase();
    if (lower.includes('pattern')) return 'pattern_recognition';
    if (lower.includes('memory')) return 'memory';
    if (lower.includes('science') || lower.includes('world')) return 'science';
    if (lower.includes('logic') || lower.includes('reason')) return 'critical_thinking';
    if (lower.includes('problem')) return 'problem_solving';
    if (lower.includes('math') || lower.includes('cognitive')) return 'math';
    return normalizeLearningCategory(subject);
}

function extractQuizzesPayload(data: unknown): BackendQuiz[] {
    if (Array.isArray(data)) {
        return data as BackendQuiz[];
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    if (Array.isArray(record.quizzes)) {
        return record.quizzes as BackendQuiz[];
    }

    if (Array.isArray(record.data)) {
        return record.data as BackendQuiz[];
    }

    const nested = record.data;
    if (nested && typeof nested === 'object') {
        const nestedRecord = nested as Record<string, unknown>;
        if (Array.isArray(nestedRecord.quizzes)) {
            return nestedRecord.quizzes as BackendQuiz[];
        }
    }

    return [];
}

export async function fetchQuizzes(): Promise<Quiz[]> {
    const { data } = await apiClient.get<unknown>('/quizzes', {
        params: { _: Date.now() },
    });
    return extractQuizzesPayload(data).map((quiz) => mapBackendQuiz(quiz));
}

export async function fetchQuizById(quizId: string): Promise<Quiz> {
    const { data } = await apiClient.get<QuizDetailResponse>(`/quizzes/${quizId}`);
    const questions = (data.questions ?? []).map((question, index) =>
        mapBackendQuestion(question, index, false),
    );
    return mapBackendQuiz(data.quiz, questions);
}

export function getQuizzesErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
            if (typeof record.error === 'string') return record.error;
        }
        if (error.response?.status === 401) {
            return 'Please sign in with a parent account (/parent/login) to load quizzes.';
        }
        if (error.message) return error.message;
    }
    if (error instanceof Error) return error.message;
    return 'Could not load quizzes. Please try again.';
}
