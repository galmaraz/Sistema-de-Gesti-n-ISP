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
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className="text-gray-500">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
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
      console.log("🔄 Cargando datos del dashboard...");
      
      const [statsData, alertsData] = await Promise.all([
        apiService.getDashboardStats(), // ✅ Método corregido
        apiService.getAlerts(),
      ]);
      
      console.log("✅ Datos cargados:", { stats: statsData, alerts: alertsData });
      
      setStats(statsData);
      // Mostrar solo alertas no leídas (máximo 5)
      setAlerts(alertsData.filter(a => !a.read).slice(0, 5));
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Datos mock para el gráfico de tráfico (hardcodeado como solicitaste)
  const trafficData = [
    { time: '00:00', download: 45, upload: 20 },
    { time: '04:00', download: 30, upload: 15 },
    { time: '08:00', download: 85, upload: 40 },
    { time: '12:00', download: 120, upload: 60 },
    { time: '16:00', download: 95, upload: 45 },
    { time: '20:00', download: 140, upload: 70 },
    { time: '23:59', download: 100, upload: 50 },
  ];

  // Datos para el gráfico de estado de clientes (dinámicos)
  const clientStatusData = stats
    ? [
        { name: 'Activos', value: stats.activeClients, color: '#10b981' },
        { name: 'Suspendidos', value: stats.suspendedClients, color: '#f59e0b' },
        { name: 'Inactivos', value: stats.inactiveClients, color: '#ef4444' },
      ].filter(item => item.value > 0) // Solo mostrar categorías con valores > 0
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

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  // Función para formatear números grandes
  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES');
  };

  // Calcular porcentaje para mostrar en descripciones
  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return '0%';
    return `${((part / total) * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudieron cargar los datos del dashboard
          </AlertDescription>
        </Alert>
        <Button 
          onClick={loadData}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema ISP</p>
      </div>

      {/* Grid de Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clientes"
          value={formatNumber(stats.totalClients)}
          description={`${formatNumber(stats.activeClients)} activos, ${formatNumber(stats.suspendedClients)} suspendidos`}
          icon={<Users className="w-5 h-5" />}
          trend="+12% este mes"
        />

        <StatCard
          title="Clientes Activos"
          value={formatNumber(stats.activeClients)}
          description={`${calculatePercentage(stats.activeClients, stats.totalClients)} del total`}
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
          value={`Bs ${formatNumber(stats.monthlyRevenue)}`}
          description={`De ${formatNumber(stats.activeContracts)} contratos activos`}
          icon={<DollarSign className="w-5 h-5" />}
          trend="+8% vs mes anterior"
        />
      </div>

      {/* Fila de Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Tráfico de Red */}
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

        {/* Gráfico de Estado de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Clientes</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            {clientStatusData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos de clientes disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
          <CardDescription>Últimas notificaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay alertas pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                  <div className="flex items-start">
                    {getAlertIcon(alert.type)}
                    <AlertDescription className="flex-1 ml-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          {alert.routerName && (
                            <p className="text-sm mt-1 opacity-80">
                              Router: {alert.routerName}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-4 whitespace-nowrap">
                          {new Date(alert.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contratos Totales</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalContracts)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(stats.activeContracts)} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Routers Activos</CardTitle>
            <Wifi className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onlineRouters}</div>
            <p className="text-xs text-gray-500 mt-1">Funcionando correctamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Problemas Detectados</CardTitle>
            <WifiOff className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.offlineRouters}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Agregar el botón de reintento si no está importado
import { Button } from '../../components/ui/button';