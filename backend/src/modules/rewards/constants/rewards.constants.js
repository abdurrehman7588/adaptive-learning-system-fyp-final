export const XP_QUIZ_COMPLETE = 50;
export const XP_BONUS_80 = 25;
export const XP_BONUS_90 = 50;
export const XP_DAILY_ACTIVITY = 20;
export const XP_STREAK_3_BONUS = 50;
export const XP_STREAK_7_BONUS = 100;

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 99 },
  { level: 2, minXp: 100, maxXp: 249 },
  { level: 3, minXp: 250, maxXp: 499 },
  { level: 4, minXp: 500, maxXp: 999 },
  { level: 5, minXp: 1000, maxXp: null },
];

export const LEVEL_TITLES = {
  1: 'Curious Explorer',
  2: 'Rising Star',
  3: 'Super Learner',
  4: 'Quiz Champion',
  5: 'Brain Boss',
};

export const BADGE_DEFINITIONS = [
  {
    id: 'first_quiz',
    title: 'First Quiz Completed',
    description: 'Complete your first quiz',
    icon: 'star',
    target: 1,
    metric: 'completed_quizzes',
  },
  {
    id: 'five_quizzes',
    title: '5 Quizzes Completed',
    description: 'Complete 5 quizzes',
    icon: 'trophy',
    target: 5,
    metric: 'completed_quizzes',
  },
  {
    id: 'ten_quizzes',
    title: '10 Quizzes Completed',
    description: 'Complete 10 quizzes',
    icon: 'trophy',
    target: 10,
    metric: 'completed_quizzes',
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Maintain an average score of 80% or higher',
    icon: 'zap',
    target: 80,
    metric: 'average_percent',
  },
  {
    id: 'consistent_learner',
    title: 'Consistent Learner',
    description: 'Practice 3 days in a row',
    icon: 'star',
    target: 3,
    metric: 'longest_streak',
  },
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Practice 7 days in a row',
    icon: 'trophy',
    target: 7,
    metric: 'longest_streak',
  },
];
