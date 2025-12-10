import api from '../api/client';

const API = '/cash-registers';

export const cashRegistersService = {
  async list(params: Record<string, any> = {}) {
    const { data } = await api.get(API, { params });
    return data;
  },

  async get(id: string) {
    const { data } = await api.get(`${API}/${id}`);
    return data;
  },

  async create(payload: Record<string, any>) {
    const { data } = await api.post(API, payload);
    return data;
  },

  async update(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`${API}/${id}`, payload);
    return data;
  },

  async deactivate(id: string) {
    const { data } = await api.patch(`${API}/${id}/deactivate`);
    return data;
  },

  async getAllSessions() {
    const { data } = await api.get(`${API}/sessions/all`);
    return data;
  },

  async getActiveSession(id: string) {
    const { data } = await api.get(`${API}/${id}/active-session`);
    return data;
  },
};

export default cashRegistersService;
