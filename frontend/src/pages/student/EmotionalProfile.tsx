import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, Sparkles, ClipboardList, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    EI_CATEGORY_PATHS,
    fetchMyEmotionalProfile,
    getEmotionalErrorMessage,
    statusColor,
    statusLabel,
    type EmotionalProfile,
    type EmotionalDimension,
} from '../../api/emotional';

const DIMENSION_ORDER: EmotionalDimension[] = ['self_awareness', 'empathy', 'self_regulation'];

export const EmotionalProfilePage = () => {
    const [profile, setProfile] = useState<EmotionalProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMyEmotionalProfile();
            setProfile(data);
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    return (
        <div className="w-full min-w-0 max-w-3xl mx-auto space-y-6 pb-8 px-4 py-5 sm:px-6 sm:py-6 md:px-8 font-sans">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Heart className="w-8 h-8 text-rose-500 fill-rose-200" />
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 break-words">
                        Emotional Intelligence
                    </h1>
                </div>
                <p className="text-slate-500 font-medium">
                    Learn about feelings, empathy, and staying calm.
                </p>
            </header>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500 py-12 justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading your profile…
                </div>
            )}

            {error && (
                <Card className="p-5 border-orange-200 bg-orange-50">
                    <p className="text-orange-700 text-sm">{error}</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => void loadProfile()}>
                        Try again
                    </Button>
                </Card>
            )}

            {!loading && !error && profile && !profile.hasAssessment && (
                <Card className="p-6 rounded-3xl border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-white">
                    <h2 className="text-xl font-black text-slate-800">Take your first check-in</h2>
                    <p className="text-slate-600 mt-2">
                        Answer 12 simple questions about feelings and friendships. It takes about 5 minutes.
                    </p>
                    <Link
                        to="/student/emotional/assessment"
                        className="inline-flex mt-4 items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                    >
                        <ClipboardList className="w-5 h-5" />
                        Start assessment
                    </Link>
                </Card>
            )}

            {!loading && !error && profile?.hasAssessment && profile.categories && (
                <>
                    <Card className="p-6 rounded-3xl border-2 border-violet-100 bg-white">
                        <p className="text-sm font-bold text-violet-700 uppercase tracking-wide">
                            Overall EI Score
                        </p>
                        <p className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mt-1">
                            {Math.round(profile.overallScore ?? 0)}%
                        </p>
                        <span
                            className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${statusColor(profile.overallStatus)}`}
                        >
                            {statusLabel(profile.overallStatus)}
                        </span>
                        {profile.lastCompletedAt && (
                            <p className="text-xs text-slate-400 mt-3">
                                Last updated {new Date(profile.lastCompletedAt).toLocaleDateString()}
                            </p>
                        )}
                    </Card>

                    <section>
                        <h2 className="text-lg font-black text-slate-700 mb-3">Your categories</h2>
                        <div className="grid gap-4">
                            {DIMENSION_ORDER.map((key) => {
                                const cat = profile.categories![key];
                                return (
                                    <Card key={key} className="p-5 rounded-2xl border border-slate-100">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-800 text-lg">{cat.label}</p>
                                                <p className="text-sm text-slate-500 mt-1">{cat.description}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                        Status
                                                    </span>
                                                    <span
                                                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(cat.status)}`}
                                                    >
                                                        {statusLabel(cat.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Progress
                                                </p>
                                                <p className="text-3xl font-black text-slate-700">
                                                    {Math.round(cat.percent)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-rose-400 to-violet-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, cat.percent)}%` }}
                                            />
                                        </div>
                                        <Link
                                            to={EI_CATEGORY_PATHS[key]}
                                            className="inline-flex mt-4 items-center gap-1 text-sm font-bold text-rose-600 hover:text-rose-700"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    <Link
                        to="/student/emotional/assessment"
                        className="text-sm font-bold text-rose-600 hover:underline"
                    >
                        Retake assessment →
                    </Link>
                </>
            )}

            {!loading && !error && profile && profile.activities.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-teal-600" />
                        <h2 className="text-lg font-black text-slate-800">Activities</h2>
                    </div>
                    <div className="grid gap-3">
                        {profile.activities.map((activity) => (
                            <Card
                                key={activity.slug}
                                className={`p-5 rounded-2xl border-2 ${
                                    activity.isRecommended
                                        ? 'border-teal-200 bg-teal-50/50'
                                        : 'border-slate-100 bg-white'
                                }`}
                            >
                                {activity.isRecommended && (
                                    <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mb-2">
                                        Recommended
                                    </span>
                                )}
                                <p className="text-xs font-bold text-teal-700 uppercase">
                                    {activity.dimensionLabel}
                                </p>
                                <p className="font-black text-lg text-slate-800 mt-0.5">{activity.title}</p>
                                <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                                <Link
                                    to={`/student/emotional/activity/${activity.slug}`}
                                    className="inline-flex mt-3 text-sm font-bold text-teal-700 hover:underline"
                                >
                                    Start activity →
                                </Link>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
