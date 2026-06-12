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
      { text: '4 + 3 = ?', options: ['5', '6', '7', '8'], correctIndex: 2, topic: 'Addition within 10' },
      { text: '9 − 2 = ?', options: ['7', '6', '8', '11'], correctIndex: 0, topic: 'Subtraction' },
      { text: 'Which number is greater: 6 or 4?', options: ['0', 'Same', '6', '4'], correctIndex: 2, topic: 'Compare numbers' },
      { text: 'How many tens in 10?', options: ['0', '10 tens', '2', '1 ten'], correctIndex: 3, topic: 'Place value intro' },
      { text: '5 + 5 = ?', options: ['10', '55', '11', '9'], correctIndex: 0, topic: 'Doubles' },
      { text: 'Shape with 3 sides:', options: ['Circle', 'Rectangle', 'Square', 'Triangle'], correctIndex: 3, topic: 'Geometry' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    difficultyLevel: 'easy',
    title: 'Kindergarten Science Easy: Seasons & Senses',
    description: 'Seasons, five senses, and living vs nonliving.',
    questions: [
      { text: 'Leaves fall in many places during ___', options: ['autumn', 'winter only always', 'summer only', 'never'], correctIndex: 0, topic: 'Seasons' },
      { text: 'We hear with our ___', options: ['eyes', 'nose', 'knees', 'ears'], correctIndex: 3, topic: 'Senses' },
      { text: 'A rock is ___', options: ['living', 'an animal', 'a plant', 'nonliving'], correctIndex: 3, topic: 'Living things' },
      { text: 'Rain comes from ___', options: ['clouds', 'underground only', 'shoes', 'tables'], correctIndex: 0, topic: 'Weather' },
      { text: 'Butterfly starts as a ___', options: ['fish', 'rock', 'frog', 'caterpillar'], correctIndex: 3, topic: 'Life cycles' },
      { text: 'Day sky is often ___', options: ['pink only', 'blue', 'no color', 'always black'], correctIndex: 1, topic: 'Sky' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    difficultyLevel: 'easy',
    title: 'Kindergarten Patterns Easy',
    description: 'AB and ABC patterns with numbers and shapes.',
    questions: [
      { text: '2, 4, 6, 8, ___', options: ['7', '9', '12', '10'], correctIndex: 3, topic: 'Skip by 2' },
      { text: 'A, B, C, A, B, ___', options: ['A', 'D', 'B', 'C'], correctIndex: 3, topic: 'Letter pattern' },
      { text: '🔺 🔻 🔺 🔻 ___', options: ['🔴', '⬜', '🔻', '🔺'], correctIndex: 3, topic: 'Shape pattern' },
      { text: '1, 2, 3, 1, 2, ___', options: ['1', '3', '2', '4'], correctIndex: 1, topic: 'Repeating pattern' },
      { text: 'Growing: 1, 2, 3, 4, ___', options: ['6', '5', '1', '3'], correctIndex: 1, topic: 'Growing sequence' },
      { text: 'Clap-clap-stomp repeats. Next is ___', options: ['silence', 'stomp', 'clap', 'clap-clap'], correctIndex: 2, topic: 'Rhythm pattern' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    difficultyLevel: 'easy',
    title: 'Kindergarten Memory Easy',
    description: 'Remember directions, rhymes, and short lists.',
    questions: [
      { text: 'North, East, South — what compass part was first?', options: ['South', 'West', 'East', 'North'], correctIndex: 3, topic: 'Order recall' },
      { text: 'Rhyme: cat, hat, bat — which rhymes?', options: ['Mat', 'Sun', 'Dog', 'Run'], correctIndex: 0, topic: 'Word families' },
      { text: 'Showed: red, blue, green. Missing from list?', options: ['Blue', 'Yellow', 'Red', 'Green'], correctIndex: 1, topic: 'List check' },
      { text: '★ = star, ▲ = triangle. ▲ means ___', options: ['square', 'triangle', 'circle', 'star'], correctIndex: 1, topic: 'Symbols' },
      { text: 'Story: plant seed → water → sun. Before water?', options: ['Plant seed', 'Pick fruit', 'Sleep', 'Eat lunch'], correctIndex: 0, topic: 'Sequence' },
      { text: 'Phone: 3-1-4. Middle digit?', options: ['0', '4', '3', '1'], correctIndex: 3, topic: 'Digit order' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    difficultyLevel: 'easy',
    title: 'Kindergarten Problem Solving Easy',
    description: 'Draw pictures and act out simple stories.',
    questions: [
      { text: '7 birds, 2 fly away. How many left?', options: ['6', '5', '9', '4'], correctIndex: 1, topic: 'Take away' },
      { text: '3 red balls and 4 blue balls. Total?', options: ['7', '6', '1', '8'], correctIndex: 0, topic: 'Join' },
      { text: 'Need 8 chairs, have 5. How many more?', options: ['3', '4', '2', '13'], correctIndex: 0, topic: 'Missing part' },
      { text: 'Longer pencil is better for ___', options: ['wearing', 'eating soup', 'sleeping', 'reaching far'], correctIndex: 3, topic: 'Compare tools' },
      { text: 'Share 6 cookies equally with 2 friends. Each gets ___', options: ['6', '3', '2', '4'], correctIndex: 1, topic: 'Fair shares' },
      { text: 'Broken crayon still colors if you ___', options: ['hide it', 'throw it', 'freeze it', 'hold the piece'], correctIndex: 3, topic: 'Try solutions' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    difficultyLevel: 'easy',
    title: 'Kindergarten Critical Thinking Easy',
    description: 'Sort, predict, and choose the best idea.',
    questions: [
      { text: 'Which can roll?', options: ['Ball', 'Chair', 'Book', 'Wall'], correctIndex: 0, topic: 'Properties' },
      { text: 'Dark clouds often mean ___ soon', options: ['snow only in desert', 'always sun', 'nothing', 'rain'], correctIndex: 3, topic: 'Predict' },
      { text: 'Opinion: “Blue is the best color.” Fact or opinion?', options: ['Fact', 'Opinion', 'Both', 'Neither'], correctIndex: 1, topic: 'Fact vs opinion' },
      { text: 'Heavier bag needs ___ to carry', options: ['throw it', 'one finger', 'no help ever', 'two hands or help'], correctIndex: 3, topic: 'Better plan' },
      { text: 'Which does NOT belong: dog, cat, car, fish?', options: ['Cat', 'Car', 'Fish', 'Dog'], correctIndex: 1, topic: 'Odd one out' },
      { text: 'Ice in freezer stays solid because it is ___', options: ['square', 'loud', 'cold', 'hot'], correctIndex: 2, topic: 'Cause and effect' },
    ],
  }),
];

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const KINDERGARTEN_CATALOG = [
  ...KINDERGARTEN_BASE_CATALOG,
  ...KINDERGARTEN_TIER_QUIZZES,
];
