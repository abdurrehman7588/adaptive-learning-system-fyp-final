import { isAxiosError } from 'axios';
import { apiClient } from './client';

export type ChildProfile = {
    id: number;
    name: string;
    username?: string;
    date_of_birth?: string | null;
    grade_level?: string | null;
    grade_level_enum?: string | null;
    avatar_url?: string | null;
    age?: number | null;
    learning_preferences?: Record<string, unknown> | null;
};

export type CreateChildPayload = {
    name: string;
    username: string;
    pin: string;
    grade_level?: string;
    avatar_url?: string;
    age?: number;
};

export type UpdateChildPayload = Partial<CreateChildPayload> & {
    learning_preferences?: Record<string, unknown>;
};

function extractChild(data: unknown): ChildProfile | null {
    if (!data || typeof data !== 'object') return null;
    const record = data as Record<string, unknown>;
    if (record.child && typeof record.child === 'object') {
        return record.child as ChildProfile;
    }
    return null;
}

export async function fetchChildProfile(childId: number): Promise<ChildProfile> {
    const { data } = await apiClient.get(`/children/${childId}`);
    const child = extractChild(data);
    if (!child) {
        throw new Error('Child profile not found in response.');
    }
    return child;
}

export async function createChildProfile(payload: CreateChildPayload): Promise<ChildProfile> {
    const { data } = await apiClient.post('/children', payload);
    const child = extractChild(data);
    if (!child) {
        throw new Error('Child profile was not returned after creation.');
    }
    return child;
}

export async function updateChildProfile(
    childId: number,
    payload: UpdateChildPayload,
): Promise<ChildProfile> {
    const { data } = await apiClient.put(`/children/${childId}`, payload);
    const child = extractChild(data);
    if (!child) {
        throw new Error('Child profile was not returned after update.');
    }
    return child;
}

export async function deleteChildProfile(childId: number): Promise<void> {
    await apiClient.delete(`/children/${childId}`);
}

export function getChildrenErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not update learner profile. Please try again.';
}
