import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
    EI_PATH_TO_DIMENSION,
    fetchMyEmotionalProfile,
    getEmotionalErrorMessage,
    statusColor,
    statusLabel,
    type EIActivity,
    type EmotionalProfile,
} from '../../api/emotional';

export const EmotionalCategoryDetailPage = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const [profile, setProfile] = useState<EmotionalProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dimension = categorySlug ? EI_PATH_TO_DIMENSION[categorySlug] : undefined;

    const loadProfile = useCallback(async () => {
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
        void loadProfile();
    }, [loadProfile]);

    const category = dimension && profile?.categories ? profile.categories[dimension] : null;
    const relatedActivity: EIActivity | undefined = useMemo(() => {
        if (!category || !profile) return undefined;
        return profile.activities.find((a) => a.slug === category.relatedActivitySlug);
    }, [category, profile]);

    if (!dimension) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-600">Category not found.</p>
                <Link to="/student/emotional" className="text-rose-600 font-bold mt-2 inline-block">
                    Back to profile
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 p-6 md:p-8 font-sans max-w-2xl mx-auto">
            <Link
                to="/student/emotional"
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-rose-600"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
            </Link>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading…
                </div>
            )}

            {error && (
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <p className="text-orange-700 text-sm">{error}</p>
                </Card>
            )}

            {!loading && !error && !profile?.hasAssessment && (
                <Card className="p-6 rounded-3xl border-2 border-rose-100">
                    <p className="text-slate-600">Complete the EI assessment first to see category details.</p>
                    <Link
                        to="/student/emotional/assessment"
                        className="inline-flex mt-4 text-sm font-bold text-white bg-rose-500 px-4 py-2 rounded-xl"
                    >
                        Start assessment
                    </Link>
                </Card>
            )}

            {!loading && !error && category && (
                <>
                    <header>
                        <h1 className="text-3xl font-black text-slate-800">{category.label}</h1>
                        <p className="text-slate-500 mt-1">{category.description}</p>
                    </header>

                    <Card className="p-6 rounded-3xl border-2 border-violet-100">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-violet-700 uppercase">Your score</p>
                                <p className="text-5xl font-black text-slate-800 mt-1">
                                    {Math.round(category.percent)}%
                                </p>
                                <span
                                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${statusColor(category.status)}`}
                                >
                                    {statusLabel(category.status)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-rose-400 to-violet-500 rounded-full"
                                style={{ width: `${Math.min(100, category.percent)}%` }}
                            />
                        </div>
                    </Card>

                    <Card className="p-5 rounded-2xl border border-slate-100">
                        <h2 className="font-bold text-slate-800 mb-2">What this means</h2>
                        <p className="text-slate-600 leading-relaxed">{category.explanation}</p>
                    </Card>

                    {relatedActivity && (
                        <Card className="p-6 rounded-3xl border-2 border-teal-100 bg-teal-50/40">
                            <p className="text-xs font-bold uppercase text-teal-700">Related activity</p>
                            <p className="font-black text-xl text-slate-800 mt-1">{relatedActivity.title}</p>
                            <p className="text-sm text-slate-600 mt-2">{relatedActivity.description}</p>
                            {relatedActivity.isRecommended && (
                                <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    Recommended
                                </span>
                            )}
                            <Link
                                to={`/student/emotional/activity/${relatedActivity.slug}`}
                                className="inline-flex mt-4 items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                            >
                                Start activity
                            </Link>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};
