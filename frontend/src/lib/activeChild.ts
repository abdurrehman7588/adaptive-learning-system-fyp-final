import { apiClient } from '../api/client';
import { getAuthRoleFromToken, getStudentChildIdFromToken } from './jwtSession';
import { getStoredAuthUser, getToken } from './tokenStorage';
import type { User } from '../types';

const ACTIVE_CHILD_KEY = 'klp-active-child-id';

export type ChildRecord = {
    id: number;
    name: string;
    username?: string;
    grade_level?: string | null;
    age?: number | null;
    avatar_url?: string | null;
};

export const getActiveChildId = (): number | null => {
    const raw = localStorage.getItem(ACTIVE_CHILD_KEY);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const setActiveChildId = (childId: number): void => {
    localStorage.setItem(ACTIVE_CHILD_KEY, String(childId));
};

/**
 * Pick the active child for parent UI: keep valid in-memory choice, else localStorage, else first.
 */
export function resolveSelectedChildIdFromList(
    children: Array<{ id: number }>,
    preferredId?: number | null,
): number | null {
    if (!children.length) {
        clearActiveChildId();
        return null;
    }

    const validIds = new Set(
        children
            .map((child) => Number(child.id))
            .filter((id) => Number.isInteger(id) && id > 0),
    );

    const candidates = [
        preferredId != null ? Number(preferredId) : null,
        getActiveChildId(),
    ].filter((id): id is number => id != null && validIds.has(id));

    const resolved = candidates[0] ?? [...validIds][0] ?? null;
    if (resolved) {
        setActiveChildId(resolved);
    }
    return resolved;
}

export const clearActiveChildId = (): void => {
    localStorage.removeItem(ACTIVE_CHILD_KEY);
};

function extractChildrenList(data: unknown): ChildRecord[] {
    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    if (Array.isArray(record.children)) {
        return record.children as ChildRecord[];
    }

    if (Array.isArray(record.data)) {
        return record.data as ChildRecord[];
    }

    return [];
}

export async function fetchChildrenForParent(): Promise<ChildRecord[]> {
    if (!getToken()) {
        return [];
    }

    const { data } = await apiClient.get<unknown>('/children');
    return extractChildrenList(data);
}

/**
 * Resolves the PostgreSQL child_id used for quiz_attempts.
 * Validates cached ids against the API so stale localStorage values are cleared.
 */
function resolveStudentChildId(): number | null {
    const role = getAuthRoleFromToken();
    if (role !== 'student') {
        return null;
    }

    const fromToken = getStudentChildIdFromToken();
    if (fromToken) {
        setActiveChildId(fromToken);
        return fromToken;
    }

    const user = getStoredAuthUser<User>();
    if (!user || user.role !== 'student') {
        return null;
    }

    const parsed = Number.parseInt(String(user.id), 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    setActiveChildId(parsed);
    return parsed;
}

export async function resolveActiveChildId(): Promise<number | null> {
    if (!getToken()) {
        return null;
    }

    const studentChildId = resolveStudentChildId();
    if (studentChildId) {
        return studentChildId;
    }

    try {
        const children = await fetchChildrenForParent();

        if (!children.length) {
            clearActiveChildId();
            return null;
        }

        const stored = getActiveChildId();
        if (stored) {
            const stillValid = children.some((child) => child.id === stored);
            if (stillValid) {
                return stored;
            }
            clearActiveChildId();
        }

        const firstChild = children[0];
        if (!firstChild?.id) {
            return null;
        }

        setActiveChildId(firstChild.id);
        return firstChild.id;
    } catch {
        return null;
    }
}

/** Call after parent API login so quiz submission has a child id ready. */
export async function primeActiveChildFromApi(): Promise<number | null> {
    return resolveActiveChildId();
}
