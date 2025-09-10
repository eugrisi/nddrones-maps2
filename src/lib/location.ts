// Serviço para gerenciar dados de estados e cidades brasileiras

export interface State {
  id: string;
  name: string;
  uf: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
}

// Estados brasileiros
export const BRAZILIAN_STATES: State[] = [
  { id: 'AC', name: 'Acre', uf: 'AC' },
  { id: 'AL', name: 'Alagoas', uf: 'AL' },
  { id: 'AP', name: 'Amapá', uf: 'AP' },
  { id: 'AM', name: 'Amazonas', uf: 'AM' },
  { id: 'BA', name: 'Bahia', uf: 'BA' },
  { id: 'CE', name: 'Ceará', uf: 'CE' },
  { id: 'DF', name: 'Distrito Federal', uf: 'DF' },
  { id: 'ES', name: 'Espírito Santo', uf: 'ES' },
  { id: 'GO', name: 'Goiás', uf: 'GO' },
  { id: 'MA', name: 'Maranhão', uf: 'MA' },
  { id: 'MT', name: 'Mato Grosso', uf: 'MT' },
  { id: 'MS', name: 'Mato Grosso do Sul', uf: 'MS' },
  { id: 'MG', name: 'Minas Gerais', uf: 'MG' },
  { id: 'PA', name: 'Pará', uf: 'PA' },
  { id: 'PB', name: 'Paraíba', uf: 'PB' },
  { id: 'PR', name: 'Paraná', uf: 'PR' },
  { id: 'PE', name: 'Pernambuco', uf: 'PE' },
  { id: 'PI', name: 'Piauí', uf: 'PI' },
  { id: 'RJ', name: 'Rio de Janeiro', uf: 'RJ' },
  { id: 'RN', name: 'Rio Grande do Norte', uf: 'RN' },
  { id: 'RS', name: 'Rio Grande do Sul', uf: 'RS' },
  { id: 'RO', name: 'Rondônia', uf: 'RO' },
  { id: 'RR', name: 'Roraima', uf: 'RR' },
  { id: 'SC', name: 'Santa Catarina', uf: 'SC' },
  { id: 'SP', name: 'São Paulo', uf: 'SP' },
  { id: 'SE', name: 'Sergipe', uf: 'SE' },
  { id: 'TO', name: 'Tocantins', uf: 'TO' }
];

