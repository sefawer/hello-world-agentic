import axios from 'axios';
import type { Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const messageApi = {
  // Yeni mesaj gönder
  sendMessage: async (content: string = 'Hello World') => {
    const response = await api.post<Message>('/api/messages', { content });
    return response.data;
  },

  // Son mesajları getir
  getMessages: async (limit: number = 10) => {
    const response = await api.get<Message[]>(`/api/messages?limit=${limit}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  }
};