interface CityCoordinates {
  latitude: number;
  longitude: number;
}

class GeocodingService {
  private coordinatesCache: Map<string, CityCoordinates> = new Map();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private cacheTimestamps: Map<string, number> = new Map();

  // Coordenadas pré-definidas para principais cidades brasileiras
  private readonly PREDEFINED_COORDINATES: Record<string, CityCoordinates> = {
    // Capitais
    'São Paulo-SP': { latitude: -23.5505, longitude: -46.6333 },
    'Rio de Janeiro-RJ': { latitude: -22.9068, longitude: -43.1729 },
    'Belo Horizonte-MG': { latitude: -19.9167, longitude: -43.9345 },
    'Salvador-BA': { latitude: -12.9714, longitude: -38.5014 },
    'Brasília-DF': { latitude: -15.7939, longitude: -47.8828 },
    'Fortaleza-CE': { latitude: -3.7319, longitude: -38.5267 },
    'Manaus-AM': { latitude: -3.1190, longitude: -60.0217 },
    'Curitiba-PR': { latitude: -25.4284, longitude: -49.2733 },
    'Recife-PE': { latitude: -8.0476, longitude: -34.8770 },
    'Porto Alegre-RS': { latitude: -30.0346, longitude: -51.2177 },
    'Belém-PA': { latitude: -1.4558, longitude: -48.5044 },
    'Goiânia-GO': { latitude: -16.6869, longitude: -49.2648 },
    'Guarulhos-SP': { latitude: -23.4538, longitude: -46.5333 },
    'Campinas-SP': { latitude: -22.9099, longitude: -47.0626 },
    'São Luís-MA': { latitude: -2.5387, longitude: -44.2825 },
    'São Gonçalo-RJ': { latitude: -22.8267, longitude: -43.0537 },
    'Maceió-AL': { latitude: -9.6658, longitude: -35.7353 },
    'Duque de Caxias-RJ': { latitude: -22.7856, longitude: -43.3117 },
    'Natal-RN': { latitude: -5.7945, longitude: -35.2110 },
    'Teresina-PI': { latitude: -5.0892, longitude: -42.8019 },
    'Campo Grande-MS': { latitude: -20.4697, longitude: -54.6201 },
    'Nova Iguaçu-RJ': { latitude: -22.7592, longitude: -43.4511 },
    'São Bernardo do Campo-SP': { latitude: -23.6939, longitude: -46.5650 },
    'João Pessoa-PB': { latitude: -7.1195, longitude: -34.8450 },
    'Santo André-SP': { latitude: -23.6528, longitude: -46.5311 },
    'Osasco-SP': { latitude: -23.5329, longitude: -46.7918 },
    'Jaboatão dos Guararapes-PE': { latitude: -8.1130, longitude: -35.0149 },
    'São José dos Campos-SP': { latitude: -23.2237, longitude: -45.9009 },
    'Ribeirão Preto-SP': { latitude: -21.1775, longitude: -47.8208 },
    'Uberlândia-MG': { latitude: -18.9113, longitude: -48.2622 },
    'Contagem-MG': { latitude: -19.9317, longitude: -44.0536 },
    'Sorocaba-SP': { latitude: -23.5015, longitude: -47.4526 },
    'Aracaju-SE': { latitude: -10.9472, longitude: -37.0731 },
    'Feira de Santana-BA': { latitude: -12.2664, longitude: -38.9663 },
    'Cuiabá-MT': { latitude: -15.6014, longitude: -56.0979 },
    'Joinville-SC': { latitude: -26.3045, longitude: -48.8487 },
    'Juiz de Fora-MG': { latitude: -21.7642, longitude: -43.3467 },
    'Londrina-PR': { latitude: -23.3045, longitude: -51.1696 },
    'Aparecida de Goiânia-GO': { latitude: -16.8173, longitude: -49.2444 },
    'Niterói-RJ': { latitude: -22.8833, longitude: -43.1036 },
    'Ananindeua-PA': { latitude: -1.3656, longitude: -48.3722 },
    'Porto Velho-RO': { latitude: -8.7612, longitude: -63.9039 },
    'Caxias do Sul-RS': { latitude: -29.1678, longitude: -51.1794 },
    'Campos dos Goytacazes-RJ': { latitude: -21.7587, longitude: -41.3298 },
    'Vila Velha-ES': { latitude: -20.3297, longitude: -40.2925 },
    'Florianópolis-SC': { latitude: -27.5954, longitude: -48.5480 },
    'Macapá-AP': { latitude: 0.0389, longitude: -51.0664 },
    'Vitória-ES': { latitude: -20.3155, longitude: -40.3128 },
    'Rio Branco-AC': { latitude: -9.9754, longitude: -67.8249 },
    'Boa Vista-RR': { latitude: 2.8235, longitude: -60.6758 },
    'Palmas-TO': { latitude: -10.1689, longitude: -48.3317 }
  };

  async getCityCoordinates(cityName: string, stateName: string): Promise<CityCoordinates | null> {
    const cacheKey = `${cityName}-${stateName}`;
    
    // Verifica cache
    if (this.coordinatesCache.has(cacheKey)) {
      const timestamp = this.cacheTimestamps.get(cacheKey) || 0;
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return this.coordinatesCache.get(cacheKey)!;
      }
    }

    // Verifica coordenadas pré-definidas
    if (this.PREDEFINED_COORDINATES[cacheKey]) {
      const coordinates = this.PREDEFINED_COORDINATES[cacheKey];
      this.coordinatesCache.set(cacheKey, coordinates);
      this.cacheTimestamps.set(cacheKey, Date.now());
      return coordinates;
    }

    // Tenta buscar via API de geocodificação (Nominatim - OpenStreetMap)
    try {
      const query = encodeURIComponent(`${cityName}, ${stateName}, Brazil`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=br`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coordinates: CityCoordinates = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
        
        // Salva no cache
        this.coordinatesCache.set(cacheKey, coordinates);
        this.cacheTimestamps.set(cacheKey, Date.now());
        
        return coordinates;
      }
    } catch (error) {
      console.warn(`Erro ao buscar coordenadas para ${cacheKey}:`, error);
    }

    // Fallback: coordenadas aproximadas do centro do Brasil
    const fallbackCoordinates: CityCoordinates = {
      latitude: -15.7939,
      longitude: -47.8828
    };
    
    return fallbackCoordinates;
  }

  // Método para limpar cache
  clearCache(): void {
    this.coordinatesCache.clear();
    this.cacheTimestamps.clear();
  }

  // Método para adicionar coordenadas customizadas
  addCustomCoordinates(cityName: string, stateName: string, coordinates: CityCoordinates): void {
    const cacheKey = `${cityName}-${stateName}`;
    this.coordinatesCache.set(cacheKey, coordinates);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }
}

// Exporta uma instância singleton
export const geocodingService = new GeocodingService();
export default geocodingService;
export type { CityCoordinates };