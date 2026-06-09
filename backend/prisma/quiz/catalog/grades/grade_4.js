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
      { text: '2/4 in simplest form?', options: ['1/2', '2/8', '4/2', '1/4'], correctIndex: 0, topic: 'Simplify' },
      { text: '3.5 + 2.1 = ?', options: ['5.6', '5.4', '6.6', '1.4'], correctIndex: 0, topic: 'Decimals' },
      { text: 'Factors of 24 include ___', options: ['6', '5', '7', '9'], correctIndex: 0, topic: 'Factors' },
      { text: 'Angle in square corner is ___°', options: ['90', '45', '180', '360'], correctIndex: 0, topic: 'Angles' },
      { text: '7 × 8 = ?', options: ['56', '54', '48', '15'], correctIndex: 0, topic: 'Multiply' },
      { text: '1,000 − 347 = ?', options: ['653', '643', '663', '1347'], correctIndex: 0, topic: 'Subtract' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 4 Science: Earth & Energy',
    description: 'Rocks, electricity, and ecosystems.',
    questions: [
      { text: 'Fossils form in ___', options: ['sedimentary rock', 'only air', 'only water vapor', 'plastic'], correctIndex: 0, topic: 'Fossils' },
      { text: 'Complete circuit needs closed path and ___', options: ['energy source', 'wood only', 'paper', 'magnet only'], correctIndex: 0, topic: 'Electricity' },
      { text: 'Producer in pond food web often ___', options: ['algae', 'fish', 'hawk', 'rock'], correctIndex: 0, topic: 'Ecosystem' },
      { text: 'Earth rotates causing day and ___', options: ['night', 'seasons only', 'tides only', 'earthquakes only'], correctIndex: 0, topic: 'Earth spin' },
      { text: 'Sound travels fastest through ___', options: ['solids', 'vacuum', 'empty space', 'nothing'], correctIndex: 0, topic: 'Waves' },
      { text: 'Weathering breaks ___', options: ['rock', 'light', 'sound', 'gravity'], correctIndex: 0, topic: 'Weathering' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 4 Pattern Recognition',
    description: 'Numeric rules, tables, and sequences.',
    questions: [
      { text: '4, 9, 14, 19, ___', options: ['24', '23', '25', '20'], correctIndex: 0, topic: '+5' },
      { text: '×10: 3, 30, 300, ___', options: ['3000', '30', '330', '303'], correctIndex: 0, topic: 'Powers of ten' },
      { text: '1, 1, 2, 3, 5, ___ (Fibonacci)', options: ['8', '6', '7', '9'], correctIndex: 0, topic: 'Special sequence' },
      { text: 'Input 4 → output 13 (+9). Input 7 → ___', options: ['16', '15', '17', '22'], correctIndex: 0, topic: 'Function table' },
      { text: '0.2, 0.4, 0.6, ___', options: ['0.8', '0.7', '1.0', '0.5'], correctIndex: 0, topic: 'Decimal pattern' },
      { text: '2³ = ?', options: ['8', '6', '9', '5'], correctIndex: 0, topic: 'Exponents intro' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 4 Memory',
    description: 'States of matter, formulas, and timelines.',
    questions: [
      { text: 'States: solid, liquid, ___', options: ['gas', 'plasma only always', 'wood', 'rock'], correctIndex: 0, topic: 'Matter' },
      { text: 'Perimeter rectangle: 2(l+w). Square side 5 perimeter?', options: ['20', '25', '10', '15'], correctIndex: 0, topic: 'Formula recall' },
      { text: 'Order: Declaration, Constitution — which came first?', options: ['Declaration', 'Constitution', 'Same year', 'Neither'], correctIndex: 0, topic: 'History order' },
      { text: 'NWES compass: opposite of North is ___', options: ['South', 'East', 'West', 'Up'], correctIndex: 0, topic: 'Geography' },
      { text: 'Steps of water cycle include evaporation and ___', options: ['precipitation', 'photosynthesis', 'digestion', 'friction'], correctIndex: 0, topic: 'Cycle recall' },
      { text: 'List 8, 2, 5, 2 — mode is ___', options: ['2', '8', '5', 'none'], correctIndex: 0, topic: 'Data recall' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 4 Problem Solving',
    description: 'Multi-step word problems and measurement.',
    questions: [
      { text: 'Bus 42 students, 6 per row. Rows?', options: ['7', '6', '8', '36'], correctIndex: 0, topic: 'Division' },
      { text: '3/8 pizza eaten. Left?', options: ['5/8', '3/8', '8/8', '1/8'], correctIndex: 0, topic: 'Fractions' },
      { text: 'Rect 8m×5m area?', options: ['40 m²', '26 m', '13 m²', '80 m'], correctIndex: 0, topic: 'Area' },
      { text: 'Train 120 km in 2 h. Speed km/h?', options: ['60', '40', '80', '240'], correctIndex: 0, topic: 'Rate' },
      { text: '$12.00 for 4 notebooks. One costs ___', options: ['$3.00', '$4.00', '$8.00', '$16.00'], correctIndex: 0, topic: 'Unit price' },
      { text: 'Morning 18°C, warmer 7°C afternoon. Afternoon?', options: ['25°C', '11°C', '7°C', '18°C'], correctIndex: 0, topic: 'Change' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 4 Critical Thinking',
    description: 'Deduction, bias, and argument strength.',
    questions: [
      { text: 'All bloops are razzies. This is bloop → it is ___', options: ['razzie', 'tree', 'cloud', 'number'], correctIndex: 0, topic: 'Deduction' },
      { text: 'Odd one out: circle, square, triangle, apple', options: ['Apple', 'Circle', 'Square', 'Triangle'], correctIndex: 0, topic: 'Classify' },
      { text: '“Chocolate is best” is ___', options: ['opinion', 'fact', 'law', 'measurement'], correctIndex: 0, topic: 'Fact vs opinion' },
      { text: 'Stronger claim needs ___', options: ['evidence', 'bigger font', 'more colors', 'no data'], correctIndex: 0, topic: 'Argument' },
      { text: 'Two experiments, only one changes plant light. That is ___', options: ['fair', 'unfair', 'magic', 'useless'], correctIndex: 0, topic: 'Fair test' },
      { text: 'Map scale helps you find real ___', options: ['distance', 'taste', 'sound', 'smell'], correctIndex: 0, topic: 'Tools' },
    ],
  }),
  ...GRADE_4_TIER_QUIZZES,
];
