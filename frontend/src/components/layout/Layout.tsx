import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Menu, Home, BookOpen, User, Settings, Award, BarChart2, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';

type NavItem = {
    label: string;
    shortLabel: string;
    icon: typeof Home;
    path: string;
};

export const Layout = () => {
    const { ageGroup } = useTheme();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isParent = ageGroup === 'parent';

    const studentNav: NavItem[] = [
        { label: 'Home', shortLabel: 'Home', icon: Home, path: '/student/dashboard' },
        { label: 'Quizzes', shortLabel: 'Paths', icon: BookOpen, path: '/student/quizzes' },
        {
            label: 'Emotional Intelligence',
            shortLabel: 'EI',
            icon: Heart,
            path: '/student/emotional',
        },
        { label: 'Rewards', shortLabel: 'Rewards', icon: Award, path: '/student/rewards' },
        { label: 'Profile', shortLabel: 'Profile', icon: User, path: '/student/profile' },
    ];

    const parentNav: NavItem[] = [
        { label: 'Dashboard', shortLabel: 'Home', icon: Home, path: '/parent/dashboard' },
        { label: 'Reports', shortLabel: 'Reports', icon: BarChart2, path: '/parent/reports' },
        { label: 'Settings', shortLabel: 'Settings', icon: Settings, path: '/parent/settings' },
    ];

    const navItems = isParent ? parentNav : studentNav;

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isSidebarOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isSidebarOpen]);

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-gray-50 transition-colors duration-500 font-sans">
            <Sidebar
                navItems={navItems}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden bg-slate-50/50">
                <header className="md:hidden h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-10 shrink-0">
                    <h1 className="font-bold text-base sm:text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 truncate pr-2">
                        KidsLearn
                    </h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 min-h-11 min-w-11"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6 text-slate-600" />
                    </Button>
                </header>

                <div
                    className={cn(
                        'flex-1 overflow-y-auto overflow-x-hidden scroll-smooth',
                        !isParent && 'pb-safe-nav md:pb-0',
                    )}
                >
                    <AnimatePresence mode="wait">
                        <div key={location.pathname} className="min-w-0 w-full">
                            <Outlet />
                        </div>
                    </AnimatePresence>
                </div>

                {!isParent && (
                    <nav
                        className="md:hidden bg-white border-t border-gray-200 flex justify-between items-stretch px-1 pt-1 pb-safe sticky bottom-0 z-10 shrink-0"
                        aria-label="Student navigation"
                    >
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        'flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 py-2 px-0.5 rounded-lg transition-colors min-h-[3.25rem]',
                                        isActive ? 'text-indigo-600' : 'text-gray-400',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'w-5 h-5 sm:w-6 sm:h-6 shrink-0',
                                            isActive && 'fill-current',
                                        )}
                                    />
                                    <span className="text-[10px] sm:text-xs font-medium leading-tight text-center truncate w-full px-0.5">
                                        <span className="sm:hidden">{item.shortLabel}</span>
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </main>
        </div>
    );
};
