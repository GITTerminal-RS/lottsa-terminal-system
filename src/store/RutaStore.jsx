import { create } from "zustand";
import {
  BuscarRuta,
  EditarRuta,
  EliminarRuta,
  InsertarRuta,
  MostrarRuta,
} from "../index";

export const useRutaStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataruta: [],
  rutaItemSelect: null,
  parametros: {},

  actualizarTabla: async (id_operadora) => {
    try {
      if (!id_operadora) {
        console.error("ID de operadora no proporcionado en actualizarTabla");
        return [];
      }

      console.log("Actualizando tabla para operadora:", id_operadora);
      const response = await get().mostrarRuta({ id_operadora });
      console.log("Tabla actualizada:", response);
      return response;
    } catch (error) {
      console.error("Error al actualizar tabla:", error);
      return [];
    }
  },

  mostrarRuta: async (p) => {
    try {
      console.log("Mostrando rutas para operadora:", p.id_operadora);
    const response = await MostrarRuta(p);
    set({ parametros: p });
    set({ dataruta: response });
      
      // Solo seleccionar el primer elemento si no hay una selección previa
      // y no estamos en modo edición
      if (response && response.length > 0 && !get().rutaItemSelect && !p.isEditing) {
    set({ rutaItemSelect: response[0] });
      }
      
    return response;
    } catch (error) {
      console.error("Error en mostrarRuta:", error);
      set({ dataruta: [] });
      set({ rutaItemSelect: null });
      return [];
    }
  },

  selectRuta: (p) => {
    console.log("Seleccionando ruta:", p);
    set({ rutaItemSelect: p });
  },

  insertarRuta: async (p) => {
    try {
      console.log("Intentando insertar ruta:", p);
      
      // Validar datos requeridos
      if (!p._descripcion || !p._idoperadora) {
        throw new Error("Faltan datos requeridos para insertar la ruta");
      }

      const success = await InsertarRuta(p);
      console.log("Resultado de insertar ruta:", success);
      
      if (success) {
        // Actualizar la tabla después de insertar
        await get().actualizarTabla(p._idoperadora);
      }
      return success;
    } catch (error) {
      console.error("Error en insertarRuta:", error);
      throw error;
    }
  },

  eliminarRuta: async (p) => {
    try {
      console.log("Intentando eliminar ruta:", p);
      const success = await EliminarRuta(p);
      if (success) {
        // Actualizar la tabla después de eliminar
    const { parametros } = get();
        if (parametros?.id_operadora) {
          await get().actualizarTabla(parametros.id_operadora);
        }
      }
      return success;
    } catch (error) {
      console.error("Error en eliminarRuta:", error);
      throw error;
    }
  },

  editarRuta: async (p) => {
    try {
      console.log("Intentando editar ruta:", p);
      
      // Validar datos requeridos
      if (!p.id || !p.descripcion || !p.id_operadora) {
        throw new Error("Faltan datos requeridos para editar la ruta");
      }

      const success = await EditarRuta(p);
      console.log("Resultado de editar ruta:", success);
      
      if (success) {
        // Actualizar la tabla después de editar
        await get().actualizarTabla(p.id_operadora);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en editarRuta:", error);
      throw error;
    }
  },

  buscarRuta: async (p) => {
    try {
      console.log("Buscando rutas con parámetros:", p);
    const response = await BuscarRuta(p);
    set({ dataruta: response });
      return response;
    } catch (error) {
      console.error("Error en buscarRuta:", error);
      set({ dataruta: [] });
      throw error;
    }
  },
}));
