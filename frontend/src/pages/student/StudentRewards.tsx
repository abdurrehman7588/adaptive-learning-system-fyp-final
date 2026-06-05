import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { StudentRewardsExperience } from '../../components/features/rewards/StudentRewardsExperience';
import {
    emptyChildRewards,
    fetchChildRewards,
    getRewardsErrorMessage,
    type ChildRewards,
} from '../../api/rewards';
import { resolveActiveChildId } from '../../lib/activeChild';
import { getToken } from '../../lib/tokenStorage';
import { useActiveLearnerProfile } from '../../hooks/useActiveLearnerProfile';
import { pageHeading, pageShell } from '../../lib/responsive';
import { cn } from '../../lib/utils';

export const StudentRewards = () => {
    const { learnerFirstName } = useActiveLearnerProfile();
    const [rewards, setRewards] = useState<ChildRewards>(emptyChildRewards());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRewards = useCallback(async () => {
        if (!getToken()) {
            setRewards(emptyChildRewards());
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const childId = await resolveActiveChildId();
            if (!childId) {
                setRewards(emptyChildRewards());
                return;
            }
            const bundle = await fetchChildRewards(childId);
            setRewards(bundle.rewards);
        } catch (err) {
            setError(getRewardsErrorMessage(err));
            setRewards(emptyChildRewards());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadRewards();
    }, [loadRewards]);

    return (
        <motion.div
            className={cn(pageShell, 'space-y-6 sm:space-y-8 font-sans pb-10 sm:pb-12')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="text-center md:text-left">
                <h1
                    className={cn(
                        pageHeading,
                        'md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500',
                    )}
                >
                    Rewards &amp; Streaks 🏆
                </h1>
                <p className="text-slate-500 font-bold mt-3 text-lg md:text-xl">
                    {learnerFirstName}&apos;s trophy case — XP, badges, achievements, and daily streaks.
                </p>
            </header>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500 justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading rewards...
                </div>
            )}

            {error && (
                <p className="text-center text-sm text-orange-600 font-medium">{error}</p>
            )}

            {!loading && !error && (
                <StudentRewardsExperience rewards={rewards} />
            )}
        </motion.div>
    );
};
