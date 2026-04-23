import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const err = error as Record<string, unknown>;
  console.error('[ErrorHandler]', err);

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = typeof err.message === 'string' ? err.message : 'Erro interno do servidor';
  const code = typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(env.isDev() && { stack: err.stack }),
    },
  });
};
