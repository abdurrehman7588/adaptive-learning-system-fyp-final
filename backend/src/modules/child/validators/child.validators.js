import { z } from 'zod';
import { ChildValidationError } from '../errors/child.errors.js';

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username must be 3–32 letters, numbers, or underscores');

const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, 'PIN must be 4–6 digits');

const avatarSchema = z.string().trim().max(500).optional().nullable();

const gradeSchema = z.string().trim().min(1).max(50);

const ageSchema = z.number().int().min(4).max(12).optional().nullable();

const prefsSchema = z.record(z.unknown()).optional();

const MAX_PREFS_BYTES = 8192;

function assertPrefsSize(prefs) {
  if (!prefs) return;
  const size = Buffer.byteLength(JSON.stringify(prefs), 'utf8');
  if (size > MAX_PREFS_BYTES) {
    throw new ChildValidationError('learning_preferences exceeds maximum size');
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(255),
  username: usernameSchema,
  pin: pinSchema,
  grade_level: gradeSchema,
  avatar_url: avatarSchema,
  age: ageSchema,
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  learning_preferences: prefsSchema,
});

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    username: usernameSchema.optional(),
    pin: pinSchema.optional(),
    grade_level: gradeSchema,
    avatar_url: avatarSchema,
    age: ageSchema,
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    learning_preferences: prefsSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ChildValidationError('Validation failed', errors);
  }
  assertPrefsSize(result.data.learning_preferences);
  return result.data;
}

const studentAvatarSchema = z.object({
  avatar_url: z.string().trim().min(1).max(500),
});

export const childValidators = {
  create(body) {
    return parse(createSchema, body);
  },
  update(body) {
    return parse(updateSchema, body);
  },
  studentAvatar(body) {
    return parse(studentAvatarSchema, body);
  },
};
