import { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PostQuizEmotionFeedbackModal } from '../../components/features/emotional/PostQuizEmotionFeedbackModal';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import type { SubmittedAnswerRow } from '../../api/attempts';
import type { QuizResult, Quiz } from '../../types';
// import Confetti from 'react-confetti';

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

    // Simple feedback logic
    let message = "Good Job!";
    if (percentage === 100) message = "Perfect Score! 🌟";
    else if (percentage >= 80) message = "Awesome! 🚀";
    else if (percentage >= 60) message = "Well Done!";
    else message = "Keep Practicing!";

    return (
        <div className="max-w-3xl mx-auto py-8 text-center space-y-8">
            {showEmotionPrompt && serverAttemptId != null && (
                <PostQuizEmotionFeedbackModal
                    open={emotionPromptOpen}
                    quizAttemptId={serverAttemptId}
                    quizTitle={quiz.title}
                    onComplete={() => setEmotionPromptOpen(false)}
                />
            )}
            {percentage > 70 && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {/* CSS Confetti could go here */}
                </div>
            )}

            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-comic text-blue-600 text-center px-2">
                    {message}
                </h1>
                <p className="text-gray-500 text-lg">You completed {quiz.title}</p>
                {submittedToServer ? (
                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 inline-block mt-2">
                        Saved to your parent dashboard
                    </p>
                ) : (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block mt-2">
                        Saved on this device only — parent login required for server scoring
                    </p>
                )}
            </div>

            <Card className="p-8 inline-block w-full max-w-md bg-gradient-to-br from-white to-blue-50">
                <div className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-2">Your Score</div>
                <div className="text-7xl font-extrabold text-blue-600 mb-4">
                    {result.score}/{result.totalQuestions}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${percentage}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Link to="/student/quizzes">
                        <Button variant="outline" className="w-full">
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Button>
                    </Link>
                    <Link to={`/student/quiz/${quiz.id}`}>
                        <Button className="w-full">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </Link>
                </div>
            </Card>

            <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold ml-2">Review Answers</h3>
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
                        <Card key={q.id} className={`p-4 border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="flex gap-3">
                                <div>
                                    {isCorrect ? <CheckCircle className="text-green-500 w-6 h-6" /> : <XCircle className="text-red-500 w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold mb-2">{idx + 1}. {q.text}</p>
                                    <div className="space-y-1 text-sm">
                                        {q.options.map((opt, optIdx) => (
                                            <div key={optIdx} className={`
                                                px-2 py-1 rounded 
                                                ${(() => {
                                                    const optionId = q.optionIds?.[optIdx];
                                                    const isUserPick =
                                                        optionId !== undefined &&
                                                        selectedOptionId !== null &&
                                                        optionId === selectedOptionId;
                                                    if (isUserPick && isCorrect) {
                                                        return 'bg-green-100 text-green-700 font-medium';
                                                    }
                                                    if (isUserPick && !isCorrect) {
                                                        return 'bg-red-100 text-red-700';
                                                    }
                                                    return 'text-gray-500';
                                                })()}
                                            `}>
                                                {opt}
                                            </div>
                                        ))}
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
