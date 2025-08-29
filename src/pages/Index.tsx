import { useState, useEffect, useRef } from 'react';
import DroneMap from '@/components/Map/DroneMap';
import NotificationToast from '@/components/NotificationToast';
import { useResellers } from '@/hooks/useResellers';
import { useNotifications } from '@/hooks/useNotifications';
import { useMapControl } from '@/hooks/useMapControl';
import { useIsMobile } from '@/hooks/use-mobile';
import { Reseller } from '@/data/mockData';
import L from 'leaflet';

const estadosCidades = [
  { estado: 'SP', cidades: ['Monts Azul Paulista'], center: [-22.1, -47.9], zoom: 7 },
  { estado: 'MG', cidades: ['Espera Feliz', 'Janaúba', 'Lavras', 'Patos de Minas', 'Unaí'], center: [-19.0, -44.0], zoom: 6 },
];

// Customização padrão
const defaultCustom = {
  logo: '/nd-logo.svg',
  homeTitle: 'Localizador de Unidades',
  homeSubtitle: 'Encontre nossa unidade mais próxima',
  btnBuscar: 'Buscar Unidades',
  selectEstado: 'Selecione o estado',
  selectCidade: 'Todas as cidades',
};

const Index = () => {
  const isMobile = useIsMobile();
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [suggestion, setSuggestion] = useState<Reseller | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(false);
  const [animateUnits, setAnimateUnits] = useState(false);
  const [mapType, setMapType] = useState<'traditional' | 'satellite'>('traditional');
  const [showCoverageCircles, setShowCoverageCircles] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const { resellers, loading, error } = useResellers();
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  // Usar o novo hook de controle do mapa
  const {
    mapState,
    focusOnReseller,
    focusOnState,
    focusOnCity,
    showAllResellers,
    filterByLocation,
    customFocus
  } = useMapControl({ resellers });

  // Extrair estados únicos dos endereços das unidades
  const estadosDisponiveis = Array.from(new Set(
    resellers.map(r => r.address.split(',').pop()?.trim()).filter(Boolean)
  )).map(estado => ({ estado, label: estado }));

  // Extrair cidades cobertas do estado selecionado
  const cidadesDisponiveis = selectedEstado 
    ? Array.from(new Set(
        resellers
          .filter(r => r.address.includes(selectedEstado))
          .flatMap(r => r.coveredCities || [])
          .map(city => city.split(',')[0].trim())
          .filter(Boolean)
      )).sort()
    : [];

  // Carregar customização
  const [custom, setCustom] = useState(() => {
    const saved = localStorage.getItem('nddrones_custom');
    return saved ? JSON.parse(saved) : defaultCustom;
  });

  // Garantir que a sidebar seja recolhida em dispositivos móveis
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Carregar estado dos círculos de cobertura
  useEffect(() => {
    const saved = localStorage.getItem('nddrones_custom');
    if (saved) {
      const custom = JSON.parse(saved);
      setShowCoverageCircles(custom.showCoverageCircles || false);
    }
  }, []);

  // Atualizar customização quando localStorage mudar
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('nddrones_custom');
      if (saved) {
        setCustom(JSON.parse(saved));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Função para ver todas as unidades
  const handleVerTodas = () => {
    showAllResellers();
    setSelectedEstado('');
    setSelectedCidade('');
    setSelectedReseller(null);
    setSuggestion(null);
    setAnimateUnits(true);
    
    addNotification(`Exibindo todas as ${resellers.length} unidades da rede ND Drones no mapa.`, 'success', 5000);
    setTimeout(() => setAnimateUnits(false), 2000);
  };

  // Função para alternar círculos de cobertura
  const toggleCoverageCircles = () => {
    const newValue = !showCoverageCircles;
    setShowCoverageCircles(newValue);
    
    // Salvar no localStorage
    const saved = localStorage.getItem('nddrones_custom');
    const customData = saved ? JSON.parse(saved) : defaultCustom;
    const updatedCustom = { ...customData, showCoverageCircles: newValue };
    localStorage.setItem('nddrones_custom', JSON.stringify(updatedCustom));
    
    addNotification(
      newValue 
        ? 'Círculos de cobertura ativados no mapa.' 
        : 'Círculos de cobertura desativados.', 
      'info', 
      3000
    );
  };

  // Função para selecionar uma unidade específica
  const handleSelectReseller = (reseller: Reseller) => {
    setSelectedReseller(reseller);
    focusOnReseller(reseller);
    
    // Limpar filtros para focar apenas na unidade selecionada
    setSelectedEstado('');
    setSelectedCidade('');
    setSuggestion(null);
    
    addNotification(`Focalizando na unidade: ${reseller.name}. Clique no marcador para mais informações.`, 'info', 6000);
  };

  // Atualiza cidades ao trocar estado com zoom automático
  const handleEstadoChange = (estado: string) => {
    setSelectedEstado(estado);
    setSelectedCidade('');
    setSuggestion(null);
    setSelectedReseller(null);
    
    if (estado) {
      focusOnState(estado);
      addNotification(`Exibindo unidades do estado: ${estado}. Selecione uma cidade para filtrar ainda mais.`, 'info', 5000);
    } else {
      showAllResellers();
    }
  };

  // Função para selecionar cidade com zoom
  const handleCidadeChange = (cidade: string) => {
    setSelectedCidade(cidade);
    setSuggestion(null);
    setSelectedReseller(null);
    
    if (cidade && selectedEstado) {
      // Verificar se a cidade tem cobertura
      const coveringUnits = resellers.filter(r => 
        r.address.includes(selectedEstado) &&
        r.coveredCities?.some(coveredCity => 
          coveredCity.toLowerCase().includes(cidade.toLowerCase())
        )
      );

      if (coveringUnits.length > 0) {
      focusOnCity(cidade, selectedEstado);
        if (coveringUnits.length === 1) {
          addNotification(`COBERTURA CONFIRMADA: A cidade ${cidade} é atendida pela unidade ${coveringUnits[0].name}.`, 'success', 8000);
        } else {
          const unitNames = coveringUnits.map(u => u.name).join(', ');
          addNotification(`MÚLTIPLAS OPÇÕES: A cidade ${cidade} é atendida por ${coveringUnits.length} unidades: ${unitNames}.`, 'success', 8000);
        }
      } else {
        addNotification(`SEM COBERTURA: Não há unidades que atendem a cidade ${cidade}. Tente selecionar outra cidade ou entre em contato conosco.`, 'warning', 8000);
      }
    } else if (selectedEstado) {
      focusOnState(selectedEstado);
    }
  };

  // Busca e sugestão inteligente
  const handleBuscar = () => {
    if (!selectedEstado) {
      addNotification('Selecione um estado antes de realizar a busca.', 'warning', 5000);
      return;
    }

    if (selectedCidade) {
      // Se cidade está selecionada, verificar cobertura
      const coveringUnits = resellers.filter(r => 
        r.address.includes(selectedEstado) &&
        r.coveredCities?.some(coveredCity => 
          coveredCity.toLowerCase().includes(selectedCidade.toLowerCase())
        )
      );

      if (coveringUnits.length > 0) {
        filterByLocation(selectedEstado, selectedCidade);
        if (coveringUnits.length === 1) {
          addNotification(`Encontrada cobertura para ${selectedCidade}: ${coveringUnits[0].name}.`, 'success', 6000);
        } else {
          addNotification(`Encontradas ${coveringUnits.length} unidades que atendem ${selectedCidade}.`, 'success', 6000);
        }
      } else {
        addNotification(`A cidade ${selectedCidade} não possui cobertura de nenhuma unidade.`, 'warning', 6000);
        return;
      }
    } else {
      // Apenas estado selecionado
      filterByLocation(selectedEstado);
      const stateUnits = resellers.filter(r => r.address.includes(selectedEstado));
      addNotification(`Encontradas ${stateUnits.length} unidades no estado ${selectedEstado}.`, 'success', 5000);
    }

    setSelectedReseller(null);
    setSuggestion(null);
    setAnimateUnits(true);
    setTimeout(() => setAnimateUnits(false), 2000);
  };

  return (
    <div 
      className={
        darkMode 
          ? "min-h-screen flex transition-all duration-500 bg-gray-900"
          : "min-h-screen flex transition-all duration-500 bg-nd-beige"
      }
    >
      {/* Botão de toggle da sidebar - Oculto na impressão */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="sidebar-toggle fixed top-6 left-2 z-[9999] bg-nd-orange text-white p-1.5 rounded-full shadow-lg hover:bg-nd-green-dark transition-all border-2 border-white hover:scale-110 print:hidden"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
        aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {/* Controles Flutuantes - Responsivos para Mobile */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[1000] print:hidden">
            <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Toggle Modo Noturno */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-1.5 rounded-lg shadow-xl transition-all hover:scale-110 hover:shadow-2xl min-w-[32px] min-h-[32px] flex items-center justify-center ${
            darkMode ? 'bg-yellow-500 hover:bg-yellow-400 text-white' : 'bg-gray-900 hover:bg-gray-800 text-yellow-400'
          }`}
          title={darkMode ? 'Modo Claro' : 'Modo Noturno'}
        >
          {darkMode ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
            </svg>
          )}
        </button>

          {/* Lista de Unidades */}
          <div className="relative group">
            <button
              className={`p-1.5 rounded-lg shadow-xl transition-all hover:scale-110 hover:shadow-2xl min-w-[32px] min-h-[32px] flex items-center justify-center ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
              title="Lista de Unidades"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            </button>
            
            {/* Dropdown da lista de unidades */}
            <div className={`absolute right-0 top-full mt-2 w-64 sm:w-72 md:w-80 rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3 sm:p-4">
                <h3 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Unidades Disponíveis
                </h3>
                <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
                  {resellers.map((reseller) => (
                    <button
                      key={reseller.id}
                      onClick={() => handleSelectReseller(reseller)}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg transition-colors hover:bg-nd-orange hover:text-white ${
                        darkMode ? 'text-gray-200 hover:bg-nd-orange' : 'text-gray-700 hover:bg-nd-orange'
                      }`}
                    >
                      <div className="font-medium text-sm sm:text-base">{reseller.name}</div>
                      <div className="text-xs sm:text-sm opacity-75 mt-1 sm:mt-1.5">{reseller.address}</div>
                      {reseller.coverageRadius && (
                        <div className="text-xs sm:text-sm opacity-60 mt-1 sm:mt-1.5">
                          Cobertura: {reseller.coverageRadius}km
                          {reseller.coveredCities && ` • ${reseller.coveredCities.length} cidades`}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Círculos de Cobertura */}
          <button
            onClick={toggleCoverageCircles}
            className={`p-1.5 rounded-lg shadow-xl transition-all hover:scale-110 hover:shadow-2xl min-w-[32px] min-h-[32px] flex items-center justify-center ${
              showCoverageCircles 
                ? 'bg-nd-orange hover:bg-orange-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
            title={showCoverageCircles ? 'Ocultar Raio de Cobertura' : 'Mostrar Raio de Cobertura'}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar ND Drones - Responsiva para mobile */}
      <aside className={`${sidebarOpen ? 'w-full sm:w-80 md:w-72 lg:w-80' : 'w-0'} ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-nd-green-dark text-nd-beige'} flex flex-col shadow-2xl transition-all duration-300 overflow-hidden print:hidden fixed md:relative z-50 h-full md:h-auto ${sidebarOpen ? 'md:relative' : ''}`}>
        {/* Logo Responsiva - Tamanhos específicos para diferentes resoluções */}
        <div className={`p-2 sm:p-3 md:p-4 border-b ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'} flex items-center justify-center`}>
          <img 
            src="/logo-h-05.svg" 
            alt="ND Drones" 
            className="object-contain mx-auto transition-transform hover:scale-110 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 max-w-full max-h-full"
          />
        </div>
        
        {/* Título personalizado */}
        <div className={`px-4 py-3 text-center border-b ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'}`}>
          <h1 className="text-xl font-bold">{custom.homeTitle}</h1>
          <p className="opacity-70 text-sm">{custom.homeSubtitle}</p>
        </div>

        {/* Formulário de Busca */}
        <div className={`p-4 sm:p-5 space-y-3 sm:space-y-4 border-b ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'}`}>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block font-semibold mb-1 text-xs sm:text-sm">
                <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Estado
              </label>
              <select
                className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-nd-orange focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white/10 border-nd-green-light/30 text-white'
                }`}
                value={selectedEstado}
                onChange={e => handleEstadoChange(e.target.value)}
              >
                <option value="" className="text-nd-green-dark">{custom.selectEstado}</option>
                {estadosDisponiveis.map(e => (
                  <option key={e.estado} value={e.estado} className="text-nd-green-dark">{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-xs sm:text-sm">
                <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" clipRule="evenodd" />
                </svg>
                Cidade
              </label>
              <select
                className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-nd-orange focus:border-transparent transition-all disabled:opacity-50 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white/10 border-nd-green-light/30 text-white'
                }`}
                value={selectedCidade}
                onChange={e => handleCidadeChange(e.target.value)}
                disabled={!selectedEstado}
              >
                <option value="" className="text-nd-green-dark">{custom.selectCidade}</option>
                {cidadesDisponiveis.map(cidade => (
                  <option key={cidade} value={cidade} className="text-nd-green-dark">{cidade}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                className="bg-nd-orange hover:bg-orange-500 text-white font-bold py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-nd-orange shadow-lg hover:shadow-xl"
                onClick={handleBuscar}
              >
                <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>

              <button
                className={`font-bold py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-600' 
                    : 'bg-nd-green-dark hover:bg-green-700 text-white focus:ring-nd-green-dark'
                }`}
                onClick={handleVerTodas}
              >
                <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Todas
              </button>
            </div>
          </div>
            </div>

        {/* Informações de Cobertura do Estado */}
        {selectedEstado && (
          <div className={`p-3 sm:p-4 border-t ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'}`}>
            <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center">
              <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                </svg>
              Cobertura em {selectedEstado}
              </h4>
            <div className="text-xs sm:text-sm space-y-1">
              <div className="flex justify-between">
                <span className="opacity-70">Unidades no Estado:</span>
                <span className="font-semibold">
                  {mapState.filteredResellers.filter(r => r.address.includes(selectedEstado)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Cidades Atendidas:</span>
                <span className="font-semibold text-nd-orange">
                  {cidadesDisponiveis.length}
                </span>
              </div>
              {cidadesDisponiveis.length === 0 && (
                <div className="mt-1.5 sm:mt-2 text-xs opacity-60 text-yellow-400">
                  Nenhuma cidade configurada para este estado
                </div>
              )}
              {cidadesDisponiveis.length > 0 && (
                <div className="mt-1.5 sm:mt-2">
                  <span className="opacity-70 text-xs">Cidades cobertas:</span>
                  <div className="text-xs opacity-80 mt-1 max-h-16 sm:max-h-20 overflow-y-auto">
                    {cidadesDisponiveis.slice(0, 6).join(', ')}
                    {cidadesDisponiveis.length > 6 && (
                      ` e mais ${cidadesDisponiveis.length - 6} ${cidadesDisponiveis.length - 6 === 1 ? 'cidade' : 'cidades'}`
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sugestão */}
        {suggestion && (
          <div className={`p-3 sm:p-4 border-t ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'}`}>
            <div className="bg-nd-orange/20 border border-nd-orange/30 rounded-lg p-2 sm:p-3">
              <div className="flex items-start space-x-1.5 sm:space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nd-orange mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-bold text-nd-orange text-xs sm:text-sm">Sugestão:</div>
                  <div className="font-semibold text-xs sm:text-sm">{suggestion.name}</div>
                  <div className="opacity-80 text-xs">{suggestion.address}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas de Cobertura */}
        <div className={`p-3 sm:p-4 border-t ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'}`}>
          <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center">
            <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
            </svg>
            {mapState.filteredResellers.length === resellers.length 
              ? 'Estatísticas Gerais' 
              : selectedEstado 
                ? `Estatísticas - ${selectedEstado}` 
                : `Estatísticas Filtradas`
            }
          </h4>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">Total de Unidades:</span>
              <span className="font-semibold">{mapState.filteredResellers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Cidades Cobertas:</span>
              <span className="font-semibold">
                {Array.from(new Set(
                  mapState.filteredResellers.flatMap(r => r.coveredCities || [])
                )).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Raio Médio:</span>
              <span className="font-semibold">
                {mapState.filteredResellers.length > 0 
                  ? Math.round(mapState.filteredResellers.reduce((total, r) => total + (r.coverageRadius || 0), 0) / mapState.filteredResellers.length)
                  : 0}km
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="opacity-70">Estados Atendidos:</span>
              <span className="font-semibold text-xs text-right max-w-[50%]">
                {mapState.filteredResellers.length > 0 
                  ? [...new Set(mapState.filteredResellers.map(r => r.address.split(',').pop()?.trim()))].filter(Boolean).join(', ')
                  : 'Nenhum'}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className={`p-3 sm:p-4 border-t ${darkMode ? 'border-gray-700' : 'border-nd-green-light/30'}`}>
          <div className="text-center opacity-60 text-xs">
            © 2025 ND Drones<br />
            Todos os direitos reservados
          </div>
        </div>
      </aside>

      {/* Mapa */}
      <main className="map-container flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-nd-beige/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nd-orange mx-auto mb-4"></div>
              <p className="text-nd-green-dark font-semibold">Carregando mapa...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-nd-beige/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">X</div>
              <p className="text-red-600 mb-2 font-semibold">Erro ao carregar dados</p>
              <p className="text-nd-green-dark text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="h-full m-4 rounded-2xl overflow-hidden shadow-2xl border border-nd-green-light/20 print:m-0 print:rounded-none print:shadow-none print:border-none print:w-screen print:h-screen">
          <DroneMap
            resellers={mapState.filteredResellers}
            center={mapState.center}
            zoom={mapState.zoom}
            darkMode={darkMode}
            mapType={mapType}
            showCoverageCircles={showCoverageCircles}
          />
          
          {/* Controles de Tipo de Mapa - Reposicionados para evitar sobreposição */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] print:hidden">
            <div className={`backdrop-blur-sm rounded-lg shadow-2xl border overflow-hidden transition-all hover:shadow-3xl ${
              darkMode ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-200'
            }`}>
              <div className="flex flex-col">
                <button 
                  onClick={() => setMapType('traditional')}
                  className={`px-3 py-3 text-sm font-semibold transition-all min-w-[40px] min-h-[40px] flex items-center justify-center border-b hover:scale-105 hover:shadow-lg ${
                    mapType === 'traditional'
                      ? darkMode 
                        ? 'bg-nd-orange hover:bg-orange-500 text-white border-gray-600 shadow-inner' 
                        : 'bg-nd-orange hover:bg-orange-500 text-white border-gray-200 shadow-inner'
                      : darkMode 
                        ? 'text-gray-100 hover:bg-gray-700 border-gray-600' 
                        : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                  title="Mapa Tradicional"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.158.69-.158 1.006 0l4.994 2.497c.317.158.69.158 1.007 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-3 text-sm font-semibold transition-all min-w-[40px] min-h-[40px] flex items-center justify-center hover:scale-105 hover:shadow-lg ${
                    mapType === 'satellite'
                      ? darkMode 
                        ? 'bg-nd-orange hover:bg-orange-500 text-white shadow-inner' 
                        : 'bg-nd-orange hover:bg-orange-500 text-white shadow-inner'
                      : darkMode 
                        ? 'text-gray-100 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Mapa Satélite"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className={`absolute bottom-8 left-8 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border print:hidden ${
          darkMode 
            ? 'bg-gray-800/90 border-gray-700 text-gray-100' 
            : 'bg-white/90 border-nd-green-light/20 text-nd-green-dark'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">
              {mapState.filteredResellers.length} unidades encontradas
            </span>
            <button
              onClick={handleVerTodas}
              className="text-nd-green-dark hover:underline text-sm"
            >
              Ver Todas
            </button>
          </div>
        </div>
      </main>

      {/* Notificações */}
      <NotificationToast notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default Index;