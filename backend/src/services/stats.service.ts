import prisma from '../config/database';
import { getClassification } from '../utils/calculations';

export class StatsService {
  async getDashboard() {
    const [
      totalEmployees,
      totalEvaluations,
      byDecision,
      gestores,
      operacionais,
      avgScoreResult,
    ] = await Promise.all([
      prisma.employee.count({ where: { isActive: true } }),
      prisma.evaluation.count(),
      prisma.evaluation.groupBy({ by: ['decision'], _count: true }),
      prisma.employee.aggregate({
        where: { type: 'GESTORES', isActive: true },
        _count: true,
      }),
      prisma.employee.aggregate({
        where: { type: 'OPERACIONAIS', isActive: true },
        _count: true,
      }),
      prisma.evaluation.aggregate({ _avg: { average: true } }),
    ]);

    const [evaluatedGestores, evaluatedOperacionais, avgGestores, avgOperacionais] =
      await Promise.all([
        prisma.evaluation.groupBy({
          by: ['employeeId'],
          where: { type: 'GESTORES' },
          _count: true,
        }).then((r) => r.length),
        prisma.evaluation.groupBy({
          by: ['employeeId'],
          where: { type: 'OPERACIONAIS' },
          _count: true,
        }).then((r) => r.length),
        prisma.evaluation.aggregate({
          where: { type: 'GESTORES' },
          _avg: { average: true },
        }),
        prisma.evaluation.aggregate({
          where: { type: 'OPERACIONAIS' },
          _avg: { average: true },
        }),
      ]);

    const decisionMap: Record<string, number> = { MANTER: 0, DESLIGAR: 0, EM_EVOLUCAO: 0 };
    byDecision.forEach((d) => { decisionMap[d.decision] = d._count; });

    const totalEvaluated = evaluatedGestores + evaluatedOperacionais;
    const pendingEvaluations = totalEmployees - totalEvaluated;

    return {
      totalEmployees,
      totalEvaluations,
      pendingEvaluations: Math.max(0, pendingEvaluations),
      byDecision: decisionMap,
      averageScore: parseFloat((avgScoreResult._avg.average ?? 0).toFixed(2)),
      byType: {
        GESTORES: {
          total: gestores._count,
          evaluated: evaluatedGestores,
          averageScore: parseFloat((avgGestores._avg.average ?? 0).toFixed(2)),
        },
        OPERACIONAIS: {
          total: operacionais._count,
          evaluated: evaluatedOperacionais,
          averageScore: parseFloat((avgOperacionais._avg.average ?? 0).toFixed(2)),
        },
      },
    };
  }

  async getEmployeeHistory(employeeId: number) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true, position: true, department: true },
    });

    if (!employee) {
      throw Object.assign(new Error('Colaborador não encontrado'), {
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
      });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { employeeId },
      select: {
        id: true,
        average: true,
        decision: true,
        createdAt: true,
        evaluator: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalEvaluations = evaluations.length;
    const averageScore =
      totalEvaluations > 0
        ? parseFloat(
            (evaluations.reduce((s, e) => s + e.average, 0) / totalEvaluations).toFixed(2)
          )
        : 0;

    let trend = 'STABLE';
    if (totalEvaluations >= 2) {
      const last = evaluations[totalEvaluations - 1].average;
      const prev = evaluations[totalEvaluations - 2].average;
      trend = last > prev ? 'IMPROVING' : last < prev ? 'DECLINING' : 'STABLE';
    }

    return {
      employee,
      summary: {
        totalEvaluations,
        averageScore,
        classification: getClassification(averageScore),
        trend,
        lastDecision: evaluations[totalEvaluations - 1]?.decision ?? null,
      },
      history: evaluations.map((ev) => ({
        id: ev.id,
        average: ev.average,
        classification: getClassification(ev.average),
        decision: ev.decision,
        evaluatorName: ev.evaluator.name,
        createdAt: ev.createdAt,
      })),
    };
  }
}
