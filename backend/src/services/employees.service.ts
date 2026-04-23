import prisma from '../config/database';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../schemas/employee.schema';
import { parsePagination } from '../types';

const EVALUATOR_FIELDS = [
  'avaliador01', 'avaliador02', 'avaliador03', 'avaliador04',
  'avaliador05', 'avaliador06', 'avaliador07', 'avaliador08',
] as const;

function buildEvaluatorFilter(username: string) {
  return EVALUATOR_FIELDS.map((field) => ({ [field]: username }));
}

function normalizeAvaliadores<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const field of EVALUATOR_FIELDS) {
    if (typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field] = (result[field] as string).toLowerCase();
    }
  }
  return result;
}

export class EmployeesService {
  async findAll(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const type = query.type as string | undefined;
    const department = query.department as string | undefined;
    const search = query.search as string | undefined;
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : true;
    const evaluatorUsername = query.evaluatorUsername as string | undefined;

    const where: Record<string, unknown> = {
      isActive,
      ...(type ? { type } : {}),
      ...(department ? { department } : {}),
      ...(search ? { name: { contains: search } } : {}),
      ...(evaluatorUsername ? { OR: buildEvaluatorFilter(evaluatorUsername) } : {}),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          department: true,
          type: true,
          isActive: true,
          hireDate: true,
          managerId: true,
          branchId: true,
          branch: { select: { id: true, name: true, code: true } },
          seniorId: true,
          avaliador01: true,
          avaliador02: true,
          avaliador03: true,
          avaliador04: true,
          avaliador05: true,
          avaliador06: true,
          avaliador07: true,
          avaliador08: true,
          _count: { select: { evaluations: true } },
          evaluations: {
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);

    const mapped = employees.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      position: e.position,
      department: e.department,
      type: e.type,
      isActive: e.isActive,
      hireDate: e.hireDate,
      managerId: e.managerId,
      branchId: e.branchId,
      branch: e.branch,
      seniorId: e.seniorId,
      avaliador01: e.avaliador01,
      avaliador02: e.avaliador02,
      avaliador03: e.avaliador03,
      avaliador04: e.avaliador04,
      avaliador05: e.avaliador05,
      avaliador06: e.avaliador06,
      avaliador07: e.avaliador07,
      avaliador08: e.avaliador08,
      evaluationsCount: e._count.evaluations,
      lastEvaluationDate: e.evaluations[0]?.createdAt ?? null,
    }));

    return {
      employees: mapped,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        evaluations: {
          select: {
            id: true,
            average: true,
            decision: true,
            createdAt: true,
            evaluator: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw Object.assign(new Error('Colaborador não encontrado'), {
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
      });
    }

    return {
      ...employee,
      evaluations: employee.evaluations.map((ev) => ({
        id: ev.id,
        average: ev.average,
        decision: ev.decision,
        createdAt: ev.createdAt,
        evaluatorName: ev.evaluator.name,
      })),
    };
  }

  async create(data: CreateEmployeeInput) {
    if (data.email) {
      const existing = await prisma.employee.findUnique({ where: { email: data.email } });
      if (existing) {
        throw Object.assign(new Error('Já existe um colaborador com esse email'), {
          statusCode: 409,
          code: 'DUPLICATE_ENTRY',
        });
      }
    }

    return prisma.employee.create({ data: normalizeAvaliadores(data) });
  }

  async update(id: number, data: UpdateEmployeeInput) {
    await this.findById(id);

    if (data.email) {
      const existing = await prisma.employee.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        throw Object.assign(new Error('Email já está em uso por outro colaborador'), {
          statusCode: 409,
          code: 'DUPLICATE_ENTRY',
        });
      }
    }

    return prisma.employee.update({ where: { id }, data: normalizeAvaliadores(data) });
  }

  async deactivate(id: number) {
    await this.findById(id);
    return prisma.employee.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }

  async findPending(type?: string, evaluatorUsername?: string) {
    const where: Record<string, unknown> = {
      isActive: true,
      ...(type ? { type } : {}),
      evaluations: { none: {} },
      ...(evaluatorUsername ? { OR: buildEvaluatorFilter(evaluatorUsername) } : {}),
    };

    return prisma.employee.findMany({
      where,
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        type: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
