import { useState, useEffect } from 'react';
import { Reseller, mockResellers } from '@/data/mockData';

export const useResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResellers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data (in production, this would be an API call to backend with MySQL)
      setResellers(mockResellers);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados dos revendedores');
      setResellers(mockResellers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const addReseller = async (reseller: Omit<Reseller, 'id'>) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate new ID
      const newId = Math.max(...resellers.map(r => r.id), 0) + 1;
      
      // Create new reseller object
      const newReseller: Reseller = {
        ...reseller,
        id: newId,
        photo: reseller.photo || '',
        coverageRadius: reseller.coverageRadius || 50,
        showCoverage: reseller.showCoverage || false,
        coveredCities: reseller.coveredCities || []
      };
      
      setResellers(prev => [...prev, newReseller]);
    } catch (err) {
      console.error('Erro ao adicionar revendedor:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar revendedor');
      throw err;
    }
  };

  const updateReseller = async (id: number, updates: Partial<Reseller>) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update local state
      setResellers(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (err) {
      console.error('Erro ao atualizar revendedor:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar revendedor');
      throw err;
    }
  };

  const deleteReseller = async (id: number) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setResellers(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Erro ao deletar revendedor:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar revendedor');
      throw err;
    }
  };

  return {
    resellers,
    loading,
    error,
    fetchResellers,
    addReseller,
    updateReseller,
    deleteReseller,
  };
};