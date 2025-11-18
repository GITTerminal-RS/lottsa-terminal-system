import { create } from "zustand";
import { BuscarDestinos, EditarDestinos, EliminarDestinos, InsertarDestinos, MostrarDestinos, ReportStockDestinosTodos, ReportStockXDestino, ReportStockBajoMinimo, ReportInventarioValorado } from "../index";
import { supabase } from "../supabase/supabase.config";
import Swal from "sweetalert2";

export const useDestinosStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  datadestinos: [],
  destinosItemSelect: null,
  parametros: {},
  operadorasEncontradas: [],

  mostrardestinos: async (p) => {
    try {
      if (!p?.id_operadora) {
        console.error("ID de operadora no proporcionado en mostrardestinos");
        return [];
      }

      const response = await MostrarDestinos(p);
      
      if (!response) {
        set({ datadestinos: [] });
        set({ destinosItemSelect: null });
        return [];
      }

    set({ parametros: p });
    set({ datadestinos: response });
      set({ destinosItemSelect: response[0] || null });
      
    return response;
    } catch (error) {
      console.error("Error en mostrardestinos:", error);
      set({ datadestinos: [] });
      set({ destinosItemSelect: null });
      return [];
    }
  },

  selectdestinos: (p) => {
    set({ destinosItemSelect: p });
  },

  actualizarTabla: async (id_operadora) => {
    try {
      if (!id_operadora) {
        console.error("ID de operadora no proporcionado en actualizarTabla");
        return [];
      }

      const response = await get().mostrardestinos({ id_operadora });
      return response;
    } catch (error) {
      console.error("Error al actualizar tabla:", error);
      return [];
    }
  },

  insertardestinos: async (p) => {
    try {
      if (!p?._id_operadora) {
        throw new Error("ID de operadora no proporcionado");
      }

      const resultado = await InsertarDestinos(p);
      if (resultado?.error) {
        throw new Error(resultado.error);
      }

      // Actualizar la tabla después de insertar
      await get().actualizarTabla(p._id_operadora);
      
      return resultado;
    } catch (error) {
      console.error("Error en insertardestinos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al guardar el destino",
        timer: 2000,
        showConfirmButton: false
      });
      throw error;
    }
  },

  eliminardestinos: async (p) => {
    try {
      if (!p?.id) {
        throw new Error("ID de destino no proporcionado");
      }

      const resultado = await EliminarDestinos(p);
      
      if (!resultado?.success) {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: resultado?.error || "Error al eliminar el destino",
          timer: 2000,
          showConfirmButton: false
        });
        return resultado;
      }

      // Actualizar la tabla después de eliminar
      if (resultado?.id_operadora) {
        await get().actualizarTabla(resultado.id_operadora);
      }

      Swal.fire({
        icon: "success",
        title: "¡Eliminado!",
        text: resultado?.message || "El registro ha sido eliminado correctamente",
        timer: 1500,
        showConfirmButton: false
      });

      return resultado;
    } catch (error) {
      console.error("Error en eliminardestinos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo eliminar el registro",
        timer: 2000,
        showConfirmButton: false
      });
      throw error;
    }
  },

  editardestinos: async (p) => {
    try {
      if (!p?.id || !p?.descripcion || !p?.id_operadora) {
        throw new Error("Datos incompletos para la edición");
      }

      const resultado = await EditarDestinos(p);
      
      if (!resultado?.success) {
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: resultado?.error || "Error al editar el destino",
          timer: 2000,
          showConfirmButton: false
        });
        return resultado;
      }

      // Actualizar la tabla después de editar
      await get().actualizarTabla(p.id_operadora);

      return resultado;
    } catch (error) {
      console.error("Error en editardestinos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el registro",
        timer: 2000,
        showConfirmButton: false
      });
      throw error;
    }
  },

  buscardestinos: async (p) => {
    try {
      if (!p?._id_operadora) {
        console.error("ID de operadora no proporcionado en buscardestinos");
        throw new Error("ID de operadora no proporcionado");
      }

      if (!p?.provincia) {
        console.error("Provincia no proporcionada en buscardestinos");
        throw new Error("Provincia no proporcionada");
      }

      const response = await BuscarDestinos({
        _id_operadora: p._id_operadora,
        provincia: p.provincia
      });

      if (!response) {
        set({ datadestinos: [] });
        return [];
      }

      if (!Array.isArray(response)) {
        throw new Error("Formato de respuesta inválido");
      }

    set({ datadestinos: response });
    return response;
    } catch (error) {
      console.error("Error en buscardestinos:", error);
      set({ datadestinos: [] });
      throw error;
    }
  },

  //Reporte de Stock
 reportStockDestinosTodos: async (p) => {
    try {
    const response = await ReportStockDestinosTodos(p);
    return response;
    } catch (error) {
      console.error("Error en reportStockDestinosTodos:", error);
      throw error;
    }
  },
  reportStockXdestino: async (p) => {
    const response = await ReportStockXDestino(p);
    return response;
  },
  reportBajoMinimo: async (p) => {
    const response = await ReportStockBajoMinimo(p);
    return response;
  },
  reportInventarioValorado: async (p) => {
    const response = await ReportInventarioValorado(p);
    return response;
  },

  buscarDestinosYOperadoras: async (searchTerm) => {
    try {
      const { data, error } = await supabase.rpc("buscar_destinos_y_operadoras", { _search_term: searchTerm });

      if (error) {
        console.error("Error en buscarDestinosYOperadoras:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        set({ operadorasEncontradas: [] });
        return [];
      }

      set({ operadorasEncontradas: data });
      return data;
    } catch (error) {
      console.error("Error al buscar destinos y operadoras:", error);
      set({ operadorasEncontradas: [] });
      return [];
    }
  },

  buscarDestinosAutocomplete: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc("buscar_destinos_autocomplete", {
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
}));    
