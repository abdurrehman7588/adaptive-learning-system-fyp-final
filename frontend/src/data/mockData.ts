import type { Quiz } from '../types';

export const AVATARS = [
    '🤖', '🦁', '🚀', '🦄', '🐱', '🦖', '🌟', '🐼'
];

export const MOCK_QUIZZES: Quiz[] = [
    {
        id: 'q-cognitive-1',
        type: 'cognitive',
        title: 'Pattern Recognition',
        questions: [
            {
                id: '1',
                text: 'Which shape comes next in the pattern? 🟥 🟦 🟥 🟦 ...',
                options: ['🟥', '🟦', '🟩', '🟨'],
                correctIndex: 0
            },
            {
                id: '2',
                text: 'Pick the odd one out.',
                options: ['🍎', '🍌', '🚗', '🍇'],
                correctIndex: 2
            },
            // ... more questions would go here
            { id: '3', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctIndex: 1 },
            { id: '4', text: 'Which is bigger?', options: ['🐭', '🐘', '🐜', '🐕'], correctIndex: 1 },
            { id: '5', text: 'Select the red fruit.', options: ['🍋', '🥒', '🍓', '🥕'], correctIndex: 2 },
            { id: '6', text: 'A triangle has how many sides?', options: ['2', '3', '4', '5'], correctIndex: 1 },
            { id: '7', text: 'Day comes after...', options: ['Night', 'Evening', 'Lunch', 'Breakfast'], correctIndex: 0 },
            { id: '8', text: 'Ice is...', options: ['Hot', 'Cold', 'Warm', 'Spicy'], correctIndex: 1 },
            { id: '9', text: 'Birds can...', options: ['Bark', 'Meow', 'Fly', 'Moo'], correctIndex: 2 },
            { id: '10', text: 'Which color is the sky?', options: ['Green', 'Blue', 'Red', 'Purple'], correctIndex: 1 },
        ]
    },
    {
        id: 'q-gk-1',
        type: 'gk',
        title: 'World Around Us',
        questions: Array.from({ length: 10 }).map((_, i) => ({
            id: `gk-${i}`,
            text: `Sample GK Question ${i + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0
        }))
    },
    {
        id: 'q-iq-1',
        type: 'iq',
        title: 'Brain Teasers',
        questions: Array.from({ length: 10 }).map((_, i) => ({
            id: `iq-${i}`,
            text: `Sample IQ Question ${i + 1}`,
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 1
        }))
    }
];
