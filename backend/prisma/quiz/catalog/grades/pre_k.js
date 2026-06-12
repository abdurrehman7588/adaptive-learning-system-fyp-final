import { buildQuiz } from '../utils.js';
import { PRE_K_TIER_QUIZZES } from './pre_k_tier_quizzes.js';

const G = 'pre_k';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const PRE_K_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    difficultyLevel: 'easy',
    title: 'Pre-K Math Easy: Count & Compare',
    description: 'Count objects and compare which group has more.',
    questions: [
      { text: 'How many apples? 🍎🍎🍎', options: ['5', '4', '2', '3'], correctIndex: 3, topic: 'Counting to 5' },
      { text: 'Which group has MORE stars? ⭐⭐  or  ⭐⭐⭐⭐', options: ['Second group', 'Same', 'Neither', 'First group'], correctIndex: 0, topic: 'Compare groups' },
      { text: 'What number comes after 2?', options: ['5', '4', '3', '1'], correctIndex: 2, topic: 'Number order' },
      { text: 'Circle the shape with 4 sides.', options: ['Square', 'Circle', 'Triangle', 'Heart'], correctIndex: 0, topic: 'Shapes' },
      { text: '1, 2, 3, ___', options: ['1', '4', '5', '2'], correctIndex: 1, topic: 'Counting on' },
      { text: 'Which shows the number 2?', options: ['●●', '●●●', '●', '●●●●'], correctIndex: 0, topic: 'Number sense' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Pre-K Science: My World',
    description: 'Weather, animals, and taking care of our bodies.',
    questions: [
      { text: 'We use an umbrella when it ___', options: ['rains', 'is summer', 'snows only at night', 'is always dark'], correctIndex: 0, topic: 'Weather' },
      { text: 'A fish swims in ___', options: ['trees', 'water', 'sand', 'clouds'], correctIndex: 1, topic: 'Habitats' },
      { text: 'We wash hands to remove ___', options: ['music', 'colors', 'germs', 'wind'], correctIndex: 2, topic: 'Health' },
      { text: 'The sun helps us see during the ___', options: ['winter only', 'night only', 'day', 'never'], correctIndex: 2, topic: 'Day and night' },
      { text: 'A puppy is a baby ___', options: ['dog', 'fish', 'cat', 'bird'], correctIndex: 0, topic: 'Animals' },
      { text: 'Plants need water and ___ to grow', options: ['toys', 'shoes', 'pillows', 'light'], correctIndex: 3, topic: 'Plants' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Pre-K Patterns',
    description: 'Colors, sounds, and simple repeating patterns.',
    questions: [
      { text: 'Red, blue, red, blue, ___', options: ['yellow', 'purple', 'green', 'red'], correctIndex: 3, topic: 'Color pattern' },
      { text: 'Clap, stomp, clap, stomp, ___', options: ['sit', 'clap', 'jump', 'stomp'], correctIndex: 1, topic: 'Action pattern' },
      { text: 'Big, small, big, small, ___', options: ['huge', 'tiny', 'small', 'big'], correctIndex: 3, topic: 'Size pattern' },
      { text: '🔵 🔴 🔵 🔴 ___', options: ['🔴', '🔵', '🟢', '🟡'], correctIndex: 1, topic: 'Shape-color pattern' },
      { text: '1, 1, 2, 1, 1, 2 — what repeats?', options: ['3, 3, 3', '1, 1, 2', '2, 2, 1', '1, 2 only'], correctIndex: 1, topic: 'Growing pattern' },
      { text: 'Circle, square, circle, square, ___', options: ['star', 'triangle', 'circle', 'square'], correctIndex: 2, topic: 'Shape pattern' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Pre-K Memory',
    description: 'Remember pictures, order, and pairs.',
    questions: [
      { text: 'You saw: ball, cup, hat. Which was in the list?', options: ['Cup', 'Shoe', 'Car', 'Tree'], correctIndex: 0, topic: 'List recall' },
      { text: 'First we sing, then we snack. What comes first?', options: ['Sing', 'Sleep', 'Snack', 'Run'], correctIndex: 0, topic: 'Order' },
      { text: '🐶 means dog. 🐶 means ___', options: ['dog', 'sun', 'cat', 'book'], correctIndex: 0, topic: 'Symbol match' },
      { text: 'Hide the red block under the bowl. The block is ___', options: ['in the sky', 'under the bowl', 'on your head', 'gone forever'], correctIndex: 1, topic: 'Location memory' },
      { text: 'Repeat: tap, tap, clap. Last sound was ___', options: ['tap', 'clap', 'hum', 'stomp'], correctIndex: 1, topic: 'Sound sequence' },
      { text: 'Match: sock goes with ___', options: ['shoe', 'book', 'hat', 'spoon'], correctIndex: 0, topic: 'Pairs' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Pre-K Problem Solving',
    description: 'Try a plan and fix simple everyday problems.',
    questions: [
      { text: 'Crayon broke. Good first try?', options: ['Throw away desk', 'Tape or sharpen', 'Hide it', 'Draw on wall'], correctIndex: 1, topic: 'Fix it' },
      { text: 'Two friends want one swing. Kind plan?', options: ['Push each other', 'Take turns', 'Leave swing', 'Cry only'], correctIndex: 1, topic: 'Sharing' },
      { text: 'Tower keeps falling. Try ___', options: ['shake it', 'ignore', 'taller on one block', 'wider base'], correctIndex: 3, topic: 'Build and test' },
      { text: 'Spill on floor. You should ___', options: ['walk away', 'wipe it up', 'add more water', 'hide'], correctIndex: 1, topic: 'Safety' },
      { text: 'Can’t reach book. Safe help?', options: ['Ask a grown-up', 'Jump from chair', 'Give up reading', 'Climb shelves'], correctIndex: 0, topic: 'Ask for help' },
      { text: 'Puzzle piece does not fit. Next step?', options: ['stop forever', 'force it hard', 'Turn it or try another spot', 'eat snack'], correctIndex: 2, topic: 'Try another way' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Pre-K Thinking',
    description: 'Same or different, true pictures, and safe choices.',
    questions: [
      { text: 'Which is NOT a fruit?', options: ['Grape', 'Rock', 'Banana', 'Apple'], correctIndex: 1, topic: 'Categories' },
      { text: 'It is dark outside. Likely time is ___', options: ['always morning', 'noon', 'night', 'never'], correctIndex: 2, topic: 'Reason from clues' },
      { text: 'Wearing a coat in snow helps you stay ___', options: ['warm', 'invisible', 'wet on purpose', 'taller'], correctIndex: 0, topic: 'Cause and effect' },
      { text: 'Which picture shows a happy face?', options: ['Smile', 'Blank page', 'Frown', 'Sleeping only'], correctIndex: 0, topic: 'Feelings' },
      { text: 'Cross the street only with a ___', options: ['closed eyes', 'run fast blind', 'pet alone', 'grown-up'], correctIndex: 3, topic: 'Safety rules' },
      { text: 'Ice cream melts in heat because it gets ___', options: ['colder', 'warm', 'heavier', 'square'], correctIndex: 1, topic: 'Why things change' },
    ],
  }),
  ...PRE_K_TIER_QUIZZES,
];
