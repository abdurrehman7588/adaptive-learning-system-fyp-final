import type { ChildComparisonRow } from '../../../api/analyticsReports';

type ReportsChildComparisonProps = {
    rows: ChildComparisonRow[];
    selectedChildId: number;
    onSelectChild: (childId: number) => void;
};

export function ReportsChildComparison({
    rows,
    selectedChildId,
    onSelectChild,
}: ReportsChildComparisonProps) {
    return (
        <>
            {/* Mobile: selectable cards */}
            <ul className="mobile-only space-y-3">
                {rows.map((row) => {
                    const isSelected = row.id === selectedChildId;
                    return (
                        <li key={row.id}>
                            <button
                                type="button"
                                onClick={() => onSelectChild(row.id)}
                                className={`w-full text-left rounded-xl border p-4 transition-colors min-h-11 ${
                                    isSelected
                                        ? 'border-teal-300 bg-teal-50/90 ring-2 ring-teal-200'
                                        : 'border-slate-100 bg-white hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span
                                        className={`font-bold text-base ${
                                            isSelected ? 'text-teal-700' : 'text-slate-800'
                                        }`}
                                    >
                                        {row.name}
                                    </span>
                                    {isSelected && (
                                        <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded shrink-0">
                                            Viewing
                                        </span>
                                    )}
                                </div>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">
                                            Quizzes
                                        </dt>
                                        <dd className="font-bold text-slate-800">{row.completedQuizzes}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">
                                            Avg score
                                        </dt>
                                        <dd className="font-bold text-slate-800">
                                            {row.averageScorePercent}%
                                        </dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">
                                            Best subject
                                        </dt>
                                        <dd className="text-slate-700 break-words">{row.bestSubjectLabel}</dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">
                                            Focus area
                                        </dt>
                                        <dd className="text-slate-700 break-words">{row.focusAreaLabel}</dd>
                                    </div>
                                </dl>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* Desktop: table */}
            <div className="desktop-table overflow-x-auto -mx-1 px-1">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                            <th className="py-3 pr-4">Learner</th>
                            <th className="py-3 pr-4 text-right">Quizzes</th>
                            <th className="py-3 pr-4 text-right">Avg score</th>
                            <th className="py-3 pr-4">Best subject</th>
                            <th className="py-3">Focus area</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const isSelected = row.id === selectedChildId;
                            return (
                                <tr
                                    key={row.id}
                                    className={`border-b border-slate-50 last:border-0 ${
                                        isSelected ? 'bg-teal-50/80' : 'hover:bg-slate-50/80'
                                    }`}
                                >
                                    <td className="py-3 pr-4">
                                        <button
                                            type="button"
                                            onClick={() => onSelectChild(row.id)}
                                            className={`font-semibold text-left ${
                                                isSelected
                                                    ? 'text-teal-700'
                                                    : 'text-slate-800 hover:text-teal-600'
                                            }`}
                                        >
                                            {row.name}
                                            {isSelected ? (
                                                <span className="ml-2 text-[10px] uppercase font-bold text-teal-600 bg-teal-100 px-1.5 py-0.5 rounded">
                                                    Viewing
                                                </span>
                                            ) : null}
                                        </button>
                                    </td>
                                    <td className="py-3 pr-4 text-right font-medium text-slate-700">
                                        {row.completedQuizzes}
                                    </td>
                                    <td className="py-3 pr-4 text-right font-bold text-slate-800">
                                        {row.averageScorePercent}%
                                    </td>
                                    <td className="py-3 pr-4 text-slate-600">{row.bestSubjectLabel}</td>
                                    <td className="py-3 text-slate-600">{row.focusAreaLabel}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
