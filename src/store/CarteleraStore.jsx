import { create } from "zustand";
import { obtenerCartelera, insertarCartelera, editarCartelera, eliminarCartelera } from "../supabase/crudCartelera";
import { supabase } from "../index";

export const useCarteleraStore = create((set, get) => ({
  datacartelera: [],
  buscador: "",
  setBuscador: (valor) => set({ buscador: valor }),
  cargarCartelera: async () => {
    const termino = get().buscador;
    let data = [];
    if (termino && termino.trim() !== "") {
      const { data: dataBuscada, error } = await supabase.rpc('buscarcartelera', { termino });
      if (!error) data = dataBuscada;
    } else {
      data = await obtenerCartelera();
    }
    set({ datacartelera: data || [] });
    return data;
  },
  insertarCartelera: async (p) => {
    await insertarCartelera(p);
    await get().cargarCartelera();
  },
  editarCartelera: async (id, p) => {
    await editarCartelera(id, p);
    await get().cargarCartelera();
  },
  eliminarCartelera: async (p) => {
    await eliminarCartelera(p.id);
    await get().cargarCartelera();
  },
  // Métodos para insertar, editar y eliminar se pueden agregar aquí
})); 