/**
 * Post-quiz emotional feedback options.
 *
 * OPTIONAL BY DESIGN (Open House / child safety):
 * - Children may skip without penalty; no row is stored on skip.
 * - Recommendations still work via SDQ baseline or neutral score (50).
 * - When submitted, the latest check-in takes priority over SDQ for adaptive scoring.
 */

/** @typedef {'very_easy_fun' | 'confident' | 'okay' | 'difficult' | 'frustrated'} EmotionFeedbackSlug */

/** @type {Record<EmotionFeedbackSlug, { label: string, emoji: string, score: number }>} */
export const EMOTION_FEEDBACK_OPTIONS = {
  very_easy_fun: {
    label: 'Very Easy & Fun',
    emoji: '😄',
    score: 90,
  },
  confident: {
    label: 'Confident',
    emoji: '😊',
    score: 80,
  },
  okay: {
    label: 'Okay',
    emoji: '😐',
    score: 60,
  },
  difficult: {
    label: 'Difficult',
    emoji: '😕',
    score: 40,
  },
  frustrated: {
    label: 'Frustrated',
    emoji: '😣',
    score: 20,
  },
};

export const EMOTION_FEEDBACK_SLUGS = Object.keys(EMOTION_FEEDBACK_OPTIONS);

/** Neutral fallback when feedback is skipped and no SDQ assessment exists. */
export const NEUTRAL_EMOTIONAL_DEFAULT_SCORE = 50;
