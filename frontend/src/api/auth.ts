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
    const id = raw.id ?? raw._id;
    if (!id) {
        throw new Error('Login response did not include a user id.');
    }

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

export function getLoginErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const data = error.response?.data;
        if (data && typeof data === 'object') {
            const record = data as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
            if (typeof record.error === 'string') return record.error;
        }
        if (error.response?.status === 401) {
            return 'Invalid email or password.';
        }
        if (error.message) return error.message;
    }
    if (error instanceof Error) return error.message;
    return 'Login failed. Please try again.';
}
