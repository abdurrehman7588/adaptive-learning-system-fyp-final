import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import type { CategoryCatalogEntry } from '../../../lib/catalogGrouping';
import { getCategoryDef } from '../../../lib/learningCategories';
import { difficultyBadgeLabel } from '../../../lib/difficultyBadge';
import { cn } from '../../../lib/utils';
import { QuizCardBadge } from './QuizCardBadge';

type CategoryLearningCatalogProps = {
    entries: CategoryCatalogEntry[];
    gradeLabel?: string;
};

export function CategoryLearningCatalog({ entries, gradeLabel }: CategoryLearningCatalogProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
            {entries.map((entry, index) => {
                const theme = getCategoryDef(entry.categoryId).theme;
                const quiz = entry.quiz;
                const questionCount = quiz?.questionCount ?? quiz?.questions.length ?? 0;
                const difficultyLabel = quiz
                    ? difficultyBadgeLabel(quiz.difficultyLevel)
                    : null;

                return (
                    <motion.div
                        key={entry.categoryId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card
                            className={cn(
                                'relative p-4 sm:p-5 h-full flex flex-col border-b-4 transition-shadow hover:shadow-lg min-w-0',
                                theme.bg,
                                theme.border,
                                !quiz && 'opacity-75',
                            )}
                        >
                            {quiz && (
                                <div
                                    className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1"
                                    aria-label="Quiz badges"
                                >
                                    {entry.isRecommended && (
                                        <QuizCardBadge>Pick for you</QuizCardBadge>
                                    )}
                                    {difficultyLabel && (
                                        <QuizCardBadge data-difficulty={quiz.difficultyLevel}>
                                            {difficultyLabel}
                                        </QuizCardBadge>
                                    )}
                                </div>
                            )}

                            <div className="flex items-start gap-2 mb-3 pr-20 sm:pr-24">
                                <div
                                    className={cn(
                                        'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0',
                                        theme.iconBg,
                                    )}
                                >
                                    {entry.emoji}
                                </div>
                            </div>

                            <h3 className={cn('text-lg sm:text-xl font-black break-words', theme.text)}>
                                {entry.label}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium mt-1 mb-4 flex-1">
                                {entry.description}
                            </p>

                            {quiz ? (
                                <>
                                    <p className="text-xs font-bold text-slate-500 mb-3 truncate">
                                        {quiz.title}
                                        {questionCount > 0
                                            ? ` · ${questionCount} questions`
                                            : ''}
                                    </p>
                                    <Link to={`/student/quiz/${quiz.id}`}>
                                        <Button
                                            className={cn(
                                                'w-full font-bold rounded-xl py-3.5 sm:py-5 min-h-12 text-white border-0 bg-gradient-to-r shadow-md',
                                                theme.gradient,
                                            )}
                                        >
                                            Start <Rocket className="w-4 h-4 ml-2 inline" />
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <p className="text-xs font-bold text-slate-400 py-3">
                                    Coming soon for {gradeLabel ?? 'your grade'}
                                </p>
                            )}
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
