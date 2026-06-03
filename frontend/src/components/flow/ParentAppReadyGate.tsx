import type { ReactNode } from 'react';
import { useParentFlow } from '../../context/ParentFlowContext';
import { Loader2 } from 'lucide-react';

/**
 * Wraps dashboard-style pages so analytics/recommendations only mount when onboarding is done.
 */
export function ParentAppReadyGate({ children }: { children: ReactNode }) {
    const { isLoading, isAppReady } = useParentFlow();

    if (isLoading || !isAppReady) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600 mr-2" />
                Preparing dashboard...
            </div>
        );
    }

    return <>{children}</>;
}
