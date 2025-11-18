import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerCartelera, insertarCartelera, editarCartelera, eliminarCartelera } from '../supabase/crudCartelera';
import { supabase } from '../index';
import toast from 'react-hot-toast';

export const useCarteleraQuery = () => {
  const [buscador, setBuscador] = useState("");
  const queryClient = useQueryClient();

  // 🚀 TanStack Query: Cargar cartelera con búsqueda
  const { 
    data: datacartelera = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['cartelera', buscador],
    queryFn: async () => {
      const termino = buscador?.trim();
      if (termino && termino !== "") {
        const { data: dataBuscada, error } = await supabase.rpc('buscarcartelera', { termino });
        if (error) throw error;
        return dataBuscada || [];
      } else {
        return await obtenerCartelera();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 min - cartelera cambia frecuentemente
    cacheTime: 10 * 60 * 1000, // 10 min - cache moderado
    retry: 2,
    refetchOnWindowFocus: true,
    // 🔍 Refetch cuando cambia el término de búsqueda
    enabled: true,
  });

  // 🚀 TanStack Query: Mutación para insertar cartelera
  const insertarMutation = useMutation({
    mutationFn: insertarCartelera,
    onMutate: async (nuevaCartelera) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries(['cartelera']);
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(['cartelera', buscador]);
      
      // Update optimístico
      queryClient.setQueryData(['cartelera', buscador], (old = []) => [
        ...old,
        { 
          id: `temp-${Date.now()}`, // ID temporal
          ...nuevaCartelera,
        }
      ]);
      
      return { previousData };
    },
    onSuccess: (data, variables) => {
      // Invalidar cache para refrescar con datos reales del servidor
      queryClient.invalidateQueries(['cartelera']);
      toast.success('Cartelera agregada exitosamente');
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['cartelera', buscador], context.previousData);
      }
      toast.error('Error al agregar cartelera: ' + error.message);
    }
  });

  // 🚀 TanStack Query: Mutación para editar cartelera
  const editarMutation = useMutation({
    mutationFn: ({ id, data }) => editarCartelera(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['cartelera']);
      
      const previousData = queryClient.getQueryData(['cartelera', buscador]);
      
      // Update optimístico
      queryClient.setQueryData(['cartelera', buscador], (old = []) =>
        old.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cartelera']);
      toast.success('Cartelera actualizada exitosamente');
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['cartelera', buscador], context.previousData);
      }
      toast.error('Error al actualizar cartelera: ' + error.message);
    }
  });

  // 🚀 TanStack Query: Mutación para eliminar cartelera
  const eliminarMutation = useMutation({
    mutationFn: eliminarCartelera,
    onMutate: async (id) => {
      await queryClient.cancelQueries(['cartelera']);
      
      const previousData = queryClient.getQueryData(['cartelera', buscador]);
      
      // Update optimístico
      queryClient.setQueryData(['cartelera', buscador], (old = []) =>
        old.filter(item => item.id !== id)
      );
      
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cartelera']);
      toast.success('Cartelera eliminada exitosamente');
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['cartelera', buscador], context.previousData);
      }
      toast.error('Error al eliminar cartelera: ' + error.message);
    }
  });

  // 🔄 Función para recargar cartelera (compatibilidad con código existente)
  const cargarCartelera = () => refetch();

  return {
    // Datos
    datacartelera,
    isLoading,
    error,
    
    // Búsqueda
    buscador,
    setBuscador,
    
    // Operaciones CRUD
    insertarCartelera: insertarMutation.mutate,
    editarCartelera: (id, data) => editarMutation.mutate({ id, data }),
    eliminarCartelera: eliminarMutation.mutate,
    cargarCartelera,
    
    // Estados de las mutaciones
    isInserting: insertarMutation.isLoading,
    isEditing: editarMutation.isLoading,
    isDeleting: eliminarMutation.isLoading,
    
    // Errores de mutaciones
    insertError: insertarMutation.error,
    editError: editarMutation.error,
    deleteError: eliminarMutation.error,
  };
}; 