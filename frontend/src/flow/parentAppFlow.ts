import type { OnboardingStatusDto } from '../api/parent';

/** Canonical parent app destinations (single source of truth). */
export type ParentFlowDestination =
    | '/parent/login'
    | '/parent/onboarding/profile'
    | '/parent/onboarding/child'
    | '/parent/onboarding/complete'
    | '/parent/dashboard';

export const PARENT_DASHBOARD_PATHS = [
    '/parent/dashboard',
    '/parent/reports',
    '/parent/settings',
    '/parent/settings/children',
    '/parent/insights',
] as const;

export const PARENT_ONBOARDING_PATHS = [
    '/parent/onboarding/profile',
    '/parent/onboarding/child',
    '/parent/onboarding/complete',
] as const;

/**
 * Resolves where an authenticated parent should go next.
 * Uses backend onboarding `suggestedNextStep` (ChildQueryPort-aware).
 */
export function resolveParentFlowDestination(
    isAuthenticated: boolean,
    onboarding: OnboardingStatusDto | null,
): ParentFlowDestination {
    if (!isAuthenticated || !onboarding) {
        return '/parent/login';
    }

    switch (onboarding.suggestedNextStep) {
        case 'set_preferences':
            return '/parent/onboarding/profile';
        case 'create_child':
            return '/parent/onboarding/child';
        case 'done':
        default:
            return '/parent/dashboard';
    }
}

export function isParentDashboardPath(pathname: string): boolean {
    return PARENT_DASHBOARD_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
}

/** Forward navigation within the onboarding wizard (backend step lags one screen behind). */
const ONBOARDING_PATHS_BY_DESTINATION: Partial<
    Record<ParentFlowDestination, readonly string[]>
> = {
    '/parent/onboarding/profile': PARENT_ONBOARDING_PATHS,
    '/parent/onboarding/child': [
        '/parent/onboarding/child',
        '/parent/onboarding/complete',
    ],
    '/parent/onboarding/complete': ['/parent/onboarding/complete'],
};

export function isPathAllowedForDestination(
    pathname: string,
    destination: ParentFlowDestination,
): boolean {
    if (pathname === destination) {
        return true;
    }

    if (destination === '/parent/dashboard' && isParentDashboardPath(pathname)) {
        return true;
    }

    const wizardPaths = ONBOARDING_PATHS_BY_DESTINATION[destination];
    if (wizardPaths?.includes(pathname)) {
        return true;
    }

    return false;
}

export function isParentAppReady(onboarding: OnboardingStatusDto | null): boolean {
    if (!onboarding) return false;
    return onboarding.suggestedNextStep === 'done' && onboarding.hasChildren;
}
