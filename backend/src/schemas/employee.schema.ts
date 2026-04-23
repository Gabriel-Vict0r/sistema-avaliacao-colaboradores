import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  email: z.string().email('Email inválido').optional().nullable(),
  position: z.string().min(2, 'Cargo é obrigatório').max(200),
  department: z.string().min(2, 'Departamento é obrigatório').max(200),
  type: z.enum(['GESTORES', 'OPERACIONAIS'], {
    errorMap: () => ({ message: 'Tipo deve ser GESTORES ou OPERACIONAIS' }),
  }),
  managerId: z.number().int().positive('ID do gestor inválido').optional().nullable(),
  branchId: z.number().int().positive('ID da filial inválido').optional().nullable(),
  seniorId: z.string().max(50).optional().nullable(),
  hireDate: z.string().datetime({ offset: true }).optional().nullable(),
  avaliador01: z.string().max(100).optional().nullable(),
  avaliador02: z.string().max(100).optional().nullable(),
  avaliador03: z.string().max(100).optional().nullable(),
  avaliador04: z.string().max(100).optional().nullable(),
  avaliador05: z.string().max(100).optional().nullable(),
  avaliador06: z.string().max(100).optional().nullable(),
  avaliador07: z.string().max(100).optional().nullable(),
  avaliador08: z.string().max(100).optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
