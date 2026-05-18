import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type AgeGroup = '4-7' | '8-12' | 'parent';

interface ThemeContextType {
    ageGroup: AgeGroup;
    setAgeGroup: (group: AgeGroup) => void;
    theme: {
        primary: string;
        secondary: string;
        background: string;
        fontFamily: string;
        borderRadius: string;
    };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Definitions
const themes: Record<AgeGroup, ThemeContextType['theme']> = {
    '4-7': {
        primary: 'bg-orange-400',
        secondary: 'bg-green-400',
        background: 'bg-yellow-50',
        fontFamily: 'font-comic', // Will map to a rounded font
        borderRadius: 'rounded-3xl',
    },
    '8-12': {
        primary: 'bg-blue-500',
        secondary: 'bg-teal-400',
        background: 'bg-slate-50',
        fontFamily: 'font-sans',
        borderRadius: 'rounded-xl',
    },
    'parent': {
        primary: 'bg-indigo-600',
        secondary: 'bg-slate-200',
        background: 'bg-gray-50',
        fontFamily: 'font-sans',
        borderRadius: 'rounded-lg',
    }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [ageGroup, setAgeGroup] = useState<AgeGroup>('parent');

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('klp-theme-age-group');
        if (saved) {
            setAgeGroup(saved as AgeGroup);
        }
    }, []);

    const handleSetAgeGroup = (group: AgeGroup) => {
        setAgeGroup(group);
        localStorage.setItem('klp-theme-age-group', group);
    };

    return (
        <ThemeContext.Provider value={{ ageGroup, setAgeGroup: handleSetAgeGroup, theme: themes[ageGroup] }}>
            <div className={`${themes[ageGroup].fontFamily} ${themes[ageGroup].background} min-h-screen transition-colors duration-500`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
