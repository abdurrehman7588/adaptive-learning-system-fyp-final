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
      { text: '3/4 + 1/4 = ?', options: ['2/4', '1', '4/8', '1/8'], correctIndex: 1, topic: 'Fractions' },
      { text: 'Box 3×4×5 cm volume?', options: ['60', '35', '20', '12'], correctIndex: 0, topic: 'Volume' },
      { text: '2 + 3 × 4 = ? (order of ops)', options: ['24', '20', '14', '9'], correctIndex: 2, topic: 'PEMDAS' },
      { text: '25% of 80 = ?', options: ['20', '25', '40', '16'], correctIndex: 0, topic: 'Percent' },
      { text: '−3 + 7 = ?', options: ['−10', '−4', '10', '4'], correctIndex: 3, topic: 'Integers intro' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 5 Science: Matter & Space',
    description: 'Mixtures, cells, and solar system.',
    questions: [
      { text: 'Salt water is a ___', options: ['solution', 'element', 'compound only metal', 'gas'], correctIndex: 0, topic: 'Mixtures' },
      { text: 'Cell “control center” is ___', options: ['nucleus', 'vacuum', 'bone', 'wall only'], correctIndex: 0, topic: 'Cells' },
      { text: 'Earth orbits the ___', options: ['Moon', 'Mars', 'Sun', 'Jupiter'], correctIndex: 2, topic: 'Space' },
      { text: 'Photosynthesis makes sugar using light and ___', options: ['only iron', 'CO₂ and water', 'only rocks', 'plastic'], correctIndex: 1, topic: 'Plants' },
      { text: 'Conductor of electricity: ___', options: ['copper wire', 'wood', 'rubber', 'plastic'], correctIndex: 0, topic: 'Electricity' },
      { text: 'Human body organ for pumping blood: ___', options: ['heart', 'hair', 'stomach', 'skin'], correctIndex: 0, topic: 'Body' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 5 Pattern Recognition',
    description: 'Ratios, coordinates, and algebraic patterns.',
    questions: [
      { text: 'Ratio 2:3, if 2 parts are 8, whole equivalent 3 parts = ___', options: ['6', '16', '10', '12'], correctIndex: 3, topic: 'Ratio' },
      { text: '(1,2), (2,4), (3,6), (4,___)', options: ['8', '7', '9', '5'], correctIndex: 0, topic: 'Coordinate pattern' },
      { text: 'n=5 → 3n+2 = ?', options: ['15', '17', '10', '13'], correctIndex: 1, topic: 'Expression' },
      { text: '1, 4, 9, 16, ___ (squares)', options: ['20', '24', '18', '25'], correctIndex: 3, topic: 'Square numbers' },
      { text: '0.1, 0.2, 0.3, ___', options: ['0.5', '0.35', '0.25', '0.4'], correctIndex: 3, topic: 'Decimal' },
      { text: 'Each term ×−1: 5, −5, 5, ___', options: ['10', '−5', '0', '5'], correctIndex: 1, topic: 'Alternating' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 5 Memory',
    description: 'Science vocabulary and math facts.',
    questions: [
      { text: 'Planets mnemonic “My Very …” starts with Mercury then ___', options: ['Jupiter', 'Earth', 'Venus', 'Mars'], correctIndex: 2, topic: 'Mnemonic' },
      { text: '12 × 12 = ?', options: ['122', '124', '144', '132'], correctIndex: 2, topic: 'Facts' },
      { text: 'Photosynthesis inputs: light, water, ___', options: ['gold', 'carbon dioxide', 'nitrogen only', 'oxygen output only'], correctIndex: 1, topic: 'Process' },
      { text: 'Branches of US government: legislative, executive, ___', options: ['judicial', 'school', 'sports', 'military'], correctIndex: 0, topic: 'Civics' },
      { text: 'Metric: kilo- means ×___', options: ['1', '1000', '10', '100'], correctIndex: 1, topic: 'Prefixes' },
      { text: 'Steps: observe → hypothesize → experiment → ___', options: ['stop', 'ignore data', 'conclude', 'guess only'], correctIndex: 2, topic: 'Scientific method' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 5 Problem Solving',
    description: 'Ratios, rates, and multi-step reasoning.',
    questions: [
      { text: 'Recipe 2 cups flour per 3 cups sugar. Flour for 9 cups sugar?', options: ['12 cups', '4 cups', '5 cups', '6 cups'], correctIndex: 3, topic: 'Ratio table' },
      { text: 'Car 180 miles in 3 hours. mph?', options: ['60', '90', '50', '540'], correctIndex: 0, topic: 'Rate' },
      { text: 'Tank 40 L, 25% full. Liters?', options: ['25', '20', '15', '10'], correctIndex: 3, topic: 'Percent' },
      { text: 'Prism bases 12, height 5. Volume same base×height for rectangular prism?', options: ['60', '24', '50', '17'], correctIndex: 0, topic: 'Volume' },
      { text: 'Team scored 24, 18, 30. Mean?', options: ['72', '30', '24', '18'], correctIndex: 2, topic: 'Average' },
      { text: '−2°C drops 5°. New temp?', options: ['3°C', '7°C', '−3°C', '−7°C'], correctIndex: 3, topic: 'Integers' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 5 Critical Thinking',
    description: 'Evaluate data, media, and arguments.',
    questions: [
      { text: 'Graph shows sales up 2 years. Claim “always up forever” is ___', options: ['overgeneralized', 'certain', 'proven', 'small sample ok'], correctIndex: 0, topic: 'Data critique' },
      { text: 'Survey of 5 friends ≠ all students because sample is ___', options: ['too small/biased', 'legal', 'random national', 'perfect'], correctIndex: 0, topic: 'Sample' },
      { text: 'Correlation ≠ ___', options: ['causation', 'math', 'chart', 'table'], correctIndex: 0, topic: 'Stats' },
      { text: 'Ad uses celebrity → appeals to ___', options: ['authority/fame', 'control group', 'logic only', 'data'], correctIndex: 0, topic: 'Persuasion' },
      { text: 'If hypothesis fails, scientist should ___', options: ['hide data', 'change results', 'revise or new hypothesis', 'stop science'], correctIndex: 2, topic: 'Inquiry' },
      { text: 'Two fractions equal value: 1/2 and ___', options: ['1/3', '3/2', '2/4', '2/2'], correctIndex: 2, topic: 'Reason' },
    ],
  }),
  ...GRADE_5_TIER_QUIZZES,
];
