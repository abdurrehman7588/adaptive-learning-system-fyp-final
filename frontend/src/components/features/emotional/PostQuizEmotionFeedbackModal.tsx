import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import {
    EMOTION_FEEDBACK_OPTIONS,
    getEmotionFeedbackErrorMessage,
    submitQuizEmotionFeedback,
    type EmotionFeedbackSlug,
} from '../../../api/emotionFeedback';
import { cn } from '../../../lib/utils';

type PostQuizEmotionFeedbackModalProps = {
    open: boolean;
    quizAttemptId: number;
    quizTitle?: string;
    onComplete: () => void;
};

/**
 * Optional post-quiz emotional check-in.
 *
 * - Shown only after a server-graded quiz completes successfully.
 * - Skip stores nothing; recommendations fall back to SDQ baseline or neutral score (50).
 * - When submitted, latest feedback takes priority over SDQ in adaptive scoring.
 */
export function PostQuizEmotionFeedbackModal({
    open,
    quizAttemptId,
    quizTitle,
    onComplete,
}: PostQuizEmotionFeedbackModalProps) {
    const [selected, setSelected] = useState<EmotionFeedbackSlug | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSkip = () => {
        onComplete();
    };

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true);
        setError(null);
        try {
            await submitQuizEmotionFeedback(quizAttemptId, selected);
            setSubmitted(true);
            window.setTimeout(() => onComplete(), 900);
        } catch (err) {
            setError(getEmotionFeedbackErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="post-quiz-emotion-title"
                >
                    <motion.div
                        className="w-full max-w-lg rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50 shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    >
                        <div className="p-5 sm:p-6 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="rounded-2xl bg-white p-3 shadow-sm shrink-0">
                                        <Heart className="w-7 h-7 text-rose-500" aria-hidden />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                                            Optional check-in
                                        </p>
                                        <h2
                                            id="post-quiz-emotion-title"
                                            className="text-lg sm:text-xl font-black text-slate-800 leading-snug"
                                        >
                                            How did you feel while solving this quiz?
                                        </h2>
                                        {quizTitle && (
                                            <p className="text-sm text-slate-500 mt-1 truncate">{quizTitle}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors shrink-0"
                                    aria-label="Skip emotional feedback"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed">
                                This is optional — tap how you felt or press Skip. Your answer helps us pick the
                                right next quiz. If you skip, we use your regular emotional profile or a neutral
                                setting.
                            </p>

                            {submitted ? (
                                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-6 text-center">
                                    <p className="text-4xl mb-2" aria-hidden>
                                        💚
                                    </p>
                                    <p className="font-bold text-emerald-800">Thanks for sharing!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {EMOTION_FEEDBACK_OPTIONS.map((option) => {
                                        const isSelected = selected === option.slug;
                                        return (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                onClick={() => setSelected(option.slug)}
                                                className={cn(
                                                    'rounded-2xl border-2 px-4 py-4 text-left transition-all',
                                                    'bg-white/90 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
                                                    isSelected
                                                        ? 'border-violet-500 shadow-md ring-2 ring-violet-200'
                                                        : 'border-slate-200',
                                                )}
                                            >
                                                <span className="text-4xl sm:text-5xl block mb-2" aria-hidden>
                                                    {option.emoji}
                                                </span>
                                                <span className="text-sm sm:text-base font-bold text-slate-800 block">
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {error && (
                                <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                                    {error}
                                </p>
                            )}

                            {!submitted && (
                                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:flex-1"
                                        onClick={handleSkip}
                                        disabled={submitting}
                                    >
                                        Skip
                                    </Button>
                                    <Button
                                        type="button"
                                        className="w-full sm:flex-1"
                                        onClick={() => void handleSubmit()}
                                        disabled={!selected || submitting}
                                    >
                                        {submitting ? 'Saving…' : 'Share how I felt'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
