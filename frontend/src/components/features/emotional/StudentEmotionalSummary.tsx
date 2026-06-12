import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import {
    fetchMyEmotionalProfile,
    getEmotionalErrorMessage,
    statusLabel,
    type EmotionalProfile,
} from '../../../api/emotional';

export const StudentEmotionalSummary = () => {
    const [profile, setProfile] = useState<EmotionalProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setProfile(await fetchMyEmotionalProfile());
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <section>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-100" />
                    <h2 className="text-2xl font-black text-slate-700">Emotional Intelligence</h2>
                </div>
                <Link
                    to="/student/emotional"
                    className="text-sm font-bold text-rose-600 hover:underline shrink-0"
                >
                    Open →
                </Link>
            </div>

            {loading && (
                <Card className="p-6 rounded-3xl border-2 border-rose-100 bg-rose-50/30">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading EI profile…
                    </div>
                </Card>
            )}

            {error && (
                <Card className="p-5 rounded-3xl border-2 border-orange-100 bg-orange-50/40">
                    <p className="text-sm text-orange-700">{error}</p>
                </Card>
            )}

            {!loading && !error && profile && !profile.hasAssessment && (
                <Card className="p-5 md:p-6 rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white">
                    <p className="font-bold text-slate-800">Discover your EI strengths</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Take a short feelings check-in and get a fun activity recommendation.
                    </p>
                    <Link
                        to="/student/emotional/assessment"
                        className="inline-flex mt-4 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl"
                    >
                        Start assessment
                    </Link>
                </Card>
            )}

            {!loading && !error && profile?.hasAssessment && profile.categories && (
                <Card className="p-5 md:p-6 rounded-3xl border-2 border-rose-100 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase text-rose-600">Overall EI</p>
                            <p className="text-3xl font-black text-slate-800">
                                {Math.round(profile.overallScore ?? 0)}%
                            </p>
                            <p className="text-sm text-slate-500">
                                {statusLabel(profile.overallStatus)}
                            </p>
                        </div>
                        {profile.recommendedActivity && (
                            <div className="sm:text-right min-w-0 w-full sm:max-w-[55%]">
                                <p className="text-xs font-bold text-teal-700">Try next</p>
                                <p className="text-sm font-bold text-slate-800 break-words">
                                    {profile.recommendedActivity.title}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </section>
    );
};
