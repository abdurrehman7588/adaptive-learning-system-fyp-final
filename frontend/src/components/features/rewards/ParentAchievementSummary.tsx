import type { ReactNode } from 'react';
import { Award, Flame, Loader2, Trophy, Zap } from 'lucide-react';
import type { ChildRewards } from '../../../api/rewards';

type ParentAchievementSummaryProps = {
    rewards: ChildRewards | null;
    childName?: string;
    loading?: boolean;
    error?: string | null;
};

export function ParentAchievementSummary({
    rewards,
    childName,
    loading,
    error,
}: ParentAchievementSummaryProps) {
    if (error) {
        return (
            <p className="text-sm text-amber-700 relative z-10">{error}</p>
        );
    }

    return (
        <div className="relative z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/90 to-orange-50/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800 min-w-0">
                <Award className="w-5 h-5 shrink-0 text-amber-600" />
                <span className="text-sm font-bold truncate">
                    {childName ? `${childName}'s progress` : 'Achievement summary'}
                </span>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
            </div>

            <div className="flex flex-wrap gap-2 ms-auto">
                <SummaryChip
                    icon={<Zap className="w-3.5 h-3.5" />}
                    label="XP"
                    value={loading ? '…' : String(rewards?.totalXP ?? 0)}
                />
                <SummaryChip
                    icon={<Trophy className="w-3.5 h-3.5" />}
                    label="Level"
                    value={loading ? '…' : String(rewards?.currentLevel ?? 1)}
                />
                <SummaryChip
                    icon={<Award className="w-3.5 h-3.5" />}
                    label="Badges"
                    value={loading ? '…' : String(rewards?.achievementCount ?? 0)}
                />
                <SummaryChip
                    icon={<Flame className="w-3.5 h-3.5" />}
                    label="Streak"
                    value={loading ? '…' : `${rewards?.currentStreak ?? 0}d`}
                />
            </div>
        </div>
    );
}

function SummaryChip({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 border border-amber-100 px-3 py-1.5 text-sm shadow-sm">
            <span className="text-amber-600">{icon}</span>
            <span className="text-xs font-semibold uppercase text-slate-400">{label}</span>
            <span className="font-black text-slate-800">{value}</span>
        </div>
    );
}
