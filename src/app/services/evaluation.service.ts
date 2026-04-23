import { api } from '../lib/api';

export interface EvaluationRating {
  criterionId: string;
  criterionName: string;
  category: string;
  weight: number;
  rating: number;
}

export interface CreateEvaluationData {
  employeeId: number;
  type: 'GESTORES' | 'OPERACIONAIS';
  decision: 'MANTER' | 'DESLIGAR' | 'EM_EVOLUCAO';
  justification: string;
  ratings: EvaluationRating[];
}

export const evaluationService = {
  async getAll(filters?: {
    page?: number;
    limit?: number;
    employeeId?: string;
    type?: string;
    decision?: string;
  }) {
    const response = await api.get('/evaluations', {
      params: {
        ...filters,
        ...(filters?.type ? { type: filters.type.toUpperCase() } : {}),
        ...(filters?.decision ? { decision: filters.decision.toUpperCase() } : {}),
      },
    });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/evaluations/${id}`);
    return response.data.data;
  },

  async create(data: CreateEvaluationData) {
    const response = await api.post('/evaluations', data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/evaluations/${id}`);
    return response.data;
  },
};
