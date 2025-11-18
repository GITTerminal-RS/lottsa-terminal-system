import { supabase } from '../index';
import { eliminarPortadaCartelera } from './crudCarteleraImages';

export async function obtenerCartelera() {
  const { data, error } = await supabase
    .from('cartelera')
    .select('id, titulo, edicion, portada, fechafin_inicio, ciudad_provincia, googlemap, responsable, linkresponsable');
  if (error) {
    console.error('Error al obtener cartelera:', error);
    return [];
  }
  return data;
}

export async function insertarCartelera(p) {
  const { data, error } = await supabase
    .from('cartelera')
    .insert(p)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error al insertar cartelera:', error);
    throw error;
  }
  return data;
}

export async function editarCartelera(id, p) {
  const { data, error } = await supabase
    .from('cartelera')
    .update(p)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error al editar cartelera:', error);
    throw error;
  }
  return data;
}

export async function eliminarCartelera(id) {
  try {
    // Primero obtener la cartelera para saber si tiene portada
    const { data: cartelera, error: fetchError } = await supabase
      .from('cartelera')
      .select('portada')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener cartelera:', fetchError);
    }

    // Eliminar del storage si tiene portada
    if (cartelera?.portada) {
      try {
        await eliminarPortadaCartelera(cartelera.portada);
        console.log('🗑️ Portada eliminada del storage:', cartelera.portada);
      } catch (deleteImageError) {
        console.warn('⚠️ No se pudo eliminar la portada del storage:', deleteImageError.message);
        // No detenemos la eliminación de la cartelera por esto
      }
    }

    // Eliminar la cartelera de la base de datos
    const { error } = await supabase
      .from('cartelera')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar cartelera:', error);
      throw error;
    }

    console.log('✅ Cartelera eliminada completamente');
    return true;
  } catch (error) {
    console.error('Error en eliminarCartelera:', error);
    throw error;
  }
} 