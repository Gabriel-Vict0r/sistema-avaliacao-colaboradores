import { api } from '../lib/api';

export interface Branch {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
}

export const branchService = {
  async getAll() {
    const response = await api.get('/branches');
    return response.data.data.branches as Branch[];
  },

  async create(data: { name: string; code: string }) {
    const response = await api.post('/branches', data);
    return response.data.data as Branch;
  },

  async update(id: number, data: { name?: string; code?: string }) {
    const response = await api.put(`/branches/${id}`, data);
    return response.data.data as Branch;
  },

  async deactivate(id: number) {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};
