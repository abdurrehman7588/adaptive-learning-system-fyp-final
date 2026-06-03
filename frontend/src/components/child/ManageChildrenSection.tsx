import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import {
    createChildProfile,
    deleteChildProfile,
    fetchChildProfile,
    getChildrenErrorMessage,
    updateChildProfile,
} from '../../api/children';
import {
    fetchChildrenForParent,
    getActiveChildId,
    setActiveChildId,
    type ChildRecord,
} from '../../lib/activeChild';
import {
    childRecordToFormValues,
    emptyChildFormValues,
    validateChildFormForCreate,
    validateChildFormForUpdate,
    type ChildFormValues,
} from '../../lib/childProfileForm';
import { Button } from '../ui/Button';
import { ChildProfileForm } from './ChildProfileForm';
import { LearnerSummaryCard } from './LearnerSummaryCard';

type FormMode = 'hidden' | 'create' | 'edit';

type ManageChildrenSectionProps = {
    variant: 'onboarding' | 'settings';
    onLearnersChange?: (count: number) => void;
};

export function ManageChildrenSection({ variant, onLearnersChange }: ManageChildrenSectionProps) {
    const [learners, setLearners] = useState<ChildRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [ageError, setAgeError] = useState<string | null>(null);
    const [gradeError, setGradeError] = useState<string | null>(null);
    const [formMode, setFormMode] = useState<FormMode>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<ChildFormValues>(emptyChildFormValues);
    const [activeChildId, setActiveChildIdState] = useState<number | null>(getActiveChildId());

    const loadLearners = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            const list = await fetchChildrenForParent();
            setLearners(list);
            onLearnersChange?.(list.length);
            if (list.length === 0) {
                setFormMode('create');
                setFormValues(emptyChildFormValues());
            }
            const stored = getActiveChildId();
            if (stored && list.some((c) => c.id === stored)) {
                setActiveChildIdState(stored);
            } else if (list[0]) {
                setActiveChildId(list[0].id);
                setActiveChildIdState(list[0].id);
            } else {
                setActiveChildIdState(null);
            }
        } catch (err) {
            setMessage(getChildrenErrorMessage(err));
            onLearnersChange?.(0);
        } finally {
            setLoading(false);
        }
    }, [onLearnersChange]);

    useEffect(() => {
        void loadLearners();
    }, [loadLearners]);

    const resetForm = (mode: FormMode = 'hidden') => {
        setFormMode(mode);
        setEditingId(null);
        setFormValues(emptyChildFormValues());
        setFormError(null);
        setAgeError(null);
        setGradeError(null);
    };

    const openCreateForm = () => {
        resetForm('create');
        setFormValues(emptyChildFormValues());
        setFormMode('create');
    };

    const openEditForm = async (child: ChildRecord) => {
        setFormError(null);
        setSaving(true);
        try {
            const full = await fetchChildProfile(child.id);
            setEditingId(child.id);
            setFormValues(
                childRecordToFormValues({
                    id: full.id,
                    name: full.name,
                    username: full.username,
                    grade_level: full.grade_level,
                    age: full.age,
                    avatar_url: full.avatar_url,
                }),
            );
            setFormMode('edit');
        } catch (err) {
            setMessage(getChildrenErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const patchForm = (patch: Partial<ChildFormValues>) => {
        setFormValues((prev) => ({ ...prev, ...patch }));
    };

    const handleSaveForm = async () => {
        if (formMode === 'create') {
            const result = validateChildFormForCreate(formValues);
            if (!result.ok) {
                setFormError(result.errors.form ?? null);
                setAgeError(result.errors.age ?? null);
                setGradeError(result.errors.grade ?? null);
                return;
            }

            setSaving(true);
            setFormError(null);
            try {
                const child = await createChildProfile(result.payload);
                setActiveChildId(child.id);
                setActiveChildIdState(child.id);
                await loadLearners();
                resetForm('hidden');
                setMessage(`Added ${child.name}.`);
            } catch (err) {
                setFormError(getChildrenErrorMessage(err));
            } finally {
                setSaving(false);
            }
            return;
        }

        if (formMode === 'edit' && editingId) {
            const result = validateChildFormForUpdate(formValues);
            if (!result.ok) {
                setFormError(result.errors.form ?? null);
                setAgeError(result.errors.age ?? null);
                setGradeError(result.errors.grade ?? null);
                return;
            }

            setSaving(true);
            setFormError(null);
            try {
                await updateChildProfile(editingId, result.payload);
                await loadLearners();
                resetForm('hidden');
                setMessage('Learner profile updated.');
            } catch (err) {
                setFormError(getChildrenErrorMessage(err));
            } finally {
                setSaving(false);
            }
        }
    };

    const handleRemove = async (child: ChildRecord) => {
        if (
            !window.confirm(
                `Remove ${child.name}? Quiz history for this learner will be deleted.`,
            )
        ) {
            return;
        }

        try {
            await deleteChildProfile(child.id);
            if (editingId === child.id) {
                resetForm('hidden');
            }
            await loadLearners();
            setMessage(`${child.name} was removed.`);
        } catch (err) {
            setMessage(getChildrenErrorMessage(err));
        }
    };

    const handleSelectActive = (childId: number) => {
        setActiveChildId(childId);
        setActiveChildIdState(childId);
    };

    const showForm = formMode === 'create' || formMode === 'edit';

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900">
                    {variant === 'onboarding' ? 'Your learners' : 'All learners'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    {variant === 'onboarding'
                        ? 'Add every child who will use the app. You need at least one before continuing.'
                        : 'Add, edit, or remove learner profiles. The active learner is used for quizzes and reports.'}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    Loading learners...
                </div>
            ) : (
                <>
                    {learners.length > 0 ? (
                        <ul className="space-y-3">
                            {learners.map((child) => (
                                <li key={child.id}>
                                    <LearnerSummaryCard
                                        child={child}
                                        isActive={
                                            variant === 'settings' && activeChildId === child.id
                                        }
                                        onSelectActive={
                                            variant === 'settings'
                                                ? () => handleSelectActive(child.id)
                                                : undefined
                                        }
                                        onEdit={() => void openEditForm(child)}
                                        onRemove={() => void handleRemove(child)}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 px-6 py-10 text-center">
                            <UserPlus className="w-10 h-10 text-teal-500 mx-auto mb-3" />
                            <p className="font-medium text-teal-900">No learners yet</p>
                            <p className="text-sm text-teal-700/80 mt-1">
                                Add your first child to continue setup.
                            </p>
                        </div>
                    )}

                    {message && !formError && (
                        <p className="text-sm text-teal-700 font-medium">{message}</p>
                    )}

                    {showForm ? (
                        <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm space-y-4">
                            <p className="text-sm font-semibold text-teal-800">
                                {formMode === 'edit' ? 'Edit learner' : 'Add a learner'}
                            </p>
                            <ChildProfileForm
                                values={formValues}
                                onChange={patchForm}
                                mode={formMode === 'edit' ? 'edit' : 'create'}
                                ageError={ageError}
                                gradeError={gradeError}
                                enableGradeAutoSuggest={formMode === 'create'}
                            />
                            {formError && (
                                <p className="text-sm text-red-600" role="alert">
                                    {formError}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                    disabled={saving}
                                    onClick={() => void handleSaveForm()}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : formMode === 'edit'
                                          ? 'Save changes'
                                          : 'Save learner'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={saving}
                                    onClick={() => resetForm('hidden')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-teal-200 text-teal-800 hover:bg-teal-50"
                            onClick={openCreateForm}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Learner
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
