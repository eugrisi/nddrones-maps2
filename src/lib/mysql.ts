// MySQL configuration types and interfaces for frontend use
// Note: This file should not import mysql2 directly to avoid browser compatibility issues

// Interface para Unit
export interface Unit {
  id: number;
  name: string;
  description?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  latitude: number;
  longitude: number;
  coverage_radius?: number;
  show_coverage_circle?: boolean;
  website?: string;
  photo_url?: string;
  type: string;
  created_at?: Date;
  updated_at?: Date;
}

// Configuração do MySQL
export interface MySQLConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
}

const defaultConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'drone_network',
  ssl: false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Frontend configuration and types only
// Backend MySQL functions should be implemented in a separate API layer

// Export configuration for use in settings
export { defaultConfig };

// Helper function to validate MySQL configuration
export const validateMySQLConfig = (config: MySQLConfig): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config.host || config.host.trim() === '') {
        errors.push('Host é obrigatório');
    }
    
    if (!config.port || config.port < 1 || config.port > 65535) {
        errors.push('Porta deve estar entre 1 e 65535');
    }
    
    if (!config.user || config.user.trim() === '') {
        errors.push('Usuário é obrigatório');
    }
    
    if (!config.database || config.database.trim() === '') {
        errors.push('Nome do banco de dados é obrigatório');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

// Mock functions for frontend testing (replace with actual API calls)
export const mockTestConnection = async (config: MySQLConfig): Promise<{ success: boolean; message: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validation = validateMySQLConfig(config);
    if (!validation.valid) {
        return {
            success: false,
            message: `Erro de configuração: ${validation.errors.join(', ')}`
        };
    }
    
    // Mock successful connection for demo
    return {
        success: true,
        message: 'Conexão simulada estabelecida com sucesso! (Modo de demonstração)'
    };
};

// Funções específicas para o sistema de drones
export const droneQueries = {
  // Buscar todas as unidades
  getAllUnits: async () => {
    const query = `
      SELECT id, name, description, contact_whatsapp, contact_email, contact_phone,
             latitude, longitude, coverage_radius, show_coverage_circle, 
             created_at, updated_at
      FROM units 
      ORDER BY name
    `;
    return executeQuery(query);
  },

  // Criar nova unidade
  createUnit: async (unit: Omit<Unit, 'id'>) => {
    const query = `
      INSERT INTO units (name, description, contact_whatsapp, contact_email, contact_phone,
                        latitude, longitude, coverage_radius, show_coverage_circle)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      unit.name, unit.description, unit.contact_whatsapp, unit.contact_email,
      unit.contact_phone, unit.latitude, unit.longitude, unit.coverage_radius,
      unit.show_coverage_circle
    ];
    return executeQuery(query, params);
  },

  // Atualizar unidade
  updateUnit: async (id: number, unit: Partial<Unit>) => {
    const query = `
      UPDATE units 
      SET name = ?, description = ?, contact_whatsapp = ?, contact_email = ?, 
          contact_phone = ?, latitude = ?, longitude = ?, coverage_radius = ?, 
          show_coverage_circle = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const params = [
      unit.name, unit.description, unit.contact_whatsapp, unit.contact_email,
      unit.contact_phone, unit.latitude, unit.longitude, unit.coverage_radius,
      unit.show_coverage_circle, id
    ];
    return executeQuery(query, params);
  },

  // Deletar unidade
  deleteUnit: async (id: number) => {
    const query = 'DELETE FROM units WHERE id = ?';
    return executeQuery(query, [id]);
  },

  // Buscar configurações do sistema
  getSettings: async () => {
    const query = 'SELECT * FROM settings ORDER BY category, setting_key';
    return executeQuery(query);
  },

  // Atualizar configuração
  updateSetting: async (key: string, value: string, category: string = 'general') => {
    const query = `
      INSERT INTO settings (setting_key, setting_value, category, updated_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value), 
      updated_at = NOW()
    `;
    return executeQuery(query, [key, value, category]);
  }
};