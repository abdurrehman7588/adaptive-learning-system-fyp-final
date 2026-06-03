import dotenv from 'dotenv';

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(name, fallback = '') {
  const value = process.env[name];
  return value?.trim() ? value.trim() : fallback;
}

const nodeEnv = optional('NODE_ENV', 'development');

export const config = {
  port: Number.parseInt(optional('PORT', '5000'), 10),
  nodeEnv,
  isProduction: nodeEnv === 'production',

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
  },

  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173').replace(/\/$/, ''),

  google: {
    clientId: optional('GOOGLE_CLIENT_ID'),
    clientSecret: optional('GOOGLE_CLIENT_SECRET'),
    callbackUrl: optional(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:5000/api/auth/google/callback',
    ),
  },

  demo: {
    parentEmail: optional('DEMO_PARENT_EMAIL', 'parent@demo.com'),
    parentPassword: optional('DEMO_PARENT_PASSWORD', 'password123'),
  },

  admin: {
    email: optional('ADMIN_EMAIL'),
    password: optional('ADMIN_PASSWORD'),
  },
};

export function isGoogleOAuthConfigured() {
  return Boolean(config.google.clientId && config.google.clientSecret);
}
