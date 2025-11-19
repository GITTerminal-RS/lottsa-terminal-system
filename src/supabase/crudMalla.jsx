import { supabase } from "../index";
import Swal from "sweetalert2";

export async function obtenerMalla() {
  const { data, error } = await supabase
    .from("malla")
    .select("id, linkimg1, linkimg2, texto, video, videomovil")
    .single();
  if (error) {
    console.error("Error al obtener malla:", error);
    return null;
  }
  return data;
}

export async function actualizarMalla(p) {
  const { data, error } = await supabase
    .from("malla")
    .update({ linkimg1: p.linkimg1, linkimg2: p.linkimg2, texto: p.texto, video: p.video, videomovil: p.videomovil })
    .eq("id", p.id)
    .select()
    .maybeSingle();
  if (error) {
    console.error("Error al actualizar malla:", error);
    throw error;
  }
  return data;
}

// Función para subir video de malla al storage
export async function SubirVideoMallaAlStorage(file, id_malla) {
  try {
    console.log("SubirVideoMallaAlStorage - Iniciando subida de video");
    
    if (!file || !id_malla) {
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

    // Validar duración del video (entre 30 y 40 segundos)
    const videoDuration = await getVideoDuration(file);
    if (videoDuration < 30) {
      throw new Error("El video debe tener una duración mínima de 30 segundos");
    }
    if (videoDuration > 40) {
      throw new Error("El video debe tener una duración máxima de 40 segundos");
    }

    // Generar nombre único para el archivo
    const fileName = `malla/${id_malla}_${Date.now()}.mp4`;

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
    console.error("Error en SubirVideoMallaAlStorage:", error);
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

// Función para eliminar video de malla del storage
export async function EliminarVideoMallaDelStorage(videoUrl) {
  try {
    console.log("EliminarVideoMallaDelStorage - Eliminando video:", videoUrl);
    
    if (!videoUrl) {
      console.log("No hay URL de video para eliminar");
      return;
    }

    // Extraer el path completo del archivo de la URL de Supabase
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

    console.log("Video eliminado exitosamente del storage");
    return data;

  } catch (error) {
    console.error("Error en EliminarVideoMallaDelStorage:", error);
    // No lanzar error aquí para evitar interrumpir el flujo principal
    console.warn("Continuando sin eliminar el archivo del storage");
  }
}

// Función para actualizar video de malla (incluye eliminación automática del video anterior)
export async function ActualizarVideoMalla(id_malla, nuevoVideoUrl, videoAnteriorUrl = null) {
  try {
    console.log("ActualizarVideoMalla - Actualizando video para malla:", id_malla);
    
    if (!id_malla) {
      throw new Error("ID de malla no proporcionado");
    }

    // Si hay un video anterior, eliminarlo del storage
    if (videoAnteriorUrl && videoAnteriorUrl.trim() !== '' && videoAnteriorUrl !== 'link') {
      await EliminarVideoMallaDelStorage(videoAnteriorUrl);
    }

    // Actualizar la base de datos con la nueva URL del video
    const { data, error } = await supabase
      .from("malla")
      .update({ video: nuevoVideoUrl })
      .eq("id", id_malla)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar video en la base de datos:", error);
      throw new Error(error.message || "Error al actualizar el video");
    }

    console.log("Video actualizado exitosamente en la base de datos");
    return data;

  } catch (error) {
    console.error("Error en ActualizarVideoMalla:", error);
    throw error;
  }
}

// ==================== FUNCIONES PARA VIDEO MÓVIL ====================

// Función para subir video móvil de malla al storage
export async function SubirVideoMovilMallaAlStorage(file, id_malla) {
  try {
    console.log("SubirVideoMovilMallaAlStorage - Iniciando subida de video móvil");
    
    if (!file || !id_malla) {
      throw new Error("Faltan datos requeridos para subir el video móvil");
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

    // Validar duración del video móvil (entre 15 y 30 segundos)
    const videoDuration = await getVideoDuration(file);
    if (videoDuration < 15) {
      throw new Error("El video móvil debe tener una duración mínima de 15 segundos");
    }
    if (videoDuration > 30) {
      throw new Error("El video móvil debe tener una duración máxima de 30 segundos");
    }

    // Generar nombre único para el archivo (con sufijo _mobile)
    const fileName = `malla/${id_malla}_mobile_${Date.now()}.mp4`;

    console.log("Subiendo archivo móvil:", fileName);

    // Subir archivo al storage
    const { data, error } = await supabase.storage
      .from('multimedia')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Error al subir archivo móvil:", error);
      throw new Error(error.message || "Error al subir el video móvil");
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('multimedia')
      .getPublicUrl(fileName);

    console.log("Video móvil subido exitosamente:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error("Error en SubirVideoMovilMallaAlStorage:", error);
    throw error;
  }
}

// Función para eliminar video móvil de malla del storage
export async function EliminarVideoMovilMallaDelStorage(videoUrl) {
  try {
    console.log("EliminarVideoMovilMallaDelStorage - Eliminando video móvil:", videoUrl);
    
    if (!videoUrl || videoUrl.trim() === '' || videoUrl === 'link') {
      console.log("No hay video móvil para eliminar");
      return true;
    }

    // Extraer el path del archivo de la URL
    const urlParts = videoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const filePath = `${folderName}/${fileName}`;

    console.log("Eliminando archivo móvil:", filePath);

    // Eliminar archivo del storage
    const { error } = await supabase.storage
      .from('multimedia')
      .remove([filePath]);

    if (error) {
      console.error("Error al eliminar archivo móvil:", error);
      throw new Error(error.message || "Error al eliminar el video móvil");
    }

    console.log("Video móvil eliminado exitosamente");
    return true;

  } catch (error) {
    console.error("Error en EliminarVideoMovilMallaDelStorage:", error);
    throw error;
  }
}

// Función para actualizar video móvil de malla
export async function ActualizarVideoMovilMalla(id_malla, nuevoVideoUrl, videoAnteriorUrl = null) {
  try {
    console.log("ActualizarVideoMovilMalla - Actualizando video móvil de malla");
    
    if (!id_malla || !nuevoVideoUrl) {
      throw new Error("Faltan datos requeridos para actualizar el video móvil");
    }

    // Actualizar el campo videomovil en la base de datos
    const { data, error } = await supabase
      .from("malla")
      .update({ videomovil: nuevoVideoUrl })
      .eq("id", id_malla)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error al actualizar video móvil en BD:", error);
      throw new Error(error.message || "Error al actualizar el video móvil en la base de datos");
    }

    // Si hay un video anterior, eliminarlo del storage
    if (videoAnteriorUrl && videoAnteriorUrl.trim() !== '' && videoAnteriorUrl !== 'link') {
      try {
        await EliminarVideoMovilMallaDelStorage(videoAnteriorUrl);
      } catch (deleteError) {
        console.warn("No se pudo eliminar el video móvil anterior:", deleteError);
        // No lanzar error aquí, ya que el nuevo video se subió correctamente
      }
    }

    console.log("Video móvil de malla actualizado exitosamente");
    return data;

  } catch (error) {
    console.error("Error en ActualizarVideoMovilMalla:", error);
    throw error;
  }
} 