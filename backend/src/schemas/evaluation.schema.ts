import { z } from 'zod';

const ratingSchema = z.object({
  criterionId: z.string().min(1).max(50),
  criterionName: z.string().min(1).max(200),
  category: z.string().min(1).max(200),
  weight: z.number().min(0).max(100),
  rating: z.number().min(0).max(10),
});

export const createEvaluationSchema = z.object({
  employeeId: z.number().int().positive('ID do colaborador inválido'),
  type: z.enum(['GESTORES', 'OPERACIONAIS']),
  decision: z.enum(['MANTER', 'DESLIGAR', 'EM_EVOLUCAO'], {
    errorMap: () => ({ message: 'Decisão deve ser MANTER, DESLIGAR ou EM_EVOLUCAO' }),
  }),
  justification: z.string().min(20, 'Justificativa deve ter no mínimo 20 caracteres').max(5000),
  pointsImprovement: z.string().max(5000).optional().nullable(),
  ratings: z.array(ratingSchema).min(1, 'Pelo menos um critério deve ser avaliado'),
});

export const updateEvaluationSchema = createEvaluationSchema.partial().omit({ employeeId: true, type: true });

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
