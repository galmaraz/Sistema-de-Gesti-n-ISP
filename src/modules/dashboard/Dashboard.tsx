import React, { useEffect, useState } from 'react';
import { apiService } from '../../core/services/apiService';
import { DashboardStats, Alert as AlertType } from '../../core/models/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Users,
  UserCheck,
  UserX,
  Router,
  Wifi,
  WifiOff,
  DollarSign,
  FileText,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}> = ({ title, value, description, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
      <div className="text-gray-500">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      {trend && (
        <div className="flex items-center mt-2 text-xs text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, alertsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getAlerts(),
      ]);
      setStats(statsData);
      setAlerts(alertsData.filter(a => !a.read).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock traffic data for chart
  const trafficData = [
    { time: '00:00', download: 45, upload: 20 },
    { time: '04:00', download: 30, upload: 15 },
    { time: '08:00', download: 85, upload: 40 },
    { time: '12:00', download: 120, upload: 60 },
    { time: '16:00', download: 95, upload: 45 },
    { time: '20:00', download: 140, upload: 70 },
    { time: '23:59', download: 100, upload: 50 },
  ];

  const clientStatusData = stats
    ? [
        { name: 'Activos', value: stats.activeClients, color: '#10b981' },
        { name: 'Suspendidos', value: stats.suspendedClients, color: '#f59e0b' },
        { name: 'Inactivos', value: stats.inactiveClients, color: '#ef4444' },
      ]
    : [];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: string): 'default' | 'destructive' => {
    return type === 'error' ? 'destructive' : 'default';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Resumen general del sistema ISP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clientes"
          value={stats.totalClients}
          description={`${stats.activeClients} activos, ${stats.suspendedClients} suspendidos`}
          icon={<Users className="w-5 h-5" />}
          trend="+12% este mes"
        />

        <StatCard
          title="Clientes Activos"
          value={stats.activeClients}
          description={`${((stats.activeClients / stats.totalClients) * 100).toFixed(1)}% del total`}
          icon={<UserCheck className="w-5 h-5" />}
        />

        <StatCard
          title="Routers Online"
          value={`${stats.onlineRouters}/${stats.totalRouters}`}
          description={`${stats.offlineRouters} fuera de línea`}
          icon={<Router className="w-5 h-5" />}
        />

        <StatCard
          title="Ingresos Mensuales"
          value={`Bs ${stats.monthlyRevenue.toLocaleString()}`}
          description={`De ${stats.activeContracts} contratos activos`}
          icon={<DollarSign className="w-5 h-5" />}
          trend="+8% vs mes anterior"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tráfico de Red (Últimas 24h)</CardTitle>
            <CardDescription>Descarga y subida en Mbps</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="download"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="Descarga"
                />
                <Area
                  type="monotone"
                  dataKey="upload"
                  stackId="2"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  name="Subida"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Clientes</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
          <CardDescription>Últimas notificaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay alertas pendientes</p>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                  {getAlertIcon(alert.type)}
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p>{alert.message}</p>
                        {alert.routerName && (
                          <p className="text-xs mt-1 opacity-80">{alert.routerName}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {new Date(alert.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-gray-600">Contratos Totales</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{stats.totalContracts}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeContracts} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-gray-600">Routers Activos</CardTitle>
            <Wifi className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.onlineRouters}</div>
            <p className="text-xs text-gray-500 mt-1">Funcionando correctamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-gray-600">Problemas Detectados</CardTitle>
            <WifiOff className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.offlineRouters}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
