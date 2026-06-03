import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getToken } from '../lib/tokenStorage';
import {
    fetchParentOnboarding,
    getParentApiErrorMessage,
    type OnboardingStatusDto,
} from '../api/parent';
import {
    isParentAppReady,
    resolveParentFlowDestination,
    type ParentFlowDestination,
} from '../flow/parentAppFlow';
import { primeActiveChildFromApi } from '../lib/activeChild';

type RefreshFlowOptions = {
    /** When true, do not block the UI with the full-screen flow loader (wizard steps). */
    background?: boolean;
};

type ParentFlowContextValue = {
    isLoading: boolean;
    error: string | null;
    onboarding: OnboardingStatusDto | null;
    destination: ParentFlowDestination;
    isAppReady: boolean;
    refreshFlow: (options?: RefreshFlowOptions) => Promise<void>;
};

const ParentFlowContext = createContext<ParentFlowContextValue | undefined>(undefined);

export function ParentFlowProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const [onboarding, setOnboarding] = useState<OnboardingStatusDto | null>(null);
    const [flowLoading, setFlowLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isParent = user?.role === 'parent';
    const hasToken = Boolean(getToken());

    const refreshFlow = useCallback(
        async (options?: RefreshFlowOptions) => {
            if (!hasToken || !isParent) {
                setOnboarding(null);
                setFlowLoading(false);
                return;
            }

            if (!options?.background) {
                setFlowLoading(true);
            }
            setError(null);
            try {
                const status = await fetchParentOnboarding();
                setOnboarding(status);

                if (status.suggestedNextStep === 'done' && status.hasChildren) {
                    await primeActiveChildFromApi();
                }
            } catch (err) {
                setOnboarding(null);
                setError(getParentApiErrorMessage(err));
            } finally {
                if (!options?.background) {
                    setFlowLoading(false);
                }
            }
        },
        [hasToken, isParent],
    );

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isParent || !hasToken) {
            setOnboarding(null);
            setFlowLoading(false);
            setError(null);
            return;
        }

        void refreshFlow();
    }, [authLoading, isParent, hasToken, refreshFlow]);

    const destination = useMemo(
        () => resolveParentFlowDestination(isParent && hasToken, onboarding),
        [isParent, hasToken, onboarding],
    );

    const isAppReady = useMemo(() => isParentAppReady(onboarding), [onboarding]);

    const isLoading = authLoading || (isParent && hasToken && flowLoading);

    const value = useMemo(
        () => ({
            isLoading,
            error,
            onboarding,
            destination,
            isAppReady,
            refreshFlow,
        }),
        [isLoading, error, onboarding, destination, isAppReady, refreshFlow],
    );

    return (
        <ParentFlowContext.Provider value={value}>{children}</ParentFlowContext.Provider>
    );
}

export function useParentFlow(): ParentFlowContextValue {
    const ctx = useContext(ParentFlowContext);
    if (!ctx) {
        throw new Error('useParentFlow must be used within ParentFlowProvider');
    }
    return ctx;
}
