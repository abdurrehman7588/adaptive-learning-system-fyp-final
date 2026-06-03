import { useCallback, useRef } from 'react';
import { Select } from '../ui/Select';
import {
    buildGradeSelectOptions,
    CHILD_AGE_OPTIONS,
    CHILD_GRADE_OPTIONS,
    formatAgeOptionLabel,
    suggestGradeForAgeString,
} from '../../lib/childProfileFields';

type ChildAgeGradeFieldsProps = {
    age: string;
    grade: string;
    onAgeChange: (age: string) => void;
    onGradeChange: (grade: string) => void;
    ageError?: string | null;
    gradeError?: string | null;
    /** Stored grade from API — used to show legacy values in the grade dropdown. */
    storedGrade?: string | null;
    /** When false, changing age does not overwrite grade (edit forms). */
    enableGradeAutoSuggest?: boolean;
    layout?: 'grid' | 'stack';
    className?: string;
};

export function ChildAgeGradeFields({
    age,
    grade,
    onAgeChange,
    onGradeChange,
    ageError,
    gradeError,
    storedGrade,
    enableGradeAutoSuggest = true,
    layout = 'grid',
    className,
}: ChildAgeGradeFieldsProps) {
    const gradeManuallyEdited = useRef(!enableGradeAutoSuggest);

    const handleAgeChange = useCallback(
        (nextAge: string) => {
            onAgeChange(nextAge);
            if (!gradeManuallyEdited.current) {
                const suggested = suggestGradeForAgeString(nextAge);
                if (suggested) {
                    onGradeChange(suggested);
                }
            }
        },
        [onAgeChange, onGradeChange],
    );

    const handleGradeChange = useCallback(
        (nextGrade: string) => {
            gradeManuallyEdited.current = true;
            onGradeChange(nextGrade);
        },
        [onGradeChange],
    );

    const ageOptions = CHILD_AGE_OPTIONS.map((value) => ({
        value: String(value),
        label: formatAgeOptionLabel(value),
    }));

    const gradeOptionValues = buildGradeSelectOptions(storedGrade ?? grade);
    const gradeOptions = gradeOptionValues.map((value) => {
        const isStandard = (CHILD_GRADE_OPTIONS as readonly string[]).includes(value);
        return {
            value,
            label: isStandard ? value : `${value} (saved)`,
        };
    });

    const wrapperClass =
        layout === 'grid'
            ? `grid grid-cols-1 sm:grid-cols-2 gap-3 ${className ?? ''}`
            : `space-y-3 ${className ?? ''}`;

    return (
        <div className={wrapperClass}>
            <Select
                label="Age"
                required
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                options={ageOptions}
                placeholder="Select age"
                error={ageError ?? undefined}
                aria-invalid={ageError ? true : undefined}
            />
            <Select
                label="Grade"
                required
                value={grade}
                onChange={(e) => handleGradeChange(e.target.value)}
                options={gradeOptions}
                placeholder="Select grade"
                error={gradeError ?? undefined}
                aria-invalid={gradeError ? true : undefined}
            />
        </div>
    );
}
