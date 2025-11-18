import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MostrarOperadora, 
  ContarUsuariosXoperadora, 
  obtenerOperadoraPorAdmin, 
  actualizarOperadora 
} from '../index';
import { supabase } from '../index';
import toast from 'react-hot-toast';

export const useOperadoraQuery = () => {
  const queryClient = useQueryClient();

  // 🚀 TanStack Query: Cargar datos de operadora
  const { 
    data: dataoperadora = null, 
    isLoading: loadingOperadora, 
    error: errorOperadora,
    refetch: refetchOperadora 
  } = useQuery({
    queryKey: ['operadora-data'],
    queryFn: async () => {
      // Aquí asumo que hay una lógica para obtener el ID del usuario actual
      // Si tienes una forma específica de obtener estos datos, ajústala
      return null; // Placeholder - necesitas implementar la lógica específica
    },
    staleTime: 10 * 60 * 1000, // 10 min - datos de operadora
    cacheTime: 20 * 60 * 1000, // 20 min - cache extendido
    retry: 2,
    refetchOnWindowFocus: true,
    enabled: false, // Se habilitará cuando se necesite
  });

  // 🚀 TanStack Query: Contador de usuarios por operadora
  const { 
    data: contadorusuarios = 0,
    isLoading: loadingContador 
  } = useQuery({
    queryKey: ['contador-usuarios', dataoperadora?.id],
    queryFn: () => ContarUsuariosXoperadora({ id_operadora: dataoperadora.id }),
    enabled: !!dataoperadora?.id,
    staleTime: 5 * 60 * 1000, // 5 min - contador dinámico
    cacheTime: 10 * 60 * 1000, // 10 min
    retry: 1,
  });

  // 🚀 TanStack Query: Mutación optimista para actualizar operadora
  const actualizarMutation = useMutation({
    mutationFn: actualizarOperadora,
    onMutate: async (nuevosData) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries(['operadora-data']);
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(['operadora-data']);
      
      // 🔥 Update optimístico INSTANTÁNEO - "modificar mientras escribes"
      queryClient.setQueryData(['operadora-data'], (old) => {
        if (!old) return old;
        return {
          ...old,
          ...nuevosData
        };
      });
      
      return { previousData };
    },
    onSuccess: (data, variables) => {
      // Actualizar cache con datos del servidor
      queryClient.setQueryData(['operadora-data'], (old) => ({
        ...old,
        ...variables
      }));
      
      // NO mostrar toast para updates automáticos (evitar spam)
      // toast.success('Operadora actualizada');
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['operadora-data'], context.previousData);
      }
      toast.error('Error al actualizar: ' + error.message);
    }
  });

  // 🚀 Función optimizada para "modificar mientras escribes"
  const actualizarOperadoraOptimista = (datos) => {
    // Update inmediato sin await - UI se actualiza al instante
    actualizarMutation.mutate(datos);
  };

  // 🔄 Funciones de compatibilidad con código existente
  const mostrarOperadora = async (params) => {
    try {
      const response = await MostrarOperadora(params);
      if (response?.operadora) {
        queryClient.setQueryData(['operadora-data'], response.operadora);
        return response.operadora;
      }
      return null;
    } catch (error) {
      console.error('Error en mostrarOperadora:', error);
      return null;
    }
  };

  const obtenerOperadoraPorAdminQuery = async (idAdmin) => {
    try {
      const response = await obtenerOperadoraPorAdmin(idAdmin);
      if (response) {
        queryClient.setQueryData(['operadora-data'], response);
      }
      return response;
    } catch (error) {
      console.error('Error en obtenerOperadoraPorAdmin:', error);
      return null;
    }
  };

  const tieneOperadoraValida = () => {
    return Boolean(dataoperadora?.id);
  };

  return {
    // Datos principales
    dataoperadora,
    contadorusuarios,
    
    // Estados de loading
    loadingOperadora,
    loadingContador,
    isUpdating: actualizarMutation.isLoading,
    
    // Errores
    errorOperadora,
    updateError: actualizarMutation.error,
    
    // Operaciones optimizadas
    actualizarOperadora: actualizarOperadoraOptimista, // 🔥 OPTIMISTA
    
    // Operaciones de compatibilidad
    mostrarOperadora,
    obtenerOperadoraPorAdmin: obtenerOperadoraPorAdminQuery,
    refetchOperadora,
    tieneOperadoraValida,
    
    // Utilidades
    queryClient, // Para operaciones avanzadas
  };
}; 