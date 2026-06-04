import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    completeEmotionalActivity,
    fetchMyEmotionalProfile,
    getEmotionalErrorMessage,
    type EIActivity,
    type EIReason,
    type EIFeeling,
    type EIOption,
} from '../../api/emotional';

type FeelingsStep = 1 | 2 | 3;

export const EmotionalActivityPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [activity, setActivity] = useState<EIActivity | null>(null);
    const [feelingsOptions, setFeelingsOptions] = useState<EIOption[]>([]);
    const [reasonOptions, setReasonOptions] = useState<EIOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [xpAwarded, setXpAwarded] = useState(0);

    const [feelingsStep, setFeelingsStep] = useState<FeelingsStep>(1);
    const [feeling, setFeeling] = useState<EIFeeling | ''>('');
    const [reason, setReason] = useState<EIReason | ''>('');
    const [answer, setAnswer] = useState('');

    const loadActivity = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const profile = await fetchMyEmotionalProfile();
            const match = profile.activities.find((a) => a.slug === slug);
            if (!match) {
                setError('Activity not found.');
                return;
            }
            setActivity(match);
            setFeelingsOptions(profile.feelingsOptions);
            setReasonOptions(profile.reasonOptions);
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        void loadActivity();
    }, [loadActivity]);

    const handleFeelingSelect = (value: EIFeeling) => {
        setFeeling(value);
        setFeelingsStep(2);
    };

    const handleReasonSelect = (value: EIReason) => {
        setReason(value);
        setFeelingsStep(3);
    };

    const handleSubmit = async () => {
        if (!activity || !slug) return;
        setSubmitting(true);
        setError(null);
        try {
            const payload =
                activity.type === 'feelings_journal'
                    ? { feeling: feeling as EIFeeling, reason: reason as EIReason }
                    : { answer };
            const result = await completeEmotionalActivity(slug, payload);
            setResultMessage(result.message);
            setXpAwarded(result.xpAwarded);
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmitScenario = Boolean(answer);
    const canSubmitFeelings = feelingsStep === 3 && feeling && reason;

    return (
        <div className="space-y-6 pb-8 p-6 md:p-8 font-sans max-w-xl mx-auto">
            <Link
                to="/student/emotional"
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-teal-600"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
            </Link>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading activity…
                </div>
            )}

            {error && (
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <p className="text-orange-700 text-sm">{error}</p>
                </Card>
            )}

            {!loading && activity && !resultMessage && (
                <>
                    <header>
                        <p className="text-sm font-bold text-teal-700">{activity.dimensionLabel}</p>
                        <h1 className="text-3xl font-black text-slate-800 mt-1">{activity.title}</h1>
                        <p className="text-slate-500 mt-2">{activity.description}</p>
                    </header>

                    <Card className="p-6 rounded-3xl border-2 border-teal-100">
                        {activity.type === 'feelings_journal' && (
                            <div className="space-y-6">
                                {feelingsStep >= 1 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                                            Step 1
                                        </p>
                                        <p className="font-bold text-slate-800 mb-3">
                                            How do you feel today?
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {feelingsOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        handleFeelingSelect(opt.value as EIFeeling)
                                                    }
                                                    className={`py-3 px-2 rounded-xl font-bold border transition-colors ${
                                                        feeling === opt.value
                                                            ? 'bg-teal-600 text-white border-teal-600'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                                                    }`}
                                                >
                                                    <span className="text-xl mr-1">{opt.emoji}</span>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {feelingsStep >= 2 && feeling && (
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                                            Step 2
                                        </p>
                                        <p className="font-bold text-slate-800 mb-3">
                                            What influenced this feeling?
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {reasonOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        handleReasonSelect(opt.value as EIReason)
                                                    }
                                                    className={`py-3 px-2 rounded-xl font-bold border text-sm transition-colors ${
                                                        reason === opt.value
                                                            ? 'bg-teal-600 text-white border-teal-600'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                                                    }`}
                                                >
                                                    <span className="block text-lg">{opt.emoji}</span>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {feelingsStep === 3 && feeling && reason && (
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                                            Step 3
                                        </p>
                                        <p className="text-slate-700 mb-4">
                                            You feel <strong>{feeling}</strong> because of{' '}
                                            <strong>{reason}</strong>.
                                        </p>
                                        <Button
                                            className="w-full py-5 font-black rounded-2xl"
                                            disabled={!canSubmitFeelings || submitting}
                                            onClick={() => void handleSubmit()}
                                        >
                                            {submitting ? 'Saving…' : 'Complete activity'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activity.type === 'scenario' && activity.options && (
                            <div className="space-y-4">
                                <p className="font-bold text-slate-800 text-lg">{activity.scenario}</p>
                                <div className="space-y-2">
                                    {activity.options.map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setAnswer(opt.key)}
                                            className={`w-full text-left py-3 px-4 rounded-xl font-bold border transition-colors ${
                                                answer === opt.key
                                                    ? 'bg-teal-600 text-white border-teal-600'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                                            }`}
                                        >
                                            {opt.key}. {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    className="w-full mt-4 py-5 font-black rounded-2xl"
                                    disabled={!canSubmitScenario || submitting}
                                    onClick={() => void handleSubmit()}
                                >
                                    {submitting ? 'Saving…' : 'Complete activity'}
                                </Button>
                            </div>
                        )}
                    </Card>
                </>
            )}

            {resultMessage && (
                <Card className="p-8 rounded-3xl border-2 border-emerald-200 bg-emerald-50 text-center">
                    <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="font-black text-xl text-slate-800">{resultMessage}</p>
                    {xpAwarded > 0 && (
                        <p className="text-emerald-700 font-bold mt-2">
                            +{xpAwarded} XP added to your rewards!
                        </p>
                    )}
                    <Button className="mt-6" onClick={() => navigate('/student/emotional')}>
                        Back to profile
                    </Button>
                </Card>
            )}
        </div>
    );
};
