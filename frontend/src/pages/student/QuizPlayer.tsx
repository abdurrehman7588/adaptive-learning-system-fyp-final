import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchQuizById, getQuizzesErrorMessage } from '../../api/quizzes';
import {
    getAttemptErrorMessage,
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
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import type { Quiz, QuizResult } from '../../types';

type PersistenceMode = 'server' | 'local';

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
    const initInFlightRef = useRef(false);

    const initializeQuizSession = useCallback(async () => {
        if (initInFlightRef.current) {
            return;
        }
        initInFlightRef.current = true;
        if (!quizId) {
            setLoadError('Quiz not found.');
            setQuiz(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setLoadError(null);
        setSubmitError(null);
        setAttemptId(null);
        setChildId(null);
        setPersistenceMode('local');
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setAnswers([]);

        try {
            const token = getToken();

            if (!token) {
                const data = await fetchQuizById(quizId);
                setQuiz(data);
                setPersistenceMode('local');
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

            setAttemptId(attemptSession.attemptId);
            setQuiz({
                ...meta,
                questions: attemptSession.questions,
            });
            setPersistenceMode('server');
        } catch (error) {
            setLoadError(getQuizzesErrorMessage(error) || getAttemptErrorMessage(error));
            setQuiz(null);
        } finally {
            initInFlightRef.current = false;
            setIsLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        void initializeQuizSession();
        return () => {
            initInFlightRef.current = false;
        };
    }, [initializeQuizSession]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="font-medium">Loading quiz...</p>
            </div>
        );
    }

    if (loadError || !quiz) {
        return (
            <div className="max-w-lg mx-auto py-16 text-center space-y-4">
                <p className="text-red-600 font-medium" role="alert">
                    {loadError ?? 'Quiz not found'}
                </p>
                <Link to="/student/quizzes">
                    <Button variant="outline">Back to Quizzes</Button>
                </Link>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;

    const buildServerAnswers = (selectedAnswers: number[]): QuizAttemptAnswer[] =>
        quiz.questions.map((question, idx) => {
            const selectedIndex = selectedAnswers[idx];
            const selectedOptionId = question.optionIds?.[selectedIndex];
            if (selectedOptionId === undefined) {
                throw new Error('Could not match your answer to the server.');
            }
            return {
                question_id: Number(question.id),
                selected_option_id: selectedOptionId,
            };
        });

    const handleNext = async () => {
        if (selectedOption === null || !currentQuestion) return;

        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);

        if (!isLastQuestion) {
            setCurrentQuestionIdx((prev) => prev + 1);
            setSelectedOption(null);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            if (persistenceMode === 'server' && attemptId && childId) {
                const payload = buildServerAnswers(newAnswers);
                const attempt = await submitQuizAttempt(attemptId, payload);

                const result: QuizResult = {
                    id: String(attempt.id),
                    studentId: String(childId),
                    quizType: quiz.type,
                    score: attempt.score,
                    totalQuestions: attempt.total_points,
                    date: new Date().toISOString(),
                    answers: newAnswers,
                };

                navigate('/student/quiz/result', { state: { result, quiz } });
                return;
            }

            if (getToken()) {
                setSubmitError(
                    persistenceMode !== 'server' || !attemptId
                        ? 'Could not save to the server. Sign in at Parent Login (parent@demo.com), refresh this quiz page, then finish again.'
                        : 'Could not submit your answers. Refresh and try again.',
                );
                setAnswers(newAnswers.slice(0, -1));
                return;
            }

            const score = newAnswers.reduce((acc, ans, idx) => {
                return acc + (ans === quiz.questions[idx].correctIndex ? 1 : 0);
            }, 0);

            const result: QuizResult = {
                id: `r-${Date.now()}`,
                studentId: user?.id || 'guest',
                quizType: quiz.type,
                score,
                totalQuestions: quiz.questions.length,
                date: new Date().toISOString(),
                answers: newAnswers,
            };

            storage.saveResult(result);
            navigate('/student/quiz/result', { state: { result, quiz } });
        } catch (error) {
            setSubmitError(getAttemptErrorMessage(error));
            setAnswers(newAnswers.slice(0, -1));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
            {persistenceMode === 'local' && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                    Playing offline — results will save on this device only. For database scoring, sign in at{' '}
                    <Link to="/parent/login" className="font-semibold underline">
                        Parent Login
                    </Link>{' '}
                    first, then open this quiz again.
                </p>
            )}

            <div className="flex items-center justify-between text-gray-500 font-medium">
                <span>
                    Question {currentQuestionIdx + 1}/{quiz.questions.length}
                </span>
                <span>{quiz.title}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                        width: `${(currentQuestionIdx / quiz.questions.length) * 100}%`,
                    }}
                />
            </div>

            <Card className="p-6 md:p-8 min-h-[400px] flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-8 leading-relaxed">{currentQuestion.text}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedOption(idx)}
                                disabled={isSubmitting}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between group
                             ${
                                 selectedOption === idx
                                     ? 'border-blue-500 bg-blue-50 text-blue-700'
                                     : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                             }`}
                            >
                                <span className="font-medium text-lg">{option}</span>
                                {selectedOption === idx && (
                                    <CheckCircle className="w-6 h-6 text-blue-500" />
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
                        onClick={() => void handleNext()}
                        disabled={selectedOption === null || isSubmitting}
                        size="lg"
                        className="w-full md:w-auto"
                    >
                        {isSubmitting
                            ? 'Saving...'
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