// Principais cidades por estado (amostra representativa)
export const BRAZILIAN_CITIES: City[] = [
  // São Paulo
  { id: 'sp-sao-paulo', name: 'São Paulo', stateId: 'SP' },
  { id: 'sp-campinas', name: 'Campinas', stateId: 'SP' },
  { id: 'sp-santos', name: 'Santos', stateId: 'SP' },
  { id: 'sp-sao-bernardo', name: 'São Bernardo do Campo', stateId: 'SP' },
  { id: 'sp-guarulhos', name: 'Guarulhos', stateId: 'SP' },
  { id: 'sp-osasco', name: 'Osasco', stateId: 'SP' },
  { id: 'sp-ribeirao-preto', name: 'Ribeirão Preto', stateId: 'SP' },
  { id: 'sp-sorocaba', name: 'Sorocaba', stateId: 'SP' },
  { id: 'sp-monte-azul-paulista', name: 'Monte Azul Paulista', stateId: 'SP' },
  { id: 'sp-bauru', name: 'Bauru', stateId: 'SP' },
  { id: 'sp-piracicaba', name: 'Piracicaba', stateId: 'SP' },
  { id: 'sp-jundiai', name: 'Jundiaí', stateId: 'SP' },
  
  // Rio de Janeiro
  { id: 'rj-rio-de-janeiro', name: 'Rio de Janeiro', stateId: 'RJ' },
  { id: 'rj-niteroi', name: 'Niterói', stateId: 'RJ' },
  { id: 'rj-nova-iguacu', name: 'Nova Iguaçu', stateId: 'RJ' },
  { id: 'rj-duque-de-caxias', name: 'Duque de Caxias', stateId: 'RJ' },
  { id: 'rj-campos', name: 'Campos dos Goytacazes', stateId: 'RJ' },
  { id: 'rj-petropolis', name: 'Petrópolis', stateId: 'RJ' },
  
  // Minas Gerais
  { id: 'mg-belo-horizonte', name: 'Belo Horizonte', stateId: 'MG' },
  { id: 'mg-uberlandia', name: 'Uberlândia', stateId: 'MG' },
  { id: 'mg-contagem', name: 'Contagem', stateId: 'MG' },
  { id: 'mg-juiz-de-fora', name: 'Juiz de Fora', stateId: 'MG' },
  { id: 'mg-montes-claros', name: 'Montes Claros', stateId: 'MG' },
  { id: 'mg-uberaba', name: 'Uberaba', stateId: 'MG' },
  
  // Paraná
  { id: 'pr-curitiba', name: 'Curitiba', stateId: 'PR' },
  { id: 'pr-londrina', name: 'Londrina', stateId: 'PR' },
  { id: 'pr-maringa', name: 'Maringá', stateId: 'PR' },
  { id: 'pr-ponta-grossa', name: 'Ponta Grossa', stateId: 'PR' },
  { id: 'pr-cascavel', name: 'Cascavel', stateId: 'PR' },
  { id: 'pr-foz-do-iguacu', name: 'Foz do Iguaçu', stateId: 'PR' },
  
  // Rio Grande do Sul
  { id: 'rs-porto-alegre', name: 'Porto Alegre', stateId: 'RS' },
  { id: 'rs-caxias-do-sul', name: 'Caxias do Sul', stateId: 'RS' },
  { id: 'rs-pelotas', name: 'Pelotas', stateId: 'RS' },
  { id: 'rs-canoas', name: 'Canoas', stateId: 'RS' },
  { id: 'rs-santa-maria', name: 'Santa Maria', stateId: 'RS' },
  { id: 'rs-novo-hamburgo', name: 'Novo Hamburgo', stateId: 'RS' },
  
  // Bahia
  { id: 'ba-salvador', name: 'Salvador', stateId: 'BA' },
  { id: 'ba-feira-de-santana', name: 'Feira de Santana', stateId: 'BA' },
  { id: 'ba-vitoria-da-conquista', name: 'Vitória da Conquista', stateId: 'BA' },
  { id: 'ba-camaçari', name: 'Camaçari', stateId: 'BA' },
  { id: 'ba-juazeiro', name: 'Juazeiro', stateId: 'BA' },
  { id: 'ba-ilheus', name: 'Ilhéus', stateId: 'BA' },
  
  // Santa Catarina
  { id: 'sc-florianopolis', name: 'Florianópolis', stateId: 'SC' },
  { id: 'sc-joinville', name: 'Joinville', stateId: 'SC' },
  { id: 'sc-blumenau', name: 'Blumenau', stateId: 'SC' },
  { id: 'sc-sao-jose', name: 'São José', stateId: 'SC' },
  { id: 'sc-criciuma', name: 'Criciúma', stateId: 'SC' },
  { id: 'sc-chapeco', name: 'Chapecó', stateId: 'SC' },
  
  // Goiás
  { id: 'go-goiania', name: 'Goiânia', stateId: 'GO' },
  { id: 'go-aparecida-de-goiania', name: 'Aparecida de Goiânia', stateId: 'GO' },
  { id: 'go-anapolis', name: 'Anápolis', stateId: 'GO' },
  { id: 'go-rio-verde', name: 'Rio Verde', stateId: 'GO' },
  { id: 'go-luziania', name: 'Luziânia', stateId: 'GO' },
  
  // Pernambuco
  { id: 'pe-recife', name: 'Recife', stateId: 'PE' },
  { id: 'pe-jaboatao', name: 'Jaboatão dos Guararapes', stateId: 'PE' },
  { id: 'pe-olinda', name: 'Olinda', stateId: 'PE' },
  { id: 'pe-caruaru', name: 'Caruaru', stateId: 'PE' },
  { id: 'pe-petrolina', name: 'Petrolina', stateId: 'PE' },
  
  // Ceará
  { id: 'ce-fortaleza', name: 'Fortaleza', stateId: 'CE' },
  { id: 'ce-caucaia', name: 'Caucaia', stateId: 'CE' },
  { id: 'ce-juazeiro-do-norte', name: 'Juazeiro do Norte', stateId: 'CE' },
  { id: 'ce-maracanau', name: 'Maracanaú', stateId: 'CE' },
  { id: 'ce-sobral', name: 'Sobral', stateId: 'CE' },
  
  // Distrito Federal
  { id: 'df-brasilia', name: 'Brasília', stateId: 'DF' },
  { id: 'df-gama', name: 'Gama', stateId: 'DF' },
  { id: 'df-taguatinga', name: 'Taguatinga', stateId: 'DF' },
  { id: 'df-ceilandia', name: 'Ceilândia', stateId: 'DF' },
  
  // Espírito Santo
  { id: 'es-vitoria', name: 'Vitória', stateId: 'ES' },
  { id: 'es-vila-velha', name: 'Vila Velha', stateId: 'ES' },
  { id: 'es-cariacica', name: 'Cariacica', stateId: 'ES' },
  { id: 'es-serra', name: 'Serra', stateId: 'ES' },
  
  // Pará
  { id: 'pa-belem', name: 'Belém', stateId: 'PA' },
  { id: 'pa-ananindeua', name: 'Ananindeua', stateId: 'PA' },
  { id: 'pa-santarem', name: 'Santarém', stateId: 'PA' },
  { id: 'pa-maraba', name: 'Marabá', stateId: 'PA' },
  
  // Amazonas
  { id: 'am-manaus', name: 'Manaus', stateId: 'AM' },
  { id: 'am-parintins', name: 'Parintins', stateId: 'AM' },
  { id: 'am-itacoatiara', name: 'Itacoatiara', stateId: 'AM' },
  
  // Maranhão
  { id: 'ma-sao-luis', name: 'São Luís', stateId: 'MA' },
  { id: 'ma-imperatriz', name: 'Imperatriz', stateId: 'MA' },
  { id: 'ma-timon', name: 'Timon', stateId: 'MA' },
  
  // Paraíba
  { id: 'pb-joao-pessoa', name: 'João Pessoa', stateId: 'PB' },
  { id: 'pb-campina-grande', name: 'Campina Grande', stateId: 'PB' },
  { id: 'pb-santa-rita', name: 'Santa Rita', stateId: 'PB' },
  
  // Mato Grosso
  { id: 'mt-cuiaba', name: 'Cuiabá', stateId: 'MT' },
  { id: 'mt-varzea-grande', name: 'Várzea Grande', stateId: 'MT' },
  { id: 'mt-rondonopolis', name: 'Rondonópolis', stateId: 'MT' },
  
  // Mato Grosso do Sul
  { id: 'ms-campo-grande', name: 'Campo Grande', stateId: 'MS' },
  { id: 'ms-dourados', name: 'Dourados', stateId: 'MS' },
  { id: 'ms-tres-lagoas', name: 'Três Lagoas', stateId: 'MS' },
  
  // Rio Grande do Norte
  { id: 'rn-natal', name: 'Natal', stateId: 'RN' },
  { id: 'rn-mossoró', name: 'Mossoró', stateId: 'RN' },
  { id: 'rn-parnamirim', name: 'Parnamirim', stateId: 'RN' },
  
  // Alagoas
  { id: 'al-maceio', name: 'Maceió', stateId: 'AL' },
  { id: 'al-arapiraca', name: 'Arapiraca', stateId: 'AL' },
  
  // Piauí
  { id: 'pi-teresina', name: 'Teresina', stateId: 'PI' },
  { id: 'pi-parnaiba', name: 'Parnaíba', stateId: 'PI' },
  
  // Sergipe
  { id: 'se-aracaju', name: 'Aracaju', stateId: 'SE' },
  { id: 'se-nossa-senhora-do-socorro', name: 'Nossa Senhora do Socorro', stateId: 'SE' },
  
  // Tocantins
  { id: 'to-palmas', name: 'Palmas', stateId: 'TO' },
  { id: 'to-araguaina', name: 'Araguaína', stateId: 'TO' },
  
  // Acre
  { id: 'ac-rio-branco', name: 'Rio Branco', stateId: 'AC' },
  { id: 'ac-cruzeiro-do-sul', name: 'Cruzeiro do Sul', stateId: 'AC' },
  
  // Amapá
  { id: 'ap-macapa', name: 'Macapá', stateId: 'AP' },
  { id: 'ap-santana', name: 'Santana', stateId: 'AP' },
  
  // Rondônia
  { id: 'ro-porto-velho', name: 'Porto Velho', stateId: 'RO' },
  { id: 'ro-ji-parana', name: 'Ji-Paraná', stateId: 'RO' },
  
  // Roraima
  { id: 'rr-boa-vista', name: 'Boa Vista', stateId: 'RR' },
  { id: 'rr-rorainopolis', name: 'Rorainópolis', stateId: 'RR' }
];

