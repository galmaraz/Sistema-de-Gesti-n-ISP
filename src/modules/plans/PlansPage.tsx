import React, { useEffect, useState } from 'react';
import { apiService } from '../../core/services/apiService';
import { Plan } from '../../core/models/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, Package, Download, Upload, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    downloadSpeed: 0,
    uploadSpeed: 0,
    price: 0,
    pppoeProfile: '',
    description: '',
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPlans();
      setPlans(data);
    } catch (error) {
      toast.error('Error al cargar planes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        downloadSpeed: plan.downloadSpeed,
        uploadSpeed: plan.uploadSpeed,
        price: plan.price,
        pppoeProfile: plan.pppoeProfile,
        description: plan.description || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        downloadSpeed: 0,
        uploadSpeed: 0,
        price: 0,
        pppoeProfile: '',
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await apiService.updatePlan(editingPlan.id, formData);
        toast.success('Plan actualizado exitosamente');
      } else {
        await apiService.createPlan(formData);
        toast.success('Plan creado exitosamente');
      }
      setDialogOpen(false);
      loadPlans();
    } catch (error) {
      toast.error('Error al guardar plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este plan?')) {
      try {
        await apiService.deletePlan(id);
        toast.success('Plan eliminado exitosamente');
        loadPlans();
      } catch (error) {
        toast.error('Error al eliminar plan');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Planes de Internet</h1>
          <p className="text-gray-500">Gestiona los planes disponibles para clientes</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-gray-500 col-span-full text-center py-8">Cargando...</p>
        ) : plans.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">No hay planes registrados</p>
        ) : (
          plans.map(plan => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="mt-1">{plan.pppoeProfile}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Download className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Descarga</span>
                    </div>
                    <span className="text-green-700">{plan.downloadSpeed} Mbps</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Upload className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">Subida</span>
                    </div>
                    <span className="text-purple-700">{plan.uploadSpeed} Mbps</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Precio Mensual</span>
                    </div>
                    <span className="text-blue-700">Bs {plan.price}</span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-500 border-t pt-3">{plan.description}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenDialog(plan)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? 'Actualiza la información del plan'
                : 'Completa los datos del nuevo plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Plan</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Premium 50 Mbps"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="downloadSpeed">Velocidad de Descarga (Mbps)</Label>
                <Input
                  id="downloadSpeed"
                  type="number"
                  value={formData.downloadSpeed}
                  onChange={e =>
                    setFormData({ ...formData, downloadSpeed: Number(e.target.value) })
                  }
                  placeholder="50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="uploadSpeed">Velocidad de Subida (Mbps)</Label>
                <Input
                  id="uploadSpeed"
                  type="number"
                  value={formData.uploadSpeed}
                  onChange={e =>
                    setFormData({ ...formData, uploadSpeed: Number(e.target.value) })
                  }
                  placeholder="25"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Precio Mensual (Bs)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pppoeProfile">Perfil PPPoE (MikroTik)</Label>
              <Input
                id="pppoeProfile"
                value={formData.pppoeProfile}
                onChange={e => setFormData({ ...formData, pppoeProfile: e.target.value })}
                placeholder="Ej: profile_50mbps"
              />
              <p className="text-xs text-gray-500">
                Nombre exacto del perfil configurado en el router MikroTik
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del plan y beneficios..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingPlan ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
