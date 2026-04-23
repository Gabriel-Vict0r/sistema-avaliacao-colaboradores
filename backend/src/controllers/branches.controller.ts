import { Response } from 'express';
import { BranchesService } from '../services/branches.service';
import { AuthRequest, successResponse, errorResponse } from '../types';

const branchesService = new BranchesService();

export class BranchesController {
  async findAll(_req: AuthRequest, res: Response) {
    try {
      const branches = await branchesService.findAll();
      res.json(successResponse({ branches }));
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
      const branch = await branchesService.findById(id);
      res.json(successResponse(branch));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const branch = await branchesService.create(req.body);
      res.status(201).json(successResponse(branch));
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
      const branch = await branchesService.update(id, req.body);
      res.json(successResponse(branch));
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
      const result = await branchesService.deactivate(id);
      res.json(successResponse(result));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }
}
