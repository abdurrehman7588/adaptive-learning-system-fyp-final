import type { LucideIcon } from 'lucide-react';
import {
    Brain,
    FlaskConical,
    Lightbulb,
    Calculator,
    Shapes,
    Sparkles,
} from 'lucide-react';

/** Product learning paths (6 categories). */
export type LearningCategoryId =
    | 'math'
    | 'science'
    | 'pattern_recognition'
    | 'memory'
    | 'problem_solving'
    | 'critical_thinking';

export type LearningCategoryDef = {
    id: LearningCategoryId;
    label: string;
    shortLabel: string;
    description: string;
    emoji: string;
    icon: LucideIcon;
    theme: {
        bg: string;
        border: string;
        text: string;
        iconBg: string;
        gradient: string;
    };
};

export const LEARNING_CATEGORIES: LearningCategoryDef[] = [
    {
        id: 'math',
        label: 'Math',
        shortLabel: 'Math',
        description: 'Numbers, counting, and problem steps.',
        emoji: '🔢',
        icon: Calculator,
        theme: {
            bg: 'bg-sky-50',
            border: 'border-sky-200',
            text: 'text-sky-700',
            iconBg: 'bg-sky-100',
            gradient: 'from-sky-400 to-blue-500',
        },
    },
    {
        id: 'science',
        label: 'Science',
        shortLabel: 'Science',
        description: 'Explore how the world works.',
        emoji: '🔬',
        icon: FlaskConical,
        theme: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            iconBg: 'bg-emerald-100',
            gradient: 'from-emerald-400 to-teal-500',
        },
    },
    {
        id: 'pattern_recognition',
        label: 'Pattern Recognition',
        shortLabel: 'Patterns',
        description: 'Find what comes next.',
        emoji: '🧩',
        icon: Shapes,
        theme: {
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            text: 'text-violet-700',
            iconBg: 'bg-violet-100',
            gradient: 'from-violet-400 to-purple-500',
        },
    },
    {
        id: 'memory',
        label: 'Memory',
        shortLabel: 'Memory',
        description: 'Remember and recall.',
        emoji: '🧠',
        icon: Brain,
        theme: {
            bg: 'bg-fuchsia-50',
            border: 'border-fuchsia-200',
            text: 'text-fuchsia-700',
            iconBg: 'bg-fuchsia-100',
            gradient: 'from-fuchsia-400 to-pink-500',
        },
    },
    {
        id: 'problem_solving',
        label: 'Problem Solving',
        shortLabel: 'Problems',
        description: 'Think through challenges.',
        emoji: '💡',
        icon: Lightbulb,
        theme: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-800',
            iconBg: 'bg-amber-100',
            gradient: 'from-amber-400 to-orange-500',
        },
    },
    {
        id: 'critical_thinking',
        label: 'Critical Thinking',
        shortLabel: 'Thinking',
        description: 'Reason, compare, and decide.',
        emoji: '✨',
        icon: Sparkles,
        theme: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-700',
            iconBg: 'bg-orange-100',
            gradient: 'from-orange-400 to-rose-500',
        },
    },
];

const LEGACY_CATEGORY_MAP: Record<string, LearningCategoryId> = {
    sequencing: 'problem_solving',
    visual_reasoning: 'critical_thinking',
};

export function normalizeLearningCategory(
    raw?: string | null,
): LearningCategoryId | null {
    if (!raw?.trim()) return null;
    const value = raw.trim() as LearningCategoryId;
    if (LEARNING_CATEGORIES.some((row) => row.id === value)) {
        return value;
    }
    return LEGACY_CATEGORY_MAP[value] ?? null;
}

export function getCategoryDef(id: LearningCategoryId): LearningCategoryDef {
    return LEARNING_CATEGORIES.find((row) => row.id === id) ?? LEARNING_CATEGORIES[0];
}

const GRADE_DISPLAY_LABELS: Record<string, string> = {
    pre_k: 'Pre-K',
    kindergarten: 'Kindergarten',
    grade_1: 'Grade 1',
    grade_2: 'Grade 2',
    grade_3: 'Grade 3',
    grade_4: 'Grade 4',
    grade_5: 'Grade 5',
    grade_6: 'Grade 6',
};

export function gradeLevelToDisplayLabel(grade?: string | null): string {
    if (!grade?.trim()) return '';
    const key = grade.trim();
    return (
        GRADE_DISPLAY_LABELS[key] ??
        key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
}
