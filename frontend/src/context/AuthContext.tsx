import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Parent, Student } from '../types';
import { storage } from '../data/storage';
import { useTheme } from './ThemeContext';
import { loginWithApi, registerWithApi, getLoginErrorMessage } from '../api/auth';
import { clearActiveChildId, primeActiveChildFromApi } from '../lib/activeChild';
import {
    clearAuthStorage,
    getStoredAuthUser,
    getToken,
    setStoredAuthUser,
    setToken,
} from '../lib/tokenStorage';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, role: 'parent' | 'student') => Promise<boolean>;
    loginStudentByName: (name: string) => boolean;
    logout: () => void;
    signupParent: (data: Omit<Parent, 'id' | 'role' | 'childIds'> & { password: string }) => Promise<boolean>;
    signupStudent: (data: Omit<Student, 'id' | 'role'>) => void;
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
        const token = getToken();
        const storedUser = getStoredAuthUser<User>();

        if (token && storedUser) {
            setUser(storedUser);
            applyUserTheme(storedUser, setAgeGroup);
            storage.setCurrentUser({ id: storedUser.id, role: storedUser.role });
            setIsLoading(false);
            return;
        }

        const legacySession = storage.getCurrentUser();
        if (legacySession) {
            if (legacySession.role === 'parent') {
                const parents = storage.getParents();
                const p = parents.find((x) => x.id === legacySession.id);
                if (p) {
                    setUser(p);
                    setAgeGroup('parent');
                }
            } else {
                const students = storage.getStudents();
                const s = students.find((x) => x.id === legacySession.id);
                if (s) {
                    setUser(s);
                    if (s.age <= 7) setAgeGroup('4-7');
                    else setAgeGroup('8-12');
                }
            }
        }

        setIsLoading(false);
    }, [setAgeGroup]);

    const loginStudentByName = (name: string): boolean => {
        const students = storage.getStudents();
        const found = students.find((s) => s.name === name);
        if (!found) return false;

        setUser(found);
        persistSession(found);
        applyUserTheme(found, setAgeGroup);
        return true;
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

            if (role === 'parent') {
                await primeActiveChildFromApi();
            }

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

    const signupStudent = (data: Omit<Student, 'id' | 'role'>) => {
        const newStudent: Student = {
            ...data,
            id: `s-${Date.now()}`,
            role: 'student',
        };
        storage.saveStudent(newStudent);
        setUser(newStudent);
        persistSession(newStudent);
        if (newStudent.age <= 7) setAgeGroup('4-7');
        else setAgeGroup('8-12');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                loginStudentByName,
                logout,
                signupParent,
                signupStudent,
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
