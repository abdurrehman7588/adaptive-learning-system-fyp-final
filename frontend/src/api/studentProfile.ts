import { isAxiosError } from 'axios';
import { apiClient } from './client';
import type { ChildProfile } from './children';

export type StudentProfileParent = {
    name: string;
    account_linked: boolean;
};

export type StudentProfileAccount = {
    current_level: number;
    level_title: string;
    total_xp: number;
    badges_earned: number;
    member_since: string;
};

export type StudentProfileLearner = ChildProfile & {
    created_at?: string;
};

export type StudentProfileBundle = {
    learner: StudentProfileLearner;
    parent: StudentProfileParent;
    account: StudentProfileAccount;
};

export async function fetchStudentProfileBundle(): Promise<StudentProfileBundle> {
    const { data } = await apiClient.get<StudentProfileBundle>('/children/me/profile');
    return data;
}

export async function updateStudentAvatar(avatarUrl: string): Promise<ChildProfile> {
    const { data } = await apiClient.patch<{ child: ChildProfile }>('/children/me', {
        avatar_url: avatarUrl,
    });
    if (!data?.child) {
        throw new Error('Avatar update did not return profile.');
    }
    return data.child;
}

export function formatMemberSince(iso: string | undefined | null): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatLearnerAge(age: number | null | undefined): string {
    if (age == null || age < 0) return '—';
    return `${age} ${age === 1 ? 'Year' : 'Years'}`;
}

export function getStudentProfileErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
        if (error.response?.status === 404) {
            return 'Profile API not found. Restart the backend server.';
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not load profile. Please try again.';
}
