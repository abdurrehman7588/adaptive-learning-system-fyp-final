import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Parent, Student } from '../types';
import { storage } from '../data/storage';
import { useTheme } from './ThemeContext';
import {
    loginWithApi,
    loginStudentWithApi,
    registerWithApi,
    getLoginErrorMessage,
    fetchCurrentUser,
} from '../api/auth';
import { clearActiveChildId } from '../lib/activeChild';
import {
    clearAuthStorage,
    getToken,
    setStoredAuthUser,
    setToken,
} from '../lib/tokenStorage';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, role: 'parent' | 'student') => Promise<boolean>;
    loginStudent: (username: string, pin: string) => Promise<boolean>;
    logout: () => void;
    signupParent: (data: Omit<Parent, 'id' | 'role' | 'childIds'> & { password: string }) => Promise<boolean>;
    patchUser: (partial: Partial<User>) => void;
    getLastLoginError: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applyUserTheme(user: User, setAgeGroup: (group: 'parent' | '4-7' | '8-12') => void) {
    if (user.role === 'parent') {
        setAgeGroup('parent');
        return;
    }
    const student = user as Student;
    if (student.age <= 7) setAgeGroup('4-7');
    else setAgeGroup('8-12');
}

function persistSession(user: User) {
    storage.setCurrentUser({ id: user.id, role: user.role });
    setStoredAuthUser(user);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastLoginError, setLastLoginError] = useState<string | null>(null);
    const { setAgeGroup } = useTheme();

    useEffect(() => {
        const onSessionExpired = () => {
            setUser(null);
            clearActiveChildId();
            storage.setCurrentUser(null);
        };

        window.addEventListener('auth:session-expired', onSessionExpired);
        return () => window.removeEventListener('auth:session-expired', onSessionExpired);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            const token = getToken();

            if (token) {
                try {
                    const apiUser = await fetchCurrentUser();
                    if (cancelled) return;

                    setUser(apiUser);
                    persistSession(apiUser);
                    applyUserTheme(apiUser, setAgeGroup);

                } catch {
                    if (!cancelled) {
                        clearAuthStorage();
                        clearActiveChildId();
                        storage.setCurrentUser(null);
                        setUser(null);
                    }
                } finally {
                    if (!cancelled) setIsLoading(false);
                }
                return;
            }

            // No JWT — do not treat legacy localStorage as an API-authenticated session.
            const legacySession = storage.getCurrentUser();
            if (legacySession) {
                storage.setCurrentUser(null);
            }

            if (!cancelled) setIsLoading(false);
        };

        void restoreSession();

        return () => {
            cancelled = true;
        };
    }, [setAgeGroup]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const oauthToken = params.get('token');
        const oauthError = params.get('error');
        if (oauthError) {
            setLastLoginError(
                oauthError === 'google_not_configured'
                    ? 'Google sign-in is not configured on the server.'
                    : 'Google sign-in failed. Please try again.',
            );
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }
        if (!oauthToken) return;

        setToken(oauthToken);
        void fetchCurrentUser()
            .then((apiUser) => {
                setUser(apiUser);
                persistSession(apiUser);
                applyUserTheme(apiUser, setAgeGroup);
            })
            .catch(() => {
                setLastLoginError('Could not complete Google sign-in.');
            })
            .finally(() => {
                window.history.replaceState({}, '', window.location.pathname);
            });
    }, [setAgeGroup]);

    const loginStudent = async (username: string, pin: string): Promise<boolean> => {
        setLastLoginError(null);
        try {
            const { token, user: apiUser } = await loginStudentWithApi({ username, pin });
            setToken(token);
            setUser(apiUser);
            persistSession(apiUser);
            applyUserTheme(apiUser, setAgeGroup);
            return true;
        } catch (error) {
            setLastLoginError(getLoginErrorMessage(error));
            return false;
        }
    };

    const login = async (
        email: string,
        password: string,
        role: 'parent' | 'student',
    ): Promise<boolean> => {
        setLastLoginError(null);
        try {
            const { token, user: apiUser } = await loginWithApi({ email, password }, role);
            setToken(token);
            setUser(apiUser);
            persistSession(apiUser);
            applyUserTheme(apiUser, setAgeGroup);

            return true;
        } catch (error) {
            setLastLoginError(getLoginErrorMessage(error));
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        clearAuthStorage();
        clearActiveChildId();
        storage.setCurrentUser(null);
        setAgeGroup('parent');
    };

    const signupParent = async (
        data: Omit<Parent, 'id' | 'role' | 'childIds'> & { password: string },
    ): Promise<boolean> => {
        setLastLoginError(null);
        if (!data.email?.trim() || !data.password) {
            setLastLoginError('Email and password are required.');
            return false;
        }

        try {
            await registerWithApi({
                name: data.name,
                email: data.email.trim(),
                password: data.password,
                role: 'parent',
            });
            return login(data.email.trim(), data.password, 'parent');
        } catch (error) {
            setLastLoginError(getLoginErrorMessage(error));
            return false;
        }
    };

    const patchUser = (partial: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...partial } as User;
            persistSession(next);
            if (next.role === 'student') {
                storage.saveStudent(next as Student);
            }
            return next;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                loginStudent,
                logout,
                signupParent,
                patchUser,
                getLastLoginError: () => lastLoginError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
