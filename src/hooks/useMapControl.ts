import { useState, useEffect, useRef } from 'react';
import { Reseller } from '@/data/mockData';

interface MapState {
  center: [number, number];
  zoom: number;
  filteredResellers: Reseller[];
}

interface UseMapControlProps {
  resellers: Reseller[];
}

interface UseMapControlReturn {
  mapState: MapState;
  focusOnReseller: (reseller: Reseller) => void;
  focusOnState: (state: string) => void;
  focusOnCity: (city: string, state: string) => void;
  showAllResellers: () => void;
  filterByLocation: (state?: string, city?: string) => void;
  customFocus: (center: [number, number], zoom: number, filteredResellers: Reseller[]) => void;
}

// Dados dos estados com centros geográficos
const stateData = {
  'SP': { center: [-22.1, -47.9] as [number, number], zoom: 7 },
  'MG': { center: [-19.0, -44.0] as [number, number], zoom: 6 },
  'RJ': { center: [-22.9, -43.1] as [number, number], zoom: 8 },
  'ES': { center: [-20.3, -40.3] as [number, number], zoom: 8 },
  'GO': { center: [-16.7, -49.3] as [number, number], zoom: 7 },
  'DF': { center: [-15.8, -47.9] as [number, number], zoom: 10 },
};

export const useMapControl = ({ resellers }: UseMapControlProps): UseMapControlReturn => {
  const [mapState, setMapState] = useState<MapState>({
    center: [-18.5833, -46.5167],
    zoom: 7,
    filteredResellers: resellers
  });

  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  // Atualizar resellers filtrados quando a lista principal mudar
  useEffect(() => {
    setMapState(prev => ({
      ...prev,
      filteredResellers: resellers
    }));
  }, [resellers]);

  // Função para calcular o centro geográfico de múltiplas posições
  const calculateBounds = (positions: [number, number][]) => {
    if (positions.length === 0) return { center: [-18.5833, -46.5167] as [number, number], zoom: 7 };
    
    const lats = positions.map(pos => pos[0]);
    const lngs = positions.map(pos => pos[1]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calcular zoom baseado na distância
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 7;
    if (maxDiff < 0.5) zoom = 12;
    else if (maxDiff < 1) zoom = 10;
    else if (maxDiff < 2) zoom = 9;
    else if (maxDiff < 4) zoom = 8;
    else if (maxDiff < 8) zoom = 7;
    else zoom = 6;
    
    return { center: [centerLat, centerLng] as [number, number], zoom };
  };

  // Foco em uma revenda específica
  const focusOnReseller = (reseller: Reseller) => {
    setMapState({
      center: reseller.position,
      zoom: 14,
      filteredResellers: [reseller]
    });
  };

  // Foco em um estado
  const focusOnState = (state: string) => {
    const stateInfo = stateData[state as keyof typeof stateData];
    const stateResellers = resellers.filter(r => r.address.includes(state));
    
    if (stateInfo) {
      setMapState({
        center: stateInfo.center,
        zoom: stateInfo.zoom,
        filteredResellers: stateResellers
      });
    } else if (stateResellers.length > 0) {
      const bounds = calculateBounds(stateResellers.map(r => r.position));
      setMapState({
        center: bounds.center,
        zoom: bounds.zoom,
        filteredResellers: stateResellers
      });
    }
  };

  // Foco em uma cidade específica
  const focusOnCity = (city: string, state: string) => {
    const cityResellers = resellers.filter(r => 
      r.address.includes(state) && 
      r.address.toLowerCase().includes(city.toLowerCase())
    );

    if (cityResellers.length > 0) {
      const bounds = calculateBounds(cityResellers.map(r => r.position));
      setMapState({
        center: bounds.center,
        zoom: Math.max(bounds.zoom, 12), // Zoom mínimo para cidades
        filteredResellers: cityResellers
      });
    } else {
      // Se não há resellers na cidade, tenta encontrar a cidade mais próxima
      const stateResellers = resellers.filter(r => r.address.includes(state));
      if (stateResellers.length > 0) {
        const bounds = calculateBounds(stateResellers.map(r => r.position));
        setMapState({
          center: bounds.center,
          zoom: 10,
          filteredResellers: stateResellers
        });
      }
    }
  };

  // Mostrar todas as revendas
  const showAllResellers = () => {
    if (resellers.length > 0) {
      const bounds = calculateBounds(resellers.map(r => r.position));
      setMapState({
        center: bounds.center,
        zoom: bounds.zoom,
        filteredResellers: resellers
      });
    }
  };

  // Filtrar por localização
  const filterByLocation = (state?: string, city?: string) => {
    let filtered = resellers;

    if (state) {
      filtered = filtered.filter(r => r.address.includes(state));
    }

    if (city) {
      filtered = filtered.filter(r => 
        r.address.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (filtered.length > 0) {
      const bounds = calculateBounds(filtered.map(r => r.position));
      setMapState({
        center: bounds.center,
        zoom: filtered.length === 1 ? 14 : bounds.zoom,
        filteredResellers: filtered
      });
    } else {
      setMapState(prev => ({
        ...prev,
        filteredResellers: []
      }));
    }
  };

  // Foco customizado
  const customFocus = (center: [number, number], zoom: number, filteredResellers: Reseller[]) => {
    setMapState({
      center,
      zoom,
      filteredResellers
    });
  };

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    mapState,
    focusOnReseller,
    focusOnState,
    focusOnCity,
    showAllResellers,
    filterByLocation,
    customFocus
  };
}; 