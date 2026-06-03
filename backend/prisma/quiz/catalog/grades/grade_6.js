import { buildQuiz } from '../utils.js';

const G = 'grade_6';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_6_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 6 Math: Ratios & Expressions',
    description: 'Ratios, integers, and introductory algebra.',
    questions: [
      { text: 'Simplify 18:24', options: ['3:4', '2:3', '9:12', '6:8'], correctIndex: 0, topic: 'Ratio' },
      { text: '−5 + (−3) = ?', options: ['−8', '−2', '8', '2'], correctIndex: 0, topic: 'Integers' },
      { text: 'Solve x + 7 = 15', options: ['8', '22', '7', '15'], correctIndex: 0, topic: 'Equation' },
      { text: '1/3 ÷ 1/6 = ?', options: ['2', '1/18', '2/9', '1/2'], correctIndex: 0, topic: 'Fraction division' },
      { text: 'Area triangle base 10 height 6', options: ['30', '60', '16', '20'], correctIndex: 0, topic: 'Area' },
      { text: '4² + 3² = ?', options: ['25', '49', '7', '12'], correctIndex: 0, topic: 'Exponents' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 6 Science: Systems',
    description: 'Cells, energy transfer, and Earth systems.',
    questions: [
      { text: 'Mitochondria role: ___', options: ['energy (ATP)', 'photosynthesis', 'digest food in stomach', 'make DNA only'], correctIndex: 0, topic: 'Cells' },
      { text: 'Energy in food chain starts from ___', options: ['Sun', 'decomposers only', 'rocks', 'moon'], correctIndex: 0, topic: 'Energy flow' },
      { text: 'Plate tectonics move ___', options: ['continents', 'clouds only', 'stars', 'sound'], correctIndex: 0, topic: 'Earth' },
      { text: 'Atoms join in chemical ___', options: ['reactions', 'photos only', 'gravity only', 'magnet only'], correctIndex: 0, topic: 'Chemistry intro' },
      { text: 'Human impact: excess CO₂ linked to ___', options: ['climate change', 'more gravity', 'less water on Earth gone', 'no plants'], correctIndex: 0, topic: 'Environment' },
      { text: 'Virus needs host cell to ___', options: ['reproduce', 'photosynthesize', 'fly', 'digest metal'], correctIndex: 0, topic: 'Life science' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 6 Pattern Recognition',
    description: 'Linear patterns and tables.',
    questions: [
      { text: 'y = 2x; x=6 → y=?', options: ['12', '8', '10', '14'], correctIndex: 0, topic: 'Linear' },
      { text: '−2, −1, 0, 1, ___', options: ['2', '3', '−2', '0'], correctIndex: 0, topic: 'Integer sequence' },
      { text: '3, 6, 12, 24, ___', options: ['48', '36', '30', '18'], correctIndex: 0, topic: 'Geometric' },
      { text: 'Table x:1,2,3 y:5,8,11 — x=4 y=?', options: ['14', '12', '13', '11'], correctIndex: 0, topic: 'Table' },
      { text: '1/2, 1, 3/2, 2, ___', options: ['5/2', '2', '3', '1'], correctIndex: 0, topic: 'Fraction pattern' },
      { text: 'nth term 4n+1; n=3 → ?', options: ['13', '12', '11', '7'], correctIndex: 0, topic: 'Expression pattern' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 6 Memory',
    description: 'Formulas, timelines, and vocabulary.',
    questions: [
      { text: 'Speed = distance ÷ ___', options: ['time', 'mass', 'volume', 'color'], correctIndex: 0, topic: 'Formula' },
      { text: 'WWII ended 1945; WWI ended 1918. Which first?', options: ['WWI', 'WWII', 'Same', 'Neither'], correctIndex: 0, topic: 'Timeline' },
      { text: 'PEMDAS: after parentheses comes ___', options: ['exponents', 'addition', 'division only', 'letters'], correctIndex: 0, topic: 'Order' },
      { text: 'Cell theory: all living things made of ___', options: ['cells', 'only water', 'only air', 'rocks'], correctIndex: 0, topic: 'Biology' },
      { text: 'Prime factors of 12: 2, 2, and ___', options: ['3', '4', '6', '5'], correctIndex: 0, topic: 'Factors' },
      { text: 'Latitude lines measure distance from ___', options: ['equator', 'prime meridian only', 'poles only', 'moon'], correctIndex: 0, topic: 'Geography' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 6 Problem Solving',
    description: 'Proportions, percent, and geometry.',
    questions: [
      { text: 'Map scale 1 cm : 5 km. 3 cm on map = ___ km', options: ['15', '8', '5', '3'], correctIndex: 0, topic: 'Scale' },
      { text: 'Shirt $40, 25% off. Sale price?', options: ['$30', '$35', '$25', '$10'], correctIndex: 0, topic: 'Percent' },
      { text: 'Cylinder-ish: need radius and height for volume of ___', options: ['cylinder', 'circle', 'line', 'angle'], correctIndex: 0, topic: 'Choose formula' },
      { text: 'Mix 2:5 red:blue, 14 red parts. Blue parts?', options: ['35', '28', '7', '10'], correctIndex: 0, topic: 'Proportion' },
      { text: 'Average of 4, 6, and 10?', options: ['6.67', '8', '5', '20'], correctIndex: 0, topic: 'Mean' },
      { text: 'Walk 3 km at 4 km/h. Hours?', options: ['0.75', '1.33', '7', '12'], correctIndex: 0, topic: 'Rate' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 6 Critical Thinking',
    description: 'Analyze claims, ethics, and models.',
    questions: [
      { text: 'Model airplane ≠ real plane because model ___', options: ['simplifies', 'is larger always', 'flies faster always', 'is alive'], correctIndex: 0, topic: 'Models' },
      { text: 'Study without control group weak because no ___', options: ['comparison', 'colors', 'titles', 'paper'], correctIndex: 0, topic: 'Experiment design' },
      { text: 'Ethical research protects participant ___', options: ['privacy/safety', 'grades only', 'shoes', 'lunch'], correctIndex: 0, topic: 'Ethics' },
      { text: 'Outlier 100 when others 10–12 should be ___', options: ['checked', 'always deleted', 'ignored always', 'doubled'], correctIndex: 0, topic: 'Data' },
      { text: 'Strong argument addresses counter___', options: ['arguments', 'colors', 'fonts', 'images only'], correctIndex: 0, topic: 'Debate' },
      { text: 'If P→Q and P true, Q is ___', options: ['true', 'false', 'unknown always', 'random'], correctIndex: 0, topic: 'Logic' },
    ],
  }),
];
