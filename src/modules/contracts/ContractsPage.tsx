import React, { useEffect, useState } from 'react';
import { apiService } from '../../core/services/apiService';
import { Contract, Client, Plan, Router } from '../../core/models/types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Plus,
  Pause,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [routers, setRouters] = useState<Router[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    clientId: '',
    planId: '',
    routerId: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active' as const,
  });
  const [newPlanId, setNewPlanId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contractsData, clientsData, plansData, routersData] = await Promise.all([
        apiService.getContracts(),
        apiService.getClients(),
        apiService.getPlans(),
        apiService.getRouters(),
      ]);
      setContracts(contractsData);
      setClients(clientsData);
      setPlans(plansData);
      setRouters(routersData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      clientId: '',
      planId: '',
      routerId: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.planId || !formData.routerId) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      await apiService.createContract({
        clientId: formData.clientId,
        planId: formData.planId,
        routerId: formData.routerId,
        startDate: new Date(formData.startDate),
        status: formData.status,
      });
      toast.success('Contrato creado exitosamente. Credenciales PPPoE generadas.');
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al crear contrato');
    }
  };

  const handleSuspend = async (contract: Contract) => {
    try {
      await apiService.suspendContract(contract.id);
      toast.success(`Contrato suspendido. Secret PPPoE deshabilitado en ${contract.router?.name}`);
      loadData();
    } catch (error) {
      toast.error('Error al suspender contrato');
    }
  };

  const handleReactivate = async (contract: Contract) => {
    try {
      await apiService.reactivateContract(contract.id);
      toast.success(`Contrato reactivado. Secret PPPoE habilitado en ${contract.router?.name}`);
      loadData();
    } catch (error) {
      toast.error('Error al reactivar contrato');
    }
  };

  const handleOpenChangePlanDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setNewPlanId(contract.planId);
    setChangePlanDialogOpen(true);
  };

  const handleChangePlan = async () => {
    if (!selectedContract || !newPlanId) return;

    try {
      await apiService.changePlan(selectedContract.id, newPlanId);
      const newPlan = plans.find(p => p.id === newPlanId);
      toast.success(`Plan cambiado a ${newPlan?.name}. Perfil PPPoE actualizado en MikroTik.`);
      setChangePlanDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al cambiar plan');
    }
  };

  const togglePasswordVisibility = (contractId: string) => {
    setShowPassword(prev => ({ ...prev, [contractId]: !prev[contractId] }));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Activo', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspendido', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelado', icon: XCircle, className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status as keyof typeof variants] || variants.cancelled;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(password.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Gestión de Contratos</h1>
          <p className="text-gray-500">Administra los contratos y credenciales PPPoE</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contrato
        </Button>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Router</TableHead>
                <TableHead>Credenciales PPPoE</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay contratos registrados
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map(contract => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{contract.client?.name}</p>
                        <p className="text-sm text-gray-500">{contract.client?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{contract.plan?.name}</p>
                        <p className="text-sm text-gray-500">
                          {contract.plan?.downloadSpeed}/{contract.plan?.uploadSpeed} Mbps
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{contract.router?.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="text-gray-500">Usuario:</span> {contract.pppoeUsername}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-900">
                            <span className="text-gray-500">Password:</span>{' '}
                            {showPassword[contract.id]
                              ? contract.pppoePassword
                              : maskPassword(contract.pppoePassword)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => togglePasswordVisibility(contract.id)}
                          >
                            {showPassword[contract.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">Bs {contract.monthlyFee}</TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {contract.status === 'active' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenChangePlanDialog(contract)}
                              title="Cambiar plan"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSuspend(contract)}
                              title="Suspender"
                            >
                              <Pause className="w-4 h-4 text-yellow-600" />
                            </Button>
                          </>
                        ) : contract.status === 'suspended' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReactivate(contract)}
                            title="Reactivar"
                          >
                            <Play className="w-4 h-4 text-green-600" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Contract Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Contrato</DialogTitle>
            <DialogDescription>
              Crea un nuevo contrato y genera automáticamente las credenciales PPPoE
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={formData.clientId} onValueChange={value => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    .filter(c => c.status !== 'inactive')
                    .map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.idCard}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plan">Plan de Internet</Label>
              <Select value={formData.planId} onValueChange={value => setFormData({ ...formData, planId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.downloadSpeed}/{plan.uploadSpeed} Mbps - Bs {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="router">Router MikroTik</Label>
              <Select value={formData.routerId} onValueChange={value => setFormData({ ...formData, routerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un router" />
                </SelectTrigger>
                <SelectContent>
                  {routers
                    .filter(r => r.status === 'online')
                    .map(router => (
                      <SelectItem key={router.id} value={router.id}>
                        {router.name} - {router.location}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Solo se muestran routers en línea</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="mb-1">Al crear el contrato se generarán automáticamente:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Usuario PPPoE (formato: cli###_iniciales)</li>
                    <li>Contraseña segura aleatoria</li>
                    <li>Secret PPPoE en el router MikroTik seleccionado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Crear Contrato</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Plan</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo plan para {selectedContract?.client?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Plan Actual</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{selectedContract?.plan?.name}</p>
                <p className="text-sm text-gray-500">Bs {selectedContract?.monthlyFee}/mes</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newPlan">Nuevo Plan</Label>
              <Select value={newPlanId} onValueChange={setNewPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.downloadSpeed}/{plan.uploadSpeed} Mbps - Bs {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                El perfil PPPoE será actualizado automáticamente en el router MikroTik
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan}>Cambiar Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
