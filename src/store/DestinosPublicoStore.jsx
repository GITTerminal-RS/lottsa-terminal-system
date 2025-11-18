import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useDestinosPublicoStore = create((set) => ({
  buscarDestinosAutocomplete: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc("buscar_destinos_autocomplete_publicos", {
        buscador: searchTerm
      });

      if (error) {
        console.error("Error en buscarDestinosAutocomplete:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error al buscar destinos para autocompletado:", error);
      return [];
    }
  },

  buscarDestinosYOperadoras: async (searchTerm) => {
    try {
      const { data, error } = await supabase.rpc("buscar_destinos_y_operadoras", { 
        _search_term: searchTerm 
      });

      if (error) {
        console.error("Error en buscarDestinosYOperadoras:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error al buscar destinos y operadoras:", error);
      return [];
    }
  },

  buscarDestinosPorOperadora: async (operadoraId, descripcion, tipoBusqueda = 'destino') => {
    try {
      if (!operadoraId) {
        throw new Error("Se requiere el ID de la operadora");
      }

      console.log("Buscando destinos por operadora:", { operadoraId, descripcion, tipoBusqueda });

      const { data, error } = await supabase.rpc('buscar_destinos_por_operadora', {
        p_operadora_id: operadoraId,
        p_descripcion: descripcion || '',
        p_tipo_busqueda: tipoBusqueda
      });

      if (error) {
        console.error("Error en buscarDestinosPorOperadora:", error);
        throw error;
      }

      console.log("Destinos encontrados:", data);
      return data || [];
    } catch (error) {
      console.error("Error al buscar destinos por operadora:", error);
      throw error;
    }
  },

  buscarHorariosPorDestino: async (destinoId, operadoraId) => {
    try {
      if (!destinoId || !operadoraId) {
        throw new Error("Se requieren tanto el ID del destino como el ID de la operadora");
      }

      console.log("Buscando horarios por destino:", { destinoId, operadoraId });

      const { data, error } = await supabase.rpc('buscar_horarios_por_destino', {
        p_destino_id: destinoId,
        p_operadora_id: operadoraId
      });

      if (error) {
        console.error("Error en buscarHorariosPorDestino:", error);
        throw error;
      }

      console.log("Horarios encontrados:", data);
      return data || [];
    } catch (error) {
      console.error("Error al buscar horarios por destino:", error);
      throw error;
    }
  },

  buscarHorariosRutasPrecios: async (destinoId, operadoraId) => {
    try {
      if (!destinoId || !operadoraId) {
        console.error("Faltan parámetros requeridos:", { destinoId, operadoraId });
        throw new Error("Se requieren tanto el ID del destino como el ID de la operadora");
      }

      const { data, error } = await supabase
        .rpc('buscar_horarios_rutas_precios', {
          p_destino_id: parseInt(destinoId),
          p_operadora_id: parseInt(operadoraId)
        });

      if (error) {
        console.error("Error en la llamada RPC:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error al buscar horarios:", error);
      throw error;
    }
  },
})); 