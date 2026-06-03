import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ParentAuth = () => {
    const navigate = useNavigate();
    const { user, isLoading, login, logout, signupParent, getLastLoginError } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isLogin) {
            setIsSubmitting(true);
            const success = await login(formData.email, formData.password, 'parent');
            setIsSubmitting(false);

            if (success) {
                navigate('/parent/dashboard');
                return;
            }

            setError(getLastLoginError() ?? 'Invalid email or password.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsSubmitting(true);
        const success = await signupParent({
            name: formData.name,
            email: formData.email,
            password: formData.password,
        });
        setIsSubmitting(false);

        if (success) {
            navigate('/parent/dashboard');
            return;
        }

        const message = getLastLoginError() ?? 'Could not create account.';
        setError(message);
        if (message.includes('already exists')) {
            setIsLogin(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 relative overflow-hidden">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <motion.div className="bg-white/90 backdrop-blur-xl border border-white/60 ring-1 ring-slate-900/5 p-8 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] relative overflow-hidden">
                    <motion.div className="absolute top-[-50%] left-[-50%] w-full h-full bg-gradient-to-br from-teal-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <motion.div className="relative z-10">
                        {!isLoading && user?.role === 'parent' && (
                            <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                                <p>
                                    Signed in as <strong>{user.name}</strong>.{' '}
                                    <Link to="/parent/dashboard" className="font-semibold underline">
                                        Open dashboard
                                    </Link>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => logout()}
                                    className="mt-2 font-semibold text-teal-700 underline"
                                >
                                    Sign out to use another account
                                </button>
                            </div>
                        )}

                        <motion.div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-teal-500/20"
                            >
                                <span className="text-3xl font-bold text-white">P</span>
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                                {isLogin ? 'Welcome Back!' : 'Join Us'}
                            </h2>
                            <p className="text-slate-500 mt-2">
                                {isLogin
                                    ? 'Sign in to access your parent dashboard'
                                    : 'Create your account to start monitoring'}
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-white/50 focus:bg-white"
                                />
                            )}
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="parent@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="bg-white/50 focus:bg-white"
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={isLogin ? 1 : 8}
                                className="bg-white/50 focus:bg-white"
                            />
                            {!isLogin && (
                                <p className="text-xs text-slate-500 -mt-2">
                                    Use at least 8 characters.
                                </p>
                            )}

                            {error && (
                                <p className="text-sm text-red-600 font-medium" role="alert">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="w-full mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25 py-3 text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isSubmitting ? 'Signing in...' : isLogin ? 'Sign In' : 'Create Account'}
                            </Button>

                            {isLogin && (
                                <a
                                    href="/api/auth/google"
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Continue with Google
                                </a>
                            )}
                        </form>

                        <motion.div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                }}
                                className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
                            >
                                {isLogin ? 'New here? ' : 'Already have an account? '}
                                <span className="text-teal-600 font-bold hover:underline">
                                    {isLogin ? 'Create an account' : 'Sign in'}
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};
