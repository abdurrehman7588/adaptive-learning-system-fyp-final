import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { updateParentOnboarding, getParentApiErrorMessage } from '../../../api/parent';
import { primeActiveChildFromApi } from '../../../lib/activeChild';
import { useParentFlow } from '../../../context/ParentFlowContext';
import { Button } from '../../../components/ui/Button';
import { OnboardingShell } from './OnboardingShell';

export function ParentOnboardingComplete() {
    const navigate = useNavigate();
    const { refreshFlow } = useParentFlow();
    const [error, setError] = useState<string | null>(null);
    const [finishing, setFinishing] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const finish = async () => {
            setFinishing(true);
            setError(null);
            try {
                await updateParentOnboarding({ completed: true });
                await primeActiveChildFromApi();
                await refreshFlow({ background: true });
                if (!cancelled) {
                    navigate('/parent/dashboard', { replace: true });
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getParentApiErrorMessage(err));
                    setFinishing(false);
                }
            }
        };

        void finish();

        return () => {
            cancelled = true;
        };
    }, [navigate, refreshFlow]);

    const handleRetry = async () => {
        setFinishing(true);
        setError(null);
        try {
            await updateParentOnboarding({ completed: true });
            await primeActiveChildFromApi();
            await refreshFlow({ background: true });
            navigate('/parent/dashboard', { replace: true });
        } catch (err) {
            setError(getParentApiErrorMessage(err));
            setFinishing(false);
        }
    };

    return (
        <OnboardingShell
            step={3}
            totalSteps={3}
            title="You're all set!"
            subtitle="Finishing setup and opening your dashboard."
        >
            <div className="flex flex-col items-center text-center py-4">
                {finishing ? (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
                        <p className="text-slate-600">Saving onboarding and selecting active learner...</p>
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-12 h-12 text-teal-600 mb-4" />
                        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                        <Button
                            type="button"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => void handleRetry()}
                        >
                            Retry and open dashboard
                        </Button>
                    </>
                )}
            </div>
        </OnboardingShell>
    );
}
