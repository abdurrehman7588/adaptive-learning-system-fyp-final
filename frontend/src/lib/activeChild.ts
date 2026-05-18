import { apiClient } from '../api/client';
import { getToken } from './tokenStorage';

const ACTIVE_CHILD_KEY = 'klp-active-child-id';

export type ChildRecord = {
    id: number;
    name: string;
    grade_level?: string | null;
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
export async function resolveActiveChildId(): Promise<number | null> {
    if (!getToken()) {
        return null;
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
