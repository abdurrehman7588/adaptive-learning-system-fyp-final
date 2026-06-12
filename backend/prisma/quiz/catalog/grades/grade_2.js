import { buildQuiz } from '../utils.js';
import { GRADE_2_PILOT_TIER_QUIZZES } from './grade_2_pilot_tiers.js';

const G = 'grade_2';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_2_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 2 Math: Two-Digit Numbers',
    description: 'Add and subtract within 100.',
    difficultyLevel: 'easy',
    questions: [
      { text: '23 + 5 = ?', options: ['28', '29', '18', '27'], correctIndex: 0, topic: 'Addition' },
      { text: '37 + 25 = ?', options: ['62', '52', '72', '42'], correctIndex: 0, topic: 'Regrouping' },
      { text: '50 − 18 = ?', options: ['68', '42', '32', '22'], correctIndex: 2, topic: 'Subtraction' },
      { text: '10 tens = ?', options: ['100', '1000', '20', '10'], correctIndex: 0, topic: 'Place value' },
      { text: '3 × 4 = ?', options: ['7', '34', '9', '12'], correctIndex: 3, topic: 'Arrays intro' },
      { text: 'Half of 18 is ___', options: ['8', '36', '10', '9'], correctIndex: 3, topic: 'Equal parts' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    difficultyLevel: 'medium',
    title: 'Grade 2 Science Medium: Matter & Life',
    description: 'Solids, liquids, energy, and food chains.',
    questions: [
      { text: 'Ice is a ___', options: ['light', 'solid', 'gas', 'liquid'], correctIndex: 1, topic: 'States' },
      { text: 'Sun gives energy to ___', options: ['plants', 'only metal', 'the moon', 'only rocks'], correctIndex: 0, topic: 'Energy' },
      { text: 'Grass → rabbit → ___', options: ['fox', 'water', 'sun', 'wind'], correctIndex: 0, topic: 'Food chain' },
      { text: 'Magnet attracts ___', options: ['paper', 'plastic', 'wood', 'iron'], correctIndex: 3, topic: 'Magnets' },
      { text: 'Water cycle: evaporation then ___', options: ['burning', 'condensation', 'freezing only', 'melting only'], correctIndex: 1, topic: 'Water cycle' },
      { text: 'Seed grows with soil, water, and ___', options: ['sandwich', 'light', 'paint', 'shoes'], correctIndex: 1, topic: 'Plants' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    difficultyLevel: 'medium',
    title: 'Grade 2 Pattern Recognition Medium',
    description: 'Rules with +10, ×2, and growing patterns.',
    questions: [
      { text: '12, 22, 32, ___', options: ['33', '42', '40', '52'], correctIndex: 1, topic: '+10' },
      { text: '×2: 4, 8, 12, ___', options: ['10', '20', '14', '16'], correctIndex: 3, topic: 'Multiply' },
      { text: '5, 9, 13, ___ (+4)', options: ['18', '14', '17', '16'], correctIndex: 2, topic: 'Rule' },
      { text: '100, 90, 80, ___', options: ['60', '110', '85', '70'], correctIndex: 3, topic: 'Count back' },
      { text: '🔵🔴🔵🔴___', options: ['🔴', '🔵', '🟢', '⬛'], correctIndex: 1, topic: 'Color' },
      { text: '1, 3, 5, 7, ___', options: ['10', '9', '6', '8'], correctIndex: 1, topic: 'Odd numbers' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    difficultyLevel: 'medium',
    title: 'Grade 2 Memory Medium',
    description: 'Chunks, pairs, and procedure order.',
    questions: [
      { text: 'Phone 12-45-67 — first chunk?', options: ['67', '45', '124', '12'], correctIndex: 3, topic: 'Chunking' },
      { text: '🍎=A, 🍌=B. 🍌 is ___', options: ['B', 'Apple only', 'C', 'A'], correctIndex: 0, topic: 'Pairs' },
      { text: 'Science steps: guess → test → conclude. Last?', options: ['Sleep', 'Test', 'Conclude', 'Guess'], correctIndex: 2, topic: 'Procedure' },
      { text: 'Months: Jan, Feb, Mar. Next?', options: ['Apr', 'Jun', 'May', 'Dec'], correctIndex: 0, topic: 'Sequence' },
      { text: 'Saw 5, 9, 2, 9. Which appeared twice?', options: ['5', '2', 'None', '9'], correctIndex: 3, topic: 'Scan' },
      { text: 'Left, right, left, right — next foot?', options: ['Left', 'Both', 'Right', 'Neither'], correctIndex: 0, topic: 'Pattern memory' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    difficultyLevel: 'medium',
    title: 'Grade 2 Problem Solving Medium',
    description: 'Two-step problems and perimeter.',
    questions: [
      { text: 'Had 45, spent 18, got 10. Now?', options: ['27', '37', '73', '47'], correctIndex: 1, topic: 'Two-step' },
      { text: 'Rectangle 5×3 — perimeter?', options: ['16', '15', '8', '2'], correctIndex: 0, topic: 'Perimeter' },
      { text: '62 − 19 = ?', options: ['53', '41', '81', '43'], correctIndex: 3, topic: 'Subtract' },
      { text: '24 stickers, 6 per page. Pages?', options: ['5', '3', '4', '30'], correctIndex: 2, topic: 'Equal groups' },
      { text: 'Coin total: 2 quarters + 1 dime = ___ cents', options: ['15', '25', '50', '60'], correctIndex: 3, topic: 'Money' },
      { text: 'Train leaves at 2:00, trip 1 hour. Arrives ___', options: ['1:00', '3:00', '2:01', '4:30'], correctIndex: 1, topic: 'Time' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    difficultyLevel: 'medium',
    title: 'Grade 2 Critical Thinking Medium',
    description: 'Evidence, fair tests, and logic.',
    questions: [
      { text: 'Measured length is more trusted than a ___', options: ['friend', 'table', 'ruler', 'wild guess'], correctIndex: 3, topic: 'Evidence' },
      { text: 'Fair test changes ___ thing', options: ['one', 'many', 'all', 'zero'], correctIndex: 0, topic: 'Fair test' },
      { text: 'All squares are rectangles. Every rectangle a square?', options: ['Always', 'Yes', 'Never', 'No'], correctIndex: 3, topic: 'Logic' },
      { text: 'Dark window at 8 pm suggests ___', options: ['summer only', 'night', 'winter only', 'noon'], correctIndex: 1, topic: 'Infer' },
      { text: 'Which source is stronger for weather?', options: ['Random guess', 'Dream', 'Weather station data', 'Cartoon'], correctIndex: 2, topic: 'Sources' },
      { text: 'Heavier object on same ramp rolls ___', options: ['similarly if shape same', 'uphill', 'never moves', 'always slower always'], correctIndex: 0, topic: 'Reason' },
    ],
  }),
  ...GRADE_2_PILOT_TIER_QUIZZES,
];
