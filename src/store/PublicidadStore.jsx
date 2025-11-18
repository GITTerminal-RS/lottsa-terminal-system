import { create } from "zustand";
import { 
  obtenerPublicidad, 
  insertarPublicidad, 
  actualizarPublicidad, 
  eliminarPublicidad 
} from "../supabase/crudPublicidad";

export const usePublicidadStore = create((set, get) => ({
  datapublicidad: [],
  isLoading: false,
  error: null,
  buscador: "",

  // Cargar todas las publicidades
  cargarPublicidad: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await obtenerPublicidad();
      set({ datapublicidad: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error al cargar publicidad:", error);
      return [];
    }
  },

  // Insertar nueva publicidad
  insertarPublicidad: async (nuevaPublicidad) => {
    try {
      set({ isLoading: true, error: null });
      const data = await insertarPublicidad(nuevaPublicidad);
      if (data) {
        set((state) => ({
          datapublicidad: [data, ...state.datapublicidad],
          isLoading: false
        }));
      }
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error al insertar publicidad:", error);
      return null;
    }
  },

  // Actualizar publicidad existente
  actualizarPublicidad: async (publicidadActualizada) => {
    try {
      set({ isLoading: true, error: null });
      const data = await actualizarPublicidad(publicidadActualizada);
      if (data) {
        set((state) => ({
          datapublicidad: state.datapublicidad.map(item =>
            item.id === data.id ? data : item
          ),
          isLoading: false
        }));
      }
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error al actualizar publicidad:", error);
      return null;
    }
  },

  // Eliminar publicidad
  eliminarPublicidad: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const success = await eliminarPublicidad(id);
      if (success) {
        set((state) => ({
          datapublicidad: state.datapublicidad.filter(item => item.id !== id),
          isLoading: false
        }));
      }
      return success;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error al eliminar publicidad:", error);
      return false;
    }
  },

  // Limpiar estado
  limpiarPublicidad: () => {
    set({ datapublicidad: [], isLoading: false, error: null });
  },

  // Setear buscador
  setBuscador: (valor) => {
    set({ buscador: valor });
  }
}));
