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
  state?: string; // Estado da unidade
  city?: string; // Cidade da unidade
  coveredCities?: string[]; // Cidades cobertas por esta revenda
}

// Base de dados de cidades importantes do Brasil com coordenadas
export interface CityData {
  name: string;
  state: string;
  position: [number, number];
  population?: number;
}

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

// Base de cidades brasileiras para cálculo de cobertura
const brazilianCities: CityData[] = [
  // Capitais e grandes cidades
  { name: 'São Paulo', state: 'SP', position: [-23.5505, -46.6333], population: 12396372 },
  { name: 'Rio de Janeiro', state: 'RJ', position: [-22.9068, -43.1729], population: 6747815 },
  { name: 'Belo Horizonte', state: 'MG', position: [-19.9167, -43.9345], population: 2521564 },
  { name: 'Salvador', state: 'BA', position: [-12.9714, -38.5014], population: 2886698 },
  { name: 'Brasília', state: 'DF', position: [-15.7939, -47.8828], population: 3094325 },
  { name: 'Fortaleza', state: 'CE', position: [-3.7319, -38.5267], population: 2703391 },
  { name: 'Manaus', state: 'AM', position: [-3.1190, -60.0217], population: 2255903 },
  { name: 'Curitiba', state: 'PR', position: [-25.4284, -49.2733], population: 1963726 },
  { name: 'Recife', state: 'PE', position: [-8.0476, -34.8770], population: 1653461 },
  { name: 'Porto Alegre', state: 'RS', position: [-30.0346, -51.2177], population: 1492530 },
  { name: 'Belém', state: 'PA', position: [-1.4558, -48.5044], population: 1499641 },
  { name: 'Goiânia', state: 'GO', position: [-16.6869, -49.2648], population: 1555626 },
  { name: 'Guarulhos', state: 'SP', position: [-23.4538, -46.5333], population: 1392121 },
  { name: 'Campinas', state: 'SP', position: [-22.9099, -47.0626], population: 1223237 },
  
  // Cidades de Minas Gerais
  { name: 'Uberlândia', state: 'MG', position: [-18.9113, -48.2622], population: 699097 },
  { name: 'Contagem', state: 'MG', position: [-19.9317, -44.0536], population: 668949 },
  { name: 'Juiz de Fora', state: 'MG', position: [-21.7642, -43.3467], population: 573285 },
  { name: 'Betim', state: 'MG', position: [-19.9678, -44.1989], population: 444784 },
  { name: 'Montes Claros', state: 'MG', position: [-16.7285, -43.8647], population: 413487 },
  { name: 'Ribeirão das Neves', state: 'MG', position: [-19.7667, -44.0833], population: 334858 },
  { name: 'Uberaba', state: 'MG', position: [-19.7417, -47.9319], population: 337092 },
  { name: 'Governador Valadares', state: 'MG', position: [-18.8511, -41.9494], population: 281046 },
  { name: 'Ipatinga', state: 'MG', position: [-19.4683, -42.5369], population: 267333 },
  { name: 'Sete Lagoas', state: 'MG', position: [-19.4658, -44.2467], population: 243132 },
  { name: 'Divinópolis', state: 'MG', position: [-20.1386, -44.8839], population: 240408 },
  { name: 'Santa Luzia', state: 'MG', position: [-19.7697, -43.8514], population: 218897 },
  { name: 'Ibirité', state: 'MG', position: [-20.0219, -44.0581], population: 182153 },
  { name: 'Poços de Caldas', state: 'MG', position: [-21.7878, -46.5614], population: 168641 },
  { name: 'Patos de Minas', state: 'MG', position: [-18.5789, -46.5181], population: 152488 },
  { name: 'Pouso Alegre', state: 'MG', position: [-22.2300, -45.9364], population: 152549 },
  { name: 'Teófilo Otoni', state: 'MG', position: [-17.8594, -41.5053], population: 140937 },
  { name: 'Barbacena', state: 'MG', position: [-21.2258, -43.7736], population: 136689 },
  { name: 'Sabará', state: 'MG', position: [-19.8833, -43.8056], population: 134720 },
  { name: 'Varginha', state: 'MG', position: [-21.5519, -45.4306], population: 134477 },
  { name: 'Conselheiro Lafaiete', state: 'MG', position: [-20.6597, -43.7856], population: 127592 },
  { name: 'Araguari', state: 'MG', position: [-18.6472, -48.1886], population: 117445 },
  { name: 'Ituiutaba', state: 'MG', position: [-18.9681, -49.4653], population: 104671 },
  { name: 'Passos', state: 'MG', position: [-20.7189, -46.6097], population: 114334 },
  { name: 'Coronel Fabriciano', state: 'MG', position: [-19.5181, -42.6289], population: 110047 },
  { name: 'Muriaé', state: 'MG', position: [-21.1306, -42.3664], population: 108464 },
  { name: 'Boa Esperança', state: 'MG', position: [-21.0953, -45.5653], population: 40031 },
  { name: 'Lavras', state: 'MG', position: [-21.2453, -45.0000], population: 104783 },
  { name: 'Itajubá', state: 'MG', position: [-22.4206, -45.4528], population: 97334 },
  { name: 'Pará de Minas', state: 'MG', position: [-19.8608, -44.6089], population: 94076 },
  { name: 'Paracatu', state: 'MG', position: [-17.2222, -46.8750], population: 92718 },
  { name: 'Unaí', state: 'MG', position: [-16.3578, -46.9061], population: 84269 },
  { name: 'João Monlevade', state: 'MG', position: [-19.8097, -43.1719], population: 80452 },
  { name: 'Três Corações', state: 'MG', position: [-21.6889, -45.2528], population: 78913 },
  { name: 'Janaúba', state: 'MG', position: [-15.8014, -43.3089], population: 70738 },
  { name: 'São João del Rei', state: 'MG', position: [-21.1364, -44.2606], population: 90082 },
  { name: 'Leopoldina', state: 'MG', position: [-21.5306, -42.6431], population: 52635 },
  { name: 'Espera Feliz', state: 'MG', position: [-20.6553, -41.9072], population: 21830 },
  
  // Cidades de São Paulo
  { name: 'Santo André', state: 'SP', position: [-23.6633, -46.5306], population: 721368 },
  { name: 'Osasco', state: 'SP', position: [-23.5325, -46.7917], population: 696382 },
  { name: 'São Bernardo do Campo', state: 'SP', position: [-23.6939, -46.5650], population: 844483 },
  { name: 'Sorocaba', state: 'SP', position: [-23.5015, -47.4526], population: 687357 },
  { name: 'Ribeirão Preto', state: 'SP', position: [-21.1775, -47.8103], population: 703293 },
  { name: 'Santos', state: 'SP', position: [-23.9608, -46.3331], population: 433656 },
  { name: 'Mauá', state: 'SP', position: [-23.6678, -46.4611], population: 477552 },
  { name: 'São José dos Campos', state: 'SP', position: [-23.2237, -45.9009], population: 729737 },
  { name: 'Mogi das Cruzes', state: 'SP', position: [-23.5228, -46.1881], population: 450785 },
  { name: 'Diadema', state: 'SP', position: [-23.6861, -46.6228], population: 426757 },
  { name: 'Jundiaí', state: 'SP', position: [-23.1864, -46.8842], population: 423006 },
  { name: 'Carapicuíba', state: 'SP', position: [-23.5225, -46.8356], population: 396587 },
  { name: 'Piracicaba', state: 'SP', position: [-22.7253, -47.6492], population: 407252 },
  { name: 'Bauru', state: 'SP', position: [-22.3147, -49.0608], population: 379297 },
  { name: 'São Vicente', state: 'SP', position: [-23.9628, -46.3917], population: 365798 },
  { name: 'Petrópolis', state: 'SP', position: [-23.5181, -46.7889], population: 346114 },
  { name: 'Canoas', state: 'SP', position: [-23.5181, -46.7889], population: 346114 },
  { name: 'Franca', state: 'SP', position: [-20.5386, -47.4006], population: 358539 },
  { name: 'São José do Rio Preto', state: 'SP', position: [-20.8197, -49.3794], population: 460138 },
  { name: 'Presidente Prudente', state: 'SP', position: [-22.1256, -51.3889], population: 230371 },
  { name: 'Araraquara', state: 'SP', position: [-21.7947, -48.1756], population: 238339 },
  { name: 'Americana', state: 'SP', position: [-22.7394, -47.3314], population: 229322 },
  { name: 'Jacareí', state: 'SP', position: [-23.3053, -45.9658], population: 235416 },
  { name: 'Indaiatuba', state: 'SP', position: [-23.0922, -47.2181], population: 256223 },
  { name: 'Itu', state: 'SP', position: [-23.2642, -47.2989], population: 175568 },
  { name: 'Marília', state: 'SP', position: [-22.2139, -49.9456], population: 240590 },
  { name: 'São Carlos', state: 'SP', position: [-22.0175, -47.8908], population: 254484 },
  { name: 'Sumaré', state: 'SP', position: [-22.8219, -47.2669], population: 286211 },
  { name: 'Barueri', state: 'SP', position: [-23.5106, -46.8761], population: 276982 },
  { name: 'Taubaté', state: 'SP', position: [-23.0264, -45.5553], population: 317915 },
  { name: 'Embu das Artes', state: 'SP', position: [-23.6489, -46.8522], population: 271028 },
  { name: 'Taboão da Serra', state: 'SP', position: [-23.6089, -46.7581], population: 281022 },
  { name: 'Suzano', state: 'SP', position: [-23.5425, -46.3106], population: 300559 },
  { name: 'Guarujá', state: 'SP', position: [-23.9931, -46.2564], population: 320459 },
  { name: 'Monte Azul Paulista', state: 'SP', position: [-20.9069, -48.6431], population: 19742 }
];

// Função para calcular cidades cobertas por um revendedor
export const calculateCoveredCities = (reseller: Reseller): string[] => {
  if (!reseller.coverageRadius || reseller.coverageRadius <= 0) {
    return [];
  }

  return brazilianCities
    .filter(city => {
      const distance = calculateDistance(reseller.position, city.position);
      return distance <= reseller.coverageRadius;
    })
    .map(city => `${city.name} - ${city.state}`);
};