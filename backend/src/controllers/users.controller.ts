import { Response } from 'express';
import { UsersService } from '../services/users.service';
import { AuthRequest, successResponse, errorResponse } from '../types';

const usersService = new UsersService();

export class UsersController {
  async findAll(req: AuthRequest, res: Response) {
    try {
      const result = await usersService.findAll(req.query as Record<string, unknown>);
      res.json(successResponse(result));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async findById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const user = await usersService.findById(id);
      res.json(successResponse(user));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json(successResponse(user));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const user = await usersService.update(id, req.body);
      res.json(successResponse(user));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async deactivate(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (req.user!.userId === id) {
        res.status(400).json(errorResponse('SELF_DEACTIVATION', 'Você não pode desativar sua própria conta'));
        return;
      }
      const result = await usersService.deactivate(id);
      res.json(successResponse(result));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }
}
