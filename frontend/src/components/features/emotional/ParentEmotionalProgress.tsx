import { useCallback, useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import {
    fetchChildEmotionalProfile,
    getEmotionalErrorMessage,
    statusLabel,
    type EmotionalProfile,
} from '../../../api/emotional';

type Props = {
    childId: number | null;
    childName?: string;
};

export const ParentEmotionalProgress = ({ childId, childName }: Props) => {
    const [profile, setProfile] = useState<EmotionalProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!childId) {
            setProfile(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            setProfile(await fetchChildEmotionalProfile(childId));
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        void load();
    }, [load]);

    const label = childName ?? 'Your child';

    return (
        <div className="relative z-10 rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-rose-700 flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-200 text-rose-500" />
                Emotional Progress
                {childName && (
                    <span className="text-slate-400 font-medium normal-case">· {childName}</span>
                )}
            </h3>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500 py-6">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading emotional profile…
                </div>
            )}

            {error && <p className="text-sm text-orange-600 mt-3">{error}</p>}

            {!loading && !error && profile && !profile.hasAssessment && (
                <p className="text-sm text-slate-600 mt-3">
                    {label} has not completed the EI assessment yet. Encourage them to open
                    Emotional Intelligence from their dashboard.
                </p>
            )}

            {!loading && !error && profile?.feelingsInsights && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <ProgressTile
                        title="Most common emotion"
                        value={profile.feelingsInsights.mostCommonEmotion}
                        detail={`From ${profile.feelingsInsights.entryCount} check-in(s)`}
                        tone="violet"
                    />
                    <ProgressTile
                        title="Most common reason"
                        value={profile.feelingsInsights.mostCommonReason ?? '—'}
                        detail="From My Feelings Today activity"
                        tone="violet"
                    />
                </div>
            )}

            {!loading && !error && profile?.hasAssessment && (
                <div className={`mt-4 grid md:grid-cols-3 gap-4 ${profile.feelingsInsights ? 'mt-4' : ''}`}>
                    <ProgressTile
                        title="Strongest area"
                        value={profile.strongestArea?.label ?? '—'}
                        detail={
                            profile.strongestArea
                                ? `${Math.round(profile.strongestArea.percent)}% · ${statusLabel(
                                      profile.categories?.[profile.strongestArea.dimension]?.status,
                                  )}`
                                : undefined
                        }
                        tone="emerald"
                    />
                    <ProgressTile
                        title="Needs improvement"
                        value={profile.weakestArea?.label ?? '—'}
                        detail={
                            profile.weakestArea
                                ? `${Math.round(profile.weakestArea.percent)}% · ${statusLabel(
                                      profile.categories?.[profile.weakestArea.dimension]?.status,
                                  )}`
                                : undefined
                        }
                        tone="amber"
                    />
                    <ProgressTile
                        title="Recommended activity"
                        value={profile.recommendedActivity.title}
                        detail={profile.recommendedActivity.dimensionLabel}
                        tone="teal"
                    />
                </div>
            )}
        </div>
    );
};

function ProgressTile({
    title,
    value,
    detail,
    tone,
}: {
    title: string;
    value: string;
    detail?: string;
    tone: 'emerald' | 'amber' | 'teal' | 'violet';
}) {
    const toneClass =
        tone === 'emerald'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
            : tone === 'amber'
              ? 'bg-amber-50 border-amber-100 text-amber-800'
              : tone === 'violet'
                ? 'bg-violet-50 border-violet-100 text-violet-800'
                : 'bg-teal-50 border-teal-100 text-teal-800';

    return (
        <div className={`rounded-xl border p-4 ${toneClass}`}>
            <p className="text-xs font-bold uppercase opacity-80">{title}</p>
            <p className="font-bold text-lg mt-1 text-slate-800">{value}</p>
            {detail && <p className="text-xs mt-1 text-slate-600">{detail}</p>}
        </div>
    );
}
