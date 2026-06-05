import { z } from 'zod';
import { ValidationError } from '../../../shared/http/errors.js';

const EMOTION_SLUGS = ['very_easy_fun', 'confident', 'okay', 'difficult', 'frustrated'];

const submitSchema = z.object({
  quiz_attempt_id: z.coerce.number().int().positive(),
  emotion_label: z.enum(EMOTION_SLUGS),
});

/**
 * @param {unknown} body
 */
export function validateSubmitBody(body) {
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid emotion feedback payload', parsed.error.flatten());
  }
  return {
    quizAttemptId: parsed.data.quiz_attempt_id,
    emotionLabel: parsed.data.emotion_label,
  };
}

/**
 * @param {import('express').ParamsDictionary} params
 */
export function validateChildIdParam(params) {
  const childId = Number(params.childId);
  if (!Number.isInteger(childId) || childId <= 0) {
    throw new ValidationError('Invalid child id');
  }
  return childId;
}
