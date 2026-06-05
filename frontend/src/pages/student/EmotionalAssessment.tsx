import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    fetchMyEmotionalProfile,
    getEmotionalErrorMessage,
    submitEmotionalAssessment,
    assessmentCategoryProgressLabel,
    previewCategoryScore,
    statusColor,
    statusLabel,
    type AssessmentResponse,
    type EIQuestion,
    type EIQuestionnaire,
    type EIQuestionnaireDimension,
    type EmotionalDimension,
} from '../../api/emotional';

const DIMENSION_ORDER: EmotionalDimension[] = ['self_awareness', 'empathy', 'self_regulation'];

const CATEGORY_CARD_META: Record<
    EmotionalDimension,
    { description: string; borderClass: string; headerClass: string; accentClass: string }
> = {
    self_awareness: {
        description: 'Noticing and naming your own feelings.',
        borderClass: 'border-rose-200 bg-gradient-to-br from-rose-50/80 to-white',
        headerClass: 'text-rose-700',
        accentClass: 'bg-rose-500 border-rose-500',
    },
    empathy: {
        description: 'Understanding and caring about how others feel.',
        borderClass: 'border-sky-200 bg-gradient-to-br from-sky-50/80 to-white',
        headerClass: 'text-sky-700',
        accentClass: 'bg-sky-600 border-sky-600',
    },
    self_regulation: {
        description: 'Staying calm and making thoughtful choices.',
        borderClass: 'border-violet-200 bg-gradient-to-br from-violet-50/80 to-white',
        headerClass: 'text-violet-700',
        accentClass: 'bg-violet-600 border-violet-600',
    },
};

