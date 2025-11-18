import { create } from "zustand";
import { obtenerNoticiasRPC, buscarNoticiasRPC, insertarNoticia, editarNoticia, eliminarNoticia } from "../supabase/crudNoticias";
import { supabase } from "../index";
import { useUsuariosStore } from "./UsuariosStore";

export const useNoticiasStore = create((set, get) => ({
  datanoticias: [],
  buscador: "",
  setBuscador: (valor) => set({ buscador: valor }),
  cargarNoticias: async () => {
    const { idusuario } = useUsuariosStore.getState();
    const data = await obtenerNoticiasRPC(idusuario);
    set({ datanoticias: data || [] });
  },
  buscarNoticias: async (termino) => {
    const { idusuario } = useUsuariosStore.getState();
    const data = await buscarNoticiasRPC(termino, idusuario);
    set({ datanoticias: data || [] });
  },
  insertarNoticia: async (p) => {
    await insertarNoticia(p);
    await get().cargarNoticias();
  },
  editarNoticia: async (id, p) => {
    await editarNoticia(id, p);
    await get().cargarNoticias();
  },
  eliminarNoticia: async (p) => {
    await eliminarNoticia(p.id);
    await get().cargarNoticias();
  },
})); 