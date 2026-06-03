import { gradeLevelToDisplayLabel } from '../../../shared/content/taxonomy.js';

/**
 * Public child DTO — snake_case for frontend compatibility. Never includes pin or pin_hash.
 * @param {import('@prisma/client').Child} row
 */
export function toChildResponse(row) {
  const prefs =
    row.learningPreferences && typeof row.learningPreferences === 'object'
      ? row.learningPreferences
      : {};

  return {
    id: row.id,
    name: row.name,
    username: row.username,
    grade_level: gradeLevelToDisplayLabel(row.gradeLevel) ?? row.gradeLevel ?? null,
    grade_level_enum: row.gradeLevel ?? null,
    avatar_url: row.avatarUrl ?? null,
    age: row.age ?? null,
    date_of_birth: row.dateOfBirth
      ? row.dateOfBirth.toISOString().slice(0, 10)
      : null,
    learning_preferences: prefs,
  };
}

/**
 * @param {import('@prisma/client').Child} row
 */
export function toChildSummary(row) {
  return {
    id: row.id,
    name: row.name,
    gradeLevel: gradeLevelToDisplayLabel(row.gradeLevel) ?? row.gradeLevel ?? null,
    gradeLevelEnum: row.gradeLevel ?? null,
    avatarUrl: row.avatarUrl ?? null,
  };
}
