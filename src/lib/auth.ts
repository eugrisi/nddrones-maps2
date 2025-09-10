// Sistema de autenticação para ND Drones
// Configuração de usuários e senhas

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Base de usuários do sistema
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'nddrones2024',
    role: 'admin',
    name: 'Administrador Principal',
    email: 'admin@nddrones.com.br',
    active: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'gerente',
    password: 'nd@gerente123',
    role: 'manager',
    name: 'Gerente Operacional',
    email: 'gerente@nddrones.com.br',
    active: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    username: 'operador',
    password: 'nd@operador456',
    role: 'operator',
    name: 'Operador do Sistema',
    email: 'operador@nddrones.com.br',
    active: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    username: 'suporte',
    password: 'nd@suporte789',
    role: 'operator',
    name: 'Suporte Técnico',
    email: 'suporte@nddrones.com.br',
    active: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Função para autenticar usuário
export const authenticateUser = (username: string, password: string): User | null => {
  const user = users.find(u => 
    u.username === username && 
    u.password === password && 
    u.active
  );
  
  if (user) {
    // Atualizar último login (em um sistema real, isso seria salvo no banco)
    user.lastLogin = new Date().toISOString();
    return user;
  }
  
  return null;
};

// Função para verificar se usuário está autenticado
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Função para obter usuário atual
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

// Função para fazer login
export const login = (username: string, password: string): { success: boolean; user?: User; error?: string } => {
  const user = authenticateUser(username, password);
  
  if (user) {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
  }
  
  return { success: false, error: 'Usuário ou senha incorretos' };
};

// Função para fazer logout
export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
};

// Função para verificar permissões
export const hasPermission = (requiredRole: 'admin' | 'manager' | 'operator'): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy = {
    'admin': 3,
    'manager': 2,
    'operator': 1
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

// Função para adicionar novo usuário (apenas admin)
export const addUser = (newUser: Omit<User, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
  const currentUser = getCurrentUser();
  
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem adicionar usuários' };
  }
  
  // Verificar se username já existe
  if (users.find(u => u.username === newUser.username)) {
    return { success: false, error: 'Nome de usuário já existe' };
  }
  
  const user: User = {
    ...newUser,
    id: (users.length + 1).toString(),
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  return { success: true };
};

// Função para listar usuários (apenas admin e manager)
export const getUsers = (): User[] => {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !hasPermission('manager')) {
    return [];
  }
  
  return users.filter(u => u.active);
};

// Função para desativar usuário (apenas admin)
export const deactivateUser = (userId: string): { success: boolean; error?: string } => {
  const currentUser = getCurrentUser();
  
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem desativar usuários' };
  }
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, error: 'Usuário não encontrado' };
  }
  
  user.active = false;
  return { success: true };
};

// Função para alterar senha
export const changePassword = (oldPassword: string, newPassword: string): { success: boolean; error?: string } => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, error: 'Usuário não autenticado' };
  }
  
  const user = users.find(u => u.id === currentUser.id);
  if (!user || user.password !== oldPassword) {
    return { success: false, error: 'Senha atual incorreta' };
  }
  
  user.password = newPassword;
  localStorage.setItem('currentUser', JSON.stringify(user));
  return { success: true };
};