import prisma from "../config/database";
import { calculateWeightedAverage } from "../utils/calculations";
import {
  CreateEvaluationInput,
  UpdateEvaluationInput,
} from "../schemas/evaluation.schema";
import { parsePagination } from "../types";

export class EvaluationsService {
  async findAll(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};
    if (query.employeeId) where.employeeId = parseInt(String(query.employeeId), 10);
    if (query.evaluatorId) where.evaluatorId = typeof query.evaluatorId === 'number'
      ? query.evaluatorId
      : parseInt(String(query.evaluatorId), 10);
    if (query.type) where.type = query.type;
    if (query.decision) where.decision = query.decision;
    if (query.startDate || query.endDate) {
      where.createdAt = {
        ...(query.startDate ? { gte: new Date(String(query.startDate)) } : {}),
        ...(query.endDate ? { lte: new Date(String(query.endDate)) } : {}),
      };
    }

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          average: true,
          decision: true,
          createdAt: true,
          employee: {
            select: { id: true, name: true, position: true, department: true },
          },
          evaluator: { select: { id: true, name: true, adUsername: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return {
      evaluations,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true,
            type: true,
          },
        },
        evaluator: { select: { id: true, name: true, email: true } },
        ratings: { orderBy: { category: "asc" } },
      },
    });

    if (!evaluation) {
      throw Object.assign(new Error("Avaliação não encontrada"), {
        statusCode: 404,
        code: "RESOURCE_NOT_FOUND",
      });
    }
    return evaluation;
  }

  async create(data: CreateEvaluationInput, evaluatorId: number) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw Object.assign(new Error("Colaborador não encontrado"), {
        statusCode: 404,
        code: "RESOURCE_NOT_FOUND",
      });
    }

    if (employee.type !== data.type) {
      throw Object.assign(
        new Error(
          `Tipo de avaliação '${data.type}' não corresponde ao tipo do colaborador '${employee.type}'`,
        ),
        { statusCode: 400, code: "BUSINESS_RULE_VIOLATION" },
      );
    }

    const average = calculateWeightedAverage(
      data.ratings.map((r) => ({ rating: r.rating, weight: r.weight })),
    );

    return prisma.evaluation.create({
      data: {
        employeeId: data.employeeId,
        evaluatorId,
        type: data.type,
        decision: data.decision,
        justification: data.justification,
        pointsImprovement: data.pointsImprovement ?? null,
        average,
        ratings: { create: data.ratings },
      },
      include: {
        employee: { select: { id: true, name: true, position: true } },
        evaluator: { select: { id: true, name: true } },
        ratings: true,
      },
    });
  }

  async update(
    id: number,
    data: UpdateEvaluationInput,
    userId: number,
    userRole: string,
  ) {
    const evaluation = await this.findById(id);

    // Apenas criador (em até 24h) ou ADMIN podem editar
    const hoursSinceCreation =
      (Date.now() - evaluation.createdAt.getTime()) / 3600000;
    const isCreator = evaluation.evaluatorId === userId;
    const isAdmin = userRole === "ADMIN";

    if (!isAdmin && !(isCreator && hoursSinceCreation <= 24)) {
      throw Object.assign(
        new Error(
          "Você não pode editar esta avaliação (prazo de 24h expirado)",
        ),
        { statusCode: 403, code: "AUTH_FORBIDDEN" },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.decision) updateData.decision = data.decision;
    if (data.justification) updateData.justification = data.justification;
    if (data.pointsImprovement !== undefined)
      updateData.pointsImprovement = data.pointsImprovement;

    if (data.ratings) {
      updateData.average = calculateWeightedAverage(
        data.ratings.map((r) => ({ rating: r.rating, weight: r.weight })),
      );
      // Remove e recria os ratings
      await prisma.evaluationRating.deleteMany({ where: { evaluationId: id } });
      updateData.ratings = { create: data.ratings };
    }

    return prisma.evaluation.update({
      where: { id },
      data: updateData,
      include: {
        employee: { select: { id: true, name: true } },
        evaluator: { select: { id: true, name: true } },
        ratings: true,
      },
    });
  }

  async delete(id: number, userId: number, userRole: string) {
    const evaluation = await this.findById(id);

    const hoursSinceCreation =
      (Date.now() - evaluation.createdAt.getTime()) / 3600000;
    const isCreator = evaluation.evaluatorId === userId;
    const isAdmin = userRole === "ADMIN";

    if (!isAdmin && !(isCreator && hoursSinceCreation <= 24)) {
      throw Object.assign(new Error("Você não pode excluir esta avaliação"), {
        statusCode: 403,
        code: "AUTH_FORBIDDEN",
      });
    }

    await prisma.evaluation.delete({ where: { id } });
  }
}
