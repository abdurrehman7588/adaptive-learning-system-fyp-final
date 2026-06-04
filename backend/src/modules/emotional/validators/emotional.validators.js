import { AppError, ValidationError } from '../../../shared/http/errors.js';
import { z } from 'zod';
import { EI_DIMENSIONS, EI_QUESTIONS } from '../constants/eiCatalog.js';

const dimensionSchema = z.enum(['self_awareness', 'empathy', 'self_regulation']);

const responseSchema = z.object({
  dimension: dimensionSchema,
  questionIndex: z.number().int().min(0).max(3),
  value: z.number().int().min(1).max(4),
});

const assessmentSchema = z.object({
  responses: z.array(responseSchema).length(12),
});

const feelingsActivitySchema = z.object({
  feeling: z.enum(['Happy', 'Sad', 'Angry', 'Worried']),
  reason: z.enum(['School', 'Friends', 'Family', 'Games', 'Other']),
});

const scenarioActivitySchema = z.object({
  answer: z.enum(['A', 'B', 'C']),
});

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

export function validateAssessmentBody(body) {
  const data = parse(assessmentSchema, body);

  for (const dimension of EI_DIMENSIONS) {
    const expected = EI_QUESTIONS[dimension].length;
    const got = data.responses.filter((r) => r.dimension === dimension);
    if (got.length !== expected) {
      throw new ValidationError(`Expected ${expected} responses for ${dimension}`);
    }
    const indices = new Set(got.map((r) => r.questionIndex));
    if (indices.size !== expected) {
      throw new ValidationError(
        `Duplicate or missing question indices for ${dimension}`,
      );
    }
  }

  return data;
}

export function validateFeelingsActivity(body) {
  return parse(feelingsActivitySchema, body);
}

export function validateScenarioActivity(body) {
  return parse(scenarioActivitySchema, body);
}

export function validateChildIdParam(params) {
  const id = Number.parseInt(String(params.childId), 10);
  if (!Number.isFinite(id) || id < 1) {
    throw new ValidationError('Invalid child id');
  }
  return id;
}

export function validateActivitySlug(params) {
  const slug = String(params.slug ?? '').trim();
  if (!['feelings_today', 'helping_friend', 'calm_down'].includes(slug)) {
    throw new AppError(404, 'Unknown activity', 'NOT_FOUND');
  }
  return slug;
}
