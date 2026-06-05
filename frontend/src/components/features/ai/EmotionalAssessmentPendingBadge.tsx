import { AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

type EmotionalAssessmentPendingBadgeProps = {
    className?: string;
};

export function EmotionalAssessmentPendingBadge({ className }: EmotionalAssessmentPendingBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800',
                className,
            )}
        >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Emotional assessment pending
        </span>
    );
}
