import { isAxiosError } from 'axios';
import { apiClient } from './client';

export type ParentPreferencesDto = {
    emailNotifications: boolean;
    weeklyReportEmail?: boolean;
    learningGoals?: string[];
    childInterests?: string[];
    preferredLanguage?: string | null;
};

export type OnboardingStatusDto = {
    completed: boolean;
    skipped: boolean;
    hasChildren: boolean;
    suggestedNextStep: 'create_child' | 'set_preferences' | 'done';
};

export type ParentProfileResponse = {
    parentId: number;
    name: string;
    email: string;
    avatarUrl: string | null;
    preferredLanguage: string | null;
    preferences: ParentPreferencesDto;
    onboarding: OnboardingStatusDto;
};

function extractProfile(data: unknown): ParentProfileResponse | null {
    if (!data || typeof data !== 'object') return null;
    const record = data as Record<string, unknown>;
    if (record.profile && typeof record.profile === 'object') {
        return record.profile as ParentProfileResponse;
    }
    return null;
}

export async function fetchParentProfile(): Promise<ParentProfileResponse> {
    const { data } = await apiClient.get('/parent/me');
    const profile = extractProfile(data);
    if (!profile) {
        throw new Error('Parent profile not found in response.');
    }
    return profile;
}

export async function updateParentPreferences(
    prefs: Partial<ParentPreferencesDto>,
): Promise<ParentProfileResponse> {
    const { data } = await apiClient.put('/parent/me/preferences', prefs);
    const profile = extractProfile(data);
    if (!profile) {
        throw new Error('Preferences update did not return profile.');
    }
    return profile;
}

export async function fetchParentOnboarding(): Promise<OnboardingStatusDto> {
    const { data } = await apiClient.get<{ onboarding: OnboardingStatusDto }>('/parent/onboarding');
    if (!data.onboarding) {
        throw new Error('Onboarding status missing from response.');
    }
    return data.onboarding;
}

export async function updateParentOnboarding(payload: {
    completed?: boolean;
    skipped?: boolean;
    preferences?: Partial<ParentPreferencesDto>;
}): Promise<OnboardingStatusDto> {
    const { data } = await apiClient.put<{ onboarding: OnboardingStatusDto }>(
        '/parent/onboarding',
        payload,
    );
    if (!data.onboarding) {
        throw new Error('Onboarding update did not return status.');
    }
    return data.onboarding;
}

export function getParentApiErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not load parent settings. Please try again.';
}
