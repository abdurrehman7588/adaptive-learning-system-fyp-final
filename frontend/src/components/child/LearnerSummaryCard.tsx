import { Pencil, Trash2 } from 'lucide-react';
import { normalizeStoredGrade } from '../../lib/childProfileFields';
import type { ChildRecord } from '../../lib/activeChild';

type LearnerSummaryCardProps = {
    child: ChildRecord;
    onEdit: () => void;
    onRemove: () => void;
    isActive?: boolean;
    onSelectActive?: () => void;
};

export function LearnerSummaryCard({
    child,
    onEdit,
    onRemove,
    isActive,
    onSelectActive,
}: LearnerSummaryCardProps) {
    const avatar = child.avatar_url?.trim() || '🦊';
    const gradeLabel = normalizeStoredGrade(child.grade_level) || '—';
    const ageLabel =
        child.age !== null && child.age !== undefined ? `${child.age} years` : '—';

    return (
        <div
            className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                isActive ? 'border-teal-300 bg-teal-50/60' : 'border-slate-200 bg-white'
            }`}
        >
            <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-2xl border-2 border-white shadow-sm"
                aria-hidden
            >
                {avatar}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {onSelectActive ? (
                        <button
                            type="button"
                            onClick={onSelectActive}
                            className="font-bold text-slate-900 hover:text-teal-700 text-left truncate"
                        >
                            {child.name}
                        </button>
                    ) : (
                        <p className="font-bold text-slate-900 truncate">{child.name}</p>
                    )}
                    {isActive && (
                        <span className="text-xs font-bold uppercase text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                    Age {ageLabel} · {gradeLabel}
                </p>
            </div>

            <div className="flex shrink-0 gap-1">
                <button
                    type="button"
                    onClick={onEdit}
                    className="p-2 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                    aria-label={`Edit ${child.name}`}
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                    aria-label={`Remove ${child.name}`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
