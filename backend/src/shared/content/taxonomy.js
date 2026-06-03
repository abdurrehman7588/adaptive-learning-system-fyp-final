/** @typedef {import('@prisma/client').GradeLevel} GradeLevel */
/** @typedef {import('@prisma/client').DifficultyLevel} DifficultyLevel */
/** @typedef {import('@prisma/client').LearningCategory} LearningCategory */

export const GRADE_LEVEL_ORDER = [
  'pre_k',
  'kindergarten',
  'grade_1',
  'grade_2',
  'grade_3',
  'grade_4',
  'grade_5',
  'grade_6',
];

export const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

export const LEARNING_CATEGORIES = [
  'math',
  'science',
  'pattern_recognition',
  'memory',
  'problem_solving',
  'critical_thinking',
];

/** Legacy categories mapped to the 6-category product set. */
export const LEGACY_CATEGORY_MAP = {
  sequencing: 'problem_solving',
  visual_reasoning: 'critical_thinking',
};

/** @type {Record<string, string>} */
export const GRADE_LEVEL_LABELS = {
  pre_k: 'Pre-K',
  kindergarten: 'Kindergarten',
  grade_1: 'Grade 1',
  grade_2: 'Grade 2',
  grade_3: 'Grade 3',
  grade_4: 'Grade 4',
  grade_5: 'Grade 5',
  grade_6: 'Grade 6',
};

/** @type {Record<string, string>} */
export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

/** @type {Record<string, string>} */
export const CATEGORY_LABELS = {
  math: 'Math',
  science: 'Science',
  pattern_recognition: 'Pattern Recognition',
  memory: 'Memory',
  problem_solving: 'Problem Solving',
  critical_thinking: 'Critical Thinking',
};

/** Analytics / legacy subject keys derived from category */
/** @type {Record<string, { subject: string, label: string }>} */
export const CATEGORY_TO_SUBJECT = {
  math: { subject: 'math', label: 'Math' },
  science: { subject: 'science', label: 'Science' },
  pattern_recognition: { subject: 'math', label: 'Pattern Recognition' },
  memory: { subject: 'math', label: 'Memory' },
  problem_solving: { subject: 'math', label: 'Problem Solving' },
  critical_thinking: { subject: 'logic', label: 'Critical Thinking' },
};

const DISPLAY_TO_GRADE = {
  'pre-k': 'pre_k',
  prek: 'pre_k',
  kindergarten: 'kindergarten',
  k: 'kindergarten',
  'grade 1': 'grade_1',
  'grade 2': 'grade_2',
  'grade 3': 'grade_3',
  'grade 4': 'grade_4',
  'grade 5': 'grade_5',
  'grade 6': 'grade_6',
};

const GRADE_PATTERNS = [
  { pattern: /pre[-\s]?k/i, value: 'pre_k' },
  { pattern: /kindergarten|kinder/i, value: 'kindergarten' },
  { pattern: /grade\s*1|1st\s*grade|first\s*grade/i, value: 'grade_1' },
  { pattern: /grade\s*2|2nd\s*grade|second\s*grade/i, value: 'grade_2' },
  { pattern: /grade\s*3|3rd\s*grade|third\s*grade/i, value: 'grade_3' },
  { pattern: /grade\s*4|4th\s*grade|fourth\s*grade/i, value: 'grade_4' },
  { pattern: /grade\s*5|5th\s*grade|fifth\s*grade/i, value: 'grade_5' },
  { pattern: /grade\s*6|6th\s*grade|sixth\s*grade/i, value: 'grade_6' },
  { pattern: /^grade_([1-6])$/, value: null },
];

/**
 * @param {string | null | undefined} input
 * @returns {GradeLevel | null}
 */
