import { create } from "zustand";
import {
  BuscarHorarios,
  EditarHorarios,
  EliminarHorarios,
  InsertarHorarios,
  MostrarHorarios,
  MostrarHorariosAgrupados,
} from "../index";
import Swal from "sweetalert2";

export const useHorariosStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  datahorarios: [],
  horariosItemSelect: null,
  parametros: {},
  mostrarhorarios: async (p) => {
    try {
      if (!p?.id_operadora) {
        console.error("ID de operadora no proporcionado en mostrarhorarios");
        return [];
      }

      const response = await MostrarHorarios(p);
      
      if (!response) {
        set({ datahorarios: [] });
        set({ horariosItemSelect: null });
        return [];
      }

      set({ parametros: p });
      set({ datahorarios: response });
      set({ horariosItemSelect: response[0] || null });
      
      return response;
    } catch (error) {
      console.error("Error en mostrarhorarios:", error);
      set({ datahorarios: [] });
      set({ horariosItemSelect: null });
      return [];
    }
  },
  mostrarhorariosagrupados: async (p) => {
    try {
      if (!p?.id_operadora) {
        console.error("ID de operadora no proporcionado en mostrarhorariosagrupados");
        return [];
      }

      const response = await MostrarHorariosAgrupados({
        id_operadora: p.id_operadora,
        id_destino: p.id_destino || null
      });
      
      if (!response) {
        set({ datahorarios: [] });
        return [];
      }

      set({ parametros: p });
      set({ datahorarios: response });
      
      return response;
    } catch (error) {
      console.error("Error en mostrarhorariosagrupados:", error);
      set({ datahorarios: [] });
      return [];
    }
  },
  selecthorarios: (p) => {
    console.log("Seleccionando horario:", p);
    set({ horariosItemSelect: p });
  },
  insertarhorarios: async (p) => {
    try {
      console.log("Intentando insertar horario:", p);
      
      // Validar datos requeridos
      if (!p._descripcion || !p._idoperadora || !p._color) {
        throw new Error("Faltan datos requeridos para insertar el horario");
      }

      const success = await InsertarHorarios(p);
      console.log("Resultado de insertar horario:", success);
      
      if (success) {
        // const { mostrarhorarios, parametros } = get(); // Removido para evitar actualización inmediata
        // if (parametros?.id_operadora) {
        //   await mostrarhorarios(parametros);
        // }
      }
      return success;
    } catch (error) {
      console.error("Error en insertarhorarios:", error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  },
  eliminarhorarios: async (p) => {
    try {
      console.log("Intentando eliminar horario:", p);
      const success = await EliminarHorarios(p);
      if (success) {
        // const { mostrarhorarios, parametros } = get(); // Removido para evitar actualización inmediata
        // if (parametros?.id_operadora) {
        //   await mostrarhorarios(parametros);
        // }
      }
      return success;
    } catch (error) {
      console.error("Error en eliminarhorarios:", error);
      throw error;
    }
  },
  editarhorarios: async (p) => {
    try {
      console.log("Intentando editar horario:", p);
      
      // Validar datos requeridos
      if (!p.id || !p.descripcion || !p.id_operadora || !p.color) {
        throw new Error("Faltan datos requeridos para editar el horario");
      }

      const success = await EditarHorarios(p);
      if (success) {
        const { mostrarhorarios, parametros } = get();
        if (parametros?.id_operadora) {
          await mostrarhorarios(parametros);
        }
      }
      return success;
    } catch (error) {
      console.error("Error en editarhorarios:", error);
      throw error;
    }
  },
  buscarhorarios: async (p) => {
    try {
      console.log("Buscando horarios con parámetros:", p);
    const response = await BuscarHorarios(p);
    set({ datahorarios: response });
      return response;
    } catch (error) {
      console.error("Error en buscarhorarios:", error);
      set({ datahorarios: [] });
      throw error;
    }
  },
}));
