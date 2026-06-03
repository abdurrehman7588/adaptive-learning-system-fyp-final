import { buildQuiz } from '../utils.js';

const G = 'pre_k';

/** @type {import('../../catalogTypes.js').QuizCatalogEntry[]} */
export const PRE_K_CATALOG = [
  buildQuiz({
    gradeLevel: G,
    category: 'math',
    title: 'Pre-K Math: Count & Compare',
    description: 'Count objects and compare which group has more.',
    questions: [
      { text: 'How many apples? 🍎🍎🍎', options: ['3', '2', '4', '5'], correctIndex: 0, topic: 'Counting to 5' },
      { text: 'Which group has MORE stars? ⭐⭐  or  ⭐⭐⭐⭐', options: ['Second group', 'First group', 'Same', 'Neither'], correctIndex: 0, topic: 'Compare groups' },
      { text: 'What number comes after 2?', options: ['3', '1', '4', '5'], correctIndex: 0, topic: 'Number order' },
      { text: 'Circle the shape with 4 sides.', options: ['Square', 'Circle', 'Triangle', 'Heart'], correctIndex: 0, topic: 'Shapes' },
      { text: '1, 2, 3, ___', options: ['4', '2', '5', '1'], correctIndex: 0, topic: 'Counting on' },
      { text: 'Which shows the number 2?', options: ['●●', '●', '●●●●', '●●●'], correctIndex: 0, topic: 'Number sense' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'science',
    title: 'Pre-K Science: My World',
    description: 'Weather, animals, and taking care of our bodies.',
    questions: [
      { text: 'We use an umbrella when it ___', options: ['rains', 'snows only at night', 'is always dark', 'is summer'], correctIndex: 0, topic: 'Weather' },
      { text: 'A fish swims in ___', options: ['water', 'sand', 'trees', 'clouds'], correctIndex: 0, topic: 'Habitats' },
      { text: 'We wash hands to remove ___', options: ['germs', 'colors', 'music', 'wind'], correctIndex: 0, topic: 'Health' },
      { text: 'The sun helps us see during the ___', options: ['day', 'night only', 'winter only', 'never'], correctIndex: 0, topic: 'Day and night' },
      { text: 'A puppy is a baby ___', options: ['dog', 'cat', 'bird', 'fish'], correctIndex: 0, topic: 'Animals' },
      { text: 'Plants need water and ___ to grow', options: ['light', 'toys', 'shoes', 'pillows'], correctIndex: 0, topic: 'Plants' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'pattern_recognition',
    title: 'Pre-K Patterns',
    description: 'Colors, sounds, and simple repeating patterns.',
    questions: [
      { text: 'Red, blue, red, blue, ___', options: ['red', 'green', 'yellow', 'purple'], correctIndex: 0, topic: 'Color pattern' },
      { text: 'Clap, stomp, clap, stomp, ___', options: ['clap', 'stomp', 'jump', 'sit'], correctIndex: 0, topic: 'Action pattern' },
      { text: 'Big, small, big, small, ___', options: ['big', 'small', 'tiny', 'huge'], correctIndex: 0, topic: 'Size pattern' },
      { text: '🔵 🔴 🔵 🔴 ___', options: ['🔵', '🔴', '🟢', '🟡'], correctIndex: 0, topic: 'Shape-color pattern' },
      { text: '1, 1, 2, 1, 1, 2 — what repeats?', options: ['1, 1, 2', '2, 2, 1', '1, 2 only', '3, 3, 3'], correctIndex: 0, topic: 'Growing pattern' },
      { text: 'Circle, square, circle, square, ___', options: ['circle', 'square', 'triangle', 'star'], correctIndex: 0, topic: 'Shape pattern' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'memory',
    title: 'Pre-K Memory',
    description: 'Remember pictures, order, and pairs.',
    questions: [
      { text: 'You saw: ball, cup, hat. Which was in the list?', options: ['Cup', 'Shoe', 'Car', 'Tree'], correctIndex: 0, topic: 'List recall' },
      { text: 'First we sing, then we snack. What comes first?', options: ['Sing', 'Snack', 'Sleep', 'Run'], correctIndex: 0, topic: 'Order' },
      { text: '🐶 means dog. 🐶 means ___', options: ['dog', 'cat', 'sun', 'book'], correctIndex: 0, topic: 'Symbol match' },
      { text: 'Hide the red block under the bowl. The block is ___', options: ['under the bowl', 'in the sky', 'on your head', 'gone forever'], correctIndex: 0, topic: 'Location memory' },
      { text: 'Repeat: tap, tap, clap. Last sound was ___', options: ['clap', 'tap', 'stomp', 'hum'], correctIndex: 0, topic: 'Sound sequence' },
      { text: 'Match: sock goes with ___', options: ['shoe', 'spoon', 'hat', 'book'], correctIndex: 0, topic: 'Pairs' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'problem_solving',
    title: 'Pre-K Problem Solving',
    description: 'Try a plan and fix simple everyday problems.',
    questions: [
      { text: 'Crayon broke. Good first try?', options: ['Tape or sharpen', 'Throw away desk', 'Hide it', 'Draw on wall'], correctIndex: 0, topic: 'Fix it' },
      { text: 'Two friends want one swing. Kind plan?', options: ['Take turns', 'Push each other', 'Leave swing', 'Cry only'], correctIndex: 0, topic: 'Sharing' },
      { text: 'Tower keeps falling. Try ___', options: ['wider base', 'taller on one block', 'shake it', 'ignore'], correctIndex: 0, topic: 'Build and test' },
      { text: 'Spill on floor. You should ___', options: ['wipe it up', 'walk away', 'add more water', 'hide'], correctIndex: 0, topic: 'Safety' },
      { text: 'Can’t reach book. Safe help?', options: ['Ask a grown-up', 'Climb shelves', 'Jump from chair', 'Give up reading'], correctIndex: 0, topic: 'Ask for help' },
      { text: 'Puzzle piece does not fit. Next step?', options: ['Turn it or try another spot', 'force it hard', 'eat snack', 'stop forever'], correctIndex: 0, topic: 'Try another way' },
    ],
  }),
  buildQuiz({
    gradeLevel: G,
    category: 'critical_thinking',
    title: 'Pre-K Thinking',
    description: 'Same or different, true pictures, and safe choices.',
    questions: [
      { text: 'Which is NOT a fruit?', options: ['Rock', 'Apple', 'Banana', 'Grape'], correctIndex: 0, topic: 'Categories' },
      { text: 'It is dark outside. Likely time is ___', options: ['night', 'noon', 'always morning', 'never'], correctIndex: 0, topic: 'Reason from clues' },
      { text: 'Wearing a coat in snow helps you stay ___', options: ['warm', 'wet on purpose', 'invisible', 'taller'], correctIndex: 0, topic: 'Cause and effect' },
      { text: 'Which picture shows a happy face?', options: ['Smile', 'Frown', 'Sleeping only', 'Blank page'], correctIndex: 0, topic: 'Feelings' },
      { text: 'Cross the street only with a ___', options: ['grown-up', 'pet alone', 'closed eyes', 'run fast blind'], correctIndex: 0, topic: 'Safety rules' },
      { text: 'Ice cream melts in heat because it gets ___', options: ['warm', 'colder', 'heavier', 'square'], correctIndex: 0, topic: 'Why things change' },
    ],
  }),
];
