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
      { text: '6 × 4 = ?', options: ['24', '20', '28', '10'], correctIndex: 0, topic: 'Multiplication' },
      { text: '56 ÷ 7 = ?', options: ['8', '7', '9', '49'], correctIndex: 0, topic: 'Division' },
      { text: 'Rectangle 6×3 area?', options: ['18', '9', '21', '36'], correctIndex: 0, topic: 'Area' },
      { text: '1/2 of 12 = ?', options: ['6', '4', '8', '24'], correctIndex: 0, topic: 'Fractions' },
      { text: '429 rounded to nearest hundred?', options: ['400', '500', '430', '0'], correctIndex: 0, topic: 'Rounding' },
      { text: '8 × 7 = ?', options: ['56', '54', '48', '15'], correctIndex: 0, topic: 'Facts' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 3 Science: Forces & Life',
    description: 'Forces, life cycles, and body systems.',
    questions: [
      { text: 'Kicking a ball is a ___', options: ['push', 'pull', 'lift only', 'magnet'], correctIndex: 0, topic: 'Forces' },
      { text: 'Butterfly has ___ metamorphosis', options: ['complete', 'none', 'instant', 'rock'], correctIndex: 0, topic: 'Life cycles' },
      { text: 'Bones: ___ system', options: ['skeletal', 'digestive', 'weather', 'plant'], correctIndex: 0, topic: 'Body' },
      { text: 'Friction slows a sliding book because surfaces ___', options: ['rub', 'float', 'vanish', 'glow'], correctIndex: 0, topic: 'Friction' },
      { text: 'Soil layers include topsoil and ___', options: ['subsoil', 'cloud', 'metal', 'plastic'], correctIndex: 0, topic: 'Earth' },
      { text: 'Energy from food fuels ___', options: ['muscles', 'rocks', 'chairs', 'pencils'], correctIndex: 0, topic: 'Energy' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 3 Pattern Recognition',
    description: 'Multiples, machines, and doubling.',
    questions: [
      { text: '3, 6, 9, 12, ___', options: ['15', '14', '13', '18'], correctIndex: 0, topic: 'Multiples' },
      { text: 'In 5, out 11 (+6). In 8, out ___', options: ['14', '13', '12', '18'], correctIndex: 0, topic: 'Function' },
      { text: '2, 4, 8, 16, ___', options: ['32', '24', '20', '18'], correctIndex: 0, topic: 'Doubling' },
      { text: '5, 10, 20, 40, ___', options: ['80', '50', '60', '45'], correctIndex: 0, topic: '×2 pattern' },
      { text: '¼, ½, ¾, ___', options: ['1', '½', '⅓', '2'], correctIndex: 0, topic: 'Fraction pattern' },
      { text: 'Input 7, rule ×3, output ___', options: ['21', '10', '14', '24'], correctIndex: 0, topic: 'Rule' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 3 Memory',
    description: 'Mnemonics, facts, and diagrams.',
    questions: [
      { text: 'ROYGBIV = ___', options: ['rainbow colors', 'planets', 'states', 'months'], correctIndex: 0, topic: 'Mnemonic' },
      { text: '7 × 8 = ?', options: ['56', '54', '48', '78'], correctIndex: 0, topic: 'Facts' },
      { text: 'Plant parts: roots, stem, ___', options: ['leaf', 'wheel', 'cloud', 'rock'], correctIndex: 0, topic: 'Diagram' },
      { text: 'Continents song order: NA before SA means ___ first', options: ['North America', 'South America', 'Africa', 'Asia'], correctIndex: 0, topic: 'Acronym' },
      { text: 'Steps: question → research → hypothesis → test. After hypothesis?', options: ['Test', 'Sleep', 'Guess again only', 'Publish'], correctIndex: 0, topic: 'Method' },
      { text: '9, 3, 6 — largest was ___', options: ['9', '3', '6', '0'], correctIndex: 0, topic: 'Hold in mind' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 3 Problem Solving',
    description: 'Multi-step, area, and perimeter.',
    questions: [
      { text: '4 bags × 6 apples?', options: ['24', '20', '10', '46'], correctIndex: 0, topic: 'Equal groups' },
      { text: 'Fence around garden measures ___', options: ['perimeter', 'area', 'volume', 'weight'], correctIndex: 0, topic: 'Measure' },
      { text: '3 shelves × 12 books − 5 left?', options: ['31', '36', '41', '17'], correctIndex: 0, topic: 'Multi-step' },
      { text: '144 ÷ 12 = ?', options: ['12', '11', '13', '132'], correctIndex: 0, topic: 'Division' },
      { text: 'Sarah has $5.50, spends $2.25. Left?', options: ['$3.25', '$2.25', '$7.75', '$3.50'], correctIndex: 0, topic: 'Money' },
      { text: 'Square side 4. Area?', options: ['16', '8', '12', '4'], correctIndex: 0, topic: 'Area' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 3 Critical Thinking',
    description: 'Claims, evidence, and sources.',
    questions: [
      { text: 'Plants need light. Best evidence?', options: ['Plants in dark wilt', 'Plants like music', 'Plants green', 'Plants tall'], correctIndex: 0, topic: 'Evidence' },
      { text: 'Fair test needs control with ___', options: ['no change', 'many changes', 'no data', 'no plants'], correctIndex: 0, topic: 'Control' },
      { text: 'Site with no author — trust ___', options: ['low', 'always high', 'perfect', 'illegal'], correctIndex: 0, topic: 'Sources' },
      { text: 'Advertisement says “best ever.” That is ___', options: ['opinion', 'measurement', 'law', 'data table'], correctIndex: 0, topic: 'Bias' },
      { text: 'If A > B and B > C, then A ___ C', options: ['>', '<', '=', '?'], correctIndex: 0, topic: 'Logic chain' },
      { text: 'Graph with labeled axes is ___ than doodle', options: ['clearer', 'less useful', 'always wrong', 'illegal'], correctIndex: 0, topic: 'Data' },
    ],
  }),
  ...GRADE_3_TIER_QUIZZES,
];
