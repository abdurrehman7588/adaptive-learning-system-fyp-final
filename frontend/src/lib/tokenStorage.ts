const TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'klp-auth-user';

/** Returns a raw JWT string suitable for `Authorization: Bearer <token>`. */
export const getToken = (): string | null => {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;

    let token = raw.trim();
    if (!token) return null;

    // Handle tokens accidentally stored as JSON strings.
    if (token.startsWith('"') && token.endsWith('"')) {
        try {
            const parsed: unknown = JSON.parse(token);
            if (typeof parsed === 'string') {
                token = parsed.trim();
            }
        } catch {
            token = token.slice(1, -1).trim();
        }
    }

    // Strip a duplicated Bearer prefix if present in storage.
    if (token.toLowerCase().startsWith('bearer ')) {
        token = token.slice(7).trim();
    }

    return token || null;
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getStoredAuthUser = <T>(): T | null => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
};

export const setStoredAuthUser = (user: unknown): void => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const removeStoredAuthUser = (): void => {
    localStorage.removeItem(AUTH_USER_KEY);
};

export const clearAuthStorage = (): void => {
    removeToken();
    removeStoredAuthUser();
};
