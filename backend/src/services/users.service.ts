import prisma from '../config/database';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { parsePagination } from '../types';

export class UsersService {
  async findAll(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const role = query.role as string | undefined;
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;

    const where = {
      ...(role ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          adUsername: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        adUsername: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('Usuário não encontrado'), {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ adUsername: data.adUsername }, { email: data.email }] },
    });

    if (existing) {
      throw Object.assign(new Error('Usuário com esse login ou email já existe'), {
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
      });
    }

    return prisma.user.create({
      data: { ...data, role: data.role ?? 'EVALUATOR' },
      select: {
        id: true,
        adUsername: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: number, data: UpdateUserInput) {
    await this.findById(id);

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        adUsername: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findById(id);
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }
}
