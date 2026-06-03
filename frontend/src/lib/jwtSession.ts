import { getToken } from './tokenStorage';

type JwtPayload = {
    role?: string;
    childId?: string | number;
    sub?: string | number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
        return null;
    }
}

/** Student child id from JWT (source of truth for learner APIs). */
export function getStudentChildIdFromToken(): number | null {
    const token = getToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== 'student') {
        return null;
    }

    const raw = payload.childId ?? payload.sub;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function getAuthRoleFromToken(): 'parent' | 'student' | 'admin' | null {
    const token = getToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (payload?.role === 'parent' || payload?.role === 'student' || payload?.role === 'admin') {
        return payload.role;
    }
    return null;
}
