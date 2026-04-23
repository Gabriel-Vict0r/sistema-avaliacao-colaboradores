import { Response } from 'express';
import { EvaluationsService } from '../services/evaluations.service';
import { AuthRequest, successResponse, errorResponse } from '../types';

const evaluationsService = new EvaluationsService();

export class EvaluationsController {
  async findAll(req: AuthRequest, res: Response) {
    try {
      const query = { ...req.query } as Record<string, unknown>;
      if (req.user!.role === 'EVALUATOR') {
        query.evaluatorId = req.user!.userId;
      }
      const result = await evaluationsService.findAll(query);
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
      const evaluation = await evaluationsService.findById(id);

      if (req.user!.role === 'EVALUATOR' && evaluation.evaluatorId !== req.user!.userId) {
        res.status(403).json(errorResponse('AUTH_FORBIDDEN', 'Acesso negado'));
        return;
      }

      res.json(successResponse(evaluation));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const evaluation = await evaluationsService.create(req.body, req.user!.userId);
      res.status(201).json(successResponse(evaluation));
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
      const evaluation = await evaluationsService.update(
        id,
        req.body,
        req.user!.userId,
        req.user!.role
      );
      res.json(successResponse(evaluation));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      await evaluationsService.delete(id, req.user!.userId, req.user!.role);
      res.json(successResponse({ message: 'Avaliação removida com sucesso' }));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }
}