export function parseGradeLevel(input) {
  if (!input?.trim()) return null;
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (GRADE_LEVEL_ORDER.includes(trimmed)) {
    return /** @type {GradeLevel} */ (trimmed);
  }

  if (DISPLAY_TO_GRADE[lower]) {
    return /** @type {GradeLevel} */ (DISPLAY_TO_GRADE[lower]);
  }

  const enumMatch = lower.match(/^grade_([1-6])$/);
  if (enumMatch) {
    return /** @type {GradeLevel} */ (`grade_${enumMatch[1]}`);
  }

  for (const { pattern, value } of GRADE_PATTERNS) {
    if (value && pattern.test(trimmed)) {
      return /** @type {GradeLevel} */ (value);
    }
  }

  return null;
}

/**
 * @param {GradeLevel | null | undefined} gradeLevel
 * @returns {string | null}
 */
export function gradeLevelToDisplayLabel(gradeLevel) {
  if (!gradeLevel) return null;
  return GRADE_LEVEL_LABELS[gradeLevel] ?? gradeLevel;
}

/**
 * @param {DifficultyLevel | null | undefined} level
 * @returns {string | null}
 */
export function difficultyToDisplayLabel(level) {
  if (!level) return null;
  return DIFFICULTY_LABELS[level] ?? level;
}

/**
 * @param {LearningCategory | null | undefined} category
 * @returns {{ subject: string, label: string, category: string | null }}
 */
/**
 * @param {LearningCategory | string | null | undefined} category
 * @returns {LearningCategory | null}
 */
export function normalizeLearningCategory(category) {
  if (!category) return null;
  if (LEARNING_CATEGORIES.includes(category)) {
    return /** @type {LearningCategory} */ (category);
  }
  const legacy = LEGACY_CATEGORY_MAP[category];
  return legacy ? /** @type {LearningCategory} */ (legacy) : null;
}

export function resolveCategorySubject(category) {
  const normalized = normalizeLearningCategory(category);
  if (!normalized) {
    if (!category) {
      return { subject: 'math', label: 'Math', category: null };
    }
    return { subject: 'math', label: 'Math', category: null };
  }
  const mapped = CATEGORY_TO_SUBJECT[normalized] ?? {
    subject: category,
    label: CATEGORY_LABELS[category] ?? category,
  };
  return {
    subject: mapped.subject,
    label: CATEGORY_LABELS[normalized] ?? mapped.label,
    category: normalized,
  };
}

/**
 * Prefer quiz.category; fallback legacy subject string.
 * @param {{ category?: LearningCategory | null, subject?: string | null }} quiz
 */
export function resolveQuizSubject(quiz) {
  if (quiz?.category) {
    return resolveCategorySubject(quiz.category);
  }

  const raw = (quiz?.subject ?? '').trim();
  const lower = raw.toLowerCase();

  if (lower.includes('iq') || lower.includes('logic') || lower.includes('reasoning')) {
    return { subject: 'logic', label: 'Critical Thinking', category: 'critical_thinking' };
  }
  if (lower.includes('science') || lower.includes('world')) {
    return { subject: 'science', label: 'Science', category: 'science' };
  }
  if (lower.includes('pattern')) {
    return {
      subject: 'math',
      label: 'Pattern Recognition',
      category: 'pattern_recognition',
    };
  }
  if (lower.includes('math') || lower.includes('cognitive')) {
    return { subject: 'math', label: 'Math', category: 'math' };
  }
  if (!raw) {
    return { subject: 'math', label: 'Math', category: 'math' };
  }

  return {
    subject: lower.replace(/\s+/g, '_').slice(0, 48) || 'math',
    label: raw.charAt(0).toUpperCase() + raw.slice(1),
    category: null,
  };
}

/**
 * @param {DifficultyLevel} level
 * @returns {number} 1-based ordinal for API consumers
 */
export function difficultyOrdinal(level) {
  const index = DIFFICULTY_ORDER.indexOf(level);
  return index >= 0 ? index + 1 : 2;
}

/**
 * @param {GradeLevel} gradeLevel
 * @returns {number}
 */
export function gradeLevelOrdinal(gradeLevel) {
  const index = GRADE_LEVEL_ORDER.indexOf(gradeLevel);
  return index >= 0 ? index : 0;
}
