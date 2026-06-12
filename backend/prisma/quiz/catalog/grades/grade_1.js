import { buildQuiz } from '../utils.js';
import { GRADE_1_TIER_QUIZZES } from './grade_1_tier_quizzes.js';

const G = 'grade_1';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const GRADE_1_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Grade 1 Math: Add & Subtract',
    description: 'Addition and subtraction within 20.',
    questions: [
      { text: '6 + 4 = ?', options: ['8', '9', '11', '10'], correctIndex: 3, topic: 'Addition' },
      { text: '10 − 3 = ?', options: ['8', '13', '6', '7'], correctIndex: 3, topic: 'Subtraction' },
      { text: '8 + 5 = ?', options: ['13', '14', '3', '12'], correctIndex: 0, topic: 'Teen sums' },
      { text: '15 − 7 = ?', options: ['7', '8', '9', '22'], correctIndex: 1, topic: 'Subtract teens' },
      { text: 'Maria has 8 marbles and gets 5 more. Total?', options: ['12', '13', '14', '3'], correctIndex: 1, topic: 'Word problems' },
      { text: 'Which is true: 12 ___ 9', options: ['≠', '<', '=', '>'], correctIndex: 3, topic: 'Compare' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 1 Science: Living Things',
    description: 'Plants, animals, light, and habitats.',
    questions: [
      { text: 'Roots help a plant ___', options: ['sleep', 'take in water', 'fly', 'make noise'], correctIndex: 1, topic: 'Plant parts' },
      { text: 'Fish live in ___', options: ['desert', 'sky', 'water', 'ice only'], correctIndex: 2, topic: 'Habitats' },
      { text: 'A shadow forms when light is ___', options: ['blocked', 'painted', 'frozen', 'eaten'], correctIndex: 0, topic: 'Light' },
      { text: 'Mammals feed milk to their ___', options: ['wheels', 'leaves', 'rocks', 'babies'], correctIndex: 3, topic: 'Animal traits' },
      { text: 'Recycling paper helps the ___', options: ['clock', 'environment', 'shoes', 'moon'], correctIndex: 1, topic: 'Care for Earth' },
      { text: 'Day and night happen because Earth ___', options: ['stops', 'melts', 'spins', 'shrinks'], correctIndex: 2, topic: 'Earth' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 1 Patterns',
    description: 'Skip counting and repeating patterns.',
    questions: [
      { text: '5, 10, 15, ___', options: ['20', '25', '18', '16'], correctIndex: 0, topic: 'Skip by 5' },
      { text: '🔴 🟢 🔴 🟢 ___', options: ['🟡', '🔴', '🔵', '🟢'], correctIndex: 1, topic: 'Repeating' },
      { text: 'Rule +2: 3, 5, 7, ___', options: ['6', '10', '8', '9'], correctIndex: 3, topic: 'Growing' },
      { text: '10, 9, 8, 7, ___', options: ['5', '10', '6', '9'], correctIndex: 2, topic: 'Count back' },
      { text: 'A, B, A, B, A, ___', options: ['B', 'C', 'D', 'A'], correctIndex: 0, topic: 'Letter pattern' },
      { text: '2, 4, 6, 8 — rule is ___', options: ['×3', '−2', '+2', '+1'], correctIndex: 2, topic: 'Find rule' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 1 Memory',
    description: 'Story order, symbols, and word lists.',
    questions: [
      { text: 'Sam fed the dog, then walked. First?', options: ['Fed the dog', 'Ate lunch', 'Slept', 'Walked'], correctIndex: 0, topic: 'Story recall' },
      { text: '★ = sun. ★ means ___', options: ['rain', 'sun', 'star only', 'moon'], correctIndex: 1, topic: 'Symbols' },
      { text: 'List: cat, hat, bat. In list?', options: ['Hat', 'Car', 'Dog', 'Cup'], correctIndex: 0, topic: 'Recall' },
      { text: 'Days: Mon, Tue, Wed. Next?', options: ['Thu', 'Fri', 'Sun', 'Mon'], correctIndex: 0, topic: 'Calendar' },
      { text: '3, 7, 2 — middle number was ___', options: ['3', '7', '5', '2'], correctIndex: 1, topic: 'Order' },
      { text: 'Pair: sock ↔ ___', options: ['plate', 'hat', 'shoe', 'book'], correctIndex: 2, topic: 'Pairs' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 1 Problem Solving',
    description: 'Word problems with drawings and equations.',
    questions: [
      { text: '5 birds, 2 fly away. Left?', options: ['4', '3', '7', '2'], correctIndex: 1, topic: 'Take away' },
      { text: '9 + ? = 12', options: ['4', '3', '21', '2'], correctIndex: 1, topic: 'Missing addend' },
      { text: 'Need 15 stickers, have 9. More needed?', options: ['5', '6', '7', '24'], correctIndex: 1, topic: 'Compare' },
      { text: '4 pencils and 4 pencils. Total?', options: ['7', '0', '9', '8'], correctIndex: 3, topic: 'Join' },
      { text: 'Longer fence needs ___ posts', options: ['none', 'more', 'zero', 'fewer'], correctIndex: 1, topic: 'Reasoning' },
      { text: '12 − 5 = ?', options: ['8', '17', '7', '6'], correctIndex: 2, topic: 'Subtract' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 1 Critical Thinking',
    description: 'Causes, facts, and better plans.',
    questions: [
      { text: 'Ice melts in sun because it gets ___', options: ['warm', 'blue', 'heavy', 'square'], correctIndex: 0, topic: 'Cause' },
      { text: 'All squares have 4 sides. True?', options: ['True', 'False'], correctIndex: 0, topic: 'Shapes' },
      { text: 'Heavy bag: best plan?', options: ['Throw up', 'Use a wagon', 'Hide', 'Drag on hair'], correctIndex: 1, topic: 'Plans' },
      { text: 'Which is a fact?', options: ['Cats are best pets', 'Cats are cutest', 'Cats have four legs', 'Cats are funniest'], correctIndex: 2, topic: 'Fact vs opinion' },
      { text: 'Rain wet ground. Ground wet because ___', options: ['painted', 'slept', 'rained', 'jumped'], correctIndex: 2, topic: 'Why' },
      { text: 'Odd one out: red, blue, apple, green', options: ['Red', 'Blue', 'Apple', 'Green'], correctIndex: 2, topic: 'Sort' },
    ],
  }),
  ...GRADE_1_TIER_QUIZZES,
];
