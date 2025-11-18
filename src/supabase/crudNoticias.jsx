import { supabase } from "../index";

// Obtener todas las noticias ordenadas por id descendente (más recientes primero)
export async function obtenerNoticias() {
  const { data, error } = await supabase
    .from("noticias")
    .select("id, contexto, descripcion, linknoticia, linkfoto")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error al obtener noticias:", error);
    return [];
  }
  return data;
}

// Obtener noticias usando RPC (mostrar_noticias)
export async function obtenerNoticiasRPC(iduser) {
  const { data, error } = await supabase.rpc('mostrar_noticias', { p_iduser: iduser });
  if (error) {
    console.error('Error al mostrar noticias (RPC):', error);
    return [];
  }
  return data;
}

// Buscar noticias usando RPC (buscar_noticias)
export async function buscarNoticiasRPC(termino, iduser) {
  const { data, error } = await supabase.rpc('buscar_noticias', { termino, p_iduser: iduser });
  if (error) {
    console.error('Error al buscar noticias (RPC):', error);
    return [];
  }
  return data;
}

export async function insertarNoticia(p) {
  const { data, error } = await supabase
    .from('noticias')
    .insert(p)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error al insertar noticia:', error);
    throw error;
  }
  return data;
}

export async function editarNoticia(id, p) {
  const { data, error } = await supabase
    .from('noticias')
    .update(p)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error al editar noticia:', error);
    throw error;
  }
  return data;
}

export async function eliminarNoticia(id) {
  const { error } = await supabase
    .from('noticias')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error al eliminar noticia:', error);
    throw error;
  }
  return true;
} 