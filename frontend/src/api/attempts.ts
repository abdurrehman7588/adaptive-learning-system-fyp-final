import { isAxiosError } from 'axios';
import { apiClient } from './client';
import type { Question } from '../types';

type BackendOption = {
    id: number;
    option_text: string;
    order_index?: number;
};

type BackendQuestion = {
    id: number;
    question_text: string;
    options: BackendOption[];
};

type StartAttemptResponse = {
    attempt: { id: number; quiz_id: number; child_id: number; status: string };
    questions: BackendQuestion[];
};

export type SubmittedAnswerRow = {
    question_id: number;
    selected_option_id: number | null;
    is_correct: boolean;
};

type SubmitAttemptResponse = {
    attempt: {
        id: number;
        score: number;
        total_points: number;
        percentage?: number | string;
        answers?: SubmittedAnswerRow[];
    };
};

export type QuizAttemptAnswer = {
    question_id: number;
    selected_option_id: number;
    time_taken_seconds?: number;
};

function mapAttemptQuestions(questions: BackendQuestion[]): Question[] {
    return questions.map((question, index) => {
        const sorted = [...(question.options ?? [])].sort(
            (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
        );

        const optionIds = sorted.map((option) => Number(option.id));
        if (optionIds.length !== sorted.length || optionIds.some((id) => !Number.isFinite(id) || id <= 0)) {
            throw new Error(
                `Question ${index + 1} is missing answer options on the server. Re-seed quizzes or contact support.`,
            );
        }

        return {
            id: String(question.id),
            text: question.question_text,
            options: sorted.map((option) => option.option_text),
            optionIds,
            correctIndex: 0,
        };
    });
}

export async function startQuizAttempt(
    quizId: string,
    childId: number,
): Promise<{ attemptId: number; questions: Question[] }> {
    const { data } = await apiClient.post<StartAttemptResponse>(`/quizzes/${quizId}/attempts`, {
        child_id: childId,
    });

    return {
        attemptId: data.attempt.id,
        questions: mapAttemptQuestions(data.questions),
    };
}

export async function submitQuizAttempt(
    attemptId: number,
    answers: QuizAttemptAnswer[],
): Promise<SubmitAttemptResponse['attempt']> {
    const { data } = await apiClient.post<SubmitAttemptResponse>(
        `/attempts/${attemptId}/submit`,
        { answers },
    );
    return data.attempt;
}

/** Maps server-graded rows to question ids for the result review UI. */
export function mapGradedAnswersByQuestionId(
    rows: SubmittedAnswerRow[] | undefined,
): Record<string, SubmittedAnswerRow> {
    if (!rows?.length) return {};
    return rows.reduce<Record<string, SubmittedAnswerRow>>((acc, row) => {
        acc[String(row.question_id)] = row;
        return acc;
    }, {});
}

export function getAttemptErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not save your quiz results.';
}
