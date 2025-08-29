import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Palette, 
  Phone, 
  Map, 
  Shield, 
  Save, 
  TestTube, 
  Eye,
  Download,
  FileText,
  Zap,
  Lock
} from 'lucide-react';
import { mockTestConnection, validateMySQLConfig, type MySQLConfig } from '@/lib/mysql';

interface SettingsData {
  // Configurações Gerais
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  logo: string;
  favicon: string;
  
  // Configurações de Banco
  database: MySQLConfig;
  
  // Configurações de Aparência
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  
  // Configurações de Contato
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  phone: string;
  
  // Configurações de Mapa
  defaultMapType: string;
  showCoverageByDefault: boolean;
  defaultZoom: number;
  centerLat: number;
  centerLng: number;
  
  // Configurações Avançadas
  enableBackup: boolean;
  backupFrequency: string;
  enableLogs: boolean;
  logLevel: string;
  enableSecurity: boolean;
  sessionTimeout: number;
  enablePerformance: boolean;
  cacheEnabled: boolean;
}

const defaultSettings: SettingsData = {
  title: 'ND Drones Network',
  subtitle: 'Rede de Localizadores de Drones',
  searchPlaceholder: 'Buscar unidades...',
  logo: '',
  favicon: '',
  database: {
    host: 'localhost',
    port: 3306,
    database: 'drone_network',
    user: 'root',
    password: '',
    ssl: false
  },
  primaryColor: '#ea580c',
  secondaryColor: '#f97316',
  darkMode: false,
  theme: 'light',
  whatsappNumber: '',
  whatsappMessage: 'Olá! Gostaria de saber mais sobre os serviços de drones.',
  email: '',
  phone: '',
  defaultMapType: 'roadmap',
  showCoverageByDefault: true,
  defaultZoom: 10,
  centerLat: -23.5505,
  centerLng: -46.6333,
  enableBackup: true,
  backupFrequency: 'daily',
  enableLogs: true,
  logLevel: 'info',
  enableSecurity: true,
  sessionTimeout: 30,
  enablePerformance: true,
  cacheEnabled: true
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Aqui você carregaria as configurações do banco de dados
      // const savedSettings = await loadSettingsFromDB();
      // setSettings(savedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Aqui você salvaria as configurações no banco de dados
      // await saveSettingsToDB(settings);
      setHasChanges(false);
      console.log('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testDatabaseConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await mockTestConnection(settings.database);
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Erro ao testar conexão: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const updateSettings = (section: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [section]: value }));
    setHasChanges(true);
  };

  const updateDatabaseSettings = (key: keyof MySQLConfig, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      database: { ...prev.database, [key]: value }
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Gerencie todas as configurações da aplicação</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Alterações não salvas
            </Badge>
          )}
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || !hasChanges}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Banco</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Contato</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span>Mapa</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Avançado</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Configure as informações principais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título Principal</Label>
                  <Input
                    id="title"
                    value={settings.title}
                    onChange={(e) => updateSettings('title', e.target.value)}
                    placeholder="Ex: ND Drones Network"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={settings.subtitle}
                    onChange={(e) => updateSettings('subtitle', e.target.value)}
                    placeholder="Ex: Rede de Localizadores de Drones"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="searchPlaceholder">Placeholder de Busca</Label>
                <Input
                  id="searchPlaceholder"
                  value={settings.searchPlaceholder}
                  onChange={(e) => updateSettings('searchPlaceholder', e.target.value)}
                  placeholder="Ex: Buscar unidades..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo">URL do Logo</Label>
                  <Input
                    id="logo"
                    value={settings.logo}
                    onChange={(e) => updateSettings('logo', e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="favicon">URL do Favicon</Label>
                  <Input
                    id="favicon"
                    value={settings.favicon}
                    onChange={(e) => updateSettings('favicon', e.target.value)}
                    placeholder="https://exemplo.com/favicon.ico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Banco de Dados */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do MySQL</CardTitle>
              <CardDescription>
                Configure a conexão com o banco de dados MySQL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dbHost">Host do Banco</Label>
                  <Input
                    id="dbHost"
                    value={settings.database.host}
                    onChange={(e) => updateDatabaseSettings('host', e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                <div>
                  <Label htmlFor="dbPort">Porta</Label>
                  <Input
                    id="dbPort"
                    type="number"
                    value={settings.database.port}
                    onChange={(e) => updateDatabaseSettings('port', parseInt(e.target.value))}
                    placeholder="3306"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dbName">Nome do Banco</Label>
                  <Input
                    id="dbName"
                    value={settings.database.database}
                    onChange={(e) => updateDatabaseSettings('database', e.target.value)}
                    placeholder="drone_network"
                  />
                </div>
                <div>
                  <Label htmlFor="dbUser">Usuário</Label>
                  <Input
                    id="dbUser"
                    value={settings.database.user}
                    onChange={(e) => updateDatabaseSettings('user', e.target.value)}
                    placeholder="root"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dbPassword">Senha</Label>
                <Input
                  id="dbPassword"
                  type="password"
                  value={settings.database.password}
                  onChange={(e) => updateDatabaseSettings('password', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="dbSsl"
                  checked={settings.database.ssl}
                  onCheckedChange={(checked) => updateDatabaseSettings('ssl', checked)}
                />
                <Label htmlFor="dbSsl">Usar SSL</Label>
              </div>
              
              <Separator />
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={testDatabaseConnection}
                  disabled={testingConnection}
                  variant="outline"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testingConnection ? 'Testando...' : 'Testar Conexão'}
                </Button>
                
                {connectionStatus && (
                  <Alert className={connectionStatus.success ? 'border-green-500' : 'border-red-500'}>
                    <AlertDescription className={connectionStatus.success ? 'text-green-700' : 'text-red-700'}>
                      {connectionStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização Visual</CardTitle>
              <CardDescription>
                Configure cores, tema e aparência da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Cor Principal</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      placeholder="#ea580c"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      placeholder="#f97316"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="theme">Tema Padrão</Label>
                <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => updateSettings('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings('darkMode', checked)}
                />
                <Label htmlFor="darkMode">Modo Escuro por Padrão</Label>
              </div>
              
              <Separator />
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Preview das Cores</h4>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded" 
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <div 
                    className="w-8 h-8 rounded" 
                    style={{ backgroundColor: settings.secondaryColor }}
                  />
                  <span className="text-sm text-gray-600">Cores selecionadas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Contato */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Configure os canais de comunicação da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
                  <Input
                    id="whatsappNumber"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSettings('whatsappNumber', e.target.value)}
                    placeholder="5511999999999"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => updateSettings('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">E-mail de Contato</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings('email', e.target.value)}
                  placeholder="contato@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsappMessage">Mensagem Padrão do WhatsApp</Label>
                <Textarea
                  id="whatsappMessage"
                  value={settings.whatsappMessage}
                  onChange={(e) => updateSettings('whatsappMessage', e.target.value)}
                  placeholder="Olá! Gostaria de saber mais sobre os serviços de drones."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Mapa */}
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Mapa</CardTitle>
              <CardDescription>
                Configure as opções padrão do mapa e visualização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultMapType">Tipo de Mapa Padrão</Label>
                <Select value={settings.defaultMapType} onValueChange={(value) => updateSettings('defaultMapType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Mapa de Ruas</SelectItem>
                    <SelectItem value="satellite">Satélite</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                    <SelectItem value="terrain">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultZoom">Zoom Padrão</Label>
                  <Input
                    id="defaultZoom"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.defaultZoom}
                    onChange={(e) => updateSettings('defaultZoom', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="centerLat">Latitude Central</Label>
                  <Input
                    id="centerLat"
                    type="number"
                    step="any"
                    value={settings.centerLat}
                    onChange={(e) => updateSettings('centerLat', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="centerLng">Longitude Central</Label>
                  <Input
                    id="centerLng"
                    type="number"
                    step="any"
                    value={settings.centerLng}
                    onChange={(e) => updateSettings('centerLng', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showCoverageByDefault"
                  checked={settings.showCoverageByDefault}
                  onCheckedChange={(checked) => updateSettings('showCoverageByDefault', checked)}
                />
                <Label htmlFor="showCoverageByDefault">Mostrar Círculos de Cobertura por Padrão</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Avançado */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Backup</span>
              </CardTitle>
              <CardDescription>
                Configure as opções de backup automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableBackup"
                  checked={settings.enableBackup}
                  onCheckedChange={(checked) => updateSettings('enableBackup', checked)}
                />
                <Label htmlFor="enableBackup">Habilitar Backup Automático</Label>
              </div>
              
              {settings.enableBackup && (
                <div>
                  <Label htmlFor="backupFrequency">Frequência do Backup</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => updateSettings('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Logs do Sistema</span>
              </CardTitle>
              <CardDescription>
                Configure o sistema de logs e monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableLogs"
                  checked={settings.enableLogs}
                  onCheckedChange={(checked) => updateSettings('enableLogs', checked)}
                />
                <Label htmlFor="enableLogs">Habilitar Logs</Label>
              </div>
              
              {settings.enableLogs && (
                <div>
                  <Label htmlFor="logLevel">Nível de Log</Label>
                  <Select value={settings.logLevel} onValueChange={(value) => updateSettings('logLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Apenas Erros</SelectItem>
                      <SelectItem value="warn">Avisos e Erros</SelectItem>
                      <SelectItem value="info">Informações</SelectItem>
                      <SelectItem value="debug">Debug (Detalhado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>
                Configure as opções de segurança da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSecurity"
                  checked={settings.enableSecurity}
                  onCheckedChange={(checked) => updateSettings('enableSecurity', checked)}
                />
                <Label htmlFor="enableSecurity">Habilitar Recursos de Segurança</Label>
              </div>
              
              {settings.enableSecurity && (
                <div>
                  <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSettings('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Performance</span>
              </CardTitle>
              <CardDescription>
                Configure as opções de performance e cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enablePerformance"
                  checked={settings.enablePerformance}
                  onCheckedChange={(checked) => updateSettings('enablePerformance', checked)}
                />
                <Label htmlFor="enablePerformance">Habilitar Otimizações de Performance</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="cacheEnabled"
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) => updateSettings('cacheEnabled', checked)}
                />
                <Label htmlFor="cacheEnabled">Habilitar Cache</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}