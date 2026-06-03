import type { ChildProfile } from '../api/children';
import type { ChildRecord } from './activeChild';

type ChildFormSource = ChildRecord | ChildProfile;
import {
    normalizeStoredGrade,
    parseChildAgeValue,
    validateChildAgeValue,
    validateChildGradeValue,
} from './childProfileFields';

export const AVATAR_OPTIONS = ['🦊', '🐼', '🦁', '🐰', '🐨', '🦄'] as const;

export type ChildFormValues = {
    name: string;
    username: string;
    pin: string;
    age: string;
    grade: string;
    avatar: string;
};

export const emptyChildFormValues = (): ChildFormValues => ({
    name: '',
    username: '',
    pin: '',
    age: '',
    grade: '',
    avatar: AVATAR_OPTIONS[0],
});

export function childRecordToFormValues(child: ChildFormSource): ChildFormValues {
    const age =
        child.age !== null && child.age !== undefined && child.age >= 4
            ? String(child.age)
            : '';
    return {
        name: child.name ?? '',
        username: child.username ?? '',
        pin: '',
        age,
        grade: normalizeStoredGrade(
            'grade_level' in child ? child.grade_level : null,
        ),
        avatar:
            ('avatar_url' in child && child.avatar_url) ||
            AVATAR_OPTIONS[0],
    };
}

export type ChildFormFieldErrors = {
    form?: string;
    age?: string | null;
    grade?: string | null;
};

export function validateChildFormForCreate(
    values: ChildFormValues,
): { ok: true; payload: {
    name: string;
    username: string;
    pin: string;
    grade_level: string;
    avatar_url: string;
    age: number;
} } | { ok: false; errors: ChildFormFieldErrors } {
    if (!values.name.trim()) {
        return { ok: false, errors: { form: 'Learner name is required.' } };
    }

    const normalizedUsername =
        values.username.trim() ||
        values.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 32);

    if (normalizedUsername.length < 3) {
        return { ok: false, errors: { form: 'Username must be at least 3 characters.' } };
    }

    if (!/^\d{4,6}$/.test(values.pin)) {
        return { ok: false, errors: { form: 'PIN must be 4–6 digits.' } };
    }

    const ageValidation = validateChildAgeValue(values.age);
    const gradeValidation = validateChildGradeValue(values.grade);
    if (ageValidation || gradeValidation) {
        return {
            ok: false,
            errors: {
                form: ageValidation ?? gradeValidation ?? undefined,
                age: ageValidation,
                grade: gradeValidation,
            },
        };
    }

    const parsedAge = parseChildAgeValue(values.age);
    if (parsedAge === null) {
        return {
            ok: false,
            errors: { form: 'Age must be between 4 and 12.', age: 'Age must be between 4 and 12.' },
        };
    }

    return {
        ok: true,
        payload: {
            name: values.name.trim(),
            username: normalizedUsername,
            pin: values.pin,
            grade_level: values.grade,
            avatar_url: values.avatar,
            age: parsedAge,
        },
    };
}

export function validateChildFormForUpdate(
    values: ChildFormValues,
): { ok: true; payload: {
    name: string;
    username: string;
    grade_level: string;
    avatar_url: string;
    age: number;
    pin?: string;
} } | { ok: false; errors: ChildFormFieldErrors } {
    if (!values.name.trim()) {
        return { ok: false, errors: { form: 'Learner name is required.' } };
    }

    const normalizedUsername =
        values.username.trim() ||
        values.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 32);

    if (normalizedUsername.length < 3) {
        return { ok: false, errors: { form: 'Username must be at least 3 characters.' } };
    }

    if (values.pin.trim() && !/^\d{4,6}$/.test(values.pin.trim())) {
        return { ok: false, errors: { form: 'PIN must be 4–6 digits.' } };
    }

    const ageValidation = validateChildAgeValue(values.age);
    const gradeValidation = validateChildGradeValue(values.grade);
    if (ageValidation || gradeValidation) {
        return {
            ok: false,
            errors: {
                form: ageValidation ?? gradeValidation ?? undefined,
                age: ageValidation,
                grade: gradeValidation,
            },
        };
    }

    const parsedAge = parseChildAgeValue(values.age);
    if (parsedAge === null) {
        return {
            ok: false,
            errors: { form: 'Age must be between 4 and 12.', age: 'Age must be between 4 and 12.' },
        };
    }

    const payload: {
        name: string;
        username: string;
        grade_level: string;
        avatar_url: string;
        age: number;
        pin?: string;
    } = {
        name: values.name.trim(),
        username: normalizedUsername,
        grade_level: values.grade,
        avatar_url: values.avatar,
        age: parsedAge,
    };

    if (values.pin.trim()) {
        payload.pin = values.pin.trim();
    }

    return { ok: true, payload };
}
