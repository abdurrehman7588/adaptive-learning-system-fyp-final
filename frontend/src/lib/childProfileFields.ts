/** Allowed learner ages for the product (matches backend validator 4–12). */
export const CHILD_AGE_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type ChildAge = (typeof CHILD_AGE_OPTIONS)[number];

export const CHILD_GRADE_OPTIONS = [
    'Pre-K',
    'Kindergarten',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
] as const;

export type ChildGrade = (typeof CHILD_GRADE_OPTIONS)[number];

const AGE_TO_GRADE: Record<ChildAge, ChildGrade> = {
    4: 'Pre-K',
    5: 'Kindergarten',
    6: 'Grade 1',
    7: 'Grade 2',
    8: 'Grade 3',
    9: 'Grade 4',
    10: 'Grade 5',
    11: 'Grade 6',
    12: 'Grade 6',
};

const LEGACY_GRADE_PATTERNS: Array<{ pattern: RegExp; grade: ChildGrade }> = [
    { pattern: /pre[-\s]?k/i, grade: 'Pre-K' },
    { pattern: /kindergarten|kinder/i, grade: 'Kindergarten' },
    { pattern: /grade\s*1|1st\s*grade|first\s*grade/i, grade: 'Grade 1' },
    { pattern: /grade\s*2|2nd\s*grade|second\s*grade/i, grade: 'Grade 2' },
    { pattern: /grade\s*3|3rd\s*grade|third\s*grade/i, grade: 'Grade 3' },
    { pattern: /grade\s*4|4th\s*grade|fourth\s*grade/i, grade: 'Grade 4' },
    { pattern: /grade\s*5|5th\s*grade|fifth\s*grade/i, grade: 'Grade 5' },
    { pattern: /grade\s*6|6th\s*grade|sixth\s*grade/i, grade: 'Grade 6' },
];

export function suggestGradeForAge(age: number): ChildGrade | null {
    if (!CHILD_AGE_OPTIONS.includes(age as ChildAge)) {
        return null;
    }
    return AGE_TO_GRADE[age as ChildAge];
}

export function suggestGradeForAgeString(ageValue: string): ChildGrade | null {
    const parsed = parseChildAgeValue(ageValue);
    if (parsed === null) return null;
    return suggestGradeForAge(parsed);
}

export function parseChildAgeValue(ageValue: string): ChildAge | null {
    const parsed = Number.parseInt(ageValue, 10);
    if (!Number.isInteger(parsed)) return null;
    if (!CHILD_AGE_OPTIONS.includes(parsed as ChildAge)) return null;
    return parsed as ChildAge;
}

const ENUM_GRADE_TO_DISPLAY: Record<string, ChildGrade> = {
    pre_k: 'Pre-K',
    kindergarten: 'Kindergarten',
    grade_1: 'Grade 1',
    grade_2: 'Grade 2',
    grade_3: 'Grade 3',
    grade_4: 'Grade 4',
    grade_5: 'Grade 5',
    grade_6: 'Grade 6',
};

export function normalizeStoredGrade(gradeLevel: string | null | undefined): string {
    if (!gradeLevel?.trim()) return '';
    const trimmed = gradeLevel.trim();
    if (ENUM_GRADE_TO_DISPLAY[trimmed]) {
        return ENUM_GRADE_TO_DISPLAY[trimmed];
    }
    if ((CHILD_GRADE_OPTIONS as readonly string[]).includes(trimmed)) {
        return trimmed;
    }
    for (const { pattern, grade } of LEGACY_GRADE_PATTERNS) {
        if (pattern.test(trimmed)) {
            return grade;
        }
    }
    return trimmed;
}

/** Options for grade select, including a legacy value not in the standard list. */
export function buildGradeSelectOptions(storedGrade: string | null | undefined): string[] {
    const normalized = normalizeStoredGrade(storedGrade);
    if (!normalized) {
        return [...CHILD_GRADE_OPTIONS];
    }
    if ((CHILD_GRADE_OPTIONS as readonly string[]).includes(normalized)) {
        return [...CHILD_GRADE_OPTIONS];
    }
    return [normalized, ...CHILD_GRADE_OPTIONS];
}

export function validateChildAgeValue(ageValue: string): string | null {
    if (!ageValue.trim()) {
        return 'Please select an age.';
    }
    const parsed = parseChildAgeValue(ageValue);
    if (parsed === null) {
        return 'Age must be between 4 and 12.';
    }
    return null;
}

export function validateChildGradeValue(gradeValue: string): string | null {
    if (!gradeValue.trim()) {
        return 'Please select a grade.';
    }
    const normalized = normalizeStoredGrade(gradeValue);
    if (!(CHILD_GRADE_OPTIONS as readonly string[]).includes(normalized)) {
        return 'Please select a grade from the list.';
    }
    return null;
}

export function formatAgeOptionLabel(age: number): string {
    return `${age} years old`;
}
