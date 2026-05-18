import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface SidebarProps {
    navItems: { label: string; icon: any; path: string }[];
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar = ({ navItems, isOpen = false, onClose }: SidebarProps) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isStudent = location.pathname.startsWith('/student');

    // Theme Configuration
    const theme = isStudent ? {
        // Student Theme (Sunny/Playful)
        bg: "bg-gradient-to-br from-yellow-50 via-white to-orange-50",
        logoBg: "bg-gradient-to-br from-orange-400 to-pink-500",
        logoShadow: "shadow-orange-500/20",
        textGradient: "bg-gradient-to-r from-orange-600 to-pink-600",
        activeTab: "bg-gradient-to-r from-orange-100/50 to-pink-100/50",
        activeText: "text-orange-700",
        activeIcon: "text-orange-600",
        activeDot: "bg-orange-600",
        hoverBg: "hover:bg-orange-50/50",
        premiumBg: "bg-gradient-to-br from-orange-500 to-pink-600", // "Super Hero" plan for kids maybe?
        premiumShadow: "shadow-orange-500/25",
        premiumText: "text-orange-100",
        buttonHover: "hover:text-orange-600 hover:bg-orange-50"
    } : {
        // Parent Theme (Teal/Professional)
        bg: "bg-gradient-to-br from-teal-50 via-white to-cyan-50",
        logoBg: "bg-gradient-to-br from-teal-600 to-cyan-600",
        logoShadow: "shadow-teal-500/20",
        textGradient: "bg-gradient-to-r from-slate-800 to-slate-600",
        activeTab: "bg-gradient-to-r from-teal-100/50 to-cyan-100/50",
        activeText: "text-teal-700",
        activeIcon: "text-teal-600",
        activeDot: "bg-teal-600",
        hoverBg: "hover:bg-slate-50/50",
        premiumBg: "bg-gradient-to-br from-teal-600 to-cyan-700",
        premiumShadow: "shadow-teal-500/25",
        premiumText: "text-teal-100",
        buttonHover: "hover:text-red-500 hover:bg-red-50"
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={{ width: 288 }}
                animate={{
                    width: isCollapsed ? 80 : 288,
                }}
                // Implementing separate variants for desktop/mobile is cleaner but mixing with width requires care.
                // Let's rely on classes for positioning and standard animate for width.
                // Mobile Open/Close via CSS transform is easier.

                className={cn(
                    "flex flex-col border-r border-slate-200/60 h-screen sticky top-0 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out",
                    // Desktop styles: always visible (reset transform)
                    "md:translate-x-0",
                    // Mobile styles: fixed, full height, slide in/out
                    "fixed md:sticky left-0 top-0 bottom-0",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    theme.bg
                )}
            >
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 bg-white border border-slate-200 text-slate-500 rounded-full p-1 shadow-sm hover:text-indigo-600 hover:border-indigo-200 transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed ? "p-4 justify-center" : "p-8 pb-6")}>
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0",
                        theme.logoBg,
                        theme.logoShadow
                    )}>
                        <span className="text-white font-bold text-xl">{isStudent ? '🚀' : 'K'}</span>
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.h2
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className={cn(
                                    "text-2xl font-bold bg-clip-text text-transparent tracking-tight whitespace-nowrap overflow-hidden",
                                    theme.textGradient
                                )}
                            >
                                {isStudent ? 'SuperKid' : 'KidsLearn'}
                            </motion.h2>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 px-3 space-y-2 py-6">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="block relative group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className={cn("absolute inset-0 rounded-xl", theme.activeTab)}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={cn(
                                    "relative flex items-center rounded-xl transition-all duration-300",
                                    isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3.5",
                                    isActive
                                        ? cn("font-bold", theme.activeText)
                                        : cn("text-slate-500", theme.hoverBg)
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                        isActive && theme.activeIcon
                                    )} />

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="font-medium whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {isActive && !isCollapsed && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={cn("ml-auto w-1.5 h-1.5 rounded-full", theme.activeDot)}
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className={cn("border-t border-slate-100", isCollapsed ? "p-3" : "p-6")}>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className={cn(
                                    "mb-6 px-4 py-4 rounded-2xl text-white shadow-lg relative overflow-hidden group",
                                    theme.premiumBg,
                                    theme.premiumShadow
                                )}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-110" />
                                <h4 className="font-bold text-sm relative z-10">{isStudent ? 'Super Hero Plan' : 'Premium Plan'}</h4>
                                <p className={cn("text-xs mt-1 relative z-10", theme.premiumText)}>
                                    {isStudent ? 'You are a Hero! 🌟' : 'You are on the Pro plan.'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Link to="/">
                        <Button variant="ghost" className={cn(
                            "w-full text-slate-500 rounded-xl transition-colors",
                            isCollapsed ? "justify-center px-0" : "justify-start gap-3",
                            theme.buttonHover
                        )}>
                            <LogOut className="w-5 h-5" />
                            {!isCollapsed && <span>Logout</span>}
                        </Button>
                    </Link>
                </div>
            </motion.aside>
        </>
    );
};
