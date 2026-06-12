/**
 * Shuffle quiz option order and fix correctIndex in catalog grade files.
 * Run: node scripts/fix-catalog-correct-index.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FULL_GRADE_CATALOG } from '../prisma/quiz/catalog/index.js';

const GRADES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../prisma/quiz/catalog/grades',
);

const TARGET_FILES = [
  'pre_k.js',
  'pre_k_tier_quizzes.js',
  'kindergarten.js',
  'kindergarten_tier_quizzes.js',
  'grade_1.js',
  'grade_1_tier_quizzes.js',
  'grade_2.js',
  'grade_2_pilot_tiers.js',
  'grade_3.js',
  'grade_3_tier_quizzes.js',
  'grade_4.js',
  'grade_4_tier_quizzes.js',
  'grade_5.js',
  'grade_5_tier_quizzes.js',
  'grade_6.js',
  'grade_6_tier_quizzes.js',
];

const QUESTION_RE =
  /^(\s*)\{ text: '((?:\\'|[^'])*)', options: \[((?:'(?:\\'|[^'])*'(?:,\s*)?)+)\], correctIndex: (\d+), topic: '((?:\\'|[^'])*)' \},?\s*$/;

function unescapeJsString(value) {
  return value.replace(/\\'/g, "'");
}

function escapeJsString(value) {
  return value.replace(/'/g, "\\'");
}

function parseOptions(optionsInner) {
  const options = [];
  const re = /'((?:\\'|[^'])*)'/g;
  let match;
  while ((match = re.exec(optionsInner)) !== null) {
    options.push(unescapeJsString(match[1]));
  }
  return options;
}

function formatOptions(options) {
  return options.map((option) => `'${escapeJsString(option)}'`).join(', ');
}

function shuffleInPlace(items, random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function fixQuestionLine(line, random) {
  const match = line.match(QUESTION_RE);
  if (!match) return { line, changed: false };

  const indent = match[1];
  const text = unescapeJsString(match[2]);
  const options = parseOptions(match[3]);
  const oldIndex = Number(match[4]);
  const topic = unescapeJsString(match[5]);

  if (!Number.isInteger(oldIndex) || oldIndex < 0 || oldIndex >= options.length) {
    throw new Error(`Invalid correctIndex ${oldIndex} in line: ${line.trim()}`);
  }

  const correctAnswer = options[oldIndex];
  const shuffled = [...options];
  shuffleInPlace(shuffled, random);

  const newIndex = shuffled.indexOf(correctAnswer);
  if (newIndex === -1) {
    throw new Error(`Correct answer missing after shuffle: ${correctAnswer}`);
  }

  const fixed = `${indent}{ text: '${escapeJsString(text)}', options: [${formatOptions(shuffled)}], correctIndex: ${newIndex}, topic: '${escapeJsString(topic)}' },`;
  return { line: fixed, changed: true, newIndex };
}

function fixFile(fileName, random) {
  const filePath = path.join(GRADES_DIR, fileName);
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  let changedCount = 0;
  const indices = [];

  const updated = lines.map((line) => {
    const result = fixQuestionLine(line, random);
    if (result.changed) {
      changedCount += 1;
      indices.push(result.newIndex);
    }
    return result.line;
  });

  fs.writeFileSync(filePath, updated.join('\n'), 'utf8');
  return { fileName, changedCount, indices };
}

function verifyCatalog() {
  const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let total = 0;

  for (const quiz of FULL_GRADE_CATALOG) {
    for (const question of quiz.questions) {
      const idx = question.correctIndex;
      distribution[idx] = (distribution[idx] ?? 0) + 1;
      total += 1;

      const correct = question.options[question.correctIndex];
      if (correct === undefined) {
        throw new Error(`Broken question in ${quiz.slug}: correctIndex ${idx}`);
      }
    }
  }

  return { distribution, total };
}

function main() {
  // Deterministic shuffle for reproducible catalog commits.
  let seed = 20260519;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };

  const results = [];
  for (const fileName of TARGET_FILES) {
    results.push(fixFile(fileName, random));
  }

  // Re-import catalog after edits (fresh process would be needed; re-read via dynamic import cache bust)
  // Validate by scanning files instead
  let totalQuestions = 0;
  const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const fileName of TARGET_FILES) {
    const content = fs.readFileSync(path.join(GRADES_DIR, fileName), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/correctIndex: (\d+)/);
      if (!match) continue;
      if (!line.includes('options: [')) continue;
      const idx = Number(match[1]);
      distribution[idx] = (distribution[idx] ?? 0) + 1;
      totalQuestions += 1;
    }
  }

  console.log('Fixed catalog files:');
  for (const row of results) {
    console.log(`  ${row.fileName}: ${row.changedCount} questions`);
  }

  console.log(`\nTotal questions scanned: ${totalQuestions}`);
  console.log('\ncorrectIndex distribution:');
  for (const idx of [0, 1, 2, 3]) {
    const count = distribution[idx] ?? 0;
    const pct = totalQuestions > 0 ? ((100 * count) / totalQuestions).toFixed(1) : '0.0';
    console.log(`  index ${idx}: ${count} (${pct}%)`);
  }

  const maxShare = Math.max(...[0, 1, 2, 3].map((i) => distribution[i] ?? 0)) / totalQuestions;
  if (distribution[0] === totalQuestions) {
    console.error('\nFAIL: all correctIndex values are still 0');
    process.exit(1);
  }
  if (maxShare > 0.5) {
    console.warn('\nWARN: one index holds >50% — shuffle may be skewed');
  } else {
    console.log('\nPASS: correctIndex spread across 0–3');
  }
}

main();
