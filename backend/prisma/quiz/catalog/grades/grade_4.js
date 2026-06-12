import { buildQuiz } from '../utils.js';
import { GRADE_4_TIER_QUIZZES } from './grade_4_tier_quizzes.js';

const G = 'grade_4';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_4_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 4 Math: Fractions & Factors',
    description: 'Equivalent fractions, factors, and decimals intro.',
    questions: [
      { text: '2/4 in simplest form?', options: ['2/8', '1/2', '4/2', '1/4'], correctIndex: 1, topic: 'Simplify' },
      { text: '3.5 + 2.1 = ?', options: ['1.4', '6.6', '5.6', '5.4'], correctIndex: 2, topic: 'Decimals' },
      { text: 'Factors of 24 include ___', options: ['5', '7', '9', '6'], correctIndex: 3, topic: 'Factors' },
      { text: 'Angle in square corner is ___°', options: ['180', '90', '360', '45'], correctIndex: 1, topic: 'Angles' },
      { text: '7 × 8 = ?', options: ['54', '56', '48', '15'], correctIndex: 1, topic: 'Multiply' },
      { text: '1,000 − 347 = ?', options: ['663', '643', '1347', '653'], correctIndex: 3, topic: 'Subtract' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 4 Science: Earth & Energy',
    description: 'Rocks, electricity, and ecosystems.',
    questions: [
      { text: 'Fossils form in ___', options: ['only air', 'only water vapor', 'sedimentary rock', 'plastic'], correctIndex: 2, topic: 'Fossils' },
      { text: 'Complete circuit needs closed path and ___', options: ['energy source', 'magnet only', 'wood only', 'paper'], correctIndex: 0, topic: 'Electricity' },
      { text: 'Producer in pond food web often ___', options: ['algae', 'fish', 'rock', 'hawk'], correctIndex: 0, topic: 'Ecosystem' },
      { text: 'Earth rotates causing day and ___', options: ['earthquakes only', 'tides only', 'night', 'seasons only'], correctIndex: 2, topic: 'Earth spin' },
      { text: 'Sound travels fastest through ___', options: ['nothing', 'vacuum', 'empty space', 'solids'], correctIndex: 3, topic: 'Waves' },
      { text: 'Weathering breaks ___', options: ['rock', 'sound', 'gravity', 'light'], correctIndex: 0, topic: 'Weathering' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 4 Pattern Recognition',
    description: 'Numeric rules, tables, and sequences.',
    questions: [
      { text: '4, 9, 14, 19, ___', options: ['25', '24', '23', '20'], correctIndex: 1, topic: '+5' },
      { text: '×10: 3, 30, 300, ___', options: ['330', '3000', '303', '30'], correctIndex: 1, topic: 'Powers of ten' },
      { text: '1, 1, 2, 3, 5, ___ (Fibonacci)', options: ['7', '8', '9', '6'], correctIndex: 1, topic: 'Special sequence' },
      { text: 'Input 4 → output 13 (+9). Input 7 → ___', options: ['17', '22', '15', '16'], correctIndex: 3, topic: 'Function table' },
      { text: '0.2, 0.4, 0.6, ___', options: ['0.8', '1.0', '0.5', '0.7'], correctIndex: 0, topic: 'Decimal pattern' },
      { text: '2³ = ?', options: ['6', '8', '5', '9'], correctIndex: 1, topic: 'Exponents intro' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 4 Memory',
    description: 'States of matter, formulas, and timelines.',
    questions: [
      { text: 'States: solid, liquid, ___', options: ['rock', 'wood', 'gas', 'plasma only always'], correctIndex: 2, topic: 'Matter' },
      { text: 'Perimeter rectangle: 2(l+w). Square side 5 perimeter?', options: ['25', '20', '15', '10'], correctIndex: 1, topic: 'Formula recall' },
      { text: 'Order: Declaration, Constitution — which came first?', options: ['Same year', 'Declaration', 'Constitution', 'Neither'], correctIndex: 1, topic: 'History order' },
      { text: 'NWES compass: opposite of North is ___', options: ['South', 'West', 'East', 'Up'], correctIndex: 0, topic: 'Geography' },
      { text: 'Steps of water cycle include evaporation and ___', options: ['digestion', 'photosynthesis', 'precipitation', 'friction'], correctIndex: 2, topic: 'Cycle recall' },
      { text: 'List 8, 2, 5, 2 — mode is ___', options: ['5', '8', '2', 'none'], correctIndex: 2, topic: 'Data recall' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 4 Problem Solving',
    description: 'Multi-step word problems and measurement.',
    questions: [
      { text: 'Bus 42 students, 6 per row. Rows?', options: ['7', '6', '8', '36'], correctIndex: 0, topic: 'Division' },
      { text: '3/8 pizza eaten. Left?', options: ['3/8', '5/8', '1/8', '8/8'], correctIndex: 1, topic: 'Fractions' },
      { text: 'Rect 8m×5m area?', options: ['13 m²', '40 m²', '80 m', '26 m'], correctIndex: 1, topic: 'Area' },
      { text: 'Train 120 km in 2 h. Speed km/h?', options: ['40', '240', '60', '80'], correctIndex: 2, topic: 'Rate' },
      { text: '$12.00 for 4 notebooks. One costs ___', options: ['$4.00', '$16.00', '$8.00', '$3.00'], correctIndex: 3, topic: 'Unit price' },
      { text: 'Morning 18°C, warmer 7°C afternoon. Afternoon?', options: ['18°C', '7°C', '11°C', '25°C'], correctIndex: 3, topic: 'Change' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 4 Critical Thinking',
    description: 'Deduction, bias, and argument strength.',
    questions: [
      { text: 'All bloops are razzies. This is bloop → it is ___', options: ['cloud', 'tree', 'number', 'razzie'], correctIndex: 3, topic: 'Deduction' },
      { text: 'Odd one out: circle, square, triangle, apple', options: ['Triangle', 'Circle', 'Square', 'Apple'], correctIndex: 3, topic: 'Classify' },
      { text: '“Chocolate is best” is ___', options: ['law', 'measurement', 'fact', 'opinion'], correctIndex: 3, topic: 'Fact vs opinion' },
      { text: 'Stronger claim needs ___', options: ['bigger font', 'no data', 'more colors', 'evidence'], correctIndex: 3, topic: 'Argument' },
      { text: 'Two experiments, only one changes plant light. That is ___', options: ['magic', 'useless', 'fair', 'unfair'], correctIndex: 2, topic: 'Fair test' },
      { text: 'Map scale helps you find real ___', options: ['distance', 'sound', 'taste', 'smell'], correctIndex: 0, topic: 'Tools' },
    ],
  }),
  ...GRADE_4_TIER_QUIZZES,
];
