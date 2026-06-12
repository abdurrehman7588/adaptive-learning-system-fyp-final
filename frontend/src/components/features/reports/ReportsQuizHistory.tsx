import { formatRelativeTime, type RecentAttempt } from '../../../api/analytics';
import { AlertCircle } from 'lucide-react';

type ReportsQuizHistoryProps = {
    history: RecentAttempt[];
    isLoading?: boolean;
};

function scoreBadgeClass(percentage: number) {
    if (percentage >= 80) return 'bg-emerald-100 text-emerald-800';
    if (percentage >= 60) return 'bg-sky-100 text-sky-800';
    return 'bg-amber-100 text-amber-800';
}

export function ReportsQuizHistory({ history, isLoading }: ReportsQuizHistoryProps) {
    if (isLoading) {
        return (
            <p className="text-sm text-slate-500 py-8 text-center">Loading quiz history...</p>
        );
    }

    if (history.length === 0) {
        return (
            <div className="py-10 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium">No completed quizzes yet</p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: stacked cards — no horizontal scroll */}
            <ul className="mobile-only space-y-3">
                {history.map((attempt) => (
                    <li
                        key={attempt.attemptId}
                        className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-2"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-slate-800 break-words min-w-0 flex-1">
                                {attempt.quizTitle}
                            </p>
                            <span
                                className={`shrink-0 font-bold px-2.5 py-1 rounded-lg text-xs ${scoreBadgeClass(attempt.percentage)}`}
                            >
                                {Math.round(attempt.percentage)}%
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>{attempt.subjectLabel}</span>
                            <span aria-hidden>·</span>
                            <span>{formatRelativeTime(attempt.completedAt)}</span>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Desktop: table */}
            <div className="desktop-table overflow-x-auto -mx-1 px-1">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                            <th className="py-3 pr-4">Quiz</th>
                            <th className="py-3 pr-4">Subject</th>
                            <th className="py-3 pr-4 text-right">Score</th>
                            <th className="py-3 text-right">Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((attempt) => (
                            <tr
                                key={attempt.attemptId}
                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                            >
                                <td className="py-3 pr-4 font-semibold text-slate-800">
                                    {attempt.quizTitle}
                                </td>
                                <td className="py-3 pr-4 text-slate-600">{attempt.subjectLabel}</td>
                                <td className="py-3 pr-4 text-right">
                                    <span
                                        className={`inline-block font-bold px-2 py-0.5 rounded-lg text-xs ${scoreBadgeClass(attempt.percentage)}`}
                                    >
                                        {Math.round(attempt.percentage)}%
                                    </span>
                                </td>
                                <td className="py-3 text-right text-slate-500">
                                    {formatRelativeTime(attempt.completedAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
