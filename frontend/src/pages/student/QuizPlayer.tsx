import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchQuizById, getQuizzesErrorMessage } from '../../api/quizzes';
import {
    getAttemptErrorMessage,
    mapGradedAnswersByQuestionId,
    startQuizAttempt,
    submitQuizAttempt,
    type QuizAttemptAnswer,
} from '../../api/attempts';
import { resolveActiveChildId } from '../../lib/activeChild';
import { getToken } from '../../lib/tokenStorage';
import { storage } from '../../data/storage';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, Loader2 } from 'lucide-react';
import type { Quiz, QuizResult } from '../../types';

type PersistenceMode = 'server' | 'local';

type QuizSession = {
    mode: PersistenceMode;
    attemptId: number | null;
    childId: number | null;
};

const emptySession: QuizSession = { mode: 'local', attemptId: null, childId: null };

function buildServerAnswers(
    questions: Quiz['questions'],
    selectedAnswers: number[],
    timings: number[],
): QuizAttemptAnswer[] {
    if (selectedAnswers.length !== questions.length) {
        throw new Error(
            `Please answer all questions (${selectedAnswers.length}/${questions.length} saved).`,
        );
    }

    return questions.map((question, idx) => {
        const selectedIndex = selectedAnswers[idx];
        if (selectedIndex === undefined || selectedIndex === null) {
            throw new Error(`Missing answer for question ${idx + 1}.`);
        }

        const optionIds = question.optionIds ?? [];
        const selectedOptionId = optionIds[selectedIndex];
        if (!Number.isFinite(selectedOptionId) || selectedOptionId <= 0) {
            throw new Error(
                'Could not match your answer to the server. Sign in at Parent Login, refresh this page, then try again.',
            );
        }

        const rawSeconds = timings[idx];
        const timeTakenSeconds =
            typeof rawSeconds === 'number' && Number.isFinite(rawSeconds)
                ? Math.min(600, Math.max(1, Math.round(rawSeconds)))
                : 1;

        return {
            question_id: Number(question.id),
            selected_option_id: Number(selectedOptionId),
            time_taken_seconds: timeTakenSeconds,
        };
    });
}

