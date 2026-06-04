/** @typedef {'self_awareness' | 'empathy' | 'self_regulation'} EmotionalDimension */

export const EI_SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Always' },
];

/** @type {Record<EmotionalDimension, string[]>} */
export const EI_QUESTIONS = {
  self_awareness: [
    'I know when I am happy.',
    'I know when I am sad.',
    'I can talk about my feelings.',
    'I know what makes me upset.',
  ],
  empathy: [
    'I help friends when they are sad.',
    'I care about other people\'s feelings.',
    'I like sharing with others.',
    'I listen when someone needs help.',
  ],
  self_regulation: [
    'I stay calm when things go wrong.',
    'I wait for my turn.',
    'I can control my reactions.',
    'I keep trying when something is difficult.',
  ],
};

export const EI_DIMENSION_LABELS = {
  self_awareness: 'Self Awareness',
  empathy: 'Empathy',
  self_regulation: 'Self Regulation',
};

/** Short copy for profile cards */
export const EI_CATEGORY_DESCRIPTIONS = {
  self_awareness: 'Noticing and naming your own feelings.',
  empathy: 'Understanding and caring about how others feel.',
  self_regulation: 'Staying calm and making thoughtful choices.',
};

/** Longer copy for category detail pages */
export const EI_CATEGORY_EXPLANATIONS = {
  self_awareness:
    'Self Awareness helps you recognize when you feel happy, sad, angry, or worried. When you know your feelings, you can talk about them and understand what you need.',
  empathy:
    'Empathy means caring about friends and family. You listen, share, and help when someone needs support.',
  self_regulation:
    'Self Regulation is about staying calm, waiting your turn, and trying again when something is hard. It helps you make good choices even when you are upset.',
};

/** URL segment → Prisma dimension */
export const EI_DIMENSION_ROUTE_SLUGS = {
  'self-awareness': 'self_awareness',
  empathy: 'empathy',
  'self-regulation': 'self_regulation',
};

export const EI_FEELING_OPTIONS = [
  { value: 'Happy', emoji: '😊', label: 'Happy' },
  { value: 'Sad', emoji: '😢', label: 'Sad' },
  { value: 'Angry', emoji: '😠', label: 'Angry' },
  { value: 'Worried', emoji: '😟', label: 'Worried' },
];

export const EI_REASON_OPTIONS = [
  { value: 'School', emoji: '🏫', label: 'School' },
  { value: 'Friends', emoji: '🤝', label: 'Friends' },
  { value: 'Family', emoji: '👨‍👩‍👧', label: 'Family' },
  { value: 'Games', emoji: '🎮', label: 'Games' },
  { value: 'Other', emoji: '❓', label: 'Other' },
];

export const EI_FEELING_VALUES = EI_FEELING_OPTIONS.map((o) => o.value);
export const EI_REASON_VALUES = EI_REASON_OPTIONS.map((o) => o.value);

/** @type {EmotionalDimension[]} */
export const EI_DIMENSIONS = ['self_awareness', 'empathy', 'self_regulation'];

export const EI_ACTIVITIES = {
  feelings_today: {
    slug: 'feelings_today',
    dimension: 'self_awareness',
    title: 'My Feelings Today',
    description: 'Pick how you feel and what influenced it.',
    type: 'feelings_journal',
    feelings: EI_FEELING_VALUES,
    reasons: EI_REASON_VALUES,
  },
  helping_friend: {
    slug: 'helping_friend',
    dimension: 'empathy',
    title: 'Helping a Friend',
    description: 'Your friend is sad. What should you do?',
    type: 'scenario',
    scenario: 'Your friend is sad.',
    options: [
      { key: 'A', label: 'Ignore' },
      { key: 'B', label: 'Laugh' },
      { key: 'C', label: 'Help' },
    ],
    correctAnswer: 'C',
  },
  calm_down: {
    slug: 'calm_down',
    dimension: 'self_regulation',
    title: 'Calm Down Challenge',
    description: 'You lost a game. What is the best choice?',
    type: 'scenario',
    scenario: 'You lost a game.',
    options: [
      { key: 'A', label: 'Shout' },
      { key: 'B', label: 'Leave angrily' },
      { key: 'C', label: 'Take deep breaths' },
    ],
    correctAnswer: 'C',
  },
};

/** Lowest dimension → recommended activity slug */
export const ACTIVITY_BY_DIMENSION = {
  self_awareness: 'feelings_today',
  empathy: 'helping_friend',
  self_regulation: 'calm_down',
};

export const XP_EI_ACTIVITY = 15;
