import { buildQuiz } from '../utils.js';
import { GRADE_5_TIER_QUIZZES } from './grade_5_tier_quizzes.js';

const G = 'grade_5';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_5_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 5 Math: Decimals & Volume',
    description: 'Decimal operations, volume, and order of operations.',
    questions: [
      { text: '2.5 × 4 = ?', options: ['10', '8.5', '6.5', '9'], correctIndex: 0, topic: 'Decimals' },
      { text: '3/4 + 1/4 = ?', options: ['1', '4/8', '2/4', '1/8'], correctIndex: 0, topic: 'Fractions' },
      { text: 'Box 3×4×5 cm volume?', options: ['60', '12', '20', '35'], correctIndex: 0, topic: 'Volume' },
      { text: '2 + 3 × 4 = ? (order of ops)', options: ['14', '20', '24', '9'], correctIndex: 0, topic: 'PEMDAS' },
      { text: '25% of 80 = ?', options: ['20', '25', '40', '16'], correctIndex: 0, topic: 'Percent' },
      { text: '−3 + 7 = ?', options: ['4', '−4', '10', '−10'], correctIndex: 0, topic: 'Integers intro' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 5 Science: Matter & Space',
    description: 'Mixtures, cells, and solar system.',
    questions: [
      { text: 'Salt water is a ___', options: ['solution', 'element', 'compound only metal', 'gas'], correctIndex: 0, topic: 'Mixtures' },
      { text: 'Cell “control center” is ___', options: ['nucleus', 'wall only', 'vacuum', 'bone'], correctIndex: 0, topic: 'Cells' },
      { text: 'Earth orbits the ___', options: ['Sun', 'Moon', 'Mars', 'Jupiter'], correctIndex: 0, topic: 'Space' },
      { text: 'Photosynthesis makes sugar using light and ___', options: ['CO₂ and water', 'only rocks', 'only iron', 'plastic'], correctIndex: 0, topic: 'Plants' },
      { text: 'Conductor of electricity: ___', options: ['copper wire', 'rubber', 'wood', 'plastic'], correctIndex: 0, topic: 'Electricity' },
      { text: 'Human body organ for pumping blood: ___', options: ['heart', 'stomach', 'skin', 'hair'], correctIndex: 0, topic: 'Body' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 5 Pattern Recognition',
    description: 'Ratios, coordinates, and algebraic patterns.',
    questions: [
      { text: 'Ratio 2:3, if 2 parts are 8, whole equivalent 3 parts = ___', options: ['12', '6', '10', '16'], correctIndex: 0, topic: 'Ratio' },
      { text: '(1,2), (2,4), (3,6), (4,___)', options: ['8', '7', '9', '5'], correctIndex: 0, topic: 'Coordinate pattern' },
      { text: 'n=5 → 3n+2 = ?', options: ['17', '15', '13', '10'], correctIndex: 0, topic: 'Expression' },
      { text: '1, 4, 9, 16, ___ (squares)', options: ['25', '20', '24', '18'], correctIndex: 0, topic: 'Square numbers' },
      { text: '0.1, 0.2, 0.3, ___', options: ['0.4', '0.5', '0.35', '0.25'], correctIndex: 0, topic: 'Decimal' },
      { text: 'Each term ×−1: 5, −5, 5, ___', options: ['−5', '5', '0', '10'], correctIndex: 0, topic: 'Alternating' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 5 Memory',
    description: 'Science vocabulary and math facts.',
    questions: [
      { text: 'Planets mnemonic “My Very …” starts with Mercury then ___', options: ['Venus', 'Mars', 'Earth', 'Jupiter'], correctIndex: 0, topic: 'Mnemonic' },
      { text: '12 × 12 = ?', options: ['144', '124', '132', '122'], correctIndex: 0, topic: 'Facts' },
      { text: 'Photosynthesis inputs: light, water, ___', options: ['carbon dioxide', 'oxygen output only', 'nitrogen only', 'gold'], correctIndex: 0, topic: 'Process' },
      { text: 'Branches of US government: legislative, executive, ___', options: ['judicial', 'military', 'school', 'sports'], correctIndex: 0, topic: 'Civics' },
      { text: 'Metric: kilo- means ×___', options: ['1000', '100', '10', '1'], correctIndex: 0, topic: 'Prefixes' },
      { text: 'Steps: observe → hypothesize → experiment → ___', options: ['conclude', 'guess only', 'ignore data', 'stop'], correctIndex: 0, topic: 'Scientific method' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 5 Problem Solving',
    description: 'Ratios, rates, and multi-step reasoning.',
    questions: [
      { text: 'Recipe 2 cups flour per 3 cups sugar. Flour for 9 cups sugar?', options: ['6 cups', '5 cups', '4 cups', '12 cups'], correctIndex: 0, topic: 'Ratio table' },
      { text: 'Car 180 miles in 3 hours. mph?', options: ['60', '50', '90', '540'], correctIndex: 0, topic: 'Rate' },
      { text: 'Tank 40 L, 25% full. Liters?', options: ['10', '15', '20', '25'], correctIndex: 0, topic: 'Percent' },
      { text: 'Prism bases 12, height 5. Volume same base×height for rectangular prism?', options: ['60', '17', '24', '50'], correctIndex: 0, topic: 'Volume' },
      { text: 'Team scored 24, 18, 30. Mean?', options: ['24', '18', '30', '72'], correctIndex: 0, topic: 'Average' },
      { text: '−2°C drops 5°. New temp?', options: ['−7°C', '3°C', '7°C', '−3°C'], correctIndex: 0, topic: 'Integers' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 5 Critical Thinking',
    description: 'Evaluate data, media, and arguments.',
    questions: [
      { text: 'Graph shows sales up 2 years. Claim “always up forever” is ___', options: ['overgeneralized', 'certain', 'proven', 'small sample ok'], correctIndex: 0, topic: 'Data critique' },
      { text: 'Survey of 5 friends ≠ all students because sample is ___', options: ['too small/biased', 'perfect', 'random national', 'legal'], correctIndex: 0, topic: 'Sample' },
      { text: 'Correlation ≠ ___', options: ['causation', 'chart', 'math', 'table'], correctIndex: 0, topic: 'Stats' },
      { text: 'Ad uses celebrity → appeals to ___', options: ['authority/fame', 'logic only', 'data', 'control group'], correctIndex: 0, topic: 'Persuasion' },
      { text: 'If hypothesis fails, scientist should ___', options: ['revise or new hypothesis', 'hide data', 'change results', 'stop science'], correctIndex: 0, topic: 'Inquiry' },
      { text: 'Two fractions equal value: 1/2 and ___', options: ['2/4', '1/3', '3/2', '2/2'], correctIndex: 0, topic: 'Reason' },
    ],
  }),
  ...GRADE_5_TIER_QUIZZES,
];
