import { z } from 'zod';

export const childIdParamSchema = z.object({
  childId: z.coerce.number().int().positive(),
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateChildIdParam(req, res, next) {
  const parsed = childIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Invalid child id',
      data: {
        code: 'REWARDS_VALIDATION_ERROR',
        errors: parsed.error.flatten().fieldErrors,
      },
    });
  }
  req.params.childId = String(parsed.data.childId);
  return next();
}
