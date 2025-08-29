import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResellers } from '@/hooks/useResellers';
import { Reseller } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { Search, Plus, Settings, Users, BarChart3, MapPin, Phone, Mail, Globe, Edit, Trash2, Eye, EyeOff, Grid3X3, List, Download, Filter } from 'lucide-react';
import AdminSettings from '@/components/AdminSettings';

// Customização visual (mock local)
const defaultCustom = {
  logo: '/src/pages/logo-h-05.svg',
  homeTitle: 'Localizador de Unidades',
  homeSubtitle: 'Encontre nossa unidade mais próxima',
  btnBuscar: 'Buscar Unidades',
  selectEstado: 'Selecione o estado',
  selectCidade: 'Todas as cidades',
};

interface FormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  position: [number, number];
  type: 'Sede Principal' | 'Unidade Regional';
  website: string;
  description: string;
  photo?: string;
  coverageRadius?: number;
  showCoverage?: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { resellers, loading, error, addReseller, updateReseller, deleteReseller } = useResellers();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Sede Principal' | 'Unidade Regional'>('all');
  const [showCoverageFilter, setShowCoverageFilter] = useState<'all' | 'with' | 'without'>('all');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    position: [-18.5833, -46.5167],
    type: 'Unidade Regional',
    website: '',
    description: '',
    photo: undefined,
    coverageRadius: 100,
    showCoverage: false
  });
  const [custom, setCustom] = useState(() => {
    const saved = localStorage.getItem('nddrones_custom');
    return saved ? JSON.parse(saved) : defaultCustom;
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resellerToDelete, setResellerToDelete] = useState<Reseller | null>(null);

  // Filtrar e buscar unidades
  const filteredResellers = resellers.filter(reseller => {
    const matchesSearch = reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || reseller.type === filterType;
    
    const matchesCoverage = showCoverageFilter === 'all' ||
                           (showCoverageFilter === 'with' && reseller.showCoverage) ||
                           (showCoverageFilter === 'without' && !reseller.showCoverage);
    
    return matchesSearch && matchesType && matchesCoverage;
  });

  // Calcular estatísticas
  const stats = {
    total: resellers.length,
    sedesPrincipais: resellers.filter(r => r.type === 'Sede Principal').length,
    unidadesRegionais: resellers.filter(r => r.type === 'Unidade Regional').length,
    comCobertura: resellers.filter(r => r.showCoverage).length,
    semCobertura: resellers.filter(r => !r.showCoverage).length
  };

  // Interface para dados customizados
  interface CustomData {
    logo?: string;
    title?: string;
    subtitle?: string;
    searchPlaceholder?: string;
    primaryColor?: string;
    secondaryColor?: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
    defaultMapType?: string;
    showCoverageCircles?: boolean;
    darkMode?: boolean;
  }

  // Salvar customização local
  const saveCustom = (data: CustomData) => {
    setCustom(data);
    localStorage.setItem('nddrones_custom', JSON.stringify(data));
  };

  // Upload de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        saveCustom({ ...custom, logo: ev.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload de foto para unidade
  const handlePhotoChange = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateReseller(id, { photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      position: [-18.5833, -46.5167],
      type: 'Unidade Regional',
      website: '',
      description: '',
      photo: undefined,
      coverageRadius: 100,
      showCoverage: false
    });
    setEditingReseller(null);
  };

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setFormData({
      name: reseller.name,
      address: reseller.address,
      phone: reseller.phone,
      email: reseller.email,
      position: reseller.position,
      type: reseller.type,
      website: reseller.website || '',
      description: reseller.description || '',
      photo: reseller.photo || undefined,
      coverageRadius: reseller.coverageRadius || 100,
      showCoverage: reseller.showCoverage || false
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReseller) {
        await updateReseller(editingReseller.id, {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          position: formData.position,
          type: formData.type as 'Sede Principal' | 'Unidade Regional',
          website: formData.website || undefined,
          description: formData.description || undefined,
          photo: formData.photo || undefined,
          coverageRadius: formData.coverageRadius || undefined,
          showCoverage: formData.showCoverage || false,
        });
        toast({
          title: "Sucesso!",
          description: "Unidade atualizada com sucesso.",
        });
      } else {
        await addReseller(formData);
        toast({
          title: "Sucesso!",
          description: "Nova unidade adicionada com sucesso.",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar unidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (reseller: Reseller) => {
    setResellerToDelete(reseller);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!resellerToDelete) return;
    
    try {
      await deleteReseller(resellerToDelete.id);
      toast({
        title: "Sucesso!",
        description: "Unidade removida com sucesso.",
      });
      setDeleteDialogOpen(false);
      setResellerToDelete(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover unidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={custom.logo} alt="ND Drones" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">ND Drones</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('units')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'units'
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Unidades</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'settings'
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Ver Site</span>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2"
          >
            <span>Sair</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'units' && 'Gerenciar Unidades'}
                {activeTab === 'settings' && 'Configurações'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'dashboard' && 'Visão geral do sistema'}
                {activeTab === 'units' && `${stats.total} unidades cadastradas`}
                {activeTab === 'settings' && 'Personalização e configurações'}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{stats.total} unidades ativas</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Unidades</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sedes Principais</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.headquarters}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unidades Regionais</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.regional}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Com Cobertura</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.withCoverage}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('units')}
                    className="flex items-center justify-center space-x-2 h-12"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nova Unidade</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center justify-center space-x-2 h-12"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Configurações</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar Dados</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === 'units' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar unidades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <option value="all">Todos os tipos</option>
                      <option value="Sede Principal">Sede Principal</option>
                      <option value="Unidade Regional">Unidade Regional</option>
                    </Select>
                    
                    <Select value={showCoverageFilter} onValueChange={setShowCoverageFilter}>
                      <option value="all">Todas as coberturas</option>
                      <option value="with">Com cobertura</option>
                      <option value="without">Sem cobertura</option>
                    </Select>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Grid3X3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Nova Unidade</span>
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Units List/Grid */}
              {filteredResellers.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma unidade encontrada</h3>
                  <p className="text-gray-500 mb-6">Não há unidades que correspondam aos filtros aplicados.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeira unidade
                  </Button>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredResellers.map((reseller) => (
                    <Card key={reseller.id} className={`p-6 hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}>
                      <div className={`flex items-center space-x-3 ${viewMode === 'list' ? 'flex-1' : 'mb-4'}`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          reseller.type === 'Sede Principal' ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          <svg className={`w-6 h-6 ${
                            reseller.type === 'Sede Principal' ? 'text-green-600' : 'text-orange-600'
                          }`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2L13,8L12,14L11,8L12,2M12,2C13.66,2 15,3.34 15,5C15,6.66 13.66,8 12,8C10.34,8 9,6.66 9,5C9,3.34 10.34,2 12,2M6,8C7.66,8 9,9.34 9,11C9,12.66 7.66,14 6,14C4.34,14 3,12.66 3,11C3,9.34 4.34,8 6,8M18,8C19.66,8 21,9.34 21,11C21,12.66 19.66,14 18,14C16.34,14 15,12.66 15,11C15,9.34 16.34,8 18,8M12,16C13.66,16 15,17.34 15,19C15,20.66 13.66,22 12,22C10.34,22 9,20.66 9,19C9,17.34 10.34,16 12,16Z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{reseller.name}</h3>
                          <Badge variant={reseller.type === 'Sede Principal' ? 'default' : 'secondary'} className="mt-1">
                            {reseller.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className={`space-y-2 text-sm text-gray-600 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        {reseller.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{reseller.address}</span>
                          </div>
                        )}
                        {reseller.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{reseller.phone}</span>
                          </div>
                        )}
                        {reseller.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{reseller.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${viewMode === 'list' ? '' : 'mt-4'}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reseller)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a unidade "{reseller.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(reseller)} className="bg-red-600 hover:bg-red-700">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings />
          )}
        </div>
      </div>

      {/* Dialog para Edição/Criação de Unidades */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {editingReseller ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome da Unidade</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: ND Drones São Paulo"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">Tipo de Unidade</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sede Principal">Sede Principal</SelectItem>
                      <SelectItem value="Unidade Regional">Unidade Regional</SelectItem>
                      <SelectItem value="Franquia">Franquia</SelectItem>
                      <SelectItem value="Parceiro">Parceiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ex: (11) 99999-9999"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Ex: contato@nddrones.com.br"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Localização</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat" className="text-sm font-medium text-gray-700">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.position[0]}
                    onChange={(e) => setFormData({...formData, position: [parseFloat(e.target.value) || 0, formData.position[1]]})}
                    placeholder="Ex: -23.5505"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lng" className="text-sm font-medium text-gray-700">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.position[1]}
                    onChange={(e) => setFormData({...formData, position: [formData.position[0], parseFloat(e.target.value) || 0]})}
                    placeholder="Ex: -46.6333"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Configurações de Cobertura */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Cobertura</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="radius" className="text-sm font-medium text-gray-700">Raio de Cobertura (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.coverageRadius || 0}
                    onChange={(e) => setFormData({...formData, coverageRadius: parseInt(e.target.value) || 0})}
                    placeholder="Ex: 50"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="showCircle"
                    checked={formData.showCoverage || false}
                    onChange={(e) => setFormData({...formData, showCoverage: e.target.checked})}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded"
                  />
                  <Label htmlFor="showCircle" className="text-sm text-gray-700">
                    Mostrar círculo no mapa
                  </Label>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informações Adicionais</h3>
              
              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="Ex: https://www.nddrones.com.br"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva os serviços e características desta unidade..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Foto da Unidade</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={formData.photo}
                    onChange={(url) => setFormData({...formData, photo: url})}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {editingReseller ? 'Atualizar Unidade' : 'Adicionar Unidade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade "{resellerToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;