// Classe de serviço para gerenciar localização
export class LocationService {
  private static instance: LocationService;
  private statesCache: State[] = [];
  private citiesCache: Map<string, City[]> = new Map();

  private constructor() {
    this.statesCache = [...BRAZILIAN_STATES];
    this.initializeCitiesCache();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  private initializeCitiesCache(): void {
    // Organiza cidades por estado
    BRAZILIAN_CITIES.forEach(city => {
      if (!this.citiesCache.has(city.stateId)) {
        this.citiesCache.set(city.stateId, []);
      }
      this.citiesCache.get(city.stateId)!.push(city);
    });

    // Ordena cidades por nome
    this.citiesCache.forEach(cities => {
      cities.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    });
  }

  /**
   * Retorna todos os estados brasileiros ordenados por nome
   */
  public getStates(): State[] {
    return this.statesCache.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  /**
   * Retorna as cidades de um estado específico
   */
  public getCitiesByState(stateId: string): City[] {
    return this.citiesCache.get(stateId) || [];
  }

  /**
   * Busca um estado pelo ID
   */
  public getStateById(stateId: string): State | undefined {
    return this.statesCache.find(state => state.id === stateId);
  }

  /**
   * Busca uma cidade pelo ID
   */
  public getCityById(cityId: string): City | undefined {
    for (const cities of this.citiesCache.values()) {
      const city = cities.find(c => c.id === cityId);
      if (city) return city;
    }
    return undefined;
  }

  /**
   * Busca cidades por nome (busca parcial)
   */
  public searchCities(query: string, stateId?: string): City[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    let citiesToSearch: City[] = [];
    
    if (stateId) {
      citiesToSearch = this.getCitiesByState(stateId);
    } else {
      citiesToSearch = BRAZILIAN_CITIES;
    }

    return citiesToSearch
      .filter(city => 
        city.name.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, 50); // Limita a 50 resultados
  }

  /**
   * Busca estados por nome (busca parcial)
   */
  public searchStates(query: string): State[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return this.getStates();

    return this.statesCache
      .filter(state => 
        state.name.toLowerCase().includes(normalizedQuery) ||
        state.uf.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  /**
   * Valida se um estado existe
   */
  public isValidState(stateId: string): boolean {
    return this.statesCache.some(state => state.id === stateId);
  }

  /**
   * Valida se uma cidade existe em um estado específico
   */
  public isValidCity(cityId: string, stateId?: string): boolean {
    if (stateId) {
      const cities = this.getCitiesByState(stateId);
      return cities.some(city => city.id === cityId);
    }
    return BRAZILIAN_CITIES.some(city => city.id === cityId);
  }

  /**
   * Retorna informações completas de localização (estado + cidade)
   */
  public getLocationInfo(stateId: string, cityId?: string): {
    state: State | undefined;
    city: City | undefined;
    fullAddress: string;
  } {
    const state = this.getStateById(stateId);
    const city = cityId ? this.getCityById(cityId) : undefined;
    
    let fullAddress = '';
    if (city && state) {
      fullAddress = `${city.name}, ${state.uf}`;
    } else if (state) {
      fullAddress = state.name;
    }

    return { state, city, fullAddress };
  }
}

// Instância singleton do serviço
export const locationService = LocationService.getInstance();