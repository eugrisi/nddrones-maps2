export interface Reseller {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  position: [number, number];
  type: 'Sede Principal' | 'Unidade Regional';
  website?: string;
  description?: string;
  photo?: string; // Base64 ou URL da imagem
  coverageRadius?: number; // Raio de cobertura em km
  showCoverage?: boolean; // Se deve mostrar o círculo de cobertura
  coveredCities?: string[]; // Cidades cobertas por esta revenda
}

// Base de dados de cidades importantes do Brasil com coordenadas
export interface CityData {
  name: string;
  state: string;
  position: [number, number];
  population?: number;
}

export const brazilianCities: CityData[] = [
  // São Paulo
  { name: 'São Paulo', state: 'SP', position: [-23.5505, -46.6333], population: 12000000 },
  { name: 'Guarulhos', state: 'SP', position: [-23.4628, -46.5323], population: 1392121 },
  { name: 'Campinas', state: 'SP', position: [-22.9099, -47.0626], population: 1213792 },
  { name: 'São Bernardo do Campo', state: 'SP', position: [-23.6914, -46.5646], population: 844483 },
  { name: 'Santo André', state: 'SP', position: [-23.6539, -46.5311], population: 721368 },
  { name: 'Osasco', state: 'SP', position: [-23.5320, -46.7916], population: 699944 },
  { name: 'São José dos Campos', state: 'SP', position: [-23.2237, -45.9009], population: 729737 },
  { name: 'Ribeirão Preto', state: 'SP', position: [-21.1775, -47.8103], population: 711825 },
  { name: 'Sorocaba', state: 'SP', position: [-23.5015, -47.4526], population: 695328 },
  { name: 'Santos', state: 'SP', position: [-23.9608, -46.3331], population: 433656 },
  { name: 'Monts Azul Paulista', state: 'SP', position: [-20.9467, -49.2958], population: 18000 },

  // Minas Gerais
  { name: 'Belo Horizonte', state: 'MG', position: [-19.9191, -43.9386], population: 2521564 },
  { name: 'Uberlândia', state: 'MG', position: [-18.9113, -48.2622], population: 699097 },
  { name: 'Contagem', state: 'MG', position: [-19.9320, -44.0537], population: 668949 },
  { name: 'Juiz de Fora', state: 'MG', position: [-21.7624, -43.3504], population: 573285 },
  { name: 'Betim', state: 'MG', position: [-19.9681, -44.1987], population: 444784 },
  { name: 'Montes Claros', state: 'MG', position: [-16.7282, -43.8647], population: 413487 },
  { name: 'Uberaba', state: 'MG', position: [-19.7482, -47.9319], population: 340277 },
  { name: 'Governador Valadares', state: 'MG', position: [-18.8512, -41.9495], population: 281046 },
  { name: 'Ipatinga', state: 'MG', position: [-19.4682, -42.5369], population: 267716 },
  { name: 'Sete Lagoas', state: 'MG', position: [-19.4662, -44.2470], population: 245321 },
  { name: 'Divinópolis', state: 'MG', position: [-20.1394, -44.8839], population: 240408 },
  { name: 'Santa Luzia', state: 'MG', position: [-19.7698, -43.8514], population: 230449 },
  { name: 'Ibirité', state: 'MG', position: [-20.0218, -44.0592], population: 182153 },
  { name: 'Poços de Caldas', state: 'MG', position: [-21.7895, -46.5617], population: 168641 },
  { name: 'Patos de Minas', state: 'MG', position: [-18.5833, -46.5167], population: 152488 },
  { name: 'Teófilo Otoni', state: 'MG', position: [-17.8574, -41.5075], population: 140937 },
  { name: 'Barbacena', state: 'MG', position: [-21.2258, -43.7736], population: 136689 },
  { name: 'Sabará', state: 'MG', position: [-19.8838, -43.8057], population: 136347 },
  { name: 'Varginha', state: 'MG', position: [-21.5520, -45.4308], population: 136073 },
  { name: 'Pouso Alegre', state: 'MG', position: [-22.2300, -45.9364], population: 152549 },
  { name: 'Conselheiro Lafaiete', state: 'MG', position: [-20.6598, -43.7858], population: 127592 },
  { name: 'Itabira', state: 'MG', position: [-19.6198, -43.2269], population: 119285 },
  { name: 'Araguari', state: 'MG', position: [-18.6486, -48.1836], population: 117445 },
  { name: 'Passos', state: 'MG', position: [-20.7191, -46.6097], population: 114458 },
  { name: 'Coronel Fabriciano', state: 'MG', position: [-19.5199, -42.6288], population: 110000 },
  { name: 'Muriaé', state: 'MG', position: [-21.1305, -42.3666], population: 108462 },
  { name: 'Ituiutaba', state: 'MG', position: [-18.9682, -49.4647], population: 104671 },
  { name: 'Lavras', state: 'MG', position: [-21.2500, -45.0000], population: 104783 },
  { name: 'Pará de Minas', state: 'MG', position: [-19.8604, -44.6081], population: 93969 },
  { name: 'Itajubá', state: 'MG', position: [-22.4206, -45.4528], population: 97334 },
  { name: 'Paracatu', state: 'MG', position: [-17.2221, -46.8747], population: 92542 },
  { name: 'Janaúba', state: 'MG', position: [-15.8000, -43.3167], population: 71000 },
  { name: 'Unaí', state: 'MG', position: [-16.3667, -46.9000], population: 84269 },
  { name: 'Espera Feliz', state: 'MG', position: [-20.6500, -41.9167], population: 21502 },

  // Estados vizinhos importantes
  { name: 'Rio de Janeiro', state: 'RJ', position: [-22.9068, -43.1729], population: 6748000 },
  { name: 'Brasília', state: 'DF', position: [-15.8267, -47.9218], population: 3055149 },
  { name: 'Goiânia', state: 'GO', position: [-16.6799, -49.2550], population: 1536097 },
  { name: 'Campo Grande', state: 'MS', position: [-20.4697, -54.6201], population: 906092 },
  { name: 'Vitória', state: 'ES', position: [-20.2976, -40.2958], population: 365855 },
];

