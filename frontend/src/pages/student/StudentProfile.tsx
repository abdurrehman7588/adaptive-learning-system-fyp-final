import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { AVATARS } from '../../data/mockData';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

export const StudentProfile = () => {
    const { user, logout } = useAuth();
    const { setAgeGroup } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-8 font-sans pb-10 p-6 md:p-8"
        >
            <div className="text-center">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 tracking-tight inline-block transform -rotate-1">
                    My Hero Profile 🦸
                </h1>
            </div>

            <Card className="p-8 border-none shadow-2xl shadow-teal-100 rounded-[2.5rem] bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20" />

                <div className="relative flex flex-col items-center">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-6xl mb-4 relative z-10"
                    >
                        {user?.avatar || '👤'}
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-2 rounded-full border-4 border-white shadow-sm">
                            <span className="text-lg">⭐</span>
                        </div>
                    </motion.div>

                    <h2 className="text-3xl font-black text-slate-800">{user?.name}</h2>
                    <p className="text-slate-500 font-bold bg-white/50 px-4 py-1 rounded-full mt-2 border border-slate-100">Super Student • Level 5</p>

                    <div className="mt-8 w-full space-y-6">
                        <div className="bg-white/60 p-6 rounded-3xl border-2 border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                🎭 Choose Your Avatar
                            </h3>
                            <div className="flex gap-3 flex-wrap justify-center">
                                {AVATARS.map((emoji, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.25, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-3xl p-3 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all hover:border-teal-300"
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Age Preview Controls (Dev/Demo purpose) */}
                        <div className="bg-yellow-50/50 p-4 rounded-3xl border-2 border-yellow-100 text-center">
                            <p className="text-xs font-bold text-yellow-600 uppercase mb-2">Adjust Difficulty (Preview)</p>
                            <div className="flex gap-2 justify-center">
                                <Button onClick={() => setAgeGroup('4-7')} variant="secondary" size="sm" className="bg-white text-yellow-600 hover:bg-yellow-100">Age 4-7</Button>
                                <Button onClick={() => setAgeGroup('8-12')} variant="secondary" size="sm" className="bg-white text-yellow-600 hover:bg-yellow-100">Age 8-12</Button>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="mt-8 w-full border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-xl py-6 font-bold text-lg"
                        onClick={logout}
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
};
