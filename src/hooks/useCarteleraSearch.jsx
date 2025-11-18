import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerCartelera } from '../supabase/crudCartelera';
import { supabase } from '../index';

// 🔍 Hook para búsqueda optimizada con debounce
export const useCarteleraSearch = (searchTerm = "", debounceMs = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // 🚀 Query principal de cartelera
  const { 
    data: carteleraCompleta = [], 
    isLoading: isLoadingCartelera,
    error: carteleraError 
  } = useQuery({
    queryKey: ['cartelera-base'],
    queryFn: obtenerCartelera,
    staleTime: 5 * 60 * 1000, // 5 min
    cacheTime: 10 * 60 * 1000, // 10 min
    retry: 2,
    refetchOnWindowFocus: true,
  });

  // 🔍 Query de búsqueda con RPC
  const { 
    data: resultadosBusqueda = [], 
    isLoading: isSearching,
    error: searchError 
  } = useQuery({
    queryKey: ['cartelera-search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm?.trim()) return null;
      
      const { data, error } = await supabase.rpc('buscarcartelera', { 
        termino: debouncedSearchTerm.trim() 
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!debouncedSearchTerm?.trim(),
    staleTime: 2 * 60 * 1000, // 2 min para búsquedas
    cacheTime: 5 * 60 * 1000, // 5 min cache de búsquedas
    retry: 1,
  });

  // 📊 Datos finales combinados
  const datacartelera = useMemo(() => {
    if (debouncedSearchTerm?.trim()) {
      return resultadosBusqueda || [];
    }
    return carteleraCompleta || [];
  }, [debouncedSearchTerm, resultadosBusqueda, carteleraCompleta]);

  // 📈 Estados combinados
  const isLoading = isLoadingCartelera || (debouncedSearchTerm?.trim() && isSearching);
  const error = carteleraError || searchError;

  // 🔥 Stats para debugging/optimización
  const searchStats = useMemo(() => ({
    isSearchActive: !!debouncedSearchTerm?.trim(),
    hasResults: datacartelera.length > 0,
    totalResults: datacartelera.length,
    isDebouncing: searchTerm !== debouncedSearchTerm,
    searchTerm: debouncedSearchTerm,
  }), [debouncedSearchTerm, datacartelera.length, searchTerm]);

  return {
    // Datos principales
    datacartelera,
    isLoading,
    error,
    
    // Estados de búsqueda
    searchTerm: debouncedSearchTerm,
    isSearching: isSearching && !!debouncedSearchTerm?.trim(),
    isDebouncing: searchTerm !== debouncedSearchTerm,
    
    // Estadísticas
    searchStats,
    
    // Datos raw para casos especiales
    carteleraCompleta,
    resultadosBusqueda,
  };
}; 