import api from './api';
import { Client } from '../types';

export const clientService = {
  // Get all clients
  getClients: async (page: number = 1, limit: number = 10): Promise<{ clients: Client[], total: number, pages: number }> => {
    const { data } = await api.get(`/clients?page=${page}&limit=${limit}`);
    return data;
  },

  // Get client by ID
  getClientById: async (id: string): Promise<Client> => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },

  // Create new client
  createClient: async (clientData: Omit<Client, '_id'>): Promise<Client> => {
    const { data } = await api.post('/clients', clientData);
    return data;
  },

  // Update client
  updateClient: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data;
  },

  // Delete client
  deleteClient: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  // Get client statistics
  getClientStats: async (): Promise<any> => {
    const { data } = await api.get('/clients/stats');
    return data;
  }
};
