import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResellers } from '@/hooks/useResellers';
import { Reseller } from '@/types/reseller';
import { getCurrentUser, logout, hasPermission } from '@/lib/auth';
import { stateService, State, City } from '@/services/stateService';
import { geocodingService } from '@/services/geocodingService';
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
import { Search, Plus, Settings, Users, BarChart3, MapPin, Phone, Mail, Globe, Edit, Trash2, Eye, EyeOff, Grid3X3, List, Download, Filter, Map, Building2, Loader2 } from 'lucide-react';
import AdminSettings from '@/components/AdminSettings';

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
  state: string;
  city: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { resellers, loading, error, addReseller, updateReseller, deleteReseller } = useResellers();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const currentUser = getCurrentUser();
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
    showCoverage: false,
    state: '',
    city: ''
  });
  const [custom, setCustom] = useState(() => {
    const saved = localStorage.getItem('nddrones_custom');
    return saved ? JSON.parse(saved) : defaultCustom;
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resellerToDelete, setResellerToDelete] = useState<Reseller | null>(null);

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const statesData = await stateService.getStates();
        setStates(statesData);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de estados.",
          variant: "destructive",
        });
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, [toast]);

  useEffect(() => {
    const loadCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }

      setLoadingCities(true);
      try {
        const citiesData = await stateService.getCitiesByState(formData.state);
        setCities(citiesData);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de cidades.",
          variant: "destructive",
        });
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [formData.state, toast]);

  useEffect(() => {
    if (formData.state && !editingReseller) {
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state, editingReseller]);

  // Preenche automaticamente as coordenadas quando cidade e estado são selecionados
  useEffect(() => {
    const updateCoordinates = async () => {
      if (formData.city && formData.state) {
        try {
          const coordinates = await geocodingService.getCityCoordinates(formData.city, formData.state);
          if (coordinates) {
            setFormData(prev => ({
              ...prev,
              position: [coordinates.latitude, coordinates.longitude]
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas:', error);
        }
      }
    };

    updateCoordinates();
  }, [formData.city, formData.state]);

  useEffect(() => {
    if (!hasPermission('admin')) {
      navigate('/login');
    }
  }, [hasPermission, navigate]);

  if (!hasPermission('admin')) {
    return null;
  }

  const stats = {
    total: resellers.length,
    headquarters: resellers.filter(r => r.type === 'Sede Principal').length,
    regional: resellers.filter(r => r.type === 'Unidade Regional').length,
    withCoverage: resellers.filter(r => r.showCoverage).length,
  };

  const filteredResellers = resellers.filter(reseller => {
    const matchesSearch = reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || reseller.type === filterType;
    
    const matchesCoverage = showCoverageFilter === 'all' ||
                           (showCoverageFilter === 'with' && reseller.showCoverage) ||
                           (showCoverageFilter === 'without' && !reseller.showCoverage);
    
    return matchesSearch && matchesType && matchesCoverage;
  });

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
      showCoverage: false,
      state: '',
      city: ''
    });
    setEditingReseller(null);
  };

  const handleEdit = (reseller: Reseller) => {
    setFormData({
      name: reseller.name,
      address: reseller.address || '',
      phone: reseller.phone || '',
      email: reseller.email || '',
      position: reseller.position,
      type: reseller.type,
      website: reseller.website || '',
      description: reseller.description || '',
      photo: reseller.photo,
      coverageRadius: reseller.coverageRadius || 100,
      showCoverage: reseller.showCoverage || false,
      state: reseller.state || '',
      city: reseller.city || ''
    });
    setEditingReseller(reseller);
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
          state: formData.state,
          city: formData.city,
        } as any);
        toast({
          title: "Sucesso!",
          description: "Unidade atualizada com sucesso.",
        });
      } else {
        await addReseller({
          ...formData,
          state: formData.state,
          city: formData.city
        } as any);
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
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={custom.logo} alt="ND Drones" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">ND Drones</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

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
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('units')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'units'
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Unidades</span>
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
            <span>Configurações</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center space-x-2"
          >
            <span>Sair</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
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
                      <Building2 className="w-6 h-6 text-orange-600" />
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
                      <Map className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Unidade
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
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
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Sede Principal">Sede Principal</SelectItem>
                      <SelectItem value="Unidade Regional">Unidade Regional</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={showCoverageFilter} onValueChange={setShowCoverageFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as coberturas</SelectItem>
                      <SelectItem value="with">Com cobertura</SelectItem>
                      <SelectItem value="without">Sem cobertura</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid'
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list'
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {filteredResellers.length === 0 ? (
                <Card className="p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma unidade encontrada</h3>
                  <p className="text-gray-600 mb-4">Não há unidades que correspondam aos filtros selecionados.</p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setShowCoverageFilter('all');
                  }}>
                    Limpar Filtros
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
                          <Building2 className={`w-6 h-6 ${
                            reseller.type === 'Sede Principal' ? 'text-green-600' : 'text-orange-600'
                          }`} />
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
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(reseller)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <AdminSettings />
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {editingReseller ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="bg-white border rounded-lg p-4">
              <legend className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-900">
                <Building2 className="h-5 w-5 text-orange-600" />
                Informações Básicas
              </legend>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome da Unidade</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: ND Drones - Matriz"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">Tipo de Unidade</Label>
                  <Select value={formData.type} onValueChange={(value: 'Sede Principal' | 'Unidade Regional') => setFormData({...formData, type: value})}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sede Principal">Sede Principal</SelectItem>
                      <SelectItem value="Unidade Regional">Unidade Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Rua, número, bairro, cidade - UF"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    type="tel"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contato@nddrones.com"
                    type="email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website (opcional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://www.nddrones.com"
                    type="url"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição da unidade, serviços oferecidos, etc."
                    rows={3}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="bg-white border rounded-lg p-4">
              <legend className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-900">
                <MapPin className="h-5 w-5 text-orange-600" />
                Localização
              </legend>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">Estado</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(value) => setFormData({...formData, state: value})}
                    disabled={loadingStates}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder={loadingStates ? "Carregando estados..." : "Selecione o estado"} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.sigla}>
                          {state.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingStates && (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Carregando estados...
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => setFormData({...formData, city: value})}
                    disabled={!formData.state || loadingCities}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder={
                        !formData.state 
                          ? "Primeiro selecione o estado" 
                          : loadingCities 
                            ? "Carregando cidades..." 
                            : "Selecione a cidade"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.nome}>
                          {city.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingCities && (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Carregando cidades...
                    </div>
                  )}
                  {!formData.state && (
                    <p className="text-xs text-gray-500 mt-1">Selecione um estado para ver as cidades</p>
                  )}
                  {formData.state && cities.length === 0 && !loadingCities && (
                    <p className="text-xs text-red-500 mt-1">Nenhuma cidade encontrada para este estado</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.position[0]}
                    onChange={(e) => setFormData({...formData, position: [parseFloat(e.target.value) || 0, formData.position[1]]})}
                    placeholder="-18.5833"
                    type="number"
                    step="any"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.position[1]}
                    onChange={(e) => setFormData({...formData, position: [formData.position[0], parseFloat(e.target.value) || 0]})}
                    placeholder="-46.5167"
                    type="number"
                    step="any"
                    required
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="bg-white border rounded-lg p-4">
              <legend className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-900">
                <Map className="h-5 w-5 text-orange-600" />
                Cobertura
              </legend>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coverageRadius" className="text-sm font-medium text-gray-700">Raio de Cobertura (km)</Label>
                  <Input
                    id="coverageRadius"
                    value={formData.coverageRadius || ''}
                    onChange={(e) => setFormData({...formData, coverageRadius: parseInt(e.target.value) || undefined})}
                    placeholder="100"
                    type="number"
                    min="1"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCoverage"
                    checked={formData.showCoverage}
                    onChange={(e) => setFormData({...formData, showCoverage: e.target.checked})}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <Label htmlFor="showCoverage" className="text-sm font-medium text-gray-700">
                    Exibir área de cobertura no mapa
                  </Label>
                </div>
              </div>
            </fieldset>



            <DialogFooter className="flex justify-end space-x-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {editingReseller ? 'Atualizar Unidade' : 'Adicionar Unidade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade "{resellerToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
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