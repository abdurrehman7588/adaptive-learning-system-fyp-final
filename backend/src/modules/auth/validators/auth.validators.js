import { z } from 'zod';
import { AuthError } from '../../../shared/http/errors.js';

const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.literal('parent'),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const studentLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  pin: z.string().regex(/^\d{4,6}$/),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new AuthError(422, 'Validation failed', 'AUTH_VALIDATION_ERROR', errors);
  }
  return result.data;
}

export const authValidators = {
  registerParent(body) {
    return parse(registerSchema, body);
  },
  loginParent(body) {
    return parse(loginSchema, body);
  },
  loginStudent(body) {
    return parse(studentLoginSchema, body);
  },
  updateProfile(body) {
    return parse(profileSchema, body);
  },
  loginAdmin(body) {
    return parse(adminLoginSchema, body);
  },
};