export const QuizPlayer = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>('local');
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [childId, setChildId] = useState<number | null>(null);

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [answerTimings, setAnswerTimings] = useState<number[]>([]);
    const [questionElapsed, setQuestionElapsed] = useState(0);

    const questionStartedAtRef = useRef(Date.now());
    const initInFlightRef = useRef(false);
    const sessionRef = useRef<QuizSession>(emptySession);
    const finishInFlightRef = useRef(false);

    const syncSessionRef = useCallback((session: QuizSession) => {
        sessionRef.current = session;
    }, []);

    useEffect(() => {
        syncSessionRef({ mode: persistenceMode, attemptId, childId });
    }, [persistenceMode, attemptId, childId, syncSessionRef]);

    const initializeQuizSession = useCallback(async () => {
        if (initInFlightRef.current) {
            return;
        }
        initInFlightRef.current = true;

        if (!quizId) {
            setLoadError('Quiz not found.');
            setQuiz(null);
            setIsLoading(false);
            initInFlightRef.current = false;
            return;
        }

        setIsLoading(true);
        setLoadError(null);
        setSubmitError(null);
        setAttemptId(null);
        setChildId(null);
        setPersistenceMode('local');
        syncSessionRef(emptySession);
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setAnswers([]);
        setAnswerTimings([]);

        try {
            const token = getToken();

            if (!token) {
                const data = await fetchQuizById(quizId);
                setQuiz(data);
                setPersistenceMode('local');
                syncSessionRef(emptySession);
                return;
            }

            const resolvedChildId = await resolveActiveChildId();
            if (!resolvedChildId) {
                setLoadError(
                    'No child profile is linked to this parent account. Sign in at Parent Login (parent@demo.com / password123), run npm run db:seed in backend, then try again.',
                );
                setQuiz(null);
                return;
            }

            setChildId(resolvedChildId);

            const [meta, attemptSession] = await Promise.all([
                fetchQuizById(quizId),
                startQuizAttempt(quizId, resolvedChildId),
            ]);

            const serverSession: QuizSession = {
                mode: 'server',
                attemptId: attemptSession.attemptId,
                childId: resolvedChildId,
            };

            setAttemptId(attemptSession.attemptId);
            setQuiz({
                ...meta,
                questions: attemptSession.questions,
            });
            setPersistenceMode('server');
            syncSessionRef(serverSession);
        } catch (error) {
            setLoadError(getQuizzesErrorMessage(error) || getAttemptErrorMessage(error));
            setQuiz(null);
            syncSessionRef(emptySession);
        } finally {
            initInFlightRef.current = false;
            setIsLoading(false);
        }
    }, [quizId, syncSessionRef]);

    useEffect(() => {
        void initializeQuizSession();
        return () => {
            initInFlightRef.current = false;
        };
    }, [initializeQuizSession]);

    useEffect(() => {
        questionStartedAtRef.current = Date.now();
        setSelectedOption(null);
        setQuestionElapsed(0);

        const tick = window.setInterval(() => {
            setQuestionElapsed(
                Math.max(1, Math.round((Date.now() - questionStartedAtRef.current) / 1000)),
            );
        }, 1000);

        return () => window.clearInterval(tick);
    }, [currentQuestionIdx]);

    const completeQuiz = useCallback(
        async (finalAnswers: number[], finalTimings: number[]) => {
            if (!quiz) {
                throw new Error('Quiz is not loaded.');
            }

            const session = sessionRef.current;
            const token = getToken();

            if (session.mode === 'server' && session.attemptId && session.childId) {
                const payload = buildServerAnswers(quiz.questions, finalAnswers, finalTimings);
                const attempt = await submitQuizAttempt(session.attemptId, payload);

                const result: QuizResult = {
                    id: String(attempt.id),
                    studentId: String(session.childId),
                    quizType: quiz.type,
                    score: attempt.score,
                    totalQuestions: attempt.total_points,
                    date: new Date().toISOString(),
                    answers: finalAnswers,
                };

                navigate('/student/quiz/result', {
                    state: {
                        result,
                        quiz,
                        submittedToServer: true,
                        serverAttemptId: attempt.id,
                        gradedByQuestionId: mapGradedAnswersByQuestionId(attempt.answers),
                    },
                    replace: true,
                });
                return;
            }

            if (token) {
                throw new Error(
                    session.mode !== 'server' || !session.attemptId
                        ? 'Could not save to the server. Sign in at Parent Login (parent@demo.com), refresh this quiz page, then finish again.'
                        : 'Could not submit your answers. Refresh and try again.',
                );
            }

            const score = finalAnswers.reduce((acc, ans, idx) => {
                return acc + (ans === quiz.questions[idx].correctIndex ? 1 : 0);
            }, 0);

            const result: QuizResult = {
                id: `r-${Date.now()}`,
                studentId: user?.id || 'guest',
                quizType: quiz.type,
                score,
                totalQuestions: quiz.questions.length,
                date: new Date().toISOString(),
                answers: finalAnswers,
            };

            storage.saveResult(result);
            navigate('/student/quiz/result', {
                state: { result, quiz, submittedToServer: false },
                replace: true,
            });
        },
        [navigate, quiz, user?.id],
    );

    if (isLoading) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center py-24 text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="font-medium">Loading quiz...</p>
            </motion.div>
        );
    }

    if (loadError || !quiz) {
        return (
            <motion.div className="max-w-lg mx-auto py-16 text-center space-y-4">
                <p className="text-red-600 font-medium" role="alert">
                    {loadError ?? 'Quiz not found'}
                </p>
                <Link to="/student/quizzes">
                    <Button variant="outline">Back to Quizzes</Button>
                </Link>
            </motion.div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;

    const handleNext = async () => {
        if (selectedOption === null || !currentQuestion || finishInFlightRef.current) {
            return;
        }

        const elapsedSeconds = Math.max(
            1,
            Math.round((Date.now() - questionStartedAtRef.current) / 1000),
        );
        const newAnswers = [...answers, selectedOption];
        const newTimings = [...answerTimings, elapsedSeconds];

        if (!isLastQuestion) {
            setAnswers(newAnswers);
            setAnswerTimings(newTimings);
            setCurrentQuestionIdx((prev) => prev + 1);
            return;
        }

        finishInFlightRef.current = true;
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await completeQuiz(newAnswers, newTimings);
        } catch (error) {
            setSubmitError(getAttemptErrorMessage(error));
        } finally {
            finishInFlightRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-w-0 max-w-2xl mx-auto space-y-4 sm:space-y-6 py-4 px-4 sm:px-6 md:px-8 relative text-slate-900">
            {isSubmitting && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm"
                    role="status"
                    aria-live="polite"
                >
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className="text-lg font-semibold text-slate-800">Submitting your answers...</p>
                    <p className="text-sm text-slate-500 mt-1">Please wait for your score.</p>
                </motion.div>
            )}

            {persistenceMode === 'local' && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                    Playing offline — results will save on this device only. For database scoring, sign in at{' '}
                    <Link to="/parent/login" className="font-semibold underline">
                        Parent Login
                    </Link>{' '}
                    first, then open this quiz again.
                </p>
            )}

            {persistenceMode === 'server' && attemptId && (
                <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                    Quiz linked to your parent account — answers will save when you tap Finish Quiz.
                </p>
            )}

            <motion.div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-slate-600 font-semibold text-sm min-w-0">
                <span className="shrink-0">
                    Question {currentQuestionIdx + 1}/{quiz.questions.length}
                </span>
                <span className="text-slate-800 truncate">{quiz.title}</span>
            </motion.div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                        width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%`,
                    }}
                />
            </div>

            <Card className="p-4 sm:p-6 md:p-8 min-h-[min(400px,70dvh)] flex flex-col justify-between bg-white shadow-md border-slate-200">
                <div>
                    <motion.div className="flex items-center justify-between gap-3 mb-6">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                            <Clock className="w-4 h-4" />
                            {questionElapsed}s on this question
                        </span>
                    </motion.div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 leading-relaxed text-slate-900 break-words">
                        {currentQuestion.text}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedOption(idx)}
                                disabled={isSubmitting}
                                className={`w-full min-h-12 p-3.5 sm:p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between gap-3
                             ${
                                 selectedOption === idx
                                     ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                     : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/50'
                             }`}
                            >
                                <span className="font-semibold text-base sm:text-lg break-words min-w-0">
                                    {option}
                                </span>
                                {selectedOption === idx && (
                                    <CheckCircle className="w-6 h-6 text-blue-600 shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {submitError && (
                    <p className="text-sm text-red-600 font-medium mt-4" role="alert">
                        {submitError}
                    </p>
                )}

                <div className="mt-8 flex justify-end">
                    <Button
                        type="button"
                        onClick={() => void handleNext()}
                        disabled={selectedOption === null || isSubmitting}
                        size="lg"
                        className="w-full md:w-auto !bg-blue-600 hover:!bg-blue-700 !text-white disabled:!bg-slate-300 disabled:!text-slate-600 disabled:opacity-100"
                    >
                        {isSubmitting
                            ? 'Submitting...'
                            : isLastQuestion
                              ? 'Finish Quiz'
                              : 'Next Question'}
                        {!isLastQuestion && !isSubmitting && (
                            <ArrowRight className="w-5 h-5 ml-2" />
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

