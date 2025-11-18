import React, { useEffect, useState } from 'react';
import { apiService } from '../../core/services/apiService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export interface Client {
  _id?: string;
  name: string;
  ci: string;
  direccion: string;
  telefono: string;
  email: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  fechaRegistro?: Date;
}

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    ci: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'activo' as 'activo' | 'inactivo' | 'suspendido',
  });

  // Carga inicial
  useEffect(() => {
    loadClients();
  }, []);

  // Aplicar filtros cuando cambien los clientes, término de búsqueda o filtro de estado
  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.ci.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.estado === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        ci: client.ci || '',
        direccion: client.direccion || '',
        telefono: client.telefono || '',
        email: client.email || '',
        estado: client.estado || 'activo',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        ci: '',
        direccion: '',
        telefono: '',
        email: '',
        estado: 'activo',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.ci || !formData.telefono || !formData.email || !formData.direccion) {
        toast.error('Complete todos los campos requeridos');
        return;
      }

      if (editingClient && editingClient._id) {
        // Actualización optimista
        const updatedClients = clients.map(client => 
          client._id === editingClient._id 
            ? { ...client, ...formData }
            : client
        );
        
        setClients(updatedClients);
        setDialogOpen(false);

        try {
          await apiService.updateClient(editingClient._id, formData);
          toast.success('Cliente actualizado exitosamente');
          // Recargar para consistencia
          setTimeout(() => {
            loadClients();
          }, 1000);
        } catch (error) {
          // Revertir cambios si falla el backend
          loadClients();
          toast.error('Error al actualizar cliente');
        }
      } else {
        await apiService.createClient(formData);
        toast.success('Cliente creado exitosamente');
        setDialogOpen(false);
        loadClients();
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast.error('Error al guardar cliente');
    }
  };

  const handleDelete = async (_id: string) => {
    if (!_id) {
      toast.error('Error: ID inválido');
      return;
    }

    if (confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await apiService.deleteClient(_id);
        toast.success('Cliente eliminado exitosamente');
        loadClients();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        toast.error('Error al eliminar cliente');
      }
    }
  };

  const getStatusBadge = (estado?: string) => {
    const variants = {
      activo: { label: 'Activo', className: 'bg-green-100 text-green-800 border-green-200' },
      inactivo: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      suspendido: { label: 'Suspendido', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    };
    
    const variant = variants[estado as keyof typeof variants] || variants.inactivo;
    
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la base de datos de clientes</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, CI o email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
                <SelectItem value="suspendido">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {clients.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes con los filtros aplicados'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map(client => (
                  <TableRow key={String(client._id)} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{client.ci}</TableCell>
                    <TableCell>{client.telefono}</TableCell>
                    <TableCell className="max-w-xs truncate" title={client.direccion}>
                      {client.direccion}
                    </TableCell>
                    <TableCell>{getStatusBadge(client.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDialog(client)}
                          title="Editar cliente"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(String(client._id))}
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* CI */}
            <div className="grid gap-2">
              <Label htmlFor="ci">Cédula de Identidad *</Label>
              <Input
                id="ci"
                value={formData.ci}
                onChange={e => setFormData({ ...formData, ci: e.target.value })}
                placeholder="Ej: 12345678"
              />
            </div>

            {/* Teléfono */}
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 78945612"
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej: cliente@email.com"
              />
            </div>

            {/* Dirección */}
            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: Calle Falsa 123"
              />
            </div>

            {/* Estado */}
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: 'activo' | 'inactivo' | 'suspendido') => 
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.ci || !formData.telefono || !formData.email || !formData.direccion}
            >
              {editingClient ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};