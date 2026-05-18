import type { Parent, Student, QuizResult } from '../types';

const KEYS = {
    PARENTS: 'klp-parents',
    STUDENTS: 'klp-students',
    RESULTS: 'klp-results',
    CURRENT_USER: 'klp-curr-user',
};

export const storage = {
    getParents: (): Parent[] => {
        return JSON.parse(localStorage.getItem(KEYS.PARENTS) || '[]');
    },
    saveParent: (parent: Parent) => {
        const parents = storage.getParents();
        parents.push(parent);
        localStorage.setItem(KEYS.PARENTS, JSON.stringify(parents));
    },
    getStudents: (): Student[] => {
        return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
    },
    saveStudent: (student: Student) => {
        const students = storage.getStudents();
        students.push(student);
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    },
    saveStudentLink: (parentId: string, studentId: string) => {
        const students = storage.getStudents();
        const studentIndex = students.findIndex(s => s.id === studentId);
        if (studentIndex >= 0) {
            students[studentIndex].parentId = parentId;
            localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
        }

        const parents = storage.getParents();
        const parentIndex = parents.findIndex(p => p.id === parentId);
        if (parentIndex >= 0) {
            if (!parents[parentIndex].childIds.includes(studentId)) {
                parents[parentIndex].childIds.push(studentId);
                localStorage.setItem(KEYS.PARENTS, JSON.stringify(parents));
            }
        }
    },
    getResults: (studentId?: string): QuizResult[] => {
        const all = JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]') as QuizResult[];
        if (studentId) {
            return all.filter(r => r.studentId === studentId);
        }
        return all;
    },
    saveResult: (result: QuizResult) => {
        const all = storage.getResults();
        all.push(result);
        localStorage.setItem(KEYS.RESULTS, JSON.stringify(all));
    },
    setCurrentUser: (user: { id: string, role: string } | null) => {
        if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        else localStorage.removeItem(KEYS.CURRENT_USER);
    },
    getCurrentUser: () => {
        const stored = localStorage.getItem(KEYS.CURRENT_USER);
        return stored ? JSON.parse(stored) : null;
    }
};
