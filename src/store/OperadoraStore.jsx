import { create } from "zustand";
import { ContarUsuariosXoperadora, MostrarOperadora, obtenerOperadoraPorAdmin, actualizarOperadora, supabase } from "../index";

export const useOperadoraStore = create((set, get) => ({
  contadorusuarios: 0,
  dataoperadora: null,
  operadoraContexto: null,
  setOperadoraContexto: (operadora) => set({ operadoraContexto: operadora }),
  clearOperadoraContexto: () => set({ operadoraContexto: null }),
  getOperadoraActiva: () => {
    const { dataoperadora, operadoraContexto } = get();
    return dataoperadora?.id ? dataoperadora : operadoraContexto;
  },
  mostrarOperadora: async (p) => {
    try {
    console.log("OperadoraStore - Iniciando mostrarOperadora con:", p);
    const response = await MostrarOperadora(p);
    console.log("OperadoraStore - Respuesta de MostrarOperadora:", response);
    
    if (response && response.operadora) {
      console.log("OperadoraStore - Datos de operadora encontrados:", response.operadora);
      set({ dataoperadora: response.operadora });
      return response.operadora;
    }
    
    console.log("OperadoraStore - No se encontraron datos de operadora");
      set({ dataoperadora: null });
      return null;
    } catch (error) {
      console.error("OperadoraStore - Error en mostrarOperadora:", error);
      set({ dataoperadora: null });
    return null;
    }
  },
  contarusuariosXoperadora: async (p) => {
    try {
    const response = await ContarUsuariosXoperadora(p);
    set({ contadorusuarios: response });
    return response;
    } catch (error) {
      console.error("OperadoraStore - Error en contarusuariosXoperadora:", error);
      return 0;
    }
  },
  obtenerOperadoraPorAdmin: async (idAdmin) => {
    try {
    const response = await obtenerOperadoraPorAdmin(idAdmin);
    if (response) {
      set({ dataoperadora: response });
      } else {
        set({ dataoperadora: null });
    }
    return response;
    } catch (error) {
      console.error("OperadoraStore - Error en obtenerOperadoraPorAdmin:", error);
      set({ dataoperadora: null });
      return null;
    }
  },
  actualizarOperadora: async (datos) => {
    try {
    const response = await actualizarOperadora(datos);
    if (response) {
      set((state) => ({
          dataoperadora: state.dataoperadora ? {
          ...state.dataoperadora,
          ...datos
          } : null
      }));
    }
    return response;
    } catch (error) {
      console.error("OperadoraStore - Error en actualizarOperadora:", error);
      return null;
    }
  },
  tieneOperadoraValida: () => {
    const { dataoperadora } = get();
    return Boolean(dataoperadora?.id);
  },
  mostrarOperadoraConEspera: async (p, maxIntentos = 10, delayMs = 1000) => {
    let intentos = 0;
    let operadora = null;
    while (intentos < maxIntentos && !operadora) {
      operadora = await get().mostrarOperadora(p);
      if (operadora) break;
      await new Promise(res => setTimeout(res, delayMs));
      intentos++;
    }
    if (!operadora) {
      console.error("No se pudo cargar la operadora después de varios intentos");
    }
    return operadora;
  },
  obtenerOperadoraPorIdAuth: async (idauth, maxIntentos = 10, delayMs = 1000) => {
    // 1. Buscar el id interno del usuario
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('idauth', idauth)
      .maybeSingle();
    const idUserAdmin = usuario?.id;
    if (!idUserAdmin) {
      console.error('No se encontró el id interno del usuario para el idauth:', idauth);
      return null;
    }
    // 2. Polling para operadora y asignaroperadora
    let intentos = 0;
    let operadora = null;
    let asignacion = null;
    while (intentos < maxIntentos && (!operadora || !asignacion)) {
      operadora = await get().mostrarOperadora({ iduseradmin: idUserAdmin });
      const { data: asignacionData } = await supabase
        .from('asignaroperadora')
        .select('id')
        .eq('id_usuario', idUserAdmin)
        .maybeSingle();
      asignacion = asignacionData?.id;
      if (operadora && asignacion) break;
      await new Promise(res => setTimeout(res, delayMs));
      intentos++;
    }
    if (!operadora || !asignacion) {
      console.error('No se pudo cargar la operadora o la asignación después de varios intentos');
      return null;
    }
    return { operadora, asignacion, idUserAdmin };
  }
}));
