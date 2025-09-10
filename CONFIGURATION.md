# Configuração do Projeto ND Drones

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# XANO Configuration
VITE_XANO_INSTANCE_NAME=sua-instancia-xano
VITE_XANO_WORKSPACE_ID=123
VITE_XANO_API_TOKEN=sua-chave-api
VITE_XANO_API_URL=https://sua-instancia.xano.io/api:v1
VITE_ENABLE_XANO=true

# App Configuration
VITE_APP_TITLE=ND Drones - Localizador de Unidades
VITE_APP_DESCRIPTION=Sistema de localização das unidades da ND Drones
```

### 2. Configuração do XANO

#### Passo 1: Criar Conta no XANO
1. Acesse https://xano.com e crie uma conta
2. Crie uma nova instância
3. Obtenha as credenciais de acesso

#### Passo 2: Configurar o Backend
1. Siga o guia em XANO_MIGRATION.md
2. Configure as variáveis de ambiente
2. Execute o comando: `CREATE DATABASE nddrones;`
3. Use o banco: `USE nddrones;`

#### Passo 3: Criar Tabela
Execute o seguinte script SQL:

```sql
CREATE TABLE resellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  position_lat DECIMAL(10,8) NOT NULL,
  position_lng DECIMAL(11,8) NOT NULL,
  type VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  description TEXT,
  photo VARCHAR(255),
  coverage_radius INT DEFAULT 50,
  show_coverage BOOLEAN DEFAULT FALSE,
  covered_cities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Passo 4: Inserir Dados Iniciais
```sql
INSERT INTO resellers (name, address, phone, email, position_lat, position_lng, type, website, description) VALUES
('Monts Azul Paulista (SEDE)', 'Rua Principal, 123 - Centro, Monts Azul Paulista - SP', '(17) 3333-1111', 'sede@nddrones.com.br', -20.9467, -49.2958, 'Sede Principal', 'https://nddrones.com.br', 'Sede principal da ND Drones'),
('Espera Feliz', 'Av. Central, 456 - Centro, Espera Feliz - MG', '(33) 3333-2222', 'esperafeliz@nddrones.com.br', -20.6500, -41.9167, 'Unidade Regional', NULL, 'Unidade regional de Espera Feliz'),
('Janaúba', 'Rua Comercial, 789 - Centro, Janaúba - MG', '(38) 3333-3333', 'janauba@nddrones.com.br', -15.8000, -43.3167, 'Unidade Regional', NULL, 'Unidade regional de Janaúba'),
('Lavras', 'Av. Universitária, 321 - Centro, Lavras - MG', '(35) 3333-4444', 'lavras@nddrones.com.br', -21.2500, -45.0000, 'Unidade Regional', NULL, 'Unidade regional de Lavras'),
('Patos de Minas', 'Rua do Comércio, 654 - Centro, Patos de Minas - MG', '(34) 3333-5555', 'patosdeminas@nddrones.com.br', -18.5833, -46.5167, 'Unidade Regional', NULL, 'Unidade regional de Patos de Minas'),
('Unaí', 'Av. Principal, 987 - Centro, Unaí - MG', '(38) 3333-6666', 'unai@nddrones.com.br', -16.3667, -46.9000, 'Unidade Regional', NULL, 'Unidade regional de Unaí');
```

### 3. Estrutura do Banco de Dados

A tabela `resellers` contém os seguintes campos:

| Campo | Tipo | Descrição |
|-------|------|-----------||
| id | INT AUTO_INCREMENT | ID único da unidade |
| name | VARCHAR(255) | Nome da unidade |
| address | VARCHAR(500) | Endereço completo |
| phone | VARCHAR(20) | Telefone de contato |
| email | VARCHAR(255) | Email de contato |
| position_lat | DECIMAL(10,8) | Latitude da localização |
| position_lng | DECIMAL(11,8) | Longitude da localização |
| type | VARCHAR(100) | Tipo da unidade (Sede Principal/Unidade Regional) |
| website | VARCHAR(255) | Website da unidade (opcional) |
| description | TEXT | Descrição da unidade (opcional) |
| photo | VARCHAR(255) | URL da foto da unidade (opcional) |
| coverage_radius | INT | Raio de cobertura em km |
| show_coverage | BOOLEAN | Exibir círculo de cobertura no mapa |
| covered_cities | JSON | Lista de cidades cobertas |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data da última atualização |

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm run preview
```

## 📊 Dados das Unidades

O sistema inclui as seguintes unidades:

1. **Monts Azul Paulista (SEDE)**
   - Tipo: Sede Principal
   - Coordenadas: -20.9467, -49.2958

2. **Espera Feliz**
   - Tipo: Unidade Regional
   - Coordenadas: -20.6500, -41.9167

3. **Janaúba**
   - Tipo: Unidade Regional
   - Coordenadas: -15.8000, -43.3167

4. **Lavras**
   - Tipo: Unidade Regional
   - Coordenadas: -21.2500, -45.0000

5. **Patos de Minas**
   - Tipo: Unidade Regional
   - Coordenadas: -18.5833, -46.5167

6. **Unaí**
   - Tipo: Unidade Regional
   - Coordenadas: -16.3667, -46.9000

## 🔍 Funcionalidades Implementadas

### ✅ Concluído
- [x] Integração com XANO
- [x] Mapa interativo com Leaflet
- [x] Ícones de drone personalizados
- [x] Busca por localização
- [x] Filtros por nome/endereço/tipo
- [x] Interface responsiva
- [x] Loading states
- [x] Tratamento de erros
- [x] Fallback para dados mockados
- [x] Painel administrativo
- [x] Configurações de raio de cobertura
- [x] Toggle de círculos de cobertura

### 🔄 Em Desenvolvimento
- [ ] Autenticação de usuários
- [ ] Adição/edição de unidades via interface
- [ ] Geolocalização do usuário
- [ ] Rotas otimizadas
- [ ] Relatórios e analytics

## 🛠️ Troubleshooting

### Erro de Conexão com XANO
Se o sistema não conseguir conectar ao XANO:
1. Verifique se as credenciais estão corretas
2. Confirme se a instância XANO está ativa
2. Confirme se as credenciais estão corretas no .env.local
3. Verifique se o banco de dados `nddrones` existe
4. Confirme se a tabela `resellers` foi criada
5. O sistema usará dados mockados como fallback

### Problemas com o Mapa
Se o mapa não carregar:
1. Verifique a conexão com a internet
2. Confirme se o Leaflet está instalado
3. Verifique se não há bloqueios de CORS

### Erros de Build
Se houver erros durante o build:
1. Execute `npm install` novamente
2. Limpe o cache: `npm run build -- --force`
3. Verifique se todas as dependências estão instaladas

## 📞 Suporte

Para suporte técnico:
- Email: desenvolvimento@nddrones.com.br
- Telefone: (11) 99999-9999
- Horário: Segunda a Sexta, 8h às 18h