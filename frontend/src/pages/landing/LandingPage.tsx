import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MascotBear } from '../../components/illustrations/MascotBear';
import { MascotOwl } from '../../components/illustrations/MascotOwl';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export const LandingPage = () => {
    // Animal Characters for Background (from StudentAuth)
    const animals = [
        { icon: "🦁", x: 10, y: 20, delay: 0 },
        { icon: "🐰", x: 80, y: 15, delay: 2 },
        { icon: "🐼", x: 15, y: 80, delay: 4 },
        { icon: "🐵", x: 85, y: 70, delay: 1 },
        { icon: "🦊", x: 45, y: 10, delay: 3 },
        { icon: "🐨", x: 50, y: 90, delay: 5 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-200 to-pink-300 relative font-sans flex flex-col overflow-hidden">
            {/* Animated Background Animals */}
            {animals.map((animal, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 1,
                        scale: [1, 1.2, 1],
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: animal.delay,
                        ease: "easeInOut"
                    }}
                    className="absolute text-6xl pointer-events-none filter drop-shadow-md opacity-40 md:opacity-60"
                    style={{ left: `${animal.x}%`, top: `${animal.y}%` }}
                >
                    {animal.icon}
                </motion.div>
            ))}

            {/* Floating Clouds */}
            <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-10 text-white opacity-40 text-7xl md:text-8xl pointer-events-none"
            >☁️</motion.div>
            <motion.div
                animate={{ x: [0, -100, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-32 right-10 text-white opacity-30 text-8xl md:text-9xl pointer-events-none"
            >☁️</motion.div>

            <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col justify-center min-h-screen z-10 relative">
                {/* Header */}
                <motion.header
                    className="text-center mb-16 shrink-0 pt-8 md:pt-0"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-lg border-2 border-orange-200"
                    >
                        <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-sm md:text-base font-black text-orange-600 tracking-wide uppercase">Fun Learning for Ages 4-12 🦁</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-6 drop-shadow-sm tracking-tight leading-tight transform -rotate-2">
                        Kids Learning <br className="md:hidden" /><span className="text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]">Platform</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed px-4 drop-shadow-sm">
                        A magical world where learning meets adventure. <br className="hidden md:inline" /> Safe, adaptive, and super fun! 🚀
                    </p>
                </motion.header>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch w-full mb-12">
                    {/* Student Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="h-full"
                    >
                        <Link to="/student/login">
                            <Card className="h-full p-8 bg-gradient-to-br from-white via-orange-50 to-pink-50 border-4 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(249,115,22,0.5)] hover:-translate-y-2 group rounded-[3rem] cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                                </div>
                                <div className="flex flex-col items-center text-center h-full justify-between">
                                    <div className="h-48 w-full flex items-center justify-center mb-6 relative">
                                        <div className="absolute inset-0 bg-orange-200 rounded-full opacity-0 group-hover:opacity-60 transition-opacity blur-2xl transform scale-75" />
                                        <MascotBear className="w-40 h-40 z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-800 mb-3 group-hover:text-orange-600 transition-colors">I'm a Student</h2>
                                        <p className="text-lg font-medium text-slate-600 mb-8">Play quizzes, collect badges, and explore new worlds!</p>
                                    </div>
                                    <div className="w-full">
                                        <Button size="lg" className="w-full text-xl font-bold py-6 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30 transform group-hover:scale-105 transition-all">
                                            Start Adventure <ArrowRight className="ml-2 w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>

                    {/* Parent Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="h-full"
                    >
                        <Link to="/parent/login">
                            <Card className="h-full p-8 bg-white/80 backdrop-blur-md border-4 border-white/60 hover:border-teal-300 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(45,212,191,0.4)] hover:-translate-y-2 group rounded-[3rem] cursor-pointer">
                                <div className="flex flex-col items-center text-center h-full justify-between">
                                    <div className="h-48 w-full flex items-center justify-center mb-6 relative">
                                        <div className="absolute inset-0 bg-teal-100 rounded-full opacity-0 group-hover:opacity-60 transition-opacity blur-2xl transform scale-75" />
                                        <MascotOwl className="w-44 h-44 z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">I'm a Parent</h2>
                                        <p className="text-lg font-medium text-slate-600 mb-8">Track progress, view insights, and manage accounts.</p>
                                    </div>
                                    <div className="w-full">
                                        <Button variant="outline" size="lg" className="w-full text-xl font-bold py-6 rounded-2xl border-4 border-teal-500 text-teal-600 hover:bg-teal-50 shadow-sm transform group-hover:scale-105 transition-all">
                                            Parent Dashboard
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                </div>

                <motion.footer
                    className="mt-auto text-center text-slate-600/80 font-bold text-sm py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    © 2026 Kids Learning Platform. Mock Demo.
                </motion.footer>
            </div>
        </div>
    );
};
