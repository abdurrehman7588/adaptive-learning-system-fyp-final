import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { fetchQuizzes, getQuizzesErrorMessage } from '../../api/quizzes';
import { fetchLearnerRecommendations, type RecommendedQuiz } from '../../api/recommendations';
import { CategoryLearningCatalog } from '../../components/features/student/CategoryLearningCatalog';
import { buildCategoryCatalog } from '../../lib/catalogGrouping';
import { useActiveLearnerProfile } from '../../hooks/useActiveLearnerProfile';
import { useStudentGradeScope } from '../../hooks/useStudentGradeScope';
import { getToken } from '../../lib/tokenStorage';
import type { Quiz } from '../../types';
import { Loader2, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export const QuizList = () => {
    const { learnerFirstName } = useActiveLearnerProfile();
    const { gradeLabel, scopeQuizzes, scopeRecommendations } = useStudentGradeScope();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendedQuiz[]>([]);

    const loadCatalog = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (!getToken()) {
            setQuizzes([]);
            setError(
                'Sign in to explore learning paths. Ask a parent to help you log in.',
            );
            setIsLoading(false);
            return;
        }

        try {
            const [data, recPayload] = await Promise.all([
                fetchQuizzes(),
                fetchLearnerRecommendations().catch(() => null),
            ]);
            const scopedQuizzes = scopeQuizzes(data);
            const scopedRecs = recPayload
                ? scopeRecommendations(recPayload.recommendations)
                : [];
            setQuizzes(scopedQuizzes);
            setRecommendations(scopedRecs);
        } catch (err) {
            setError(getQuizzesErrorMessage(err));
            setQuizzes([]);
            setRecommendations([]);
        } finally {
            setIsLoading(false);
        }
    }, [scopeQuizzes, scopeRecommendations]);

    useEffect(() => {
        void loadCatalog();
    }, [loadCatalog]);

    const catalogGradeLabel = gradeLabel || quizzes[0]?.gradeLabel || 'your grade';

    const catalogEntries = useMemo(
        () => buildCategoryCatalog(quizzes, recommendations),
        [quizzes, recommendations],
    );

    const availablePaths = catalogEntries.filter((e) => e.quiz).length;

    return (
        <div className="space-y-8 font-sans pb-10 p-6 md:p-8 max-w-5xl mx-auto">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm uppercase tracking-wide">
                    <Map className="w-4 h-4" />
                    Learning paths
                </div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 tracking-tight">
                    {learnerFirstName}&apos;s grade adventures
                </h1>
                <p className="text-slate-600 font-bold text-lg max-w-xl">
                    Pick a subject path for {catalogGradeLabel}. Six fun areas — your level
                    (Easy, Medium, or Hard) shows on each card.
                </p>
            </header>

            {isLoading && (
                <motion.div
                    className="flex flex-col items-center justify-center py-20 text-slate-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                    <p className="font-bold text-lg">Loading your paths...</p>
                </motion.div>
            )}

            {!isLoading && error && (
                <div className="text-center py-12 space-y-4">
                    <p className="text-red-600 font-bold" role="alert">
                        {error}
                    </p>
                    <Button onClick={() => void loadCatalog()} variant="outline">
                        Try Again
                    </Button>
                </div>
            )}

            {!isLoading && !error && availablePaths === 0 && (
                <div className="text-center py-16 space-y-4">
                    <p className="text-slate-500 font-bold text-lg">
                        No learning paths for your grade yet.
                    </p>
                    <Link to="/student/dashboard">
                        <Button variant="outline">Back to dashboard</Button>
                    </Link>
                </div>
            )}

            {!isLoading && !error && availablePaths > 0 && (
                <CategoryLearningCatalog entries={catalogEntries} gradeLabel={catalogGradeLabel} />
            )}
        </div>
    );
};
