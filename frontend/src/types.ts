export type UserRole = 'parent' | 'student';

export interface User {
    id: string;
    name: string;
    email?: string; // Parent only
    role: UserRole;
    avatar?: string; // Student only
}

export interface Parent extends User {
    role: 'parent';
    childIds: string[];
}

export interface Student extends User {
    role: 'student';
    age: number;
    grade: string;
    parentId?: string;
}

export type QuizType = 'cognitive' | 'iq' | 'gk';

export interface Question {
    id: string;
    text: string;
    options: string[];
    optionIds?: number[];
    correctIndex: number;
}

export interface Quiz {
    id: string;
    type: QuizType;
    title: string;
    description?: string;
    grade?: string;
    questions: Question[];
    questionCount?: number;
    durationMinutes?: number;
}

export interface QuizResult {
    id: string;
    studentId: string;
    quizType: QuizType;
    score: number;
    totalQuestions: number;
    date: string;
    answers: number[]; // Index of selected answers
}

export interface EmotionalInsight {
    studentId: string;
    date: string;
    moodOffset: number; // 0-100?
    note: string;
}
