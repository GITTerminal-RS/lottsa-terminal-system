import { supabase } from "../index";
import Swal from "sweetalert2";

// Función para obtener multimedia por destino
export async function ObtenerMultimediaPorDestino(id_destino) {
  try {
    console.log("ObtenerMultimediaPorDestino - Buscando multimedia para destino:", id_destino);
    
    if (!id_destino) {
      throw new Error("ID de destino no proporcionado");
    }

    const { data, error } = await supabase
      .from("multimedia")
      .select("*")
      .eq("id_destino", id_destino)
      .single();

    if (error) {
      console.error("Error en ObtenerMultimediaPorDestino:", error);
      throw new Error(error.message || "Error al obtener multimedia");
    }

    console.log("Multimedia encontrada:", data);
    return data;
  } catch (error) {
    console.error("Error en ObtenerMultimediaPorDestino:", error);
    return null;
  }
}

// Función para subir video al storage
export async function SubirVideoAlStorage(file, id_destino, id_operadora) {
  try {
    console.log("SubirVideoAlStorage - Iniciando subida de video");
    
    if (!file || !id_destino || !id_operadora) {
      throw new Error("Faltan datos requeridos para subir el video");
    }

    // Validar tipo de archivo - solo MP4
    if (file.type !== 'video/mp4') {
      throw new Error("Solo se permiten archivos MP4");
    }

    // Validar extensión del archivo
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'mp4') {
      throw new Error("Solo se permiten archivos MP4");
    }

    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error("El archivo es demasiado grande. Máximo 100MB");
    }

    // Validar duración del video (máximo 35 segundos)
    const videoDuration = await getVideoDuration(file);
    if (videoDuration > 35) {
      throw new Error("El video debe tener una duración máxima de 35 segundos");
    }

    // Generar nombre único para el archivo
    const fileName = `destinos/${id_operadora}/${id_destino}_${Date.now()}.mp4`;

    console.log("Subiendo archivo:", fileName);

    // Subir archivo al storage
    const { data, error } = await supabase.storage
      .from('multimedia')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Error al subir archivo:", error);
      throw new Error(error.message || "Error al subir el video");
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('multimedia')
      .getPublicUrl(fileName);

    console.log("Video subido exitosamente:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error("Error en SubirVideoAlStorage:", error);
    throw error;
  }
}

// Función auxiliar para obtener la duración del video
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error("No se pudo obtener la duración del video"));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

// Función para actualizar multimedia
export async function ActualizarMultimedia(id_destino, videoUrl) {
  try {
    console.log("ActualizarMultimedia - Actualizando multimedia para destino:", id_destino);
    
    if (!id_destino || !videoUrl) {
      throw new Error("Faltan datos requeridos para actualizar multimedia");
    }

    // Primero obtener el video actual para eliminarlo del storage
    const multimediaActual = await ObtenerMultimediaPorDestino(id_destino);
    
    // Si hay un video anterior y es diferente al nuevo, eliminarlo
    if (multimediaActual?.video && 
        multimediaActual.video !== 'link' && 
        multimediaActual.video !== videoUrl) {
      try {
        await EliminarVideoDelStorage(multimediaActual.video);
        console.log("Video anterior eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar video anterior:", error);
        // Continuar con la actualización aunque falle la eliminación
      }
    }

    // Actualizar multimedia con el nuevo video
    const { data, error } = await supabase
      .from("multimedia")
      .update({ video: videoUrl })
      .eq("id_destino", id_destino)
      .select()
      .single();

    if (error) {
      console.error("Error en ActualizarMultimedia:", error);
      throw new Error(error.message || "Error al actualizar multimedia");
    }

    console.log("Multimedia actualizada exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error en ActualizarMultimedia:", error);
    throw error;
  }
}

