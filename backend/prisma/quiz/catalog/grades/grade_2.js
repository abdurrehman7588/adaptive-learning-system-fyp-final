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
      { text: '23 + 5 = ?', options: ['28', '27', '29', '18'], correctIndex: 0, topic: 'Addition' },
      { text: '37 + 25 = ?', options: ['62', '52', '72', '42'], correctIndex: 0, topic: 'Regrouping' },
      { text: '50 − 18 = ?', options: ['32', '42', '22', '68'], correctIndex: 0, topic: 'Subtraction' },
      { text: '10 tens = ?', options: ['100', '10', '1000', '20'], correctIndex: 0, topic: 'Place value' },
      { text: '3 × 4 = ?', options: ['12', '7', '9', '34'], correctIndex: 0, topic: 'Arrays intro' },
      { text: 'Half of 18 is ___', options: ['9', '8', '10', '36'], correctIndex: 0, topic: 'Equal parts' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    difficultyLevel: 'medium',
    title: 'Grade 2 Science Medium: Matter & Life',
    description: 'Solids, liquids, energy, and food chains.',
    questions: [
      { text: 'Ice is a ___', options: ['solid', 'gas', 'liquid', 'light'], correctIndex: 0, topic: 'States' },
      { text: 'Sun gives energy to ___', options: ['plants', 'only rocks', 'only metal', 'the moon'], correctIndex: 0, topic: 'Energy' },
      { text: 'Grass → rabbit → ___', options: ['fox', 'sun', 'water', 'wind'], correctIndex: 0, topic: 'Food chain' },
      { text: 'Magnet attracts ___', options: ['iron', 'wood', 'plastic', 'paper'], correctIndex: 0, topic: 'Magnets' },
      { text: 'Water cycle: evaporation then ___', options: ['condensation', 'melting only', 'freezing only', 'burning'], correctIndex: 0, topic: 'Water cycle' },
      { text: 'Seed grows with soil, water, and ___', options: ['light', 'sandwich', 'shoes', 'paint'], correctIndex: 0, topic: 'Plants' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    difficultyLevel: 'medium',
    title: 'Grade 2 Pattern Recognition Medium',
    description: 'Rules with +10, ×2, and growing patterns.',
    questions: [
      { text: '12, 22, 32, ___', options: ['42', '33', '52', '40'], correctIndex: 0, topic: '+10' },
      { text: '×2: 4, 8, 12, ___', options: ['16', '14', '10', '20'], correctIndex: 0, topic: 'Multiply' },
      { text: '5, 9, 13, ___ (+4)', options: ['17', '16', '18', '14'], correctIndex: 0, topic: 'Rule' },
      { text: '100, 90, 80, ___', options: ['70', '60', '85', '110'], correctIndex: 0, topic: 'Count back' },
      { text: '🔵🔴🔵🔴___', options: ['🔵', '🔴', '🟢', '⬛'], correctIndex: 0, topic: 'Color' },
      { text: '1, 3, 5, 7, ___', options: ['9', '8', '10', '6'], correctIndex: 0, topic: 'Odd numbers' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    difficultyLevel: 'medium',
    title: 'Grade 2 Memory Medium',
    description: 'Chunks, pairs, and procedure order.',
    questions: [
      { text: 'Phone 12-45-67 — first chunk?', options: ['12', '45', '67', '124'], correctIndex: 0, topic: 'Chunking' },
      { text: '🍎=A, 🍌=B. 🍌 is ___', options: ['B', 'A', 'C', 'Apple only'], correctIndex: 0, topic: 'Pairs' },
      { text: 'Science steps: guess → test → conclude. Last?', options: ['Conclude', 'Guess', 'Test', 'Sleep'], correctIndex: 0, topic: 'Procedure' },
      { text: 'Months: Jan, Feb, Mar. Next?', options: ['Apr', 'May', 'Jun', 'Dec'], correctIndex: 0, topic: 'Sequence' },
      { text: 'Saw 5, 9, 2, 9. Which appeared twice?', options: ['9', '5', '2', 'None'], correctIndex: 0, topic: 'Scan' },
      { text: 'Left, right, left, right — next foot?', options: ['Left', 'Right', 'Both', 'Neither'], correctIndex: 0, topic: 'Pattern memory' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    difficultyLevel: 'medium',
    title: 'Grade 2 Problem Solving Medium',
    description: 'Two-step problems and perimeter.',
    questions: [
      { text: 'Had 45, spent 18, got 10. Now?', options: ['37', '27', '47', '73'], correctIndex: 0, topic: 'Two-step' },
      { text: 'Rectangle 5×3 — perimeter?', options: ['16', '15', '8', '2'], correctIndex: 0, topic: 'Perimeter' },
      { text: '62 − 19 = ?', options: ['43', '53', '41', '81'], correctIndex: 0, topic: 'Subtract' },
      { text: '24 stickers, 6 per page. Pages?', options: ['4', '3', '5', '30'], correctIndex: 0, topic: 'Equal groups' },
      { text: 'Coin total: 2 quarters + 1 dime = ___ cents', options: ['60', '50', '25', '15'], correctIndex: 0, topic: 'Money' },
      { text: 'Train leaves at 2:00, trip 1 hour. Arrives ___', options: ['3:00', '1:00', '2:01', '4:30'], correctIndex: 0, topic: 'Time' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    difficultyLevel: 'medium',
    title: 'Grade 2 Critical Thinking Medium',
    description: 'Evidence, fair tests, and logic.',
    questions: [
      { text: 'Measured length is more trusted than a ___', options: ['wild guess', 'ruler', 'table', 'friend'], correctIndex: 0, topic: 'Evidence' },
      { text: 'Fair test changes ___ thing', options: ['one', 'many', 'zero', 'all'], correctIndex: 0, topic: 'Fair test' },
      { text: 'All squares are rectangles. Every rectangle a square?', options: ['No', 'Yes', 'Always', 'Never'], correctIndex: 0, topic: 'Logic' },
      { text: 'Dark window at 8 pm suggests ___', options: ['night', 'noon', 'summer only', 'winter only'], correctIndex: 0, topic: 'Infer' },
      { text: 'Which source is stronger for weather?', options: ['Weather station data', 'Random guess', 'Cartoon', 'Dream'], correctIndex: 0, topic: 'Sources' },
      { text: 'Heavier object on same ramp rolls ___', options: ['similarly if shape same', 'always slower always', 'never moves', 'uphill'], correctIndex: 0, topic: 'Reason' },
    ],
  }),
  ...GRADE_2_PILOT_TIER_QUIZZES,
];
