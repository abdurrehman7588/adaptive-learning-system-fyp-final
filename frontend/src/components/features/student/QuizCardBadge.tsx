import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

/** Matches the "Pick for you" pill on learning-path quiz cards. */
export const quizCardBadgeClassName =
    'text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200';

type QuizCardBadgeProps = {
    children: ReactNode;
    className?: string;
};

export function QuizCardBadge({ children, className }: QuizCardBadgeProps) {
    return <span className={cn(quizCardBadgeClassName, className)}>{children}</span>;
}
