import { useCallback, useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Heart, Loader2 } from 'lucide-react';
import {
    fetchChildEmotionalProfile,
    getEmotionalErrorMessage,
    statusLabel,
    type EmotionalProfile,
} from '../../api/emotional';
import { resolveActiveChildId } from '../../lib/activeChild';
import { getToken } from '../../lib/tokenStorage';
import { pageShell } from '../../lib/responsive';

export const EmotionalInsights = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [childName, setChildName] = useState('your child');
    const [profile, setProfile] = useState<EmotionalProfile | null>(null);

    const loadInsights = useCallback(async () => {
        if (!getToken()) {
            setError('Sign in as a parent to view insights.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const childId = await resolveActiveChildId();
            if (!childId) {
                setError('Add a learner profile in Settings to see insights.');
                setLoading(false);
                return;
            }
            const data = await fetchChildEmotionalProfile(childId);
            setProfile(data);
            setChildName('your child');
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadInsights();
    }, [loadInsights]);

    return (
        <div className={`${pageShell} max-w-4xl space-y-6`}>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-7 h-7 text-rose-500" />
                Emotional Intelligence Insights
            </h1>
            <p className="text-gray-500">
                Assessment-based EI scores for {childName} (Self Awareness, Empathy, Self Regulation)
            </p>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading insights...
                </div>
            )}
            {error && <p className="text-sm text-orange-600">{error}</p>}

            {!loading && !error && profile && !profile.hasAssessment && (
                <Card className="p-6 border-l-4 border-rose-400">
                    <h3 className="font-bold text-lg">No assessment yet</h3>
                    <p className="text-gray-600 mt-2">
                        Ask your child to complete the Emotional Intelligence assessment from their
                        student dashboard. Results will appear here automatically.
                    </p>
                </Card>
            )}

            {!loading && !error && profile?.hasAssessment && profile.categories && (
                <div className="grid gap-6">
                    <Card className="p-6 border-l-4 border-violet-400">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-bold text-lg">Overall EI Score</h3>
                                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 mt-2">
                                    {Math.round(profile.overallScore ?? 0)}%
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {statusLabel(profile.overallStatus)}
                                </p>
                            </div>
                            {profile.lastCompletedAt && (
                                <span className="text-xs text-slate-400">
                                    {new Date(profile.lastCompletedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-4">
                        {(['self_awareness', 'empathy', 'self_regulation'] as const).map((key) => {
                            const cat = profile.categories![key];
                            return (
                                <Card key={key} className="p-4">
                                    <h4 className="font-bold text-slate-700">{cat.label}</h4>
                                    <p className="text-2xl font-black mt-1">{Math.round(cat.percent)}%</p>
                                    <p className="text-sm text-slate-500">{statusLabel(cat.status)}</p>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-emerald-50">
                            <h4 className="font-bold text-emerald-700 mb-2">Strongest area</h4>
                            <p className="text-emerald-900 font-medium">
                                {profile.strongestArea?.label ?? '—'}
                                {profile.strongestArea
                                    ? ` (${Math.round(profile.strongestArea.percent)}%)`
                                    : ''}
                            </p>
                        </Card>
                        <Card className="p-4 bg-amber-50">
                            <h4 className="font-bold text-amber-700 mb-2">Needs improvement</h4>
                            <p className="text-amber-900 font-medium">
                                {profile.weakestArea?.label ?? '—'}
                                {profile.weakestArea
                                    ? ` (${Math.round(profile.weakestArea.percent)}%)`
                                    : ''}
                            </p>
                        </Card>
                    </div>

                    <Card className="p-4 bg-teal-50">
                        <h4 className="font-bold text-teal-700 mb-2">Recommended activity</h4>
                        <p className="font-bold text-slate-800">{profile.recommendedActivity.title}</p>
                        <p className="text-sm text-teal-800 mt-1">
                            {profile.recommendedActivity.reason}
                        </p>
                    </Card>

                    {profile.feelingsInsights && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="p-4 bg-violet-50">
                                <h4 className="font-bold text-violet-700 mb-2">Most common emotion</h4>
                                <p className="font-bold text-slate-800">
                                    {profile.feelingsInsights.mostCommonEmotion}
                                </p>
                            </Card>
                            <Card className="p-4 bg-violet-50">
                                <h4 className="font-bold text-violet-700 mb-2">Most common reason</h4>
                                <p className="font-bold text-slate-800">
                                    {profile.feelingsInsights.mostCommonReason ?? '—'}
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
