import { Response } from 'express';
import { EmployeesService } from '../services/employees.service';
import { AuthRequest, successResponse, errorResponse } from '../types';

const employeesService = new EmployeesService();

export class EmployeesController {
  async findAll(req: AuthRequest, res: Response) {
    try {
      const query = { ...req.query } as Record<string, unknown>;
      if (req.user!.role === 'EVALUATOR') {
        query.evaluatorUsername = req.user!.adUsername;
      }
      const result = await employeesService.findAll(query);
      res.json(successResponse(result));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async findPending(req: AuthRequest, res: Response) {
    try {
      const type = req.query.type as string | undefined;
      const evaluatorUsername = req.user!.role === 'EVALUATOR' ? req.user!.adUsername : undefined;
      const employees = await employeesService.findPending(type, evaluatorUsername);
      res.json(successResponse({ employees }));
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
      const employee = await employeesService.findById(id);
      res.json(successResponse(employee));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const employee = await employeesService.create(req.body);
      res.status(201).json(successResponse(employee));
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
      const employee = await employeesService.update(id, req.body);
      res.json(successResponse(employee));
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
      const result = await employeesService.deactivate(id);
      res.json(successResponse(result));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res.status(Number(e.statusCode) || 500).json(
        errorResponse(String(e.code || 'INTERNAL_ERROR'), String(e.message))
      );
    }
  }
}
