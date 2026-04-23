import { Response } from 'express';
import { StatsService } from '../services/stats.service';
import { AuthRequest, successResponse, errorResponse } from '../types';

const statsService = new StatsService();

export class StatsController {
  async getDashboard(_req: AuthRequest, res: Response) {
    try {
      const data = await statsService.getDashboard();
      res.json(successResponse(data));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async getEmployeeHistory(req: AuthRequest, res: Response) {
    try {
      const data = await statsService.getEmployeeHistory(parseInt(req.params.id as string, 10));
      res.json(successResponse(data));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }
}
