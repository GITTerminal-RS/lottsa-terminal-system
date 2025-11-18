import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useAuthStore = create((set, get) => ({
  user: null,
  
  initializeAuth: async () => {
    // Obtener la sesión actual
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ user: session.user });
    }

    // Escuchar cambios en la autenticación
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null });
    });
  },

  signInWithEmail: async (p) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: p.correo,
      password: p.pass
    });
    if (error) {
      return null;
    }
    set({ user: data.user });
    return data.user;
  },

  signOut: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error("A ocurrido un error durante el cierre de sesión " + error);
        }
      }
      set({ user: null });
    } catch (error) {
      console.warn("No hay sesión activa para cerrar:", error);
      set({ user: null });
    }
    // Redirigir siempre al menú de inicio de la sección informativa
    window.location.href = "/";
  },

  signUp: async (p) => {
    const { data, error } = await supabase.auth.signUp({
      email: p.correo,
      password: p.pass,
      options: {
        autoSignIn: false
      }
    });
    if (error) {
      return null;
    }
    set({ user: data.user });
    return data.user;
  }
}));