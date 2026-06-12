import { buildQuiz } from '../utils.js';
import { GRADE_3_TIER_QUIZZES } from './grade_3_tier_quizzes.js';

const G = 'grade_3';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_3_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 3 Math: Multiply & Divide',
    description: 'Facts, fractions intro, and area.',
    questions: [
      { text: '6 × 4 = ?', options: ['24', '28', '20', '10'], correctIndex: 0, topic: 'Multiplication' },
      { text: '56 ÷ 7 = ?', options: ['9', '7', '8', '49'], correctIndex: 2, topic: 'Division' },
      { text: 'Rectangle 6×3 area?', options: ['9', '21', '18', '36'], correctIndex: 2, topic: 'Area' },
      { text: '1/2 of 12 = ?', options: ['8', '24', '4', '6'], correctIndex: 3, topic: 'Fractions' },
      { text: '429 rounded to nearest hundred?', options: ['500', '0', '430', '400'], correctIndex: 3, topic: 'Rounding' },
      { text: '8 × 7 = ?', options: ['15', '48', '54', '56'], correctIndex: 3, topic: 'Facts' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 3 Science: Forces & Life',
    description: 'Forces, life cycles, and body systems.',
    questions: [
      { text: 'Kicking a ball is a ___', options: ['magnet', 'push', 'lift only', 'pull'], correctIndex: 1, topic: 'Forces' },
      { text: 'Butterfly has ___ metamorphosis', options: ['none', 'rock', 'instant', 'complete'], correctIndex: 3, topic: 'Life cycles' },
      { text: 'Bones: ___ system', options: ['weather', 'plant', 'digestive', 'skeletal'], correctIndex: 3, topic: 'Body' },
      { text: 'Friction slows a sliding book because surfaces ___', options: ['vanish', 'rub', 'float', 'glow'], correctIndex: 1, topic: 'Friction' },
      { text: 'Soil layers include topsoil and ___', options: ['cloud', 'metal', 'subsoil', 'plastic'], correctIndex: 2, topic: 'Earth' },
      { text: 'Energy from food fuels ___', options: ['muscles', 'pencils', 'rocks', 'chairs'], correctIndex: 0, topic: 'Energy' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 3 Pattern Recognition',
    description: 'Multiples, machines, and doubling.',
    questions: [
      { text: '3, 6, 9, 12, ___', options: ['15', '18', '13', '14'], correctIndex: 0, topic: 'Multiples' },
      { text: 'In 5, out 11 (+6). In 8, out ___', options: ['13', '14', '18', '12'], correctIndex: 1, topic: 'Function' },
      { text: '2, 4, 8, 16, ___', options: ['32', '18', '24', '20'], correctIndex: 0, topic: 'Doubling' },
      { text: '5, 10, 20, 40, ___', options: ['60', '50', '45', '80'], correctIndex: 3, topic: '×2 pattern' },
      { text: '¼, ½, ¾, ___', options: ['½', '2', '1', '⅓'], correctIndex: 2, topic: 'Fraction pattern' },
      { text: 'Input 7, rule ×3, output ___', options: ['24', '10', '14', '21'], correctIndex: 3, topic: 'Rule' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 3 Memory',
    description: 'Mnemonics, facts, and diagrams.',
    questions: [
      { text: 'ROYGBIV = ___', options: ['states', 'planets', 'months', 'rainbow colors'], correctIndex: 3, topic: 'Mnemonic' },
      { text: '7 × 8 = ?', options: ['54', '48', '56', '78'], correctIndex: 2, topic: 'Facts' },
      { text: 'Plant parts: roots, stem, ___', options: ['rock', 'wheel', 'leaf', 'cloud'], correctIndex: 2, topic: 'Diagram' },
      { text: 'Continents song order: NA before SA means ___ first', options: ['North America', 'Asia', 'South America', 'Africa'], correctIndex: 0, topic: 'Acronym' },
      { text: 'Steps: question → research → hypothesis → test. After hypothesis?', options: ['Guess again only', 'Test', 'Sleep', 'Publish'], correctIndex: 1, topic: 'Method' },
      { text: '9, 3, 6 — largest was ___', options: ['6', '0', '3', '9'], correctIndex: 3, topic: 'Hold in mind' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 3 Problem Solving',
    description: 'Multi-step, area, and perimeter.',
    questions: [
      { text: '4 bags × 6 apples?', options: ['20', '10', '46', '24'], correctIndex: 3, topic: 'Equal groups' },
      { text: 'Fence around garden measures ___', options: ['weight', 'area', 'perimeter', 'volume'], correctIndex: 2, topic: 'Measure' },
      { text: '3 shelves × 12 books − 5 left?', options: ['17', '36', '31', '41'], correctIndex: 2, topic: 'Multi-step' },
      { text: '144 ÷ 12 = ?', options: ['12', '11', '132', '13'], correctIndex: 0, topic: 'Division' },
      { text: 'Sarah has $5.50, spends $2.25. Left?', options: ['$3.50', '$7.75', '$3.25', '$2.25'], correctIndex: 2, topic: 'Money' },
      { text: 'Square side 4. Area?', options: ['4', '8', '12', '16'], correctIndex: 3, topic: 'Area' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 3 Critical Thinking',
    description: 'Claims, evidence, and sources.',
    questions: [
      { text: 'Plants need light. Best evidence?', options: ['Plants green', 'Plants like music', 'Plants in dark wilt', 'Plants tall'], correctIndex: 2, topic: 'Evidence' },
      { text: 'Fair test needs control with ___', options: ['no change', 'many changes', 'no plants', 'no data'], correctIndex: 0, topic: 'Control' },
      { text: 'Site with no author — trust ___', options: ['perfect', 'low', 'always high', 'illegal'], correctIndex: 1, topic: 'Sources' },
      { text: 'Advertisement says “best ever.” That is ___', options: ['measurement', 'data table', 'opinion', 'law'], correctIndex: 2, topic: 'Bias' },
      { text: 'If A > B and B > C, then A ___ C', options: ['<', '?', '>', '='], correctIndex: 2, topic: 'Logic chain' },
      { text: 'Graph with labeled axes is ___ than doodle', options: ['less useful', 'clearer', 'always wrong', 'illegal'], correctIndex: 1, topic: 'Data' },
    ],
  }),
  ...GRADE_3_TIER_QUIZZES,
];
