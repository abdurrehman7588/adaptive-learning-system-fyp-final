import { buildQuiz } from '../utils.js';
import { GRADE_6_TIER_QUIZZES } from './grade_6_tier_quizzes.js';

const G = 'grade_6';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_6_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 6 Math: Ratios & Expressions',
    description: 'Ratios, integers, and introductory algebra.',
    questions: [
      { text: 'Simplify 18:24', options: ['2:3', '9:12', '3:4', '6:8'], correctIndex: 2, topic: 'Ratio' },
      { text: '−5 + (−3) = ?', options: ['2', '−2', '−8', '8'], correctIndex: 2, topic: 'Integers' },
      { text: 'Solve x + 7 = 15', options: ['15', '7', '8', '22'], correctIndex: 2, topic: 'Equation' },
      { text: '1/3 ÷ 1/6 = ?', options: ['2', '1/18', '2/9', '1/2'], correctIndex: 0, topic: 'Fraction division' },
      { text: 'Area triangle base 10 height 6', options: ['30', '20', '16', '60'], correctIndex: 0, topic: 'Area' },
      { text: '4² + 3² = ?', options: ['7', '49', '12', '25'], correctIndex: 3, topic: 'Exponents' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 6 Science: Systems',
    description: 'Cells, energy transfer, and Earth systems.',
    questions: [
      { text: 'Mitochondria role: ___', options: ['energy (ATP)', 'make DNA only', 'photosynthesis', 'digest food in stomach'], correctIndex: 0, topic: 'Cells' },
      { text: 'Energy in food chain starts from ___', options: ['decomposers only', 'moon', 'rocks', 'Sun'], correctIndex: 3, topic: 'Energy flow' },
      { text: 'Plate tectonics move ___', options: ['sound', 'stars', 'clouds only', 'continents'], correctIndex: 3, topic: 'Earth' },
      { text: 'Atoms join in chemical ___', options: ['magnet only', 'gravity only', 'photos only', 'reactions'], correctIndex: 3, topic: 'Chemistry intro' },
      { text: 'Human impact: excess CO₂ linked to ___', options: ['more gravity', 'no plants', 'less water on Earth gone', 'climate change'], correctIndex: 3, topic: 'Environment' },
      { text: 'Virus needs host cell to ___', options: ['reproduce', 'fly', 'digest metal', 'photosynthesize'], correctIndex: 0, topic: 'Life science' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 6 Pattern Recognition',
    description: 'Linear patterns and tables.',
    questions: [
      { text: 'y = 2x; x=6 → y=?', options: ['14', '10', '12', '8'], correctIndex: 2, topic: 'Linear' },
      { text: '−2, −1, 0, 1, ___', options: ['0', '3', '−2', '2'], correctIndex: 3, topic: 'Integer sequence' },
      { text: '3, 6, 12, 24, ___', options: ['30', '48', '36', '18'], correctIndex: 1, topic: 'Geometric' },
      { text: 'Table x:1,2,3 y:5,8,11 — x=4 y=?', options: ['12', '11', '14', '13'], correctIndex: 2, topic: 'Table' },
      { text: '1/2, 1, 3/2, 2, ___', options: ['5/2', '2', '1', '3'], correctIndex: 0, topic: 'Fraction pattern' },
      { text: 'nth term 4n+1; n=3 → ?', options: ['11', '12', '7', '13'], correctIndex: 3, topic: 'Expression pattern' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 6 Memory',
    description: 'Formulas, timelines, and vocabulary.',
    questions: [
      { text: 'Speed = distance ÷ ___', options: ['mass', 'time', 'volume', 'color'], correctIndex: 1, topic: 'Formula' },
      { text: 'WWII ended 1945; WWI ended 1918. Which first?', options: ['Neither', 'WWII', 'Same', 'WWI'], correctIndex: 3, topic: 'Timeline' },
      { text: 'PEMDAS: after parentheses comes ___', options: ['exponents', 'letters', 'division only', 'addition'], correctIndex: 0, topic: 'Order' },
      { text: 'Cell theory: all living things made of ___', options: ['only water', 'cells', 'rocks', 'only air'], correctIndex: 1, topic: 'Biology' },
      { text: 'Prime factors of 12: 2, 2, and ___', options: ['5', '6', '3', '4'], correctIndex: 2, topic: 'Factors' },
      { text: 'Latitude lines measure distance from ___', options: ['moon', 'poles only', 'prime meridian only', 'equator'], correctIndex: 3, topic: 'Geography' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 6 Problem Solving',
    description: 'Proportions, percent, and geometry.',
    questions: [
      { text: 'Map scale 1 cm : 5 km. 3 cm on map = ___ km', options: ['3', '5', '8', '15'], correctIndex: 3, topic: 'Scale' },
      { text: 'Shirt $40, 25% off. Sale price?', options: ['$10', '$35', '$30', '$25'], correctIndex: 2, topic: 'Percent' },
      { text: 'Cylinder-ish: need radius and height for volume of ___', options: ['line', 'cylinder', 'circle', 'angle'], correctIndex: 1, topic: 'Choose formula' },
      { text: 'Mix 2:5 red:blue, 14 red parts. Blue parts?', options: ['35', '28', '7', '10'], correctIndex: 0, topic: 'Proportion' },
      { text: 'Average of 4, 6, and 10?', options: ['5', '8', '6.67', '20'], correctIndex: 2, topic: 'Mean' },
      { text: 'Walk 3 km at 4 km/h. Hours?', options: ['1.33', '0.75', '7', '12'], correctIndex: 1, topic: 'Rate' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 6 Critical Thinking',
    description: 'Analyze claims, ethics, and models.',
    questions: [
      { text: 'Model airplane ≠ real plane because model ___', options: ['simplifies', 'flies faster always', 'is larger always', 'is alive'], correctIndex: 0, topic: 'Models' },
      { text: 'Study without control group weak because no ___', options: ['colors', 'comparison', 'paper', 'titles'], correctIndex: 1, topic: 'Experiment design' },
      { text: 'Ethical research protects participant ___', options: ['privacy/safety', 'grades only', 'lunch', 'shoes'], correctIndex: 0, topic: 'Ethics' },
      { text: 'Outlier 100 when others 10–12 should be ___', options: ['ignored always', 'doubled', 'always deleted', 'checked'], correctIndex: 3, topic: 'Data' },
      { text: 'Strong argument addresses counter___', options: ['fonts', 'colors', 'images only', 'arguments'], correctIndex: 3, topic: 'Debate' },
      { text: 'If P→Q and P true, Q is ___', options: ['unknown always', 'random', 'true', 'false'], correctIndex: 2, topic: 'Logic' },
    ],
  }),
  ...GRADE_6_TIER_QUIZZES,
];
