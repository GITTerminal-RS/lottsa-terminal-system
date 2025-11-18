import { supabase } from "../index";
import Swal from "sweetalert2";

// Función para subir video al storage para publicidad
export async function SubirVideoPublicidadAlStorage(file, id_publicidad, id_operadora) {
  try {
    console.log("SubirVideoPublicidadAlStorage - Iniciando subida de video");
    
    if (!file || !id_publicidad) {
      throw new Error("Faltan datos requeridos para subir el video");
    }

    // Si no hay operadora (usuario root), usar 'root' como identificador
    const operadoraId = id_operadora || 'root';

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
    const fileName = `publicidad/${operadoraId}/${id_publicidad}_${Date.now()}.mp4`;

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
    console.error("Error en SubirVideoPublicidadAlStorage:", error);
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

// Función para eliminar video del storage de publicidad
export async function EliminarVideoPublicidadDelStorage(videoUrl) {
  try {
    console.log("EliminarVideoPublicidadDelStorage - Eliminando video:", videoUrl);
    
    if (!videoUrl) {
      console.log("No hay URL de video para eliminar");
      return;
    }

    // Extraer el path completo del archivo de la URL de Supabase
    // La URL tiene el formato: https://[project].supabase.co/storage/v1/object/public/multimedia/publicidad/[operadora]/[archivo]
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
    console.error("Error en EliminarVideoPublicidadDelStorage:", error);
    throw error;
  }
}

// Función para actualizar publicidad con nuevo video
export async function ActualizarPublicidadConVideo(id_publicidad, videoUrl) {
  try {
    console.log("ActualizarPublicidadConVideo - Actualizando publicidad:", id_publicidad);
    
    if (!id_publicidad || !videoUrl) {
      throw new Error("Faltan datos requeridos para actualizar publicidad");
    }

    // Primero obtener la publicidad actual para eliminar el video anterior
    const { data: publicidadActual, error: fetchError } = await supabase
      .from("publicidad")
      .select("video")
      .eq("id", id_publicidad)
      .single();

    if (fetchError) {
      console.error("Error al obtener publicidad actual:", fetchError);
      throw new Error("Error al obtener datos actuales");
    }
    
    // Si hay un video anterior y es diferente al nuevo, eliminarlo
    if (publicidadActual?.video && 
        publicidadActual.video !== videoUrl &&
        publicidadActual.video.includes('supabase.co')) {
      try {
        await EliminarVideoPublicidadDelStorage(publicidadActual.video);
        console.log("Video anterior eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar video anterior:", error);
        // Continuar con la actualización aunque falle la eliminación
      }
    }

    // Actualizar publicidad con el nuevo video
    const { data, error } = await supabase
      .from("publicidad")
      .update({ video: videoUrl })
      .eq("id", id_publicidad)
      .select()
      .single();

    if (error) {
      console.error("Error en ActualizarPublicidadConVideo:", error);
      throw new Error(error.message || "Error al actualizar publicidad");
    }

    console.log("Publicidad actualizada exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error en ActualizarPublicidadConVideo:", error);
    throw error;
  }
}

// Función para eliminar video de publicidad (establecer video como null)
export async function EliminarVideoPublicidad(id_publicidad) {
  try {
    console.log("EliminarVideoPublicidad - Eliminando video de publicidad:", id_publicidad);
    
    if (!id_publicidad) {
      throw new Error("ID de publicidad no proporcionado");
    }

    // Primero obtener el video actual para eliminarlo del storage
    const { data: publicidadActual, error: fetchError } = await supabase
      .from("publicidad")
      .select("video")
      .eq("id", id_publicidad)
      .single();

    if (fetchError) {
      console.error("Error al obtener publicidad actual:", fetchError);
      throw new Error("Error al obtener datos actuales");
    }
    
    if (publicidadActual?.video && publicidadActual.video.includes('supabase.co')) {
      await EliminarVideoPublicidadDelStorage(publicidadActual.video);
    }

    // Actualizar publicidad estableciendo video como null
    const { data, error } = await supabase
      .from("publicidad")
      .update({ video: null })
      .eq("id", id_publicidad)
      .select()
      .single();

    if (error) {
      console.error("Error en EliminarVideoPublicidad:", error);
      throw new Error(error.message || "Error al eliminar video");
    }

    console.log("Video eliminado exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error en EliminarVideoPublicidad:", error);
    throw error;
  }
}
