import { Response, NextFunction } from 'express';
import { AuthRequest, errorResponse } from '../types';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json(errorResponse('AUTH_UNAUTHORIZED', 'Usuário não autenticado'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(
        errorResponse('AUTH_FORBIDDEN', 'Você não tem permissão para acessar este recurso')
      );
      return;
    }

    next();
  };
};
