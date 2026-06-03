import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useParentFlow } from '../../../context/ParentFlowContext';
import { updateParentProfileName, getLoginErrorMessage } from '../../../api/auth';
import {
    fetchParentProfile,
    updateParentPreferences,
    getParentApiErrorMessage,
} from '../../../api/parent';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { OnboardingShell } from './OnboardingShell';

export function ParentOnboardingProfile() {
    const navigate = useNavigate();
    const { user, patchUser } = useAuth();
    const { refreshFlow } = useParentFlow();

    const [name, setName] = useState(user?.name ?? '');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [weeklyReportEmail, setWeeklyReportEmail] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void (async () => {
            try {
                const profile = await fetchParentProfile();
                setName(profile.name);
                setEmailNotifications(profile.preferences.emailNotifications);
                setWeeklyReportEmail(profile.preferences.weeklyReportEmail ?? false);
            } catch {
                // Use auth user defaults
            }
        })();
    }, []);

    const handleContinue = async () => {
        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const updated = await updateParentProfileName(name.trim());
            patchUser({ name: updated.name, email: updated.email });

            await updateParentPreferences({
                emailNotifications,
                weeklyReportEmail,
            });

            await refreshFlow({ background: true });
            navigate('/parent/onboarding/child');
        } catch (err) {
            setError(getLoginErrorMessage(err) || getParentApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <OnboardingShell
            step={1}
            totalSteps={3}
            title="Set up your parent profile"
            subtitle="Tell us how to address you and which updates you want to receive."
        >
            <div className="space-y-4">
                <Input
                    label="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">Email notifications</span>
                    <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600"
                    />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">Weekly progress email</span>
                    <input
                        type="checkbox"
                        checked={weeklyReportEmail}
                        onChange={(e) => setWeeklyReportEmail(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600"
                    />
                </label>

                {error && (
                    <p className="text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                <Button
                    type="button"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={saving}
                    onClick={() => void handleContinue()}
                >
                    {saving ? 'Saving...' : 'Continue to learner setup'}
                </Button>
            </div>
        </OnboardingShell>
    );
}
