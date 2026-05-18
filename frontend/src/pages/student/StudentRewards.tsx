import { Card } from '../../components/ui/Card';
import { Star, Trophy, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const StudentRewards = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { scale: 0.8, opacity: 0, y: 20 },
        visible: { scale: 1, opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-12 font-sans pb-12 p-6 md:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="text-center md:text-left">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 tracking-tight transform -rotate-1 inline-block drop-shadow-sm">
                    My Trophy Case 🏆
                </h1>
                <p className="text-slate-500 font-bold mt-3 text-xl">Collect badges and unlock the Treasure Chest!</p>
            </div>

            {/* Level Progress Section */}
            <motion.div variants={itemVariants}>
                <Card className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-4 border-indigo-400/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-3xl font-black text-yellow-300 mb-1">Level 5</h2>
                                    <p className="text-indigo-100 font-semibold">Super Learner</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">1,250 / 2,000 XP</p>
                                </div>
                            </div>
                            <div className="h-6 w-full bg-black/20 rounded-full overflow-hidden p-1 backdrop-blur-sm border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "62.5%" }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)] relative"
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-[shimmer_2s_infinite]" />
                                </motion.div>
                            </div>
                        </div>
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-[5rem] filter drop-shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                            >
                                🎁
                            </motion.div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                Nest Reward at Lvl 6
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Unlocked Badge */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="h-full p-6 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50 border-4 border-yellow-200 rounded-[2rem] shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute inset-0 bg-yellow-200/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <motion.div
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="mb-4 relative"
                        >
                            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-20" />
                            <Trophy className="w-20 h-20 text-yellow-500 drop-shadow-md relative z-10" />
                        </motion.div>
                        <span className="font-black text-slate-800 text-xl text-center relative z-10">Quiz Wizard</span>
                        <p className="text-slate-500 text-sm font-medium text-center mt-2 mb-4">Completed 5 Quizzes</p>
                        <span className="text-xs font-bold text-yellow-700 mt-auto bg-yellow-200/50 px-4 py-1.5 rounded-full relative z-10 border border-yellow-300">Unlocked! 🎉</span>
                    </Card>
                </motion.div>

                {/* Progress Badge 1 */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="h-full p-6 flex flex-col items-center justify-center bg-white border-4 border-slate-100 rounded-[2rem] relative overflow-hidden group hover:border-orange-200 transition-colors">
                        <div className="absolute top-3 right-3 text-slate-300 group-hover:text-orange-300 transition-colors">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div className="mb-4 relative grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100">
                            <Star className="w-20 h-20 text-orange-400" />
                        </div>
                        <span className="font-bold text-slate-700 text-lg text-center group-hover:text-orange-500 transition-colors">Perfect Week</span>
                        <div className="w-full bg-slate-100 rounded-full h-3 mt-4 mb-2 overflow-hidden border border-slate-200">
                            <div className="bg-orange-400 h-full w-4/6 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 mt-auto">4 / 7 Days Login</span>
                    </Card>
                </motion.div>

                {/* Progress Badge 2 */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="h-full p-6 flex flex-col items-center justify-center bg-white border-4 border-slate-100 rounded-[2rem] relative overflow-hidden group hover:border-purple-200 transition-colors">
                        <div className="absolute top-3 right-3 text-slate-300 group-hover:text-purple-300 transition-colors">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div className="mb-4 relative grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100">
                            <Zap className="w-20 h-20 text-purple-500" />
                        </div>
                        <span className="font-bold text-slate-700 text-lg text-center group-hover:text-purple-500 transition-colors">Math Genius</span>
                        <div className="w-full bg-slate-100 rounded-full h-3 mt-4 mb-2 overflow-hidden border border-slate-200">
                            <div className="bg-purple-500 h-full w-1/5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 mt-auto">1 / 5 Perfect Scores</span>
                    </Card>
                </motion.div>

                {/* Mystery Badge */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="h-full p-6 flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] relative overflow-hidden group hover:bg-slate-100 transition-colors">
                        <div className="absolute top-3 right-3 text-slate-300">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div className="text-7xl mb-4 opacity-30 group-hover:scale-110 transition-transform duration-300">❓</div>
                        <span className="font-bold text-slate-400 text-lg text-center">Mystery Badge</span>
                        <span className="text-xs font-bold text-slate-400 mt-2 text-center bg-slate-200 px-3 py-1 rounded-full">Keep Playing!</span>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};
