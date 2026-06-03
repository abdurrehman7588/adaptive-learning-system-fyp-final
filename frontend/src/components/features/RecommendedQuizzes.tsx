import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Globe, Zap, Loader2, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RecommendedQuiz } from '../../api/recommendations';
import { subjectToQuizType } from '../../api/recommendations';

type RecommendedQuizzesProps = {
    recommendations: RecommendedQuiz[];
    isLoading?: boolean;
    error?: string | null;
    childName?: string;
    variant?: 'parent' | 'student';
    onRetry?: () => void;
    showQuizLinks?: boolean;
};

const priorityStyles = {
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-sky-100 text-sky-800 border-sky-200',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const priorityLabels: Record<string, string> = {
    high: 'Focus now',
    medium: 'Suggested',
    low: 'Keep going',
};

const matchTypeLabels: Record<string, string> = {
    weak_concept: 'Weak concept',
    difficulty_progression: 'Level up',
    maintain_mastery: 'Mastery',
    explore: 'Explore',
};

function getIcon(type: ReturnType<typeof subjectToQuizType>) {
    switch (type) {
        case 'iq':
            return Zap;
        case 'gk':
            return Globe;
        default:
            return Brain;
    }
}

function getTheme(type: ReturnType<typeof subjectToQuizType>) {
    switch (type) {
        case 'iq':
            return {
                iconBg: 'bg-orange-100',
                iconText: 'text-orange-600',
                border: 'border-orange-100',
            };
        case 'gk':
            return {
                iconBg: 'bg-green-100',
                iconText: 'text-green-600',
                border: 'border-green-100',
            };
        default:
            return {
                iconBg: 'bg-purple-100',
                iconText: 'text-purple-600',
                border: 'border-purple-100',
            };
    }
}

export const RecommendedQuizzes = ({
    recommendations,
    isLoading = false,
    error = null,
    childName,
    variant = 'parent',
    onRetry,
    showQuizLinks = true,
}: RecommendedQuizzesProps) => {
    const isParent = variant === 'parent';

    if (isLoading) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center py-12 text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <Loader2
                    className={cn(
                        'w-8 h-8 animate-spin mb-3',
                        isParent ? 'text-teal-500' : 'text-orange-500',
                    )}
                />
                <p className="font-medium text-sm">Finding personalized quizzes...</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-sm">{error}</p>
                        {onRetry && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="text-sm font-semibold underline mt-2"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <motion.div
                className="text-center py-10 text-slate-500 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">No recommendations yet</p>
                <p className="text-sm mt-1 max-w-sm mx-auto">
                    {childName
                        ? `When ${childName} completes quizzes, we will suggest practice for weaker subjects.`
                        : 'Complete a quiz to unlock personalized suggestions.'}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {recommendations.map((item, index) => {
                const quizType = subjectToQuizType(item.subject);
                const Icon = getIcon(quizType);
                const theme = getTheme(quizType);
                const targets = item.targetConcepts ?? [];
                const weakConcepts = targets.filter(
                    (concept) =>
                        item.matchType === 'weak_concept' ||
                        item.matchType === 'weak_subject' ||
                        (concept.accuracyPercent !== undefined && concept.accuracyPercent < 70),
                );
                const masteryConcepts = targets.filter(
                    (concept) =>
                        item.matchType === 'maintain_mastery' ||
                        (concept.accuracyPercent !== undefined && concept.accuracyPercent >= 85),
                );
                const conceptTags =
                    weakConcepts.length > 0
                        ? weakConcepts
                        : masteryConcepts.length > 0
                          ? masteryConcepts
                          : targets;

                const metaParts = [
                    item.questionCount > 0
                        ? `${item.questionCount} questions`
                        : item.gradeLevel ?? item.subjectLabel,
                ];
                if (item.matchType && matchTypeLabels[item.matchType]) {
                    metaParts.push(matchTypeLabels[item.matchType]);
                }
                const meta = metaParts.join(' · ');

                return (
                    <motion.div
                        key={item.quizId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            'rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow',
                            theme.border,
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={cn(
                                    'p-3 rounded-xl shrink-0',
                                    theme.iconBg,
                                    theme.iconText,
                                )}
                            >
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-800 truncate">
                                        {item.title}
                                    </h4>
                                    <span
                                        className={cn(
                                            'text-xs font-bold px-2 py-0.5 rounded-full border',
                                            priorityStyles[item.priority],
                                        )}
                                    >
                                        {priorityLabels[item.priority]}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">
                                        {item.subjectLabel}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        Level {item.suggestedDifficulty ?? 2}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {item.reason}
                                </p>
                                {conceptTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {weakConcepts.length > 0 && (
                                            <span className="text-[10px] font-bold uppercase text-amber-700 w-full">
                                                Weak concepts
                                            </span>
                                        )}
                                        {masteryConcepts.length > 0 && weakConcepts.length === 0 && (
                                            <span className="text-[10px] font-bold uppercase text-emerald-700 w-full">
                                                Mastery concepts
                                            </span>
                                        )}
                                        {conceptTags.map((concept) => (
                                            <span
                                                key={`${concept.conceptType}-${concept.key}`}
                                                className={cn(
                                                    'text-xs font-medium px-2 py-0.5 rounded-md border',
                                                    weakConcepts.some((w) => w.key === concept.key)
                                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                        : masteryConcepts.some(
                                                                (m) => m.key === concept.key,
                                                            )
                                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                          : 'bg-slate-100 text-slate-600 border-slate-200',
                                                )}
                                            >
                                                {concept.label}
                                                {concept.accuracyPercent !== undefined &&
                                                    ` · ${Math.round(concept.accuracyPercent)}%`}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 mt-2">{meta}</p>
                                {showQuizLinks && (
                                    <Link
                                        to={`/student/quiz/${item.quizId}`}
                                        className={cn(
                                            'inline-flex items-center gap-1 mt-3 text-sm font-semibold',
                                            isParent
                                                ? 'text-teal-600 hover:text-teal-700'
                                                : 'text-orange-600 hover:text-orange-700',
                                        )}
                                    >
                                        {isParent ? 'Open for child' : 'Start this quest'}
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};
