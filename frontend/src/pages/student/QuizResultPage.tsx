import { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PostQuizEmotionFeedbackModal } from '../../components/features/emotional/PostQuizEmotionFeedbackModal';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import type { SubmittedAnswerRow } from '../../api/attempts';
import type { QuizResult, Quiz } from '../../types';
import { pageShell } from '../../lib/responsive';

export const QuizResultPage = () => {
    const location = useLocation();
    const state = location.state as {
        result: QuizResult;
        quiz: Quiz;
        submittedToServer?: boolean;
        serverAttemptId?: number;
        gradedByQuestionId?: Record<string, SubmittedAnswerRow>;
    } | null;

    const showEmotionPrompt = Boolean(
        state?.submittedToServer && typeof state.serverAttemptId === 'number',
    );
    const [emotionPromptOpen, setEmotionPromptOpen] = useState(showEmotionPrompt);

    if (!state) return <Navigate to="/student/quizzes" />;

    const {
        result,
        quiz,
        submittedToServer = false,
        serverAttemptId,
        gradedByQuestionId = {},
    } = state;
    const percentage = Math.round((result.score / result.totalQuestions) * 100);

    let message = 'Good Job!';
    if (percentage === 100) message = 'Perfect Score! 🌟';
    else if (percentage >= 80) message = 'Awesome! 🚀';
    else if (percentage >= 60) message = 'Well Done!';
    else message = 'Keep Practicing!';

    return (
        <div className={`${pageShell} max-w-3xl space-y-6 sm:space-y-8 text-center pb-8`}>
            {showEmotionPrompt && serverAttemptId != null && (
                <PostQuizEmotionFeedbackModal
                    open={emotionPromptOpen}
                    quizAttemptId={serverAttemptId}
                    quizTitle={quiz.title}
                    onComplete={() => setEmotionPromptOpen(false)}
                />
            )}

            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-comic text-blue-600 px-1 break-words">
                    {message}
                </h1>
                <p className="text-slate-500 text-base sm:text-lg break-words px-1">
                    You completed {quiz.title}
                </p>
                {submittedToServer ? (
                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 inline-block mt-2 max-w-full">
                        Saved to your parent dashboard
                    </p>
                ) : (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block mt-2 max-w-full text-left sm:text-center">
                        Saved on this device only — parent login required for server scoring
                    </p>
                )}
            </div>

            <Card className="p-5 sm:p-8 w-full max-w-md mx-auto bg-gradient-to-br from-white to-blue-50">
                <div className="text-slate-500 font-medium uppercase tracking-wide text-xs sm:text-sm mb-2">
                    Your Score
                </div>
                <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-blue-600 mb-4 leading-none">
                    {result.score}/{result.totalQuestions}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                    <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Link to="/student/quizzes" className="w-full">
                        <Button variant="outline" className="w-full min-h-11">
                            <Home className="w-4 h-4 mr-2 shrink-0" />
                            Home
                        </Button>
                    </Link>
                    <Link to={`/student/quiz/${quiz.id}`} className="w-full">
                        <Button className="w-full min-h-11">
                            <RotateCcw className="w-4 h-4 mr-2 shrink-0" />
                            Retry
                        </Button>
                    </Link>
                </div>
            </Card>

            <div className="space-y-4 text-left w-full min-w-0">
                <h3 className="text-lg sm:text-xl font-bold px-1">Review Answers</h3>
                {quiz.questions.map((q, idx) => {
                    const userAnswerIdx = result.answers[idx];
                    const graded = gradedByQuestionId[q.id];
                    const isCorrect = graded
                        ? graded.is_correct
                        : userAnswerIdx === q.correctIndex;
                    const selectedOptionId =
                        graded?.selected_option_id ??
                        (q.optionIds?.[userAnswerIdx] !== undefined
                            ? q.optionIds[userAnswerIdx]
                            : null);

                    return (
                        <Card
                            key={q.id}
                            className={`p-4 sm:p-5 border-l-4 min-w-0 ${
                                isCorrect ? 'border-green-500' : 'border-red-500'
                            }`}
                        >
                            <div className="flex gap-3 min-w-0">
                                <div className="shrink-0 pt-0.5">
                                    {isCorrect ? (
                                        <CheckCircle className="text-green-500 w-6 h-6" />
                                    ) : (
                                        <XCircle className="text-red-500 w-6 h-6" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold mb-2 break-words text-sm sm:text-base">
                                        {idx + 1}. {q.text}
                                    </p>
                                    <div className="space-y-1.5 text-sm">
                                        {q.options.map((opt, optIdx) => {
                                            const optionId = q.optionIds?.[optIdx];
                                            const isUserPick =
                                                optionId !== undefined &&
                                                selectedOptionId !== null &&
                                                optionId === selectedOptionId;
                                            let optionClass = 'text-slate-500';
                                            if (isUserPick && isCorrect) {
                                                optionClass =
                                                    'bg-green-100 text-green-700 font-medium';
                                            } else if (isUserPick && !isCorrect) {
                                                optionClass = 'bg-red-100 text-red-700';
                                            }
                                            return (
                                                <div
                                                    key={optIdx}
                                                    className={`px-2.5 py-2 rounded break-words ${optionClass}`}
                                                >
                                                    {opt}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
