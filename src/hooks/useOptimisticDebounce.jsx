import { useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 🚀 Hook para debounce optimista - "modificar mientras escribes"
export const useOptimisticDebounce = (
  mutationFn, 
  queryKey, 
  options = {}
) => {
  const {
    delay = 700,
    onSuccess,
    onError,
    showToastOnSuccess = false,
    showToastOnError = true,
  } = options;

  const debounceRef = useRef();
  const queryClient = useQueryClient();

  // 🚀 Mutación optimista con debounce
  const mutation = useMutation({
    mutationFn,
    onMutate: async (newData) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries(queryKey);
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(queryKey);
      
      // 🔥 Update optimístico INSTANTÁNEO
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...newData
        };
      });
      
      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // Actualizar cache con datos reales del servidor
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        ...variables
      }));
      
      if (showToastOnSuccess && onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      if (showToastOnError && onError) {
        onError(error, variables, context);
      }
    }
  });

  // 🔥 Función debounced optimista
  const debouncedMutation = useCallback((data) => {
    // Update inmediato en UI (optimista)
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        ...data
      };
    });

    // Debounce para el servidor
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      mutation.mutate(data);
    }, delay);
  }, [mutation, delay, queryClient, queryKey]);

  // 🛑 Cancelar debounce pendiente
  const cancelDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // 🔄 Flush inmediato (guardar ahora)
  const flushDebounce = useCallback((data) => {
    cancelDebounce();
    if (data) {
      mutation.mutate(data);
    }
  }, [mutation, cancelDebounce]);

  return {
    // Función principal optimista
    debouncedMutation,
    
    // Utilidades de control
    cancelDebounce,
    flushDebounce,
    
    // Estados de la mutación
    isLoading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    
    // Para debugging
    isPending: !!debounceRef.current,
  };
}; 