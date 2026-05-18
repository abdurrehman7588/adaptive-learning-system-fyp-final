import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { fetchQuizzes, getQuizzesErrorMessage } from '../../api/quizzes';
import { getToken } from '../../lib/tokenStorage';
import type { Quiz } from '../../types';
import { Brain, Globe, Zap, Rocket, Star, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

function getQuestionCount(quiz: Quiz): number {
    return quiz.questionCount ?? quiz.questions.length;
}

export const QuizList = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadQuizzes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (!getToken()) {
            setQuizzes([]);
            setError(
                'Quizzes load from the server after a parent signs in. Go to Parent Login, sign in, then return here — or ask your parent to add published quizzes in the database.',
            );
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchQuizzes();
            setQuizzes(data);
        } catch (err) {
            setError(getQuizzesErrorMessage(err));
            setQuizzes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadQuizzes();
    }, [loadQuizzes]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'cognitive': return Brain;
            case 'gk': return Globe;
            case 'iq': return Zap;
            default: return Star;
        }
    };

    const getTheme = (type: string) => {
        switch (type) {
            case 'cognitive': return {
                bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600',
                iconBg: 'bg-purple-100', gradient: 'from-purple-400 to-indigo-500'
            };
            case 'gk': return {
                bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600',
                iconBg: 'bg-green-100', gradient: 'from-green-400 to-emerald-500'
            };
            case 'iq': return {
                bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600',
                iconBg: 'bg-orange-100', gradient: 'from-orange-400 to-red-500'
            };
            default: return {
                bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600',
                iconBg: 'bg-blue-100', gradient: 'from-blue-400 to-cyan-500'
            };
        }
    };

    return (
        <div className="space-y-8 font-sans pb-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 tracking-tight transform -rotate-1 inline-block">
                        Pick a Adventure! 🗺️
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 text-lg">Choose a quest to test your skills.</p>
                </div>
                <div className="hidden md:block text-5xl animate-bounce">
                    🎲
                </div>
            </div>

            {isLoading && (
                <motion.div
                    className="flex flex-col items-center justify-center py-20 text-slate-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                    <p className="font-bold text-lg">Loading adventures...</p>
                </motion.div>
            )}

            {!isLoading && error && (
                <motion.div className="text-center py-12 space-y-4">
                    <p className="text-red-600 font-bold" role="alert">{error}</p>
                    <Button onClick={() => void loadQuizzes()} variant="outline">
                        Try Again
                    </Button>
                </motion.div>
            )}

            {!isLoading && !error && quizzes.length === 0 && (
                <motion.div
                    className="text-center py-20 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-slate-500 font-bold text-lg">No quizzes available yet. Check back soon!</p>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                        If you are setting up the app, run <code className="bg-slate-100 px-1 rounded">npm run db:seed</code> in the{' '}
                        <code className="bg-slate-100 px-1 rounded">backend</code> folder, then refresh.
                    </p>
                    <Link to="/parent/login">
                        <Button variant="outline">Parent Login</Button>
                    </Link>
                </motion.div>
            )}

            {!isLoading && !error && quizzes.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz, index) => {
                        const Icon = getIcon(quiz.type);
                        const theme = getTheme(quiz.type);
                        const questionCount = getQuestionCount(quiz);
                        const durationLabel = quiz.durationMinutes
                            ? `${quiz.durationMinutes} Minutes`
                            : '10 Minutes';
                        const metaLabel =
                            questionCount > 0
                                ? `${questionCount} Questions`
                                : quiz.grade ?? quiz.description ?? 'Fun Quiz';

                        return (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.25 }}
                            >
                                <Card className={cn(
                                    'p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 border-b-4 relative overflow-hidden group',
                                    theme.bg, theme.border
                                )}>
                                    <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6', theme.iconBg)}>
                                        <Icon className={cn('w-8 h-8', theme.text)} />
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 transition-colors">
                                        {quiz.title}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-100">
                                            {metaLabel}
                                        </span>
                                        <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-100">
                                            {durationLabel}
                                        </span>
                                    </div>

                                    <div className="mt-auto">
                                        <Link to={`/student/quiz/${quiz.id}`}>
                                            <Button className={cn(
                                                'w-full font-bold text-lg py-6 rounded-xl shadow-lg transition-transform active:scale-95',
                                                'bg-gradient-to-r text-white border-0',
                                                theme.gradient
                                            )}>
                                                Start Quest <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
