import { create } from "zustand";
import { obtenerMalla, actualizarMalla } from "../supabase/crudMalla";

export const useMallaStore = create((set, get) => ({
  datamalla: null,
  cargarMalla: async () => {
    const data = await obtenerMalla();
    set({ datamalla: data });
    return data;
  },
  actualizarMalla: async (p) => {
    await actualizarMalla(p);
    await get().cargarMalla();
  },
})); 