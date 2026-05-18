import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Menu, Home, BookOpen, User, Settings, Award, BarChart2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';

export const Layout = () => {
    const { ageGroup } = useTheme();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Define navigation items based on role
    const isParent = ageGroup === 'parent';

    const studentNav = [
        { label: 'Home', icon: Home, path: '/student/dashboard' },
        { label: 'Quizzes', icon: BookOpen, path: '/student/quizzes' },
        { label: 'Rewards', icon: Award, path: '/student/rewards' },
        { label: 'Profile', icon: User, path: '/student/profile' },
    ];

    const parentNav = [
        { label: 'Dashboard', icon: Home, path: '/parent/dashboard' },
        { label: 'Reports', icon: BarChart2, path: '/parent/reports' },
        { label: 'Settings', icon: Settings, path: '/parent/settings' },
    ];

    const navItems = isParent ? parentNav : studentNav;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 transition-colors duration-500 font-sans">
            {/* Sidebar (Desktop) */}
            {/* Sidebar (Desktop & Mobile) */}
            <Sidebar
                navItems={navItems}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
                    <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">KidsLearn</h1>
                    <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="w-6 h-6 text-slate-600" />
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
                    <AnimatePresence mode="wait">
                        <div key={location.pathname} className="min-h-full">
                            <Outlet />
                        </div>
                    </AnimatePresence>
                </div>

                {/* Mobile Bottom Nav (Student Only) */}
                {!isParent && (
                    <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around p-2 pb-safe sticky bottom-0 z-10">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path} className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                                    isActive ? "text-indigo-600" : "text-gray-400"
                                )}>
                                    <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                )}
            </main>
        </div>
    );
};
