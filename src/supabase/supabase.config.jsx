import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Faltan VITE_APP_SUPABASE_URL o VITE_APP_SUPABASE_ANON_KEY. " +
      "Configura .env.local (local) o Environment Variables en Render (producción)."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");