export const EmotionalAssessmentPage = () => {
    const navigate = useNavigate();
    const [questionnaire, setQuestionnaire] = useState<EIQuestionnaire | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [openCategory, setOpenCategory] = useState<EmotionalDimension | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadQuestionnaire = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const profile = await fetchMyEmotionalProfile();
            setQuestionnaire(profile.questionnaire);
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadQuestionnaire();
    }, [loadQuestionnaire]);

    const dimensionsByKey = useMemo((): Map<EmotionalDimension, EIQuestionnaireDimension> => {
        if (!questionnaire) {
            return new Map<EmotionalDimension, EIQuestionnaireDimension>();
        }
        return new Map(
            questionnaire.dimensions.map((d) => [d.dimension, d] as const),
        );
    }, [questionnaire]);

    const allQuestions = useMemo((): EIQuestion[] => {
        if (!questionnaire) return [];
        return questionnaire.dimensions.flatMap((dim) => dim.questions);
    }, [questionnaire]);

    const answeredCount = allQuestions.filter((q) => {
        const key = `${q.dimension}:${q.questionIndex}`;
        return answers[key] != null;
    }).length;

    const handleSelect = (
        dimension: EmotionalDimension,
        questionIndex: number,
        value: number,
    ) => {
        setAnswers((prev) => ({ ...prev, [`${dimension}:${questionIndex}`]: value }));
    };

    const countAnsweredInDimension = (
        dimension: EmotionalDimension,
        questionCount: number,
    ) => {
        let count = 0;
        for (let i = 0; i < questionCount; i += 1) {
            if (answers[`${dimension}:${i}`] != null) count += 1;
        }
        return count;
    };

    const toggleCategory = (dimension: EmotionalDimension) => {
        setOpenCategory((current) => (current === dimension ? null : dimension));
    };

    const handleSubmit = async () => {
        if (!questionnaire || answeredCount < allQuestions.length) return;
        setSubmitting(true);
        setError(null);
        try {
            const responses: AssessmentResponse[] = allQuestions.map((q) => ({
                dimension: q.dimension,
                questionIndex: q.questionIndex,
                value: answers[`${q.dimension}:${q.questionIndex}`],
            }));
            await submitEmotionalAssessment(responses);
            navigate('/student/emotional');
        } catch (err) {
            setError(getEmotionalErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full min-w-0 max-w-3xl mx-auto space-y-6 pb-8 px-4 py-5 sm:px-6 sm:py-6 md:px-8 font-sans">
            <Link
                to="/student/emotional"
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-rose-600"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
            </Link>

            <header>
                <h1 className="text-3xl font-black text-slate-800">EI Assessment</h1>
                <p className="text-slate-500 mt-1">
                    Tap a category card to open the questions. Answer all 12 to finish.
                </p>
            </header>

            {!loading && questionnaire && allQuestions.length > 0 && (
                <Card className="p-5 rounded-2xl border-2 border-slate-100 bg-white">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm font-bold text-slate-700">Overall progress</p>
                        <p className="text-sm font-black text-slate-800">
                            {answeredCount} / {allQuestions.length}
                        </p>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-rose-400 via-sky-400 to-violet-500 rounded-full transition-all duration-300"
                            style={{
                                width: `${Math.round((answeredCount / allQuestions.length) * 100)}%`,
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {answeredCount === allQuestions.length
                            ? 'All categories complete — you can submit!'
                            : `${allQuestions.length - answeredCount} question(s) remaining`}
                    </p>
                </Card>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading questions…
                </div>
            )}

            {error && (
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <p className="text-orange-700 text-sm">{error}</p>
                </Card>
            )}

            {!loading && questionnaire && (
                <div className="space-y-4">
                    {DIMENSION_ORDER.map((dimensionKey) => {
                        const dim = dimensionsByKey.get(dimensionKey);
                        if (!dim) return null;

                        const meta = CATEGORY_CARD_META[dim.dimension];
                        const isOpen = openCategory === dim.dimension;
                        const dimAnswered = countAnsweredInDimension(
                            dim.dimension,
                            dim.questions.length,
                        );
                        const dimComplete = dimAnswered === dim.questions.length;
                        const progressMeta = assessmentCategoryProgressLabel(
                            dimAnswered,
                            dim.questions.length,
                        );
                        const scorePreview = previewCategoryScore(
                            answers,
                            dim.dimension,
                            dim.questions.length,
                        );
                        const progressPercent = Math.round(
                            (dimAnswered / dim.questions.length) * 100,
                        );

                        return (
                            <Card
                                key={dim.dimension}
                                className={`rounded-3xl border-2 shadow-sm overflow-hidden transition-shadow ${meta.borderClass} ${
                                    isOpen ? 'ring-2 ring-offset-2 ring-slate-200' : ''
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(dim.dimension)}
                                    className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-3 hover:opacity-95 transition-opacity"
                                    aria-expanded={isOpen}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className={`text-xl font-black ${meta.headerClass}`}>
                                                {dim.label}
                                            </h2>
                                            {dimComplete && (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{meta.description}</p>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase text-slate-400">
                                                    Status
                                                </span>
                                                <span
                                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${progressMeta.colorClass}`}
                                                >
                                                    {progressMeta.label}
                                                </span>
                                                {scorePreview && (
                                                    <>
                                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                                            Score preview
                                                        </span>
                                                        <span
                                                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColor(scorePreview.status)}`}
                                                        >
                                                            {Math.round(scorePreview.percent)}% ·{' '}
                                                            {statusLabel(scorePreview.status)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                    <span>Progress</span>
                                                    <span>
                                                        {dimAnswered}/{dim.questions.length} (
                                                        {progressPercent}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-white/80 rounded-full overflow-hidden border border-slate-100">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${meta.accentClass.split(' ')[0]}`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {!isOpen && (
                                            <p className="text-xs font-bold text-slate-500 mt-3">
                                                Tap to open {dim.questions.length} questions →
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span
                                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                                dimComplete
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                    : 'bg-white/80 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            {dimAnswered}/{dim.questions.length}
                                        </span>
                                        {isOpen ? (
                                            <ChevronUp className="w-6 h-6 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-white/60">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 py-4">
                                            How often is each statement true for you? · Never · Sometimes ·
                                            Often · Always
                                        </p>
                                        <div className="space-y-4">
                                            {dim.questions.map((q: EIQuestion) => {
                                                const key = `${q.dimension}:${q.questionIndex}`;
                                                return (
                                                    <div
                                                        key={key}
                                                        className={`rounded-2xl border p-4 shadow-sm ${
                                                            answers[key] != null
                                                                ? 'border-emerald-100 bg-emerald-50/30'
                                                                : 'border-slate-100 bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2 mb-3">
                                                            <p className="font-medium text-slate-800">
                                                                {q.questionIndex + 1}. {q.text}
                                                            </p>
                                                            {answers[key] != null && (
                                                                <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                                                                    Answered
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                            {questionnaire.scale.map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleSelect(
                                                                            q.dimension,
                                                                            q.questionIndex,
                                                                            opt.value,
                                                                        )
                                                                    }
                                                                    className={`text-sm font-bold py-2.5 px-2 rounded-xl border transition-colors ${
                                                                        answers[key] === opt.value
                                                                            ? `${meta.accentClass} text-white`
                                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                                                    }`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setOpenCategory(null)}
                                            className="mt-4 text-sm font-bold text-slate-500 hover:text-slate-700"
                                        >
                                            Close card
                                        </button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    <Button
                        className="w-full py-6 text-lg font-black rounded-2xl mt-2"
                        disabled={answeredCount < allQuestions.length || submitting}
                        onClick={() => void handleSubmit()}
                    >
                        {submitting
                            ? 'Saving…'
                            : answeredCount < allQuestions.length
                              ? `Complete all categories (${answeredCount}/12)`
                              : 'Submit assessment'}
                    </Button>
                </div>
            )}
        </div>
    );
};
