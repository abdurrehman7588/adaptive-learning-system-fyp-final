import { buildChildRewards } from '../../rewards/services/rewardsCalculator.service.js';
import { toChildResponse } from './childDto.mapper.js';

/**
 * @param {import('@prisma/client').Child & { user: { id: number, name: string, email: string, createdAt: Date } }} row
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function buildStudentProfileBundle(row, attempts) {
  const rewards = buildChildRewards(attempts);

  return {
    learner: {
      ...toChildResponse(row),
      created_at: row.createdAt.toISOString(),
    },
    parent: {
      name: row.user?.name ?? 'Parent',
      account_linked: Boolean(row.user),
    },
    account: {
      current_level: rewards.currentLevel,
      level_title: rewards.levelTitle,
      total_xp: rewards.totalXP,
      badges_earned: rewards.achievementCount,
      member_since: row.createdAt.toISOString(),
    },
  };
}
