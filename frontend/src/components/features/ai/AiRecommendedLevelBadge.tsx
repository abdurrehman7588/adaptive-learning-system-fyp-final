import { Sparkles } from 'lucide-react';
import type { TierRecommendation } from '../../../api/recommendations';
import { cn } from '../../../lib/utils';

type AiRecommendedLevelBadgeProps = {
    tierRecommendation: TierRecommendation | null | undefined;
    isLoading?: boolean;
    className?: string;
};

const levelStyles: Record<TierRecommendation['recommendation'], string> = {
    Easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-sky-100 text-sky-800 border-sky-200',
    Hard: 'bg-violet-100 text-violet-800 border-violet-200',
};

export function AiRecommendedLevelBadge({
    tierRecommendation,
    isLoading = false,
    className,
}: AiRecommendedLevelBadgeProps) {
    if (isLoading) {
        return (
            <span
                className={cn(
                    'inline-block h-7 w-52 rounded-full bg-slate-100 animate-pulse',
                    className,
                )}
                aria-hidden
            />
        );
    }

    if (!tierRecommendation) return null;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold',
                levelStyles[tierRecommendation.recommendation],
                className,
            )}
        >
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden />
            AI Recommended Level: {tierRecommendation.recommendation}
        </span>
    );
}
