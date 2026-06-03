import { isAxiosError } from 'axios';
import type { Parent, Student, User } from '../types';
import { apiClient } from './client';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResult {
    token: string;
    user: User;
}

type ApiUser = {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: 'parent' | 'student';
    childIds?: string[];
    age?: number;
    grade?: string;
    parentId?: string;
    avatar?: string;
};

function extractToken(data: Record<string, unknown>): string | null {
    if (typeof data.token === 'string') return data.token;
    if (typeof data.accessToken === 'string') return data.accessToken;
    if (typeof data.jwt === 'string') return data.jwt;

    const nested = data.data;
    if (nested && typeof nested === 'object') {
        return extractToken(nested as Record<string, unknown>);
    }

    return null;
}

function normalizeRole(
    role: unknown,
    expectedRole: 'parent' | 'student',
): 'parent' | 'student' | null {
    if (typeof role !== 'string') return null;
    const lower = role.toLowerCase();

    if (expectedRole === 'parent') {
        if (lower === 'parent' || lower === 'instructor' || lower === 'admin') {
            return 'parent';
        }
        return null;
    }

    if (lower === 'student') return 'student';
    return null;
}

function mapApiUser(raw: ApiUser, fallbackRole: 'parent' | 'student'): User {
    const rawId = raw.id ?? raw._id;
    if (rawId === undefined || rawId === null || rawId === '') {
        throw new Error('Login response did not include a user id.');
    }
    const id = String(rawId);

    const role = normalizeRole(raw.role, fallbackRole) ?? fallbackRole;
    const name = raw.name ?? raw.email ?? 'User';

    if (role === 'parent') {
        const parent: Parent = {
            id,
            name,
            email: raw.email,
            role: 'parent',
            childIds: raw.childIds ?? [],
        };
        return parent;
    }

    const student: Student = {
        id,
        name,
        email: raw.email,
        role: 'student',
        age: raw.age ?? 8,
        grade: raw.grade ?? '1st Grade',
        parentId: raw.parentId,
        avatar: raw.avatar,
    };
    return student;
}

function extractApiUser(data: Record<string, unknown>): ApiUser | null {
    if (data.user && typeof data.user === 'object') {
        return data.user as ApiUser;
    }

    const nested = data.data;
    if (nested && typeof nested === 'object') {
        const nestedRecord = nested as Record<string, unknown>;
        if (nestedRecord.user && typeof nestedRecord.user === 'object') {
            return nestedRecord.user as ApiUser;
        }
        return nestedRecord as ApiUser;
    }

    if (data.id || data._id) {
        return data as ApiUser;
    }

    return null;
}

export async function registerWithApi(data: {
    name: string;
    email: string;
    password: string;
    role: 'parent';
}): Promise<void> {
    await apiClient.post('/auth/register', data);
}

export async function loginWithApi(
    credentials: LoginCredentials,
    expectedRole: 'parent' | 'student',
): Promise<LoginResult> {
    const { data } = await apiClient.post<Record<string, unknown>>('/auth/login', credentials);

    const token = extractToken(data);
    if (!token) {
        throw new Error('Login response did not include a token.');
    }

    const apiUser = extractApiUser(data);
    if (!apiUser) {
        throw new Error('Login response did not include user details.');
    }

    const user = mapApiUser(apiUser, expectedRole);
    const actualRole = normalizeRole(user.role, expectedRole);
    if (actualRole && actualRole !== expectedRole) {
        throw new Error(`This account cannot sign in as a ${expectedRole}.`);
    }

    return { token, user };
}

export async function fetchCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<{ user: ApiUser }>('/auth/me');
    const rawId = data.user?.id ?? data.user?._id;
    if (rawId === undefined || rawId === null || rawId === '') {
        throw new Error('Could not load profile.');
    }

    const roleHint: 'parent' | 'student' =
        data.user?.role === 'student' ? 'student' : 'parent';
    const role = normalizeRole(data.user?.role, roleHint) ?? roleHint;
    return mapApiUser(data.user, role);
}

export async function loginStudentWithApi(credentials: {
    username: string;
    pin: string;
}): Promise<LoginResult> {
    const { data } = await apiClient.post<Record<string, unknown>>(
        '/auth/student/login',
        credentials,
    );

    const token = extractToken(data);
    if (!token) {
        throw new Error('Login response did not include a token.');
    }

    const apiUser = extractApiUser(data);
    if (!apiUser) {
        throw new Error('Login response did not include user details.');
    }

    const user = mapApiUser(apiUser, 'student');
    if (user.role !== 'student') {
        throw new Error('This account cannot sign in as a student.');
    }

    return { token, user };
}

export async function updateParentProfileName(name: string): Promise<User> {
    const { data } = await apiClient.put<{ user: ApiUser }>('/auth/profile', { name });
    if (!data.user) {
        throw new Error('Profile update did not return user details.');
    }
    return mapApiUser(data.user, 'parent');
}

import { isApiRequestError, messageFromAxiosError } from './errors';

const AUTH_ERROR_HINTS: Record<string, string> = {
    AUTH_EMAIL_EXISTS:
        'An account with this email already exists. Switch to Sign in and use the same password you used before.',
    AUTH_VALIDATION_ERROR: 'Please check the form fields and try again.',
};

function formatValidationDetails(
    errors: Array<{ field?: string; message?: string }> | undefined,
): string | null {
    if (!errors?.length) {
        return null;
    }

    const parts = errors
        .filter((item) => item.message)
        .map((item) => (item.field ? `${item.field}: ${item.message}` : item.message));

    return parts.length ? parts.join(' · ') : null;
}

export function getLoginErrorMessage(error: unknown): string {
    if (isApiRequestError(error)) {
        if (error.code && AUTH_ERROR_HINTS[error.code]) {
            const details = formatValidationDetails(error.errors);
            return details ? `${AUTH_ERROR_HINTS[error.code]} (${details})` : AUTH_ERROR_HINTS[error.code];
        }

        const details = formatValidationDetails(error.errors);
        if (details) {
            return details;
        }

        if (error.message === 'User already exists') {
            return AUTH_ERROR_HINTS.AUTH_EMAIL_EXISTS;
        }

        return error.message;
    }

    const fromAxios = messageFromAxiosError(error);
    if (fromAxios) {
        return getLoginErrorMessage(fromAxios);
    }

    if (isAxiosError(error)) {
        if (error.response?.status === 401) {
            return 'Invalid email or password.';
        }
        if (error.message) return error.message;
    }

    if (error instanceof Error) {
        if (error.message === 'User already exists') {
            return AUTH_ERROR_HINTS.AUTH_EMAIL_EXISTS;
        }
        return error.message;
    }

    return 'Login failed. Please try again.';
}

export function isEmailAlreadyRegisteredError(error: unknown): boolean {
    if (isApiRequestError(error)) {
        return error.code === 'AUTH_EMAIL_EXISTS' || error.status === 409;
    }
    return getLoginErrorMessage(error) === AUTH_ERROR_HINTS.AUTH_EMAIL_EXISTS;
}
