import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { RecommendedQuiz } from '../../../api/recommendations';
import { subjectToQuizType } from '../../../api/recommendations';
import { cn } from '../../../lib/utils';

type StudentTopQuizPicksProps = {
    recommendations: RecommendedQuiz[];
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    maxItems?: number;
};

const priorityStyles = {
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-sky-100 text-sky-800 border-sky-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function StudentTopQuizPicks({
    recommendations,
    isLoading = false,
    error = null,
    onRetry,
    maxItems = 3,
}: StudentTopQuizPicksProps) {
    const picks = [...recommendations]
        .sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority] || a.attemptCount - b.attemptCount;
        })
        .slice(0, maxItems);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2 text-orange-500" />
                <span className="font-medium text-sm">Loading picks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 space-y-3">
                <p className="text-sm text-orange-600">{error}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="text-sm font-bold text-orange-600 hover:underline"
                    >
                        Try again
                    </button>
                )}
            </div>
        );
    }

    if (picks.length === 0) {
        return (
            <p className="text-sm text-slate-500 font-medium py-4 text-center">
                Open the learning paths below to start your next quiz.
            </p>
        );
    }

    return (
        <ul className="space-y-3">
            {picks.map((item) => {
                const quizType = subjectToQuizType(item.subject);
                const emoji =
                    quizType === 'gk' ? '🌍' : quizType === 'iq' ? '⚡' : '🧠';

                return (
                    <li key={item.quizId}>
                        <Link
                            to={`/student/quiz/${item.quizId}`}
                            className="flex items-center gap-3 rounded-2xl border-2 border-orange-100 bg-gradient-to-r from-orange-50/80 to-white px-4 py-3 hover:border-orange-200 hover:shadow-md transition-all group"
                        >
                            <span className="text-2xl shrink-0" aria-hidden>
                                {emoji}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-800 truncate group-hover:text-orange-600">
                                    {item.title}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-1">{item.reason}</p>
                            </div>
                            <span
                                className={cn(
                                    'shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                                    priorityStyles[item.priority],
                                )}
                            >
                                {item.priority === 'high' ? 'Focus' : 'Try'}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 shrink-0" />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
