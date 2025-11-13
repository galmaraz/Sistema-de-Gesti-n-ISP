import { http } from './httpClient';
import {
  Client,
  Plan,
  Contract,
  Router,
  RouterStats,
  ActiveConnection,
  DashboardStats,
  Alert,
} from '../models/types';
import {
  MOCK_ROUTERS,
  MOCK_ACTIVE_CONNECTIONS,
  MOCK_ALERTS,
  generateRouterStats,
} from './mockData';

// 🕒 Simula un pequeño retraso (solo para las partes mock)
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));


export class ApiService {
  // ============================
  // ===== CLIENTES ============
  // ============================

  async getClients(): Promise<Client[]> {
    const res = await http.get('/api/clientes');
    return res.data.data.map((c: any) => ({
      id: c._id,
      nombre: c.nombre,
      ci: c.ci,
      direccion: c.direccion,
      telefono: c.telefono,
      email: c.email,
      estado: c.estado || 'activo',
      fechaRegistro: c.fechaRegistro ? new Date(c.fechaRegistro) : undefined,
    }));
  }


  async getClientById(id: string): Promise<Client> {
    const { data } = await http.get(`/api/clientes/${id}`);
    return data;
  }

  async createClient(data: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data: newClient } = await http.post('/api/clientes', data);
    return newClient;
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const { data: updatedClient } = await http.put(`/api/clientes/${id}`, data);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await http.delete(`/clients/${id}`);
  }

  // ============================
  // ===== PLANES ==============
  // ============================

  async getPlans(): Promise<Plan[]> {
    const { data } = await http.get('/api/plans');
    return data;
  }

  async getPlanById(id: string): Promise<Plan> {
    const { data } = await http.get(`/api/plans/${id}`);
    return data;
  }

  async createPlan(data: Omit<Plan, '_id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
    const { data: newPlan } = await http.post('/api/plans', data);
    return newPlan;
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    const { data: updatedPlan } = await http.put(`/api/plans/${id}`, data);
    return updatedPlan;
  }

  async deletePlan(id: string): Promise<void> {
    await http.delete(`/plans/${id}`);
  }

  // ============================
  // ===== CONTRATOS ===========
  // ============================

  async getContracts(): Promise<Contract[]> {
    const { data } = await http.get('/api/contracts');
    return data;
  }

  async getContractById(id: string): Promise<Contract> {
    const { data } = await http.get(`/api/contracts/${id}`);
    return data;
  }

  async createContract(data: Omit<Contract, '_id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const { data: newContract } = await http.post('/api/contracts', data);
    return newContract;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const { data: updatedContract } = await http.put(`/api/contracts/${id}`, data);
    return updatedContract;
  }

  async deleteContract(id: string): Promise<void> {
    await http.delete(`/api/contracts/${id}`);
  }

  // ============================
  // ===== SERVERS =============
  // ============================

  async getServers(): Promise<any[]> {
    const { data } = await http.get('/api/servers');
    return data;
  }

  async createServer(data: any): Promise<any> {
    const { data: newServer } = await http.post('/api/servers', data);
    return newServer;
  }

  // ============================
  // ===== MONITOR =============
  // ============================

  async getDashboardIndicators(): Promise<any> {
    const { data } = await http.get('/api/monitor/indicadores');
    return data;
  }

  // ============================
  // ===== ROUTERS (mock) ======
  // ============================

  private routers: Router[] = [...MOCK_ROUTERS];

  async getRouters(): Promise<Router[]> {
    await delay();
    return [...this.routers];
  }

  async getRouterById(id: string): Promise<Router | null> {
    await delay();
    return this.routers.find(r => r.id === id) || null;
  }

  async createRouter(data: Omit<Router, 'id' | 'createdAt' | 'updatedAt'>): Promise<Router> {
    await delay();
    const newRouter: Router = {
      ...data,
      id: `rtr${String(this.routers.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.routers.push(newRouter);
    return newRouter;
  }

  async updateRouter(id: string, data: Partial<Router>): Promise<Router> {
    await delay();
    const index = this.routers.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Router no encontrado');

    this.routers[index] = {
      ...this.routers[index],
      ...data,
      id,
      updatedAt: new Date(),
    };
    return this.routers[index];
  }

  async deleteRouter(id: string): Promise<void> {
    await delay();
    this.routers = this.routers.filter(r => r.id !== id);
  }

  async getRouterStats(routerId: string): Promise<RouterStats> {
    await delay();
    return generateRouterStats(routerId);
  }

  // ============================
  // ===== ALERTAS (mock) ======
  // ============================

  private alerts: Alert[] = [...MOCK_ALERTS];

  async getAlerts(): Promise<Alert[]> {
    await delay();
    return [...this.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async markAlertAsRead(id: string): Promise<void> {
    await delay();
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
    }
  }

  // ============================
  // ===== MONITOREO MOCK ======
  // ============================

  async getActiveConnections(): Promise<ActiveConnection[]> {
    await delay();
    return MOCK_ACTIVE_CONNECTIONS.map(conn => ({
      ...conn,
      rxBytes: conn.rxBytes + Math.floor(Math.random() * 1000000),
      txBytes: conn.txBytes + Math.floor(Math.random() * 500000),
    }));
  }

  // apiService.ts
  async testRouterConnection(id: string): Promise<boolean> {
    // Aquí llamas al backend real o simulas la respuesta
    const response = await http.post(`/servers/test/${id}`);
    return response.data.success;
  }

}

export const apiService = new ApiService();
