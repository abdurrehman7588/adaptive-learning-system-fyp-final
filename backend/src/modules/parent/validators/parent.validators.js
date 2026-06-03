import { z } from 'zod';
import { ParentValidationError } from '../../../shared/http/parentErrors.js';

const preferencesSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    weeklyReportEmail: z.boolean().optional(),
    learningGoals: z.array(z.string().trim().max(100)).max(10).optional(),
    childInterests: z.array(z.string().trim().max(100)).max(10).optional(),
    preferredLanguage: z.string().trim().max(10).optional(),
  })
  .strip();

const updateProfileSchema = z
  .object({
    avatarUrl: z.string().trim().max(500).optional(),
    preferredLanguage: z.string().trim().max(10).optional(),
  })
  .strip();

const onboardingSchema = z
  .object({
    completed: z.boolean().optional(),
    skipped: z.boolean().optional(),
    preferences: preferencesSchema.optional(),
  })
  .strip();

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ParentValidationError('Validation failed', errors);
  }
  return result.data;
}

export const parentValidators = {
  updatePreferences(body) {
    return parse(preferencesSchema, body);
  },
  updateProfile(body) {
    return parse(updateProfileSchema, body);
  },
  updateOnboarding(body) {
    return parse(onboardingSchema, body);
  },
};
