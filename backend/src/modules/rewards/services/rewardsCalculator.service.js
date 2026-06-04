import { buildChildAnalytics } from '../../analytics/services/childAnalytics.service.js';
import {
  BADGE_DEFINITIONS,
  LEVEL_THRESHOLDS,
  LEVEL_TITLES,
  XP_BONUS_80,
  XP_BONUS_90,
  XP_DAILY_ACTIVITY,
  XP_QUIZ_COMPLETE,
  XP_STREAK_3_BONUS,
  XP_STREAK_7_BONUS,
} from '../constants/rewards.constants.js';

function toPercent(attempt) {
  if (attempt.percentage !== null && attempt.percentage !== undefined) {
    return Number(attempt.percentage);
  }
  if (attempt.totalPoints > 0 && attempt.score !== null) {
    return Math.round((Number(attempt.score) / Number(attempt.totalPoints)) * 10000) / 100;
  }
  return 0;
}

function startOfDayIso(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function dayDiffEarlierToLater(earlierIso, laterIso) {
  const a = new Date(`${earlierIso}T12:00:00`);
  const b = new Date(`${laterIso}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/**
 * @param {string[]} sortedDays ISO date strings ascending
 */
export function computeStreaks(sortedDays) {
  if (sortedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let run = 1;

  for (let index = 1; index < sortedDays.length; index += 1) {
    if (dayDiffEarlierToLater(sortedDays[index - 1], sortedDays[index]) === 1) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 1;
    }
  }

  const today = startOfDayIso(new Date());
  const yesterday = startOfDayIso(new Date(Date.now() - 86400000));
  const lastDay = sortedDays[sortedDays.length - 1];

  let currentStreak = 0;
  if (lastDay === today || lastDay === yesterday) {
    currentStreak = 1;
    for (let index = sortedDays.length - 2; index >= 0; index -= 1) {
      if (dayDiffEarlierToLater(sortedDays[index], sortedDays[index + 1]) === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * @param {number} totalXP
 */
export function resolveLevel(totalXP) {
  let match = LEVEL_THRESHOLDS[0];
  for (const row of LEVEL_THRESHOLDS) {
    if (totalXP >= row.minXp) {
      match = row;
    }
  }

  const xpInLevel = totalXP - match.minXp;
  const xpForNextLevel =
    match.maxXp === null ? 0 : match.maxXp - match.minXp + 1;
  const xpProgressPercent =
    match.maxXp === null
      ? 100
      : xpForNextLevel > 0
        ? Math.min(100, Math.round((xpInLevel / xpForNextLevel) * 100))
        : 0;

  return {
    currentLevel: match.level,
    levelTitle: LEVEL_TITLES[match.level] ?? 'Super Learner',
    xpInLevel,
    xpForNextLevel,
    xpProgressPercent,
    nextLevelReward:
      match.level >= 5
        ? 'Max level reached!'
        : `Reach Level ${match.level + 1} at ${(match.maxXp ?? 0) + 1} XP`,
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function computeTotalXp(attempts, activeDayCount, longestStreak, bonusXp = 0) {
  const completed = attempts.filter((row) => row.status === 'completed');
  let totalXP = 0;

  for (const attempt of completed) {
    totalXP += XP_QUIZ_COMPLETE;
    const percent = toPercent(attempt);
    if (percent >= 90) {
      totalXP += XP_BONUS_90;
    } else if (percent >= 80) {
      totalXP += XP_BONUS_80;
    }
  }

  totalXP += activeDayCount * XP_DAILY_ACTIVITY;

  if (longestStreak >= 3) {
    totalXP += XP_STREAK_3_BONUS;
  }
  if (longestStreak >= 7) {
    totalXP += XP_STREAK_7_BONUS;
  }

  totalXP += bonusXp;

  return totalXP;
}

/**
 * @param {{
 *   completedCount: number,
 *   averagePercent: number,
 *   longestStreak: number,
 * }} metrics
 */
function evaluateBadges(metrics) {
  return BADGE_DEFINITIONS.map((definition) => {
    let progress = 0;
    let unlocked = false;

    switch (definition.metric) {
      case 'completed_quizzes':
        progress = metrics.completedCount;
        unlocked = progress >= definition.target;
        break;
      case 'average_percent':
        progress = Math.round(metrics.averagePercent);
        unlocked = metrics.completedCount > 0 && progress >= definition.target;
        break;
      case 'longest_streak':
        progress = metrics.longestStreak;
        unlocked = progress >= definition.target;
        break;
      default:
        break;
    }

    const cappedProgress =
      definition.metric === 'average_percent'
        ? progress
        : Math.min(progress, definition.target);

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      unlocked,
      progress: cappedProgress,
      target: definition.target,
      progressLabel: unlocked
        ? 'Unlocked! 🎉'
        : definition.metric === 'average_percent'
          ? `${cappedProgress}% / ${definition.target}% avg`
          : `${Math.min(progress, definition.target)} / ${definition.target}`,
    };
  });
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function buildChildRewards(attempts, bonusXp = 0) {
  const completed = attempts.filter((row) => row.status === 'completed');
  const analytics = buildChildAnalytics(attempts);

  const activeDays = [
    ...new Set(
      completed.map((attempt) =>
        startOfDayIso(attempt.completedAt ?? attempt.startedAt),
      ),
    ),
  ].sort();

  const { currentStreak, longestStreak } = computeStreaks(activeDays);
  const totalXP = computeTotalXp(attempts, activeDays.length, longestStreak, bonusXp);
  const levelInfo = resolveLevel(totalXP);

  const metrics = {
    completedCount: completed.length,
    averagePercent: analytics.summary.averageScorePercent,
    longestStreak,
  };

  const badges = evaluateBadges(metrics);
  const earnedBadges = badges
    .filter((badge) => badge.unlocked)
    .map((badge) => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
    }));

  return {
    totalXP,
    currentLevel: levelInfo.currentLevel,
    levelTitle: levelInfo.levelTitle,
    currentStreak,
    longestStreak,
    earnedBadges,
    achievementCount: earnedBadges.length,
    xpInLevel: levelInfo.xpInLevel,
    xpForNextLevel: levelInfo.xpForNextLevel,
    xpProgressPercent: levelInfo.xpProgressPercent,
    nextLevelReward: levelInfo.nextLevelReward,
    badges,
  };
}
