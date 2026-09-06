import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('shikayat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    },
    register: async (data: { name: string; email: string; password: string; ward?: string }) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },
    me: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
  },
  complaints: {
    list: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      priority?: string;
      ward?: string;
      search?: string;
      my_only?: boolean;
    }) => {
      const res = await apiClient.get('/complaints', { params });
      return res.data;
    },
    get: async (idOrCode: string | number) => {
      const res = await apiClient.get(`/complaints/${idOrCode}`);
      return res.data;
    },
    create: async (data: { complaint_text: string; ward: string; category?: string }) => {
      const res = await apiClient.post('/complaints', data);
      return res.data;
    },
    updateStatus: async (
      idOrCode: string | number,
      data: {
        status: string;
        action_taken?: string;
        assigned_officer?: string;
        resolution_time_days?: number;
        citizen_rating?: number;
      }
    ) => {
      const res = await apiClient.patch(`/complaints/${idOrCode}/status`, data);
      return res.data;
    },
  },
  ml: {
    classify: async (complaint_text: string, ward?: string) => {
      const res = await apiClient.post('/ml/classify', { complaint_text, ward });
      return res.data;
    },
    metrics: async () => {
      const res = await apiClient.get('/ml/metrics');
      return res.data;
    },
    retrain: async () => {
      const res = await apiClient.post('/ml/retrain');
      return res.data;
    },
  },
  analytics: {
    overview: async () => {
      const res = await apiClient.get('/analytics/overview');
      return res.data;
    },
    dashboard: async () => {
      const res = await apiClient.get('/analytics/dashboard');
      return res.data;
    },
    categories: async () => {
      const res = await apiClient.get('/analytics/categories');
      return res.data;
    },
    priorities: async () => {
      const res = await apiClient.get('/analytics/priorities');
      return res.data;
    },
  },
};
