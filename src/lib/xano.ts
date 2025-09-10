// XANO API Configuration and Service

// XANO Configuration
const XANO_CONFIG = {
  instanceName: import.meta.env.VITE_XANO_INSTANCE_NAME || '',
  workspaceId: import.meta.env.VITE_XANO_WORKSPACE_ID || '',
  apiToken: import.meta.env.VITE_XANO_API_TOKEN || '',
  baseUrl: import.meta.env.VITE_XANO_API_URL || `https://${import.meta.env.VITE_XANO_INSTANCE_NAME || 'your-instance'}.xano.io/api:v1`,
  enabled: import.meta.env.VITE_ENABLE_XANO === 'true'
};

// Types matching XANO structure
export interface XanoReseller {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  password?: string;
  latitude: number;
  longitude: number;
  type: 'Sede Principal' | 'Unidade Regional';
  website?: string;
  description?: string;
  photo_url?: string;
  coverage_radius?: number;
  show_coverage?: boolean;
  state?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
}

export interface XanoCity {
  id?: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population?: number;
  created_at?: string;
  updated_at?: string;
}

export interface XanoSetting {
  id?: number;
  key: string;
  value: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface XanoResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Base API class
class XanoAPI {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = XANO_CONFIG.baseUrl;
    this.apiKey = XANO_CONFIG.apiToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${XANO_CONFIG.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XANO_CONFIG.apiToken}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Log more details about the error
        const errorText = await response.text();
        console.error('XANO API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('XANO API Error:', error);
      throw error;
    }
  }

  // Resellers API methods
  async getResellers(): Promise<XanoReseller[]> {
    return this.request<XanoReseller[]>('/user');
  }

  async getReseller(id: number): Promise<XanoReseller> {
    return this.request<XanoReseller>(`/user/${id}`);
  }