// Función para eliminar video del storage
export async function EliminarVideoDelStorage(videoUrl) {
  try {
    console.log("EliminarVideoDelStorage - Eliminando video:", videoUrl);
    
    if (!videoUrl) {
      console.log("No hay URL de video para eliminar");
      return;
    }

    // Extraer el path completo del archivo de la URL de Supabase
    // La URL tiene el formato: https://[project].supabase.co/storage/v1/object/public/multimedia/destinos/[operadora]/[archivo]
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    
    // Buscar el índice de 'multimedia' en la ruta
    const multimediaIndex = pathParts.findIndex(part => part === 'multimedia');
    if (multimediaIndex === -1) {
      throw new Error("URL de video no válida");
    }
    
    // Extraer la ruta completa después de 'multimedia'
    const filePath = pathParts.slice(multimediaIndex + 1).join('/');
    
    console.log("Eliminando archivo:", filePath);

    const { data, error } = await supabase.storage
      .from('multimedia')
      .remove([filePath]);

    if (error) {
      console.error("Error al eliminar archivo:", error);
      throw new Error(error.message || "Error al eliminar el video");
    }

    console.log("Video eliminado exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error en EliminarVideoDelStorage:", error);
    throw error;
  }
}

// Función para eliminar multimedia (establecer video como null)
export async function EliminarMultimedia(id_destino) {
  try {
    console.log("EliminarMultimedia - Eliminando multimedia para destino:", id_destino);
    
    if (!id_destino) {
      throw new Error("ID de destino no proporcionado");
    }

    // Primero obtener el video actual para eliminarlo del storage
    const multimediaActual = await ObtenerMultimediaPorDestino(id_destino);
    
    if (multimediaActual?.video && multimediaActual.video !== 'link') {
      await EliminarVideoDelStorage(multimediaActual.video);
    }

    // Actualizar multimedia estableciendo video como 'link' (valor por defecto)
    const { data, error } = await supabase
      .from("multimedia")
      .update({ video: 'link' })
      .eq("id_destino", id_destino)
      .select()
      .single();

    if (error) {
      console.error("Error en EliminarMultimedia:", error);
      throw new Error(error.message || "Error al eliminar multimedia");
    }

    console.log("Multimedia eliminada exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error en EliminarMultimedia:", error);
    throw error;
  }
}

// Función para actualizar likes
export async function ActualizarLikes(id_destino, likes) {
  try {
    console.log("ActualizarLikes - Actualizando likes para destino:", id_destino);
    
    if (!id_destino || likes === undefined) {
      throw new Error("Faltan datos requeridos para actualizar likes");
    }

    const { data, error } = await supabase
      .from("multimedia")
      .update({ likes: likes })
      .eq("id_destino", id_destino)
      .select()
      .single();

    if (error) {
      console.error("Error en ActualizarLikes:", error);
      throw new Error(error.message || "Error al actualizar likes");
    }

    console.log("Likes actualizados exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error en ActualizarLikes:", error);
    throw error;
  }
}

// Función para actualizar multimedia sin cambiar el video
export async function ActualizarMultimediaSinVideo(id_destino) {
  try {
    console.log("ActualizarMultimediaSinVideo - Verificando multimedia para destino:", id_destino);
    
    if (!id_destino) {
      throw new Error("ID de destino no proporcionado");
    }

    // Verificar si existe un registro de multimedia para este destino
    const multimediaActual = await ObtenerMultimediaPorDestino(id_destino);
    
    if (!multimediaActual) {
      // Si no existe, crear un registro con valor por defecto
      const { data, error } = await supabase
        .from("multimedia")
        .insert({ 
          id_destino: id_destino, 
          video: 'link' 
        })
        .select()
        .single();

      if (error) {
        console.error("Error al crear multimedia:", error);
        throw new Error(error.message || "Error al crear multimedia");
      }

      console.log("Multimedia creada exitosamente:", data);
      return data;
    }

    // Si ya existe, no hacer nada
    console.log("Multimedia ya existe, no se requiere actualización");
    return multimediaActual;
  } catch (error) {
    console.error("Error en ActualizarMultimediaSinVideo:", error);
    throw error;
  }
}

export async function getDescubreViajaVideos() {
  const { data, error } = await window.supabase.rpc('descubre_viaja_videos');
  if (error) throw error;
  return data && data.length ? data[0].data : [];
} 