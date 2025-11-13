import React, { useEffect, useState } from 'react';
import { apiService } from '../../core/services/apiService';
import { ActiveConnection } from '../../core/models/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Activity, RefreshCw, User, Wifi, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export const MonitoringPage: React.FC = () => {
  const [connections, setConnections] = useState<ActiveConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadConnections();
    
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadConnections();
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadConnections = async () => {
    try {
      const data = await apiService.getActiveConnections();
      setConnections(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalTraffic = () => {
    const totalRx = connections.reduce((sum, conn) => sum + conn.rxBytes, 0);
    const totalTx = connections.reduce((sum, conn) => sum + conn.txBytes, 0);
    return { totalRx, totalTx };
  };

  const { totalRx, totalTx } = getTotalTraffic();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Monitoreo en Tiempo Real</h1>
          <p className="text-gray-500">Conexiones PPPoE activas y tráfico de red</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoRefresh ? 'default' : 'outline'} className="h-9 px-3">
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Auto-actualización activa' : 'Pausado'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pausar' : 'Reanudar'}
          </Button>
          <Button onClick={loadConnections} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Conexiones Activas</CardTitle>
            <Wifi className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{connections.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Tráfico de Subida Total</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{formatBytes(totalTx)}</div>
            <p className="text-xs text-gray-500 mt-1">Datos enviados por todos los clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Tráfico de Descarga Total</CardTitle>
            <TrendingDown className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{formatBytes(totalRx)}</div>
            <p className="text-xs text-gray-500 mt-1">Datos recibidos por todos los clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conexiones Activas</CardTitle>
          <CardDescription>
            Estado actual de las sesiones PPPoE en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Usuario PPPoE</TableHead>
                <TableHead>IP Asignada</TableHead>
                <TableHead>Router</TableHead>
                <TableHead>Tiempo Conectado</TableHead>
                <TableHead className="text-right">Descarga (RX)</TableHead>
                <TableHead className="text-right">Subida (TX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Cargando conexiones activas...
                  </TableCell>
                </TableRow>
              ) : connections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Wifi className="w-12 h-12 mb-3 opacity-50" />
                      <p>No hay conexiones activas en este momento</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                connections.map(connection => (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-900">{connection.clientName}</p>
                          <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                            <Activity className="w-3 h-3 mr-1" />
                            Online
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-900">
                        {connection.pppoeUsername}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-blue-50 rounded text-sm text-blue-900">
                        {connection.ipAddress}
                      </code>
                    </TableCell>
                    <TableCell className="text-gray-600">{connection.routerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {connection.connectedTime}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-blue-600">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        {formatBytes(connection.rxBytes)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {formatBytes(connection.txBytes)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Activity className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>Monitoreo en tiempo real:</strong> Los datos se actualizan automáticamente cada 10 segundos.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Las conexiones muestran el tráfico acumulado desde el inicio de sesión</li>
                <li>El tiempo conectado se calcula desde el establecimiento de la sesión PPPoE</li>
                <li>Los datos provienen directamente de la API de los routers MikroTik</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
