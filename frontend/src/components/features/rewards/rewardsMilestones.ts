/** Display-only milestones aligned with backend reward rules. */
export const REWARD_MILESTONES = [
    {
        id: 'quiz_complete',
        title: 'Quiz completed',
        description: '+50 XP per finished quiz',
        icon: '✅',
    },
    {
        id: 'score_80',
        title: 'Strong score',
        description: '80%+ adds +25 XP bonus',
        icon: '📈',
    },
    {
        id: 'score_90',
        title: 'Excellent score',
        description: '90%+ adds +50 XP bonus',
        icon: '⭐',
    },
    {
        id: 'daily',
        title: 'Daily practice',
        description: '+20 XP for each active day',
        icon: '📅',
    },
    {
        id: 'streak_3',
        title: '3-day streak',
        description: '+50 XP streak bonus',
        icon: '🔥',
    },
    {
        id: 'streak_7',
        title: '7-day streak',
        description: '+100 XP streak bonus',
        icon: '🏆',
    },
] as const;

export const LEVEL_MILESTONES = [
    { level: 1, range: '0–99 XP', title: 'Curious Explorer' },
    { level: 2, range: '100–249 XP', title: 'Rising Star' },
    { level: 3, range: '250–499 XP', title: 'Super Learner' },
    { level: 4, range: '500–999 XP', title: 'Quiz Champion' },
    { level: 5, range: '1000+ XP', title: 'Brain Boss' },
] as const;
