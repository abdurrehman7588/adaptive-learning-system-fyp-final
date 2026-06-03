import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParentFlow } from '../../../context/ParentFlowContext';
import { Button } from '../../../components/ui/Button';
import { ManageChildrenSection } from '../../../components/child/ManageChildrenSection';
import { OnboardingShell } from './OnboardingShell';

export function ParentOnboardingChild() {
    const navigate = useNavigate();
    const { refreshFlow } = useParentFlow();
    const [learnerCount, setLearnerCount] = useState(0);
    const [continueError, setContinueError] = useState<string | null>(null);
    const [continuing, setContinuing] = useState(false);

    const handleContinue = async () => {
        if (learnerCount < 1) {
            setContinueError('Add at least one learner before continuing.');
            return;
        }

        setContinuing(true);
        setContinueError(null);
        try {
            await refreshFlow({ background: true });
            navigate('/parent/onboarding/complete');
        } catch {
            setContinueError('Could not refresh your account. Please try again.');
        } finally {
            setContinuing(false);
        }
    };

    return (
        <OnboardingShell
            step={2}
            totalSteps={3}
            title="Set up your learners"
            subtitle="Add each child who will learn on this account. You can always add more later in Settings."
        >
            <div className="space-y-6">
                <ManageChildrenSection
                    variant="onboarding"
                    onLearnersChange={setLearnerCount}
                />

                {continueError && (
                    <p className="text-sm text-red-600" role="alert">
                        {continueError}
                    </p>
                )}

                <Button
                    type="button"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={continuing || learnerCount < 1}
                    onClick={() => void handleContinue()}
                >
                    {continuing
                        ? 'Continuing...'
                        : learnerCount < 1
                          ? 'Add at least one learner to continue'
                          : `Continue with ${learnerCount} learner${learnerCount === 1 ? '' : 's'}`}
                </Button>
            </div>
        </OnboardingShell>
    );
}
