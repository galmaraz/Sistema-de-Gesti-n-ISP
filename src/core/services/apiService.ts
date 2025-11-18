import { http } from './httpClient';
import {
  Client,
  Plan,
  Router,
  RouterStats,
  ActiveConnection,
  DashboardStats,
  Alert,
  Contract,
  CreateContractDTO,
  ApiClient
  
} from '../models/types';

import {
  MOCK_ACTIVE_CONNECTIONS,
  generateRouterStats,
} from './mockData';


const delay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

export class ApiService {

  // ===== CLIENTES ============

async getClients(): Promise<Client[]> {
    try {
      const res = await http.get('/api/clientes');
      
      // Define el tipo explícitamente
      let clientsData: ApiClient[] = [];
      
      if (Array.isArray(res.data)) {
        clientsData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.data)) {
          clientsData = res.data.data;
        } else if (Array.isArray(res.data.clients)) {
          clientsData = res.data.clients;
        } else {
          clientsData = [res.data];
        }
      }

      return clientsData.map((c: ApiClient) => ({
        _id: String(c._id || c.id || ''),
        name: c.name || c.nombre || '',
        ci: c.ci || '',
        direccion: c.direccion || '',
        telefono: c.telefono || '',
        email: c.email || '',
        estado: c.estado || c.status || 'activo',
        fechaRegistro: c.fechaRegistro ? new Date(c.fechaRegistro) : undefined,
      }));
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return [];
    }
  }

  async getClientById(id: string): Promise<Client> {
    const { data } = await http.get(`/api/clientes/${id}`);
    
    return {
      _id: String(data._id || data.id || ''),
      name: data.name || data.nombre || '',
      ci: data.ci || '',
      direccion: data.direccion || '',
      telefono: data.telefono || '',
      email: data.email || '',
      estado: data.estado || data.status || 'activo',
      fechaRegistro: data.fechaRegistro ? new Date(data.fechaRegistro) : undefined,
    };
  }

  async createClient(data: Omit<Client, '_id' | 'fechaRegistro'>): Promise<Client> {
    const payload = {
      nombre: data.name,
      ci: data.ci,
      direccion: data.direccion,
      telefono: data.telefono,
      email: data.email,
      estado: data.estado || 'activo',
    };

    const { data: newClient } = await http.post('/api/clientes', payload);
    
    return {
      _id: String(newClient._id || newClient.id || ''),
      name: newClient.nombre || newClient.name || '',
      ci: newClient.ci || '',
      direccion: newClient.direccion || '',
      telefono: newClient.telefono || '',
      email: newClient.email || '',
      estado: newClient.estado || newClient.status || 'activo',
      fechaRegistro: newClient.fechaRegistro ? new Date(newClient.fechaRegistro) : undefined,
    };
  }

  async updateClient(_id: string | { _id: string }, data: Partial<Client>): Promise<Client> {
    const id = typeof _id === 'object' ? String(_id._id) : String(_id);
    
    const payload: any = { 
      ...data,
      nombre: data.name
    };
    
    if (data.estado) {
      payload.estado = data.estado;
    }
    
    delete payload.name;
    delete payload._id;
    delete payload.id;

    const { data: updatedClient } = await http.put(`/api/clientes/${id}`, payload);
    
    return {
      _id: String(updatedClient._id || updatedClient.id || ''),
      name: updatedClient.nombre || updatedClient.name || '',
      ci: updatedClient.ci || '',
      direccion: updatedClient.direccion || '',
      telefono: updatedClient.telefono || '',
      email: updatedClient.email || '',
      estado: updatedClient.estado || updatedClient.status || 'activo',
      fechaRegistro: updatedClient.fechaRegistro ? new Date(updatedClient.fechaRegistro) : undefined,
    };
  }

  async deleteClient(_id: string): Promise<void> {
    await http.delete(`/api/clientes/${_id}`);
  }

  // ============================
  // ===== PLANES ==============
  // ============================

  async getPlans(): Promise<Plan[]> {
    const { data } = await http.get('/api/planes');
    return data.map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
      downloadSpeed: p.downloadSpeed,
      uploadSpeed: p.uploadSpeed,
      price: p.price,
      pppoeProfile: p.pppoeProfile,
      description: p.description,
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    }));
  }

  async getPlanById(id: string): Promise<Plan> {
    const { data } = await http.get(`/api/planes/${id}`);
    return data;
  }

  async createPlan(
    data: Omit<Plan, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Plan> {
    const { data: newPlan } = await http.post('/api/planes', data);
    return newPlan;
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    const { data: updatedPlan } = await http.put(`/api/planes/${id}`, data);
    return updatedPlan;
  }

  async deletePlan(id: string): Promise<void> {
    await http.delete(`/api/planes/${id}`);
  }


  // ===== CONTRATOS ===========
// En apiService.ts - ACTUALIZA getContracts temporalmente
async getContracts(): Promise<Contract[]> {
  try {
    console.log("📡 Haciendo petición a /api/contratos");
    const res = await http.get('/api/contratos');
    
    const contractsData = res.data?.data || res.data || [];
    console.log("📦 Contratos RAW:", contractsData);

    // ✅ Cargar datos adicionales para poblar
    const [clients, plans, routers] = await Promise.all([
      this.getClients(),
      this.getPlans(),
      this.getRouters()
    ]);

    console.log("📦 Clientes disponibles:", clients.map(c => ({ _id: c._id, name: c.name })));
    console.log("📦 Planes disponibles:", plans.map(p => ({ id: p.id, name: p.name })));
    console.log("📦 Routers disponibles:", routers.map(r => ({ id: r.id, name: r.name })));

    const normalized = contractsData.map((c: any) => 
      this.normalizeContract(c, clients, plans, routers)
    );
    
    return normalized;
  } catch (error) {
    console.error('❌ Error en getContracts:', error);
    return [];
  }
}

// En apiService.ts - ACTUALIZA la función normalizeContract

  normalizeContract(c: any, clients: Client[] = [], plans: Plan[] = [], routers: Router[] = []): Contract {
    console.log("🔄 Normalizando contrato:", c);
    
    const clientId = c.clientId || c.client?._id || c.client?.id;
    const planId = c.planId || c.plan?._id || c.plan?.id;
    const routerId = c.routerId || c.router?._id || c.router?.id;

    // ✅ BUSCAR objetos - método más robusto
    const client = clients.find(client => 
      client._id === clientId || client.id === clientId
    );
    
    const plan = plans.find(plan => 
      plan.id === planId || (plan as any)._id === planId
    );
    
    const router = routers.find(router => 
      router.id === routerId || (router as any)._id === routerId
    );

    // ✅ Crear objeto seguro que no cambie entre renders
    const safeContract: Contract = {
      id: c.id || c._id || '',
      clientId: clientId || '',
      planId: planId || '',
      routerId: routerId || '',
      
      usuarioPPPoE: c.usuarioPPPoE || c.pppoeUsername || '',
      contrasenaPPPoE: c.contrasenaPPPoE || c.pppoePassword || '',
      
      estado: c.estado || 'active',
      
      fechaInicio: c.fechaInicio ? new Date(c.fechaInicio) : 
                  (c.startDate ? new Date(c.startDate) : new Date()),
      
      fechaFin: c.fechaFin ? new Date(c.fechaFin) : 
              (c.endDate ? new Date(c.endDate) : undefined),
      
      monthlyFee: c.monthlyFee || 0,

      // ✅ Usar los objetos encontrados o mantener los que vienen de la API
      client: client || c.client || undefined,
      plan: plan || c.plan || undefined,
      router: router || c.router || undefined,

      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    };

    console.log("✅ Contrato normalizado:", {
      id: safeContract.id,
      client: safeContract.client?.name,
      plan: safeContract.plan?.name,
      router: safeContract.router?.name
    });

    return safeContract;
  }

  async createContract(data: CreateContractDTO): Promise<Contract> {
    try {
      console.log('📤 Enviando datos para crear contrato:', data);
      
      // ✅ Asegurar que los nombres coincidan con lo que espera el backend
      const payload = {
        clientId: data.clientId,
        planId: data.planId, 
        routerId: data.routerId,
        fechaInicio: data.fechaInicio,
        estado: data.estado,
        monthlyFee: data.monthlyFee // ✅ AGREGAR ESTE CAMPO
      };
      
      console.log('📤 Payload completo:', payload);
      
      const response = await http.post('/api/contratos', payload);
      console.log('✅ Respuesta creación contrato:', response);
      
      return this.normalizeContract(response.data);
    } catch (error) {
      console.error('❌ Error creando contrato:', error);
      throw error;
    }
  }

  async suspendContract(contractId: string): Promise<void> {
    try {
      console.log(`⏸️ Suspendiendo contrato: ${contractId}`);
      await http.post(`/api/contratos/${contractId}/suspender`);
      console.log('✅ Contrato suspendido exitosamente');
    } catch (error) {
      console.error('❌ Error suspendiendo contrato:', error);
      throw error;
    }
  }

  async reactivateContract(contractId: string): Promise<void> {
    try {
      console.log(`▶️ Reactivando contrato: ${contractId}`);
      await http.post(`/api/contratos/${contractId}/reactivar`);
      console.log('✅ Contrato reactivado exitosamente');
    } catch (error) {
      console.error('❌ Error reactivando contrato:', error);
      throw error;
    }
  }

  async changePlan(contractId: string, newPlanId: string): Promise<void> {
    try {
      console.log(`🔄 Cambiando plan del contrato: ${contractId} -> ${newPlanId}`);
      await http.post(`/api/contratos/${contractId}/cambiar-plan`, {
        planId: newPlanId,
      });
      console.log('✅ Plan cambiado exitosamente');
    } catch (error) {
      console.error('❌ Error cambiando plan:', error);
      throw error;
    }
  }

  // Si necesitas también estos métodos adicionales:
  async getContractById(id: string): Promise<Contract> {
    try {
      const { data } = await http.get(`/api/contratos/${id}`);
      return this.normalizeContract(data);
    } catch (error) {
      console.error('❌ Error obteniendo contrato por ID:', error);
      throw error;
    }
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    try {
      const { data: updatedContract } = await http.put(`/api/contratos/${id}`, data);
      return this.normalizeContract(updatedContract);
    } catch (error) {
      console.error('❌ Error actualizando contrato:', error);
      throw error;
    }
  }

  async deleteContract(id: string): Promise<void> {
    try {
      await http.delete(`/api/contratos/${id}`);
      console.log('✅ Contrato eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando contrato:', error);
      throw error;
    }
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
  // ===== ROUTERS (API) =======
  // ============================

  async getRouters(): Promise<Router[]> {
    const { data } = await http.get('/api/routers');
    return data.map((r: any) => ({
      id: r._id || r.id, 
      name: r.name,
      ip: r.ip,
      port: r.port,
      username: r.username,
      password: r.password,
      location: r.location,
      status: r.status,
      lastSeen: r.lastSeen ? new Date(r.lastSeen) : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
    }));
  }

  async getRouterById(id: string): Promise<Router | null> {
    try {
      const { data } = await http.get(`/api/routers/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async createRouter(
    data: Omit<Router, 'id' | 'createdAt' | 'updatedAt' | 'lastSeen' | 'status'>
  ): Promise<Router> {
    const { data: newRouter } = await http.post('/api/routers', data);
    return newRouter;
  }

  async updateRouter(
    id: string,
    data: Partial<Omit<Router, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Router> {
    const { data: updatedRouter } = await http.put(`/api/routers/${id}`, data);
    return updatedRouter;
  }

  async deleteRouter(id: string): Promise<void> {
    await http.delete(`/api/routers/${id}`);
  }

  async getRouterStats(routerId: string): Promise<RouterStats> {
    return generateRouterStats(routerId);
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

  // ============================
  // ===== TEST ROUTER =========
  // ============================

  async testRouterConnection(id: string): Promise<boolean> {
    const response = await http.post(`/servers/test/${id}`);
    return response.data.success;
  }

// ============================
// ===== DASHBOARD ============
// ============================

async getDashboardStats(): Promise<DashboardStats> {
  try {
    const { data } = await http.get('/api/dashboard/stats');
    
    console.log("📊 Datos del dashboard recibidos:", data);

    const stats: DashboardStats = {
      totalClients: data.totalClients || 0,
      activeClients: data.activeClients || 0,
      suspendedClients: data.suspendedClients || 0,
      inactiveClients: data.inactiveClients || 0,
      totalRouters: data.totalRouters || 0,
      onlineRouters: data.onlineRouters || 0,
      offlineRouters: data.offlineRouters || 0,
      totalContracts: data.totalContracts || 0,
      activeContracts: data.activeContracts || 0,
      monthlyRevenue: data.monthlyRevenue || 0,
    };

    console.log("📊 Stats procesados:", stats);
    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del dashboard:', error);
    // Datos por defecto
    return {
      totalClients: 0,
      activeClients: 0,
      suspendedClients: 0,
      inactiveClients: 0,
      totalRouters: 0,
      onlineRouters: 0,
      offlineRouters: 0,
      totalContracts: 0,
      activeContracts: 0,
      monthlyRevenue: 0,
    };
  }
}

// ============================
// ===== ALERTAS ==============
// ============================

  async getAlerts(): Promise<Alert[]> {
    try {
      const { data } = await http.get('/api/alerts');
      console.log("🔔 Alertas recibidas:", data);
      
      // Aseguramos que timestamps sean Date
      return data.map((a: any) => ({
        ...a,
        timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
      }));
    } catch (error) {
      console.error('❌ Error obteniendo alertas:', error);
      return [];
    }
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'read'>): Promise<Alert> {
    try {
      const { data } = await http.post('/api/alerts', alert);
      return {
        ...data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      };
    } catch (error) {
      console.error('❌ Error creando alerta:', error);
      throw error;
    }
  }

}

export const apiService = new ApiService();
