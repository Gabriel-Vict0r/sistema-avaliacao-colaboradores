import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  DATABASE_URL: required('DATABASE_URL'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',

  AD_URL: required('AD_URL'),
  AD_BASE_DN: required('AD_BASE_DN'),
  AD_SERVICE_USER: required('AD_SERVICE_USER'),
  AD_SERVICE_PASSWORD: required('AD_SERVICE_PASSWORD'),
  AD_DOMAIN: process.env.AD_DOMAIN || '',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10),

  isDev: () => process.env.NODE_ENV === 'development',
};
