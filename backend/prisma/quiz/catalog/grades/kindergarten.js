import { buildQuiz } from '../utils.js';
import { KINDERGARTEN_TIER_QUIZZES } from './kindergarten_tier_quizzes.js';

const G = 'kindergarten';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
const KINDERGARTEN_BASE_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    difficultyLevel: 'easy',
    title: 'Kindergarten Math Easy: Numbers to 10',
    description: 'Count, add, and subtract within 10.',
    questions: [
      { text: '4 + 3 = ?', options: ['7', '6', '8', '5'], correctIndex: 0, topic: 'Addition within 10' },
      { text: '9 − 2 = ?', options: ['7', '6', '8', '11'], correctIndex: 0, topic: 'Subtraction' },
      { text: 'Which number is greater: 6 or 4?', options: ['6', '4', 'Same', '0'], correctIndex: 0, topic: 'Compare numbers' },
      { text: 'How many tens in 10?', options: ['1 ten', '10 tens', '0', '2'], correctIndex: 0, topic: 'Place value intro' },
      { text: '5 + 5 = ?', options: ['10', '9', '11', '55'], correctIndex: 0, topic: 'Doubles' },
      { text: 'Shape with 3 sides:', options: ['Triangle', 'Square', 'Circle', 'Rectangle'], correctIndex: 0, topic: 'Geometry' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    difficultyLevel: 'easy',
    title: 'Kindergarten Science Easy: Seasons & Senses',
    description: 'Seasons, five senses, and living vs nonliving.',
    questions: [
      { text: 'Leaves fall in many places during ___', options: ['autumn', 'summer only', 'never', 'winter only always'], correctIndex: 0, topic: 'Seasons' },
      { text: 'We hear with our ___', options: ['ears', 'eyes', 'nose', 'knees'], correctIndex: 0, topic: 'Senses' },
      { text: 'A rock is ___', options: ['nonliving', 'living', 'a plant', 'an animal'], correctIndex: 0, topic: 'Living things' },
      { text: 'Rain comes from ___', options: ['clouds', 'underground only', 'tables', 'shoes'], correctIndex: 0, topic: 'Weather' },
      { text: 'Butterfly starts as a ___', options: ['caterpillar', 'frog', 'fish', 'rock'], correctIndex: 0, topic: 'Life cycles' },
      { text: 'Day sky is often ___', options: ['blue', 'always black', 'pink only', 'no color'], correctIndex: 0, topic: 'Sky' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    difficultyLevel: 'easy',
    title: 'Kindergarten Patterns Easy',
    description: 'AB and ABC patterns with numbers and shapes.',
    questions: [
      { text: '2, 4, 6, 8, ___', options: ['10', '9', '12', '7'], correctIndex: 0, topic: 'Skip by 2' },
      { text: 'A, B, C, A, B, ___', options: ['C', 'A', 'D', 'B'], correctIndex: 0, topic: 'Letter pattern' },
      { text: '🔺 🔻 🔺 🔻 ___', options: ['🔺', '🔻', '⬜', '🔴'], correctIndex: 0, topic: 'Shape pattern' },
      { text: '1, 2, 3, 1, 2, ___', options: ['3', '1', '4', '2'], correctIndex: 0, topic: 'Repeating pattern' },
      { text: 'Growing: 1, 2, 3, 4, ___', options: ['5', '3', '6', '1'], correctIndex: 0, topic: 'Growing sequence' },
      { text: 'Clap-clap-stomp repeats. Next is ___', options: ['clap', 'stomp', 'clap-clap', 'silence'], correctIndex: 0, topic: 'Rhythm pattern' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    difficultyLevel: 'easy',
    title: 'Kindergarten Memory Easy',
    description: 'Remember directions, rhymes, and short lists.',
    questions: [
      { text: 'North, East, South — what compass part was first?', options: ['North', 'East', 'South', 'West'], correctIndex: 0, topic: 'Order recall' },
      { text: 'Rhyme: cat, hat, bat — which rhymes?', options: ['Mat', 'Dog', 'Sun', 'Run'], correctIndex: 0, topic: 'Word families' },
      { text: 'Showed: red, blue, green. Missing from list?', options: ['Yellow', 'Red', 'Blue', 'Green'], correctIndex: 0, topic: 'List check' },
      { text: '★ = star, ▲ = triangle. ▲ means ___', options: ['triangle', 'star', 'circle', 'square'], correctIndex: 0, topic: 'Symbols' },
      { text: 'Story: plant seed → water → sun. Before water?', options: ['Plant seed', 'Pick fruit', 'Eat lunch', 'Sleep'], correctIndex: 0, topic: 'Sequence' },
      { text: 'Phone: 3-1-4. Middle digit?', options: ['1', '3', '4', '0'], correctIndex: 0, topic: 'Digit order' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    difficultyLevel: 'easy',
    title: 'Kindergarten Problem Solving Easy',
    description: 'Draw pictures and act out simple stories.',
    questions: [
      { text: '7 birds, 2 fly away. How many left?', options: ['5', '6', '4', '9'], correctIndex: 0, topic: 'Take away' },
      { text: '3 red balls and 4 blue balls. Total?', options: ['7', '6', '8', '1'], correctIndex: 0, topic: 'Join' },
      { text: 'Need 8 chairs, have 5. How many more?', options: ['3', '2', '4', '13'], correctIndex: 0, topic: 'Missing part' },
      { text: 'Longer pencil is better for ___', options: ['reaching far', 'eating soup', 'wearing', 'sleeping'], correctIndex: 0, topic: 'Compare tools' },
      { text: 'Share 6 cookies equally with 2 friends. Each gets ___', options: ['3', '2', '4', '6'], correctIndex: 0, topic: 'Fair shares' },
      { text: 'Broken crayon still colors if you ___', options: ['hold the piece', 'throw it', 'hide it', 'freeze it'], correctIndex: 0, topic: 'Try solutions' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    difficultyLevel: 'easy',
    title: 'Kindergarten Critical Thinking Easy',
    description: 'Sort, predict, and choose the best idea.',
    questions: [
      { text: 'Which can roll?', options: ['Ball', 'Book', 'Chair', 'Wall'], correctIndex: 0, topic: 'Properties' },
      { text: 'Dark clouds often mean ___ soon', options: ['rain', 'always sun', 'snow only in desert', 'nothing'], correctIndex: 0, topic: 'Predict' },
      { text: 'Opinion: “Blue is the best color.” Fact or opinion?', options: ['Opinion', 'Fact', 'Both', 'Neither'], correctIndex: 0, topic: 'Fact vs opinion' },
      { text: 'Heavier bag needs ___ to carry', options: ['two hands or help', 'one finger', 'no help ever', 'throw it'], correctIndex: 0, topic: 'Better plan' },
      { text: 'Which does NOT belong: dog, cat, car, fish?', options: ['Car', 'Dog', 'Cat', 'Fish'], correctIndex: 0, topic: 'Odd one out' },
      { text: 'Ice in freezer stays solid because it is ___', options: ['cold', 'hot', 'loud', 'square'], correctIndex: 0, topic: 'Cause and effect' },
    ],
  }),
];

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const KINDERGARTEN_CATALOG = [
  ...KINDERGARTEN_BASE_CATALOG,
  ...KINDERGARTEN_TIER_QUIZZES,
];
