import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Target } from 'lucide-react';
import type { RecommendedQuiz, TierRecommendation } from '../../../api/recommendations';
import { buildDailyChallenges, type DailyChallengePick } from '../../../lib/aiRecommendation';
import { cn } from '../../../lib/utils';

type AiChallengeOfTheDayProps = {
    recommendations: RecommendedQuiz[];
    tierRecommendation: TierRecommendation | null | undefined;
    isLoading?: boolean;
};

const tierStyles: Record<DailyChallengePick['tier'], string> = {
    easy: 'border-emerald-200 bg-emerald-50/80 hover:border-emerald-300',
    medium: 'border-sky-200 bg-sky-50/80 hover:border-sky-300',
    hard: 'border-violet-200 bg-violet-50/80 hover:border-violet-300',
};

const tierBadgeStyles: Record<DailyChallengePick['tier'], string> = {
    easy: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-sky-100 text-sky-800',
    hard: 'bg-violet-100 text-violet-800',
};

export function AiChallengeOfTheDay({
    recommendations,
    tierRecommendation,
    isLoading = false,
}: AiChallengeOfTheDayProps) {
    if (isLoading) {
        return (
            <div>
                <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((key) => (
                        <div
                            key={key}
                            className="min-h-[7.5rem] rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!tierRecommendation) return null;

    const challenges = buildDailyChallenges(recommendations, tierRecommendation);
    const hasAnyQuiz = challenges.some((row) => row.quiz);

    if (!hasAnyQuiz) return null;

    return (
        <div>
            <div className="flex items-start gap-2 mb-3 sm:mb-4">
                <Target className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-700">
                        AI Challenge of the Day
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Three tiers to try — your recommended level is marked with an AI pick.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 auto-rows-fr">
                {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.tier} challenge={challenge} />
                ))}
            </div>
        </div>
    );
}

function ChallengeCard({ challenge }: { challenge: DailyChallengePick }) {
    const { tier, label, quiz, isRecommended } = challenge;

    const content = (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span
                    className={cn(
                        'text-xs font-black uppercase px-2 py-0.5 rounded-full',
                        tierBadgeStyles[tier],
                    )}
                >
                    {label}
                </span>
                {isRecommended && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full shrink-0">
                        <Sparkles className="w-3 h-3" aria-hidden />
                        AI pick
                    </span>
                )}
            </div>

            {quiz ? (
                <>
                    <p className="font-bold text-slate-800 line-clamp-2 flex-1">{quiz.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {quiz.categoryLabel ?? quiz.subjectLabel}
                        {quiz.questionCount ? ` · ${quiz.questionCount} questions` : ''}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-orange-600">
                        Start challenge
                        <ChevronRight className="w-4 h-4" aria-hidden />
                    </span>
                </>
            ) : (
                <p className="text-sm text-slate-500 flex-1">No quiz available at this tier yet.</p>
            )}
        </div>
    );

    const className = cn(
        'rounded-2xl border-2 p-4 transition-all min-h-[7.5rem] h-full',
        tierStyles[tier],
        isRecommended && 'ring-2 ring-violet-300 ring-offset-1',
        quiz && 'group cursor-pointer hover:shadow-md',
    );

    if (quiz) {
        return (
            <Link to={`/student/quiz/${quiz.quizId}`} className={className}>
                {content}
            </Link>
        );
    }

    return <div className={className}>{content}</div>;
}
