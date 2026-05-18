import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getToken } from '../../lib/tokenStorage';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';

export const StudentAuth = () => {
    const navigate = useNavigate();
    const { user, isLoading, loginStudentByName, signupStudent } = useAuth();
    const { setAgeGroup } = useTheme();
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        age: '7',
        grade: '1st Grade',
    });

    if (!isLoading && user?.role === 'student') {
        return <Navigate to="/student/dashboard" replace />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            const success = loginStudentByName(formData.name);
            if (success) navigate('/student/dashboard');
            else alert('Student not found! Try signing up.');
        } else {
            signupStudent({
                name: formData.name,
                age: parseInt(formData.age),
                grade: formData.grade
            });
            // Theme is set in login/signup implicit
            navigate('/student/dashboard');
        }
    };

    // Dynamic Theme Preview
    const handleAgeChange = (val: string) => {
        setFormData({ ...formData, age: val });
        const age = parseInt(val);
        if (age <= 7) setAgeGroup('4-7');
        else setAgeGroup('8-12');
    };

    // Animal Characters for Background
    const animals = [
        { icon: "🦁", x: 10, y: 20, delay: 0 },
        { icon: "🐰", x: 80, y: 15, delay: 2 },
        { icon: "🐼", x: 15, y: 80, delay: 4 },
        { icon: "🐵", x: 85, y: 70, delay: 1 },
        { icon: "🦊", x: 45, y: 10, delay: 3 },
        { icon: "🐨", x: 50, y: 90, delay: 5 },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-orange-200 to-pink-300 p-4 relative overflow-hidden font-sans">
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
                    className="absolute text-6xl pointer-events-none filter drop-shadow-md opacity-60"
                    style={{ left: `${animal.x}%`, top: `${animal.y}%` }}
                >
                    {animal.icon}
                </motion.div>
            ))}

            {/* Floating Clouds */}
            <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-10 text-white opacity-40 text-8xl"
            >☁️</motion.div>
            <motion.div
                animate={{ x: [0, -100, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-32 right-10 text-white opacity-30 text-9xl"
            >☁️</motion.div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-4 border-white/50 bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(255,100,0,0.3)] relative overflow-hidden">
                    {/* Header with Mascot */}
                    <div className="text-center mb-8 relative">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-7xl mb-4 inline-block filter drop-shadow-lg"
                        >
                            🚀
                        </motion.div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 tracking-tight transform -rotate-2">
                            {isLogin ? 'Welcome Back!' : 'Join the Fun!'}
                        </h2>
                        <p className="text-slate-500 font-medium mt-2">
                            {isLogin ? 'Ready to learn something new?' : 'Create your magical profile!'}
                        </p>
                    </div>

                    {getToken() ? (
                        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                            Parent account is linked on this device. Quiz scores will save to the
                            parent dashboard.
                        </p>
                    ) : (
                        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                            For scores on the parent dashboard, a parent must sign in first at{' '}
                            <Link to="/parent/login" className="font-semibold underline">
                                Parent Login
                            </Link>{' '}
                            (demo: parent@demo.com / password123).
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Your Name</label>
                            <Input
                                placeholder="Super Kid Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="text-lg bg-orange-50 border-2 border-orange-100 focus:border-orange-400 rounded-xl h-12 transition-all placeholder:text-orange-200/80"
                            />
                        </div>

                        {!isLogin && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Age</label>
                                        <Input
                                            type="number"
                                            value={formData.age}
                                            onChange={e => handleAgeChange(e.target.value)}
                                            required
                                            min="4"
                                            max="12"
                                            className="text-lg bg-blue-50 border-2 border-blue-100 focus:border-blue-400 rounded-xl h-12 text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Grade</label>
                                        <select
                                            className="w-full h-12 px-4 border-2 border-purple-100 bg-purple-50 rounded-xl font-medium focus:border-purple-400 focus:outline-none transition-all text-slate-700"
                                            value={formData.grade}
                                            onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                        >
                                            <option>Preschool</option>
                                            <option>Kindergarten</option>
                                            <option>1st Grade</option>
                                            <option>2nd Grade</option>
                                            <option>3rd Grade</option>
                                            <option>4th Grade</option>
                                            <option>5th Grade</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg shadow-orange-400/30 hover:shadow-xl transition-all border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 relative top-0"
                        >
                            {isLogin ? '🚀 Start Adventure' : '🌟 Create Hero'}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 font-medium text-sm">
                            {isLogin ? "New Explorer? " : "Already a Hero? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-orange-500 font-bold hover:text-orange-600 underline decoration-2 underline-offset-2"
                            >
                                {isLogin ? "Create Profile" : "Login Here"}
                            </button>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
