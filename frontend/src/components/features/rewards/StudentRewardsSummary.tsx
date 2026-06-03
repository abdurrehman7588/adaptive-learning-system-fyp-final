import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, Loader2, Trophy, Zap } from 'lucide-react';
import { Card } from '../../ui/Card';
import type { ChildRewards } from '../../../api/rewards';

type StudentRewardsSummaryProps = {
    rewards: ChildRewards;
    loading?: boolean;
    error?: string | null;
};

export function StudentRewardsSummary({ rewards, loading, error }: StudentRewardsSummaryProps) {
    return (
        <Card className="p-5 md:p-6 rounded-3xl border-2 border-amber-100 bg-gradient-to-br from-amber-50/80 to-orange-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Rewards
                </h2>
                <Link
                    to="/student/rewards"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 shadow-md shadow-orange-200/50 transition-colors"
                >
                    View Rewards
                </Link>
            </div>

            {error && <p className="text-sm text-orange-600 mb-3">{error}</p>}

            {loading ? (
                <div className="flex items-center gap-2 text-slate-500 py-4 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Loading rewards...</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricChip
                        icon={<Trophy className="w-4 h-4 text-purple-600" />}
                        label="Level"
                        value={String(rewards.currentLevel)}
                    />
                    <MetricChip
                        icon={<Zap className="w-4 h-4 text-yellow-600" />}
                        label="Total XP"
                        value={rewards.totalXP.toLocaleString()}
                    />
                    <MetricChip
                        icon={<Flame className="w-4 h-4 text-orange-600" />}
                        label="Streak"
                        value={`${rewards.currentStreak}d`}
                    />
                    <MetricChip
                        icon={<Award className="w-4 h-4 text-pink-600" />}
                        label="Badges"
                        value={String(rewards.achievementCount)}
                    />
                </div>
            )}
        </Card>
    );
}

function MetricChip({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-white border border-amber-100 px-3 py-3 text-center shadow-sm">
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
            <p className="font-black text-lg text-slate-800 leading-tight mt-0.5">{value}</p>
        </div>
    );
}
