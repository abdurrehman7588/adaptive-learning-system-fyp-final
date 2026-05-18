import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const StudentDashboard = () => {
    const { user } = useAuth();

    // Subject data with specific colors/icons
    const subjects = [
        { name: 'Math Magic', icon: '🧮', color: 'bg-orange-100 text-orange-600 border-orange-200' },
        { name: 'Super Science', icon: '🧪', color: 'bg-green-100 text-green-600 border-green-200' },
        { name: 'Brainy Logic', icon: '🧩', color: 'bg-purple-100 text-purple-600 border-purple-200' },
        { name: 'Reading Fun', icon: '📖', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="space-y-8 pb-8 p-6 md:p-8 font-sans"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
                <div className="w-full md:w-auto">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-block text-4xl mb-2 origin-bottom-left"
                    >
                        👋
                    </motion.div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 tracking-tight transform -rotate-1">
                        Hi, {user?.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 font-bold text-lg mt-1">
                        Ready for a magical learning adventure? 🚀
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-2xl border-2 border-yellow-200 shadow-sm flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Stars</p>
                            <p className="font-black text-yellow-500 text-xl leading-none">124</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border-2 border-purple-200 shadow-sm flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Level</p>
                            <p className="font-black text-purple-500 text-xl leading-none">5</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 text-white p-8 rounded-[2.5rem] border-none relative overflow-hidden shadow-xl shadow-orange-200/50">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute right-[-20px] top-[-20px] text-[150px] opacity-20 pointer-events-none rotate-12"
                    >
                        🦁
                    </motion.div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-white/30">
                                🎯 Daily Quest
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-sm">
                                Solve 3 Math <br /> Puzzles!
                            </h2>
                            <p className="text-white/90 font-medium text-lg mb-8 max-w-md">
                                You are doing great! Complete today's quest to unlock a special Zoo Badge! 🦁
                            </p>
                            <Link to="/student/quizzes">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-orange-500 font-black px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg group"
                                >
                                    Start Playing <Play className="w-6 h-6 fill-current group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                        </div>
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-[8rem] md:text-[10rem] filter drop-shadow-2xl"
                        >
                            🚀
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Subjects Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-700 flex items-center gap-2">
                        <span className="text-3xl">📚</span> Your Subjects
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                        <motion.button
                            key={subject.name}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-6 rounded-3xl border-b-4 transition-all flex flex-col items-center gap-3 shadow-sm hover:shadow-md ${subject.color}`}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center text-4xl shadow-inner">
                                {subject.icon}
                            </div>
                            <span className="font-bold text-lg">{subject.name}</span>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Recent Achievement */}
            <motion.section variants={itemVariants}>
                <Card className="p-6 rounded-3xl border-2 border-slate-100 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl animate-pulse">
                            👑
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-700">New High Score!</h3>
                            <p className="text-slate-500">You scored <span className="font-bold text-yellow-500">100%</span> in Math yesterday. Keep it up!</p>
                        </div>
                    </div>
                </Card>
            </motion.section>
        </motion.div>
    );
};
