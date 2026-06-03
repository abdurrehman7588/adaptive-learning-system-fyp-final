import { motion } from 'framer-motion';
import { Flame, Lock, Sparkles, Star } from 'lucide-react';
import { Card } from '../../ui/Card';
import type { ChildRewards } from '../../../api/rewards';
import { BadgeIconGraphic } from './BadgeIconGraphic';
import { LEVEL_MILESTONES, REWARD_MILESTONES } from './rewardsMilestones';

type StudentRewardsExperienceProps = {
    rewards: ChildRewards;
};

const itemVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 12 },
    visible: { scale: 1, opacity: 1, y: 0 },
};

/** Full rewards experience for /student/rewards only. */
export function StudentRewardsExperience({ rewards }: StudentRewardsExperienceProps) {
    const progressWidth = `${rewards.xpProgressPercent}%`;
    const nextLockedBadge = rewards.badges.find((badge) => !badge.unlocked);
    const lockedBadges = rewards.badges.filter((badge) => !badge.unlocked);

    return (
        <motion.div
            className="space-y-10"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
            <motion.section variants={itemVariants}>
                <SectionHeading
                    title="Trophy Case"
                    subtitle="Your XP progression and level journey"
                />
                <Card className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] text-white border-4 border-indigo-400/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wide">
                                    XP progression
                                </p>
                                <h2 className="text-3xl font-black text-yellow-300">
                                    Level {rewards.currentLevel}
                                </h2>
                                <p className="text-indigo-100 font-semibold">{rewards.levelTitle}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-2xl font-bold">
                                    {rewards.xpInLevel.toLocaleString()} /{' '}
                                    {rewards.xpForNextLevel > 0
                                        ? rewards.xpForNextLevel.toLocaleString()
                                        : '—'}{' '}
                                    XP
                                </p>
                                <p className="text-sm text-indigo-200">
                                    {rewards.totalXP.toLocaleString()} total XP
                                </p>
                            </div>
                        </div>
                        <div className="h-6 w-full bg-black/20 rounded-full overflow-hidden p-1 border border-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: progressWidth }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                            />
                        </div>
                        <p className="text-sm text-indigo-100">{rewards.nextLevelReward}</p>
                    </div>
                </Card>
            </motion.section>

            {rewards.earnedBadges.length > 0 && (
                <motion.section variants={itemVariants}>
                    <SectionHeading
                        title="Achievements"
                        subtitle={`${rewards.achievementCount} unlocked so far`}
                    />
                    <div className="flex flex-wrap gap-2">
                        {rewards.earnedBadges.map((badge) => (
                            <span
                                key={badge.id}
                                className="inline-flex items-center gap-2 rounded-full bg-yellow-100 border border-yellow-200 px-4 py-2 text-sm font-bold text-yellow-900"
                            >
                                <Star className="w-4 h-4 text-yellow-600" />
                                {badge.title}
                            </span>
                        ))}
                    </div>
                </motion.section>
            )}

            <motion.section variants={itemVariants}>
                <SectionHeading
                    title="Badge gallery"
                    subtitle={
                        nextLockedBadge
                            ? `Next up: ${nextLockedBadge.title}`
                            : 'You unlocked every badge!'
                    }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.badges.map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))}
                </div>
            </motion.section>

            {lockedBadges.length > 0 && (
                <motion.section variants={itemVariants}>
                    <SectionHeading
                        title="Locked rewards"
                        subtitle="Keep learning to unlock these"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lockedBadges.map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} />
                        ))}
                    </div>
                </motion.section>
            )}

            <motion.section variants={itemVariants}>
                <SectionHeading
                    title="Streak history"
                    subtitle="Daily practice builds your streak"
                />
                <Card className="p-6 rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-200 flex items-center justify-center">
                            <Flame className="w-9 h-9 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Current streak</p>
                            <p className="font-black text-3xl text-orange-600">
                                {rewards.currentStreak} day{rewards.currentStreak === 1 ? '' : 's'}
                            </p>
                        </div>
                        <div className="ms-auto text-right">
                            <p className="text-sm font-bold text-slate-500 uppercase">Longest streak</p>
                            <p className="font-black text-2xl text-slate-800">
                                {rewards.longestStreak} days
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-100">
                        {[1, 3, 7].map((target) => (
                            <span
                                key={target}
                                className={`text-sm font-bold px-3 py-1.5 rounded-full border ${
                                    rewards.longestStreak >= target
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        : 'bg-white text-slate-400 border-slate-200'
                                }`}
                            >
                                {target}-day milestone {rewards.longestStreak >= target ? '✓' : '—'}
                            </span>
                        ))}
                    </div>
                </Card>
            </motion.section>

            <motion.section variants={itemVariants}>
                <SectionHeading
                    title="Reward milestones"
                    subtitle="How you earn XP and level up"
                />
                <div className="grid gap-3 md:grid-cols-2">
                    {REWARD_MILESTONES.map((milestone) => (
                        <div
                            key={milestone.id}
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                        >
                            <span className="text-2xl">{milestone.icon}</span>
                            <div>
                                <p className="font-bold text-slate-800">{milestone.title}</p>
                                <p className="text-sm text-slate-500">{milestone.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Level progression</p>
                    <div className="flex flex-wrap gap-2">
                        {LEVEL_MILESTONES.map((row) => (
                            <span
                                key={row.level}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                                    rewards.currentLevel >= row.level
                                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}
                            >
                                L{row.level} · {row.range} — {row.title}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <div>
                <h3 className="font-black text-slate-800 text-xl">{title}</h3>
                <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
        </div>
    );
}

function BadgeCard({ badge }: { badge: ChildRewards['badges'][number] }) {
    if (badge.unlocked) {
        return (
            <Card className="flex flex-col items-center text-center border-2 border-yellow-200 bg-gradient-to-b from-yellow-50 to-orange-50 p-6 rounded-[2rem]">
                <BadgeIconGraphic badge={badge} size="lg" />
                <span className="font-bold text-slate-800 mt-2 text-lg">{badge.title}</span>
                <p className="text-slate-500 text-sm mt-1">{badge.description}</p>
                <span className="text-xs font-bold text-yellow-700 mt-3 bg-yellow-100 px-3 py-1 rounded-full">
                    Unlocked
                </span>
            </Card>
        );
    }

    return (
        <Card className="relative flex flex-col items-center text-center border-2 border-slate-100 bg-white p-6 rounded-[2rem]">
            <Lock className="absolute top-3 right-3 w-5 h-5 text-slate-300" />
            <div className="opacity-60 grayscale">
                <BadgeIconGraphic badge={badge} size="lg" />
            </div>
            <span className="font-bold text-slate-600 mt-2 text-lg">{badge.title}</span>
            <p className="text-slate-500 text-sm mt-1">{badge.description}</p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                <div
                    className="bg-orange-400 h-full rounded-full"
                    style={{
                        width: `${Math.min(100, Math.round((badge.progress / badge.target) * 100))}%`,
                    }}
                />
            </div>
            <span className="text-xs font-bold text-slate-400 mt-2">{badge.progressLabel}</span>
        </Card>
    );
}
