import { api } from '../lib/api';

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  type?: string;
  department?: string;
  search?: string;
}

export interface CreateEmployeeData {
  name: string;
  position: string;
  department: string;
  type: string;
  managerId?: number;
  branchId?: number;
  seniorId?: string;
  avaliador01?: string;
  avaliador02?: string;
  avaliador03?: string;
  avaliador04?: string;
  avaliador05?: string;
  avaliador06?: string;
  avaliador07?: string;
  avaliador08?: string;
}

export const employeeService = {
  async getAll(filters?: EmployeeFilters) {
    const params = filters?.type
      ? { ...filters, type: filters.type.toUpperCase() }
      : filters;
    const response = await api.get('/employees', { params });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  async create(data: CreateEmployeeData) {
    const response = await api.post('/employees', {
      ...data,
      type: data.type.toUpperCase(),
    });
    return response.data.data;
  },

  async update(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/employees/${id}`, {
      ...data,
      ...(data.type ? { type: String(data.type).toUpperCase() } : {}),
    });
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};
