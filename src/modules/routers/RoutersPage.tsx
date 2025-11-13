import React, { useEffect, useState } from 'react';
import { apiService } from '../../core/services/apiService';
import { Router, RouterStats } from '../../core/models/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import {
  Plus,
  Edit,
  Trash2,
  Router as RouterIcon,
  Wifi,
  WifiOff,
  Activity,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export const RoutersPage: React.FC = () => {
  const [routers, setRouters] = useState<Router[]>([]);
  const [routerStats, setRouterStats] = useState<{ [key: string]: RouterStats }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRouter, setEditingRouter] = useState<Router | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: 8728,
    username: '',
    password: '',
    location: '',
    status: 'offline' as const,
  });

  useEffect(() => {
    loadRouters();
    const interval = setInterval(loadRouterStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const loadRouters = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getRouters();
      setRouters(data);
      loadRouterStats();
    } catch (error) {
      toast.error('Error al cargar routers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRouterStats = async () => {
    const stats: { [key: string]: RouterStats } = {};
    for (const router of routers) {
      if (router.status === 'online') {
        try {
          stats[router.id] = await apiService.getRouterStats(router.id);
        } catch (error) {
          console.error(`Error loading stats for ${router.id}`);
        }
      }
    }
    setRouterStats(stats);
  };

  const handleOpenDialog = (router?: Router) => {
    if (router) {
      setEditingRouter(router);
      setFormData({
        name: router.name,
        ip: router.ip,
        port: router.port,
        username: router.username,
        password: router.password,
        location: router.location,
        status: router.status,
      });
    } else {
      setEditingRouter(null);
      setFormData({
        name: '',
        ip: '',
        port: 8728,
        username: 'admin',
        password: '',
        location: '',
        status: 'offline',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingRouter) {
        await apiService.updateRouter(editingRouter.id, formData);
        toast.success('Router actualizado exitosamente');
      } else {
        await apiService.createRouter(formData);
        toast.success('Router creado exitosamente');
      }
      setDialogOpen(false);
      loadRouters();
    } catch (error) {
      toast.error('Error al guardar router');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este router?')) {
      try {
        await apiService.deleteRouter(id);
        toast.success('Router eliminado exitosamente');
        loadRouters();
      } catch (error) {
        toast.error('Error al eliminar router');
      }
    }
  };

  const handleTestConnection = async (router: Router) => {
    setTestingConnection(router.id);
    try {
      const success = await apiService.testRouterConnection(router.id);
      if (success) {
        toast.success(`Conexión exitosa con ${router.name}`);
        loadRouters();
      } else {
        toast.error(`No se pudo conectar con ${router.name}`);
      }
    } catch (error) {
      toast.error('Error al probar conexión');
    } finally {
      setTestingConnection(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: { label: 'Online', icon: Wifi, className: 'bg-green-100 text-green-800' },
      offline: { label: 'Offline', icon: WifiOff, className: 'bg-gray-100 text-gray-800' },
      error: { label: 'Error', icon: WifiOff, className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status as keyof typeof variants] || variants.offline;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Routers MikroTik</h1>
          <p className="text-gray-500">Gestiona y monitorea los routers de la red</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Router
        </Button>
      </div>

      {/* Routers Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <p className="text-gray-500 col-span-full text-center py-8">Cargando...</p>
        ) : routers.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">No hay routers registrados</p>
        ) : (
          routers.map(router => {
            const stats = routerStats[router.id];
            return (
              <Card key={router.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <RouterIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>{router.name}</CardTitle>
                        <CardDescription className="mt-1">{router.location}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(router.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Connection Info */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p className="text-gray-900">{router.ip}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Puerto</p>
                      <p className="text-gray-900">{router.port}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  {router.status === 'online' && stats && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Uso de CPU</span>
                          <span className="text-gray-900">{stats.cpuUsage}%</span>
                        </div>
                        <Progress value={stats.cpuUsage} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Uso de Memoria</span>
                          <span className="text-gray-900">{stats.memoryUsage}%</span>
                        </div>
                        <Progress value={stats.memoryUsage} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="flex items-center text-blue-600 mb-1">
                            <Users className="w-3 h-3 mr-1" />
                            <span className="text-xs">Clientes</span>
                          </div>
                          <p className="text-blue-900">{stats.activeClients}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <div className="flex items-center text-purple-600 mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-xs">Uptime</span>
                          </div>
                          <p className="text-purple-900">{stats.uptime}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-green-50 rounded">
                          <div className="flex items-center text-green-600 mb-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span className="text-xs">TX</span>
                          </div>
                          <p className="text-green-900 text-sm">{formatBytes(stats.txBytes)}</p>
                        </div>
                        <div className="p-2 bg-orange-50 rounded">
                          <div className="flex items-center text-orange-600 mb-1">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            <span className="text-xs">RX</span>
                          </div>
                          <p className="text-orange-900 text-sm">{formatBytes(stats.rxBytes)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {router.status === 'offline' && (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <WifiOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Router fuera de línea</p>
                      {router.lastSeen && (
                        <p className="text-xs text-gray-400 mt-1">
                          Última conexión: {new Date(router.lastSeen).toLocaleString('es-ES')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTestConnection(router)}
                      disabled={testingConnection === router.id}
                    >
                      {testingConnection === router.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Probando...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4 mr-2" />
                          Test Conexión
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(router)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(router.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRouter ? 'Editar Router' : 'Nuevo Router'}
            </DialogTitle>
            <DialogDescription>
              {editingRouter
                ? 'Actualiza la información del router MikroTik'
                : 'Configura un nuevo router MikroTik'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Router</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Router Central - Zona Norte"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Oficina Central, Planta 2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ip">Dirección IP</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={e => setFormData({ ...formData, ip: e.target.value })}
                  placeholder="192.168.1.1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="port">Puerto API</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={e => setFormData({ ...formData, port: Number(e.target.value) })}
                  placeholder="8728"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ La contraseña se almacena de forma segura. Asegúrate de que el usuario tenga permisos de API en MikroTik.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingRouter ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
