import { z } from 'zod';
import { ValidationError } from '../../../shared/http/errors.js';

const startAttemptSchema = z.object({
  child_id: z.coerce.number().int().positive().optional(),
});

const answerRowSchema = z.object({
  question_id: z.coerce.number().int().positive(),
  selected_option_id: z.coerce.number().int().positive().nullable(),
  time_taken_seconds: z.coerce.number().int().min(1).max(600).optional(),
});

const submitAttemptSchema = z.object({
  answers: z.array(answerRowSchema).min(1),
});

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ValidationError('Validation failed', errors);
  }
  return result.data;
}

export const quizValidators = {
  startAttempt(body) {
    return parse(startAttemptSchema, body);
  },
  submitAttempt(body) {
    return parse(submitAttemptSchema, body);
  },
};