  async createReseller(reseller: Omit<XanoReseller, 'id' | 'created_at'>): Promise<XanoReseller> {
    // Primeiro, criar o usuário com apenas name e email (campos aceitos pelo POST)
    const basicUser = {
      name: reseller.name,
      email: reseller.email
    };
    
    const createdUser = await this.request<XanoReseller>('/user', {
      method: 'POST',
      body: JSON.stringify(basicUser),
    });
    
    // Se há campos adicionais, atualizar o usuário com PATCH
    const additionalFields = {
      name: reseller.name, // Incluir name e email obrigatórios
      email: reseller.email,
      state: reseller.state,
      city: reseller.city,
      address: reseller.address,
      latitude: reseller.latitude,
      longitude: reseller.longitude,
      phone: reseller.phone,
      type: reseller.type,
      website: reseller.website,
      description: reseller.description,
      photo_url: reseller.photo_url,
      coverage_radius: reseller.coverage_radius,
      show_coverage: reseller.show_coverage
    };
    
    // Filtrar campos undefined/null (exceto name e email que são obrigatórios)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(additionalFields).filter(([key, value]) => 
        key === 'name' || key === 'email' || (value !== undefined && value !== null)
      )
    );
    
    if (Object.keys(fieldsToUpdate).length > 2) { // Mais que apenas name e email
      return this.request<XanoReseller>(`/user/${createdUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(fieldsToUpdate),
      });
    }
    
    return createdUser;
  }

  async updateReseller(id: number, reseller: Partial<XanoReseller>): Promise<XanoReseller> {
    // Primeiro, buscar o usuário atual para obter os campos obrigatórios
    const currentUser = await this.getReseller(id);
    
    // Mesclar os dados atuais com as atualizações, garantindo que name e email estejam presentes
    const updateData = {
      name: reseller.name || currentUser.name,
      email: reseller.email || currentUser.email,
      ...reseller
    };
    
    return this.request<XanoReseller>(`/user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteReseller(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/user/${id}`, {
      method: 'DELETE',
    });
  }

  // Cities API methods
  async getCities(state?: string): Promise<XanoCity[]> {
    const endpoint = state ? `/cities?state=${encodeURIComponent(state)}` : '/cities';
    return this.request<XanoCity[]>(endpoint);
  }

  async createCity(city: Omit<XanoCity, 'id' | 'created_at' | 'updated_at'>): Promise<XanoCity> {
    return this.request<XanoCity>('/cities', {
      method: 'POST',
      body: JSON.stringify(city),
    });
  }

  // Settings API methods
  async getSettings(): Promise<XanoSetting[]> {
    return this.request<XanoSetting[]>('/settings');
  }

  async getSetting(key: string): Promise<XanoSetting> {
    return this.request<XanoSetting>(`/settings/${key}`);
  }

  async updateSetting(key: string, value: string, category: string = 'general'): Promise<XanoSetting> {
    return this.request<XanoSetting>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, category }),
    });
  }
}

// Export singleton instance
export const xanoAPI = new XanoAPI();

// Helper function to extract state and city from address
const extractLocationFromAddress = (address: string) => {
  const stateMap: { [key: string]: string } = {
    'SP': 'SP', 'São Paulo': 'SP', 'Sao Paulo': 'SP',
    'MG': 'MG', 'Minas Gerais': 'MG',
    'RJ': 'RJ', 'Rio de Janeiro': 'RJ',
    'ES': 'ES', 'Espírito Santo': 'ES', 'Espirito Santo': 'ES',
    'GO': 'GO', 'Goiás': 'GO', 'Goias': 'GO',
    'DF': 'DF', 'Distrito Federal': 'DF'
  };
  
  let extractedState = '';
  let extractedCity = '';
  
  // Try to find state in address
  for (const [key, value] of Object.entries(stateMap)) {
    if (address.includes(key)) {
      extractedState = value;
      break;
    }
  }
  
  // Extract city (usually the first part before comma or dash)
  const addressParts = address.split(/[,-]/);
  if (addressParts.length > 0) {
    extractedCity = addressParts[0].trim();
  }
  
  return { state: extractedState, city: extractedCity };
};

// Utility functions to convert between formats
export const convertXanoToReseller = (xanoReseller: any) => {
  // Handle the current Xano data structure which may be incomplete
  const address = xanoReseller.address || 'Endereço não informado';
  const locationFromAddress = extractLocationFromAddress(address);
  
  return {
    id: xanoReseller.id || 0,
    name: xanoReseller.name || 'Nome não informado',
    address: address,
    phone: xanoReseller.phone || 'Telefone não informado',
    email: xanoReseller.email || 'Email não informado',
    position: [
      xanoReseller.latitude || -23.5505, // Default to São Paulo coordinates
      xanoReseller.longitude || -46.6333
    ] as [number, number],
    type: xanoReseller.type || 'Unidade Regional' as 'Sede Principal' | 'Unidade Regional',
    website: xanoReseller.website || '',
    description: xanoReseller.description || '',
    photo: xanoReseller.photo_url || '',
    coverageRadius: xanoReseller.coverage_radius || 50,
    showCoverage: xanoReseller.show_coverage || false,
    state: xanoReseller.state || locationFromAddress.state,
    city: xanoReseller.city || locationFromAddress.city,
    coveredCities: [] // Will be calculated client-side
  };
};

export const convertResellerToXano = (reseller: any): Omit<XanoReseller, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: reseller.name,
    email: reseller.email,
    address: reseller.address || '',
    phone: reseller.phone || '',
    password: 'defaultPassword123!',
    latitude: reseller.position[0],
    longitude: reseller.position[1],
    type: reseller.type,
    website: reseller.website || '',
    description: reseller.description || '',
    photo_url: reseller.photo || '',
    coverage_radius: reseller.coverageRadius || 0,
    show_coverage: reseller.showCoverage || false,
    state: reseller.state || '',
    city: reseller.city || ''
  } as any;
};

export const convertXanoToCity = (xanoCity: XanoCity) => {
  return {
    name: xanoCity.name,
    state: xanoCity.state,
    position: [xanoCity.latitude, xanoCity.longitude] as [number, number],
    population: xanoCity.population
  };
};

// Configuration validation
export const validateXanoConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!XANO_CONFIG.enabled) {
    errors.push('XANO integration is disabled');
  }
  
  if (!XANO_CONFIG.instanceName) {
    errors.push('VITE_XANO_INSTANCE_NAME is required');
  }
  
  if (!XANO_CONFIG.workspaceId) {
    errors.push('VITE_XANO_WORKSPACE_ID is required');
  }
  
  if (!XANO_CONFIG.baseUrl) {
    errors.push('VITE_XANO_API_URL is required');
  }
  
  if (!XANO_CONFIG.apiToken) {
    errors.push('XANO_API_TOKEN is required');
  }
  
  return {
    valid: errors.length === 0 && XANO_CONFIG.enabled,
    errors,
    config: XANO_CONFIG
  };
};