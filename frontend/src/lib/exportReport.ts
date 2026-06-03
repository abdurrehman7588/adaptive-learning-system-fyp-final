import type { ParentReportsViewModel } from '../api/analyticsReports';

function escapeCsv(value: string | number): string {
    const text = String(value);
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

export function downloadReportsCsv(reports: ParentReportsViewModel): void {
    const { performanceOverview: po } = reports;
    const lines: string[] = [
        'KidsLearn Performance Report',
        `Learner,${escapeCsv(reports.childName)}`,
        '',
        'Performance Overview',
        'Metric,Value',
        `Quizzes completed,${po.completedQuizzes}`,
        `Average score,${escapeCsv(po.averageScore)}`,
        `Best subject,${escapeCsv(po.bestSubject?.label ?? '—')}`,
        `Focus area,${escapeCsv(po.focusArea?.label ?? 'Balanced')}`,
        '',
        'Subject performance',
        'Subject,Average %,Attempts',
    ];

    for (const subject of reports.subjectBreakdown) {
        lines.push(
            `${escapeCsv(subject.label)},${Math.round(subject.averagePercent)},${subject.attempts}`,
        );
    }

    lines.push('', 'Weekly progress', 'Day,Average %,Attempts');
    for (const point of reports.weeklyProgress) {
        lines.push(`${escapeCsv(point.label)},${point.averagePercent},${point.attempts}`);
    }

    lines.push('', 'Recent quiz history', 'Quiz,Subject,Score %,Completed');
    for (const attempt of reports.recentHistory) {
        lines.push(
            [
                escapeCsv(attempt.quizTitle),
                escapeCsv(attempt.subjectLabel),
                Math.round(attempt.percentage),
                escapeCsv(attempt.completedAt),
            ].join(','),
        );
    }

    if (reports.multiChildComparison?.length) {
        lines.push('', 'Multi-child comparison', 'Name,Quizzes,Avg %,Best subject,Focus area');
        for (const row of reports.multiChildComparison) {
            lines.push(
                [
                    escapeCsv(row.name),
                    row.completedQuizzes,
                    row.averageScorePercent,
                    escapeCsv(row.bestSubjectLabel),
                    escapeCsv(row.focusAreaLabel),
                ].join(','),
            );
        }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = reports.childName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'learner';
    anchor.href = url;
    anchor.download = `kidslearn-report-${safeName}-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
}