// Função para calcular distância entre dois pontos (fórmula de Haversine)
export const calculateDistance = (pos1: [number, number], pos2: [number, number]): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
  const dLon = (pos2[1] - pos1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Função para calcular cidades cobertas por uma revenda
export const calculateCoveredCities = (reseller: Reseller): string[] => {
  if (!reseller.coverageRadius) return [];
  
  return brazilianCities
    .filter(city => {
      const distance = calculateDistance(reseller.position, city.position);
      return distance <= reseller.coverageRadius;
    })
    .map(city => `${city.name}, ${city.state}`)
    .sort();
};

// Customização padrão
const defaultCustom = {
  logo: '/logo-h-05.svg',
  homeTitle: 'Localizador de Unidades',
  homeSubtitle: 'Encontre nossa unidade mais próxima',
  btnBuscar: 'Buscar Unidades',
  selectEstado: 'Selecione o estado',
  selectCidade: 'Todas as cidades',
  mapType: 'traditional',
};

const baseResellers = [
  {
    id: 1,
    name: "ND Drones - Monts Azul Paulista (SEDE)",
    address: "Monts Azul Paulista, SP",
    phone: "(11) 99999-9999",
    email: "contato@nddrones.com.br",
    position: [-20.9467, -49.2958] as [number, number],
    type: "Sede Principal" as const,
    website: "https://nddrones.com.br",
    description: "Sede principal da ND Drones",
    coverageRadius: 200,
    showCoverage: true
  },
  {
    id: 2,
    name: "ND Drones - Espera Feliz",
    address: "Espera Feliz, MG",
    phone: "(32) 88888-8888",
    email: "esperafeliz@nddrones.com.br",
    position: [-20.6500, -41.9167] as [number, number],
    type: "Unidade Regional" as const,
    description: "Unidade regional em Espera Feliz",
    coverageRadius: 150,
    showCoverage: false
  },
  {
    id: 3,
    name: "ND Drones - Janaúba",
    address: "Janaúba, MG",
    phone: "(38) 77777-7777",
    email: "janauba@nddrones.com.br",
    position: [-15.8000, -43.3167] as [number, number],
    type: "Unidade Regional" as const,
    description: "Unidade regional em Janaúba",
    coverageRadius: 120,
    showCoverage: false
  },
  {
    id: 4,
    name: "ND Drones - Lavras",
    address: "Lavras, MG",
    phone: "(35) 66666-6666",
    email: "lavras@nddrones.com.br",
    position: [-21.2500, -45.0000] as [number, number],
    type: "Unidade Regional" as const,
    description: "Unidade regional em Lavras",
    coverageRadius: 100,
    showCoverage: false
  },
  {
    id: 5,
    name: "ND Drones - Patos de Minas",
    address: "Patos de Minas, MG",
    phone: "(34) 55555-5555",
    email: "patosdeminas@nddrones.com.br",
    position: [-18.5833, -46.5167] as [number, number],
    type: "Unidade Regional" as const,
    description: "Unidade regional em Patos de Minas",
    coverageRadius: 130,
    showCoverage: false
  },
  {
    id: 6,
    name: "ND Drones - Unaí",
    address: "Unaí, MG",
    phone: "(38) 44444-4444",
    email: "unai@nddrones.com.br",
    position: [-16.3667, -46.9000] as [number, number],
    type: "Unidade Regional" as const,
    description: "Unidade regional em Unaí",
    coverageRadius: 110,
    showCoverage: false
  }
];

export const mockResellers: Reseller[] = baseResellers.map((reseller): Reseller => ({
  ...reseller,
  coveredCities: calculateCoveredCities(reseller)
}));