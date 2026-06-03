import { Input } from '../ui/Input';
import { ChildAgeGradeFields } from './ChildAgeGradeFields';
import { AVATAR_OPTIONS, type ChildFormValues } from '../../lib/childProfileForm';
import { normalizeStoredGrade } from '../../lib/childProfileFields';

type ChildProfileFormProps = {
    values: ChildFormValues;
    onChange: (patch: Partial<ChildFormValues>) => void;
    mode: 'create' | 'edit';
    ageError?: string | null;
    gradeError?: string | null;
    storedGrade?: string | null;
    enableGradeAutoSuggest?: boolean;
};

export function ChildProfileForm({
    values,
    onChange,
    mode,
    ageError,
    gradeError,
    storedGrade,
    enableGradeAutoSuggest = true,
}: ChildProfileFormProps) {
    return (
        <div className="space-y-4">
            <Input
                label="Learner name"
                value={values.name}
                onChange={(e) => onChange({ name: e.target.value })}
                required
                className="bg-white/50 focus:bg-white"
            />

            <Input
                label="Username (for student login)"
                value={values.username}
                onChange={(e) => onChange({ username: e.target.value })}
                placeholder="e.g. alex_kid"
                className="bg-white/50 focus:bg-white"
            />

            <Input
                label={mode === 'edit' ? 'New PIN (optional)' : 'PIN (4–6 digits)'}
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={values.pin}
                onChange={(e) => onChange({ pin: e.target.value })}
                required={mode === 'create'}
                placeholder={mode === 'edit' ? 'Leave blank to keep current PIN' : undefined}
                className="bg-white/50 focus:bg-white"
            />

            <ChildAgeGradeFields
                age={values.age}
                grade={values.grade}
                onAgeChange={(age) => onChange({ age })}
                onGradeChange={(grade) => onChange({ grade })}
                ageError={ageError}
                gradeError={gradeError}
                storedGrade={storedGrade ?? normalizeStoredGrade(values.grade)}
                enableGradeAutoSuggest={enableGradeAutoSuggest && mode === 'create'}
            />

            <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Avatar</p>
                <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => onChange({ avatar: emoji })}
                            className={`h-11 w-11 rounded-xl text-xl border-2 transition-colors ${
                                values.avatar === emoji
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-slate-200 bg-white hover:border-teal-200'
                            }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
