// Core types for ISP Management System

export type UserRole = 'admin' | 'technician' | 'support';

 export interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: Date;
}

export interface Client {
  _id?: string;
  id?: string;
  name: string;
  ci: string;
  direccion: string;
  telefono: string;
  email: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  fechaRegistro?: Date;
}

 export interface ApiClient {
  _id?: string;
  id?: string;
  name?: string;
  nombre?: string;
  ci?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  status?: 'activo' | 'inactivo' | 'suspendido';
  fechaRegistro?: string;
}


export interface Plan {
  id: string;
  _id?: string; 
  name: string;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  price: number;
  pppoeProfile: string; // Profile name in MikroTik
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface Contract {
  id: string;
  clientId?: string;
  planId?: string;
  routerId?: string;
  usuarioPPPoE: string;
  contrasenaPPPoE: string;
  estado: 'active' | 'suspended' | 'cancelled'; 
  fechaInicio: Date; 
  fechaFin?: Date; 
  monthlyFee: number;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  plan?: Plan;
  router?: Router;
}


export interface CreateContractDTO {
  clientId: string;
  planId: string;
  routerId: string;
  fechaInicio: Date;
  estado: 'active' | 'suspended' | 'cancelled';
  monthlyFee: number;
}



export interface Router {
  id: string;
  _id?: string;
  name: string;
  ip: string;
  port: number;
  username: string;
  password: string; // In real app, this would be encrypted
  location: string;
  status: 'online' | 'offline' | 'error';
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouterStats {
  routerId: string;
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
  activeClients: number;
  txBytes: number;
  rxBytes: number;
  timestamp: Date;
}

export interface ActiveConnection {
  id: string;
  pppoeUsername: string;
  clientName: string;
  ipAddress: string;
  rxBytes: number;
  txBytes: number;
  connectedTime: string;
  routerName: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  inactiveClients: number;
  totalRouters: number;
  onlineRouters: number;
  offlineRouters: number;
  monthlyRevenue: number;
  totalContracts: number;
  activeContracts: number;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  routerName?: string;
  timestamp: Date;
  read: boolean;
}
