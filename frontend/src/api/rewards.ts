import { isAxiosError } from 'axios';
import { apiClient } from './client';

export type BadgeIcon = 'trophy' | 'star' | 'zap' | 'mystery';

export type EarnedBadge = {
    id: string;
    title: string;
    description: string;
    icon: BadgeIcon;
};

export type BadgeView = {
    id: string;
    title: string;
    description: string;
    icon: BadgeIcon;
    unlocked: boolean;
    progress: number;
    target: number;
    progressLabel: string;
};

export type ChildRewards = {
    totalXP: number;
    currentLevel: number;
    levelTitle: string;
    currentStreak: number;
    longestStreak: number;
    earnedBadges: EarnedBadge[];
    achievementCount: number;
    xpInLevel: number;
    xpForNextLevel: number;
    xpProgressPercent: number;
    nextLevelReward: string;
    badges: BadgeView[];
};

export type ChildRewardsBundle = {
    child: {
        id: number;
        name: string;
        gradeLevel?: string | null;
    };
    rewards: ChildRewards;
};

export type ChildWithRewards = {
    id: number;
    name: string;
    gradeLevel?: string | null;
    rewards: ChildRewards;
};

export type ParentRewardsOverview = {
    children: ChildWithRewards[];
};

export const emptyChildRewards = (): ChildRewards => ({
    totalXP: 0,
    currentLevel: 1,
    levelTitle: 'Curious Explorer',
    currentStreak: 0,
    longestStreak: 0,
    earnedBadges: [],
    achievementCount: 0,
    xpInLevel: 0,
    xpForNextLevel: 100,
    xpProgressPercent: 0,
    nextLevelReward: 'Reach Level 2 at 100 XP',
    badges: [],
});

export async function fetchParentRewardsOverview(): Promise<ParentRewardsOverview> {
    const { data } = await apiClient.get<{ overview: ParentRewardsOverview }>(
        '/children/rewards/overview',
        { params: { _: Date.now() } },
    );
    return data.overview;
}

export async function fetchChildRewards(childId: number): Promise<ChildRewardsBundle> {
    const { data } = await apiClient.get<ChildRewardsBundle>(
        `/children/${childId}/rewards`,
        { params: { _: Date.now() } },
    );
    return data;
}

export function getRewardsErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
        if (error.response?.status === 404) {
            return 'Rewards API not found. Restart the backend server, then refresh.';
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not load rewards. Please try again.';
}
