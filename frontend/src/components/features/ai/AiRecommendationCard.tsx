import { Brain } from 'lucide-react';
import type { TierRecommendation } from '../../../api/recommendations';
import {
    displayReasoningSummary,
    formatConfidencePercent,
    formatEmotionalFeatureLabel,
    formatLearnerLevel,
    isEmotionalAssessed,
    sourceLabel,
} from '../../../lib/aiRecommendation';
import { cn } from '../../../lib/utils';
import { EmotionalAssessmentPendingBadge } from './EmotionalAssessmentPendingBadge';

type AiRecommendationCardProps = {
    tierRecommendation: TierRecommendation | null | undefined;
    isLoading?: boolean;
    childName?: string;
};

const levelStyles: Record<
    TierRecommendation['recommendation'],
    { badge: string; ring: string; accent: string }
> = {
    Easy: {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ring: 'stroke-emerald-500',
        accent: 'from-emerald-50 to-teal-50 border-emerald-200',
    },
    Medium: {
        badge: 'bg-sky-100 text-sky-800 border-sky-200',
        ring: 'stroke-sky-500',
        accent: 'from-sky-50 to-indigo-50 border-sky-200',
    },
    Hard: {
        badge: 'bg-violet-100 text-violet-800 border-violet-200',
        ring: 'stroke-violet-500',
        accent: 'from-violet-50 to-fuchsia-50 border-violet-200',
    },
};

function ConfidenceRing({ confidence, ringClass }: { confidence: number; ringClass: string }) {
    const pct = Math.min(100, Math.max(0, Math.round(confidence * 100)));
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0" aria-label={`${pct}% confidence`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-200"
                />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={ringClass}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-xs font-black text-slate-700">
                {pct}%
            </span>
        </div>
    );
}

export function AiRecommendationCard({
    tierRecommendation,
    isLoading = false,
    childName,
}: AiRecommendationCardProps) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 animate-pulse">
                <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
                <div className="h-8 w-28 bg-slate-200 rounded mb-3" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[1, 2, 3, 4].map((key) => (
                        <div key={key} className="h-14 bg-slate-100 rounded-xl" />
                    ))}
                </div>
                <div className="h-4 w-full bg-slate-100 rounded" />
            </div>
        );
    }

    if (!tierRecommendation) return null;

    const styles = levelStyles[tierRecommendation.recommendation];
    const emotionalAssessed = isEmotionalAssessed(tierRecommendation.features);
    const emotionalLabel = formatEmotionalFeatureLabel(tierRecommendation.features);
    const reasoning = displayReasoningSummary(tierRecommendation);
    const adaptiveScore = tierRecommendation.adaptiveScore;
    const learnerLevel = tierRecommendation.learnerLevel;

    return (
        <article
            className={cn(
                'rounded-2xl border-2 bg-gradient-to-br shadow-sm overflow-hidden',
                styles.accent,
            )}
        >
            <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="rounded-xl bg-white p-3 shrink-0 self-start">
                        <Brain className="w-7 h-7 text-teal-600" aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                                AI recommendation
                            </h3>
                            {childName && (
                                <span className="text-xs text-slate-500">· {childName}</span>
                            )}
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/90 text-slate-500 border border-slate-200">
                                {sourceLabel(tierRecommendation.source)}
                            </span>
                        </div>

                        {!emotionalAssessed && <EmotionalAssessmentPendingBadge />}

                        <div className="flex flex-wrap items-center gap-3">
                            {adaptiveScore !== null && adaptiveScore !== undefined && (
                                <div className="rounded-xl bg-white/90 border border-white px-3 py-2">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">
                                        Adaptive score
                                    </p>
                                    <p className="text-lg font-black text-slate-800">
                                        {Math.round(adaptiveScore)}
                                        <span className="text-xs font-semibold text-slate-500">/100</span>
                                    </p>
                                </div>
                            )}
                            {learnerLevel && (
                                <div className="rounded-xl bg-white/90 border border-white px-3 py-2">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">
                                        Learner level
                                    </p>
                                    <p className="text-sm font-black text-slate-800">
                                        {formatLearnerLevel(learnerLevel)}
                                    </p>
                                </div>
                            )}
                            <span
                                className={cn(
                                    'inline-flex items-center text-lg font-black px-3 py-1.5 rounded-xl border',
                                    styles.badge,
                                )}
                            >
                                {tierRecommendation.recommendation}
                            </span>
                            <div className="flex items-center gap-3">
                                <ConfidenceRing
                                    confidence={tierRecommendation.confidence}
                                    ringClass={styles.ring}
                                />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">
                                        Confidence
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {formatConfidencePercent(tierRecommendation.confidence)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {tierRecommendation.features && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
                        <FeatureChip
                            label="Avg score"
                            value={`${Math.round(tierRecommendation.features.average_score)}%`}
                        />
                        <FeatureChip
                            label="Mastery"
                            value={`${Math.round(tierRecommendation.features.mastery_score ?? 0)}%`}
                        />
                        <FeatureChip
                            label="Trend"
                            value={`${Math.round(tierRecommendation.features.performance_trend ?? 50)}%`}
                        />
                        <FeatureChip
                            label="Speed"
                            value={`${Math.round(tierRecommendation.features.learning_speed ?? 50)}%`}
                        />
                        <FeatureChip
                            label="Completion"
                            value={`${Math.round(tierRecommendation.features.completion_rate)}%`}
                        />
                        <FeatureChip
                            label="Emotional"
                            value={emotionalLabel}
                            muted={!emotionalAssessed}
                        />
                    </div>
                )}

                {reasoning && (
                    <p className="text-sm text-slate-600 leading-relaxed border-t border-white/60 pt-3">
                        {reasoning}
                    </p>
                )}
            </div>
        </article>
    );
}

function FeatureChip({
    label,
    value,
    muted = false,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    return (
        <div className="rounded-xl bg-white/80 border border-white px-3 py-2.5 min-h-[4.25rem] flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
            <p
                className={cn(
                    'text-sm font-black mt-0.5 break-words',
                    muted ? 'text-amber-700' : 'text-slate-800',
                )}
            >
                {value}
            </p>
        </div>
    );
}
