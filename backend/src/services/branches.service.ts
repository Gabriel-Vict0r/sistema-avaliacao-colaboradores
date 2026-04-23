import prisma from '../config/database';
import { CreateBranchInput, UpdateBranchInput } from '../schemas/branch.schema';

export class BranchesService {
  async findAll() {
    return prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    const branch = await prisma.branch.findUnique({
      where: { id },
      select: { id: true, name: true, code: true, isActive: true, createdAt: true, updatedAt: true },
    });

    if (!branch) {
      throw Object.assign(new Error('Filial não encontrada'), {
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
      });
    }

    return branch;
  }

  async create(data: CreateBranchInput) {
    const existing = await prisma.branch.findUnique({ where: { code: data.code } });
    if (existing) {
      throw Object.assign(new Error('Já existe uma filial com esse código'), {
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
      });
    }

    return prisma.branch.create({
      data,
      select: { id: true, name: true, code: true, isActive: true, createdAt: true },
    });
  }

  async update(id: number, data: UpdateBranchInput) {
    await this.findById(id);

    if (data.code) {
      const existing = await prisma.branch.findFirst({
        where: { code: data.code, NOT: { id } },
      });
      if (existing) {
        throw Object.assign(new Error('Código já está em uso por outra filial'), {
          statusCode: 409,
          code: 'DUPLICATE_ENTRY',
        });
      }
    }

    return prisma.branch.update({
      where: { id },
      data,
      select: { id: true, name: true, code: true, isActive: true, updatedAt: true },
    });
  }

  async deactivate(id: number) {
    await this.findById(id);
    return prisma.branch.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }
}
