import { useState, useEffect } from 'react';
import { Reseller, calculateDistance, calculateCoveredCities } from '@/types/reseller';
import { xanoAPI, convertXanoToReseller, convertResellerToXano, validateXanoConfig } from '@/lib/xano';

export const useResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResellers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check XANO configuration
      const configValidation = validateXanoConfig();
      
      if (!configValidation.valid) {
        console.warn('XANO not configured:', configValidation.errors);
        // No fallback data - XANO configuration required
        setLoading(false);
        setResellers([]);
        return;
      }

      // Fetch from XANO API
      const xanoResellers = await xanoAPI.getResellers();
      
      // Convert XANO format to app format and calculate covered cities
      const convertedResellers = xanoResellers.map(xanoReseller => {
        const reseller = convertXanoToReseller(xanoReseller);
        return {
          ...reseller,
          coveredCities: calculateCoveredCities(reseller)
        };
      });
      

      
      setResellers(convertedResellers);
    } catch (err) {
      console.error('Erro ao carregar dados do XANO:', err);
      setError('Erro ao carregar dados dos revendedores.');
      // No fallback data available
      setResellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const addReseller = async (reseller: Omit<Reseller, 'id'>) => {
    try {
      const configValidation = validateXanoConfig();
      
      if (!configValidation.valid) {
        // Fallback to local simulation if XANO not configured
        await new Promise(resolve => setTimeout(resolve, 300));
        const newId = Math.max(...resellers.map(r => r.id), 0) + 1;
        const newReseller: Reseller = {
          ...reseller,
          id: newId,
          photo: reseller.photo || '',
          coverageRadius: reseller.coverageRadius || 50,
          showCoverage: reseller.showCoverage || false,
          coveredCities: calculateCoveredCities(reseller as Reseller)
        };
        setResellers(prev => [...prev, newReseller]);
        return;
      }

      // Create via XANO API
      const xanoData = convertResellerToXano(reseller);
      const createdXanoReseller = await xanoAPI.createReseller(xanoData);
      
      // Convert back and add to state
      const newReseller = convertXanoToReseller(createdXanoReseller);
      const resellerWithCities = {
        ...newReseller,
        coveredCities: calculateCoveredCities(newReseller)
      };
      
      setResellers(prev => [...prev, resellerWithCities]);
    } catch (err) {
      console.error('Erro ao adicionar revendedor:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar revendedor');
      throw err;
    }
  };

  const updateReseller = async (id: number, updates: Partial<Reseller>) => {
    try {
      const configValidation = validateXanoConfig();
      
      if (!configValidation.valid) {
        // Fallback to local simulation if XANO not configured
        await new Promise(resolve => setTimeout(resolve, 300));
        setResellers(prev => prev.map(reseller => 
          reseller.id === id 
            ? { ...reseller, ...updates, coveredCities: calculateCoveredCities({ ...reseller, ...updates }) }
            : reseller
        ));
        return;
      }

      // Update via XANO API
      const xanoData = convertResellerToXano(updates);
      const updatedXanoReseller = await xanoAPI.updateReseller(id, xanoData);
      
      // Convert back and update state
      const updatedReseller = convertXanoToReseller(updatedXanoReseller);
      const resellerWithCities = {
        ...updatedReseller,
        coveredCities: calculateCoveredCities(updatedReseller)
      };
      
      setResellers(prev => prev.map(reseller => 
        reseller.id === id ? resellerWithCities : reseller
      ));
    } catch (err) {
      console.error('Erro ao atualizar revendedor:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar revendedor');
      throw err;
    }
  };

  const deleteReseller = async (id: number) => {
    try {
      const configValidation = validateXanoConfig();
      
      if (!configValidation.valid) {
        // Fallback to local simulation if XANO not configured
        await new Promise(resolve => setTimeout(resolve, 300));
        setResellers(prev => prev.filter(reseller => reseller.id !== id));
        return;
      }

      // Delete via XANO API
      await xanoAPI.deleteReseller(id);
      
      // Update state
      setResellers(prev => prev.filter(reseller => reseller.id !== id));
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