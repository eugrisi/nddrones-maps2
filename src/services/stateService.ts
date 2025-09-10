export interface State {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

class StateService {
  private statesCache: State[] | null = null;
  private citiesCache: Map<string, City[]> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private cacheTimestamp: number = 0;

  async getStates(): Promise<State[]> {
    // Verifica se o cache ainda é válido
    if (this.statesCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.statesCache;
    }

    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const states: State[] = await response.json();
      this.statesCache = states;
      this.cacheTimestamp = Date.now();
      return states;
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      // Fallback para dados locais em caso de erro
      return this.getFallbackStates();
    }
  }

  async getCitiesByState(stateCode: string): Promise<City[]> {
    // Verifica cache
    if (this.citiesCache.has(stateCode)) {
      return this.citiesCache.get(stateCode)!;
    }

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios?orderBy=nome`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const cities: City[] = await response.json();
      this.citiesCache.set(stateCode, cities);
      return cities;
    } catch (error) {
      console.error(`Erro ao carregar cidades para ${stateCode}:`, error);
      // Fallback para dados locais em caso de erro
      return this.getFallbackCities(stateCode);
    }
  }

  private getFallbackStates(): State[] {
    return [
      { id: 11, sigla: 'RO', nome: 'Rondônia' },
      { id: 12, sigla: 'AC', nome: 'Acre' },
      { id: 13, sigla: 'AM', nome: 'Amazonas' },
      { id: 14, sigla: 'RR', nome: 'Roraima' },
      { id: 15, sigla: 'PA', nome: 'Pará' },
      { id: 16, sigla: 'AP', nome: 'Amapá' },
      { id: 17, sigla: 'TO', nome: 'Tocantins' },
      { id: 21, sigla: 'MA', nome: 'Maranhão' },
      { id: 22, sigla: 'PI', nome: 'Piauí' },
      { id: 23, sigla: 'CE', nome: 'Ceará' },
      { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
      { id: 25, sigla: 'PB', nome: 'Paraíba' },
      { id: 26, sigla: 'PE', nome: 'Pernambuco' },
      { id: 27, sigla: 'AL', nome: 'Alagoas' },
      { id: 28, sigla: 'SE', nome: 'Sergipe' },
      { id: 29, sigla: 'BA', nome: 'Bahia' },
      { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
      { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
      { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
      { id: 35, sigla: 'SP', nome: 'São Paulo' },
      { id: 41, sigla: 'PR', nome: 'Paraná' },
      { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
      { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
      { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
      { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
      { id: 52, sigla: 'GO', nome: 'Goiás' },
      { id: 53, sigla: 'DF', nome: 'Distrito Federal' }
    ];
  }

  private getFallbackCities(stateCode: string): City[] {
    // Dados básicos para algumas capitais como fallback
    const fallbackCities: Record<string, City[]> = {
      'SP': [
        {
          id: 3550308,
          nome: 'São Paulo',
          microrregiao: {
            id: 35061,
            nome: 'São Paulo',
            mesorregiao: {
              id: 3515,
              nome: 'Metropolitana de São Paulo',
              UF: { id: 35, sigla: 'SP', nome: 'São Paulo' }
            }
          }
        }
      ],
      'RJ': [
        {
          id: 3304557,
          nome: 'Rio de Janeiro',
          microrregiao: {
            id: 33018,
            nome: 'Rio de Janeiro',
            mesorregiao: {
              id: 3306,
              nome: 'Metropolitana do Rio de Janeiro',
              UF: { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' }
            }
          }
        }
      ],
      'MG': [
        {
          id: 3106200,
          nome: 'Belo Horizonte',
          microrregiao: {
            id: 31028,
            nome: 'Belo Horizonte',
            mesorregiao: {
              id: 3102,
              nome: 'Metropolitana de Belo Horizonte',
              UF: { id: 31, sigla: 'MG', nome: 'Minas Gerais' }
            }
          }
        }
      ]
    };

    return fallbackCities[stateCode] || [];
  }

  // Método para limpar cache se necessário
  clearCache(): void {
    this.statesCache = null;
    this.citiesCache.clear();
    this.cacheTimestamp = 0;
  }
}

// Exporta uma instância singleton
export const stateService = new StateService();
export default stateService;