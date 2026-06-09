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
      { text: '6 + 4 = ?', options: ['10', '9', '11', '8'], correctIndex: 0, topic: 'Addition' },
      { text: '10 − 3 = ?', options: ['7', '6', '8', '13'], correctIndex: 0, topic: 'Subtraction' },
      { text: '8 + 5 = ?', options: ['13', '12', '14', '3'], correctIndex: 0, topic: 'Teen sums' },
      { text: '15 − 7 = ?', options: ['8', '7', '9', '22'], correctIndex: 0, topic: 'Subtract teens' },
      { text: 'Maria has 8 marbles and gets 5 more. Total?', options: ['13', '12', '14', '3'], correctIndex: 0, topic: 'Word problems' },
      { text: 'Which is true: 12 ___ 9', options: ['>', '<', '=', '≠'], correctIndex: 0, topic: 'Compare' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Grade 1 Science: Living Things',
    description: 'Plants, animals, light, and habitats.',
    questions: [
      { text: 'Roots help a plant ___', options: ['take in water', 'fly', 'make noise', 'sleep'], correctIndex: 0, topic: 'Plant parts' },
      { text: 'Fish live in ___', options: ['water', 'desert', 'sky', 'ice only'], correctIndex: 0, topic: 'Habitats' },
      { text: 'A shadow forms when light is ___', options: ['blocked', 'eaten', 'frozen', 'painted'], correctIndex: 0, topic: 'Light' },
      { text: 'Mammals feed milk to their ___', options: ['babies', 'rocks', 'leaves', 'wheels'], correctIndex: 0, topic: 'Animal traits' },
      { text: 'Recycling paper helps the ___', options: ['environment', 'moon', 'clock', 'shoes'], correctIndex: 0, topic: 'Care for Earth' },
      { text: 'Day and night happen because Earth ___', options: ['spins', 'stops', 'melts', 'shrinks'], correctIndex: 0, topic: 'Earth' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Grade 1 Patterns',
    description: 'Skip counting and repeating patterns.',
    questions: [
      { text: '5, 10, 15, ___', options: ['20', '16', '18', '25'], correctIndex: 0, topic: 'Skip by 5' },
      { text: '🔴 🟢 🔴 🟢 ___', options: ['🔴', '🟢', '🟡', '🔵'], correctIndex: 0, topic: 'Repeating' },
      { text: 'Rule +2: 3, 5, 7, ___', options: ['9', '8', '10', '6'], correctIndex: 0, topic: 'Growing' },
      { text: '10, 9, 8, 7, ___', options: ['6', '5', '9', '10'], correctIndex: 0, topic: 'Count back' },
      { text: 'A, B, A, B, A, ___', options: ['B', 'A', 'C', 'D'], correctIndex: 0, topic: 'Letter pattern' },
      { text: '2, 4, 6, 8 — rule is ___', options: ['+2', '+1', '×3', '−2'], correctIndex: 0, topic: 'Find rule' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Grade 1 Memory',
    description: 'Story order, symbols, and word lists.',
    questions: [
      { text: 'Sam fed the dog, then walked. First?', options: ['Fed the dog', 'Walked', 'Slept', 'Ate lunch'], correctIndex: 0, topic: 'Story recall' },
      { text: '★ = sun. ★ means ___', options: ['sun', 'moon', 'rain', 'star only'], correctIndex: 0, topic: 'Symbols' },
      { text: 'List: cat, hat, bat. In list?', options: ['Hat', 'Dog', 'Car', 'Cup'], correctIndex: 0, topic: 'Recall' },
      { text: 'Days: Mon, Tue, Wed. Next?', options: ['Thu', 'Mon', 'Sun', 'Fri'], correctIndex: 0, topic: 'Calendar' },
      { text: '3, 7, 2 — middle number was ___', options: ['7', '3', '2', '5'], correctIndex: 0, topic: 'Order' },
      { text: 'Pair: sock ↔ ___', options: ['shoe', 'hat', 'plate', 'book'], correctIndex: 0, topic: 'Pairs' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Grade 1 Problem Solving',
    description: 'Word problems with drawings and equations.',
    questions: [
      { text: '5 birds, 2 fly away. Left?', options: ['3', '4', '2', '7'], correctIndex: 0, topic: 'Take away' },
      { text: '9 + ? = 12', options: ['3', '2', '4', '21'], correctIndex: 0, topic: 'Missing addend' },
      { text: 'Need 15 stickers, have 9. More needed?', options: ['6', '5', '7', '24'], correctIndex: 0, topic: 'Compare' },
      { text: '4 pencils and 4 pencils. Total?', options: ['8', '7', '9', '0'], correctIndex: 0, topic: 'Join' },
      { text: 'Longer fence needs ___ posts', options: ['more', 'fewer', 'zero', 'none'], correctIndex: 0, topic: 'Reasoning' },
      { text: '12 − 5 = ?', options: ['7', '6', '8', '17'], correctIndex: 0, topic: 'Subtract' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Grade 1 Critical Thinking',
    description: 'Causes, facts, and better plans.',
    questions: [
      { text: 'Ice melts in sun because it gets ___', options: ['warm', 'square', 'blue', 'heavy'], correctIndex: 0, topic: 'Cause' },
      { text: 'All squares have 4 sides. True?', options: ['True', 'False'], correctIndex: 0, topic: 'Shapes' },
      { text: 'Heavy bag: best plan?', options: ['Use a wagon', 'Drag on hair', 'Throw up', 'Hide'], correctIndex: 0, topic: 'Plans' },
      { text: 'Which is a fact?', options: ['Cats have four legs', 'Cats are cutest', 'Cats are best pets', 'Cats are funniest'], correctIndex: 0, topic: 'Fact vs opinion' },
      { text: 'Rain wet ground. Ground wet because ___', options: ['rained', 'painted', 'slept', 'jumped'], correctIndex: 0, topic: 'Why' },
      { text: 'Odd one out: red, blue, apple, green', options: ['Apple', 'Red', 'Blue', 'Green'], correctIndex: 0, topic: 'Sort' },
    ],
  }),
  ...GRADE_1_TIER_QUIZZES,
];
