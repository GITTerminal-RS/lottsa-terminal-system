import { supabase } from '../index';

// Función para subir imagen de portada al storage (con eliminación de imagen anterior)
export async function subirPortadaCartelera(file, carteleraId, portadaAnterior = null) {
  try {
    console.log('🚀 Subiendo portada cartelera:', carteleraId);
    
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    // Validar tipo de archivo - solo imágenes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP)');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB');
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `cartelera_portada_${carteleraId || Date.now()}.${fileExt}`;
    const filePath = `cartelera/portadas/${fileName}`;

    console.log('Subiendo archivo:', filePath);

    // Subir archivo al storage
    const { data, error } = await supabase.storage
      .from('cartelera')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error al subir archivo:', error);
      throw new Error(error.message || 'Error al subir la imagen');
    }

    console.log('✅ Portada subida exitosamente:', data);

    // Si se subió correctamente y existe una portada anterior, eliminarla
    if (portadaAnterior && portadaAnterior !== filePath) {
      try {
        await eliminarPortadaCartelera(portadaAnterior);
        console.log('🗑️ Portada anterior eliminada:', portadaAnterior);
      } catch (deleteError) {
        console.warn('⚠️ No se pudo eliminar la portada anterior:', deleteError.message);
        // No lanzamos error aquí para no afectar la subida exitosa
      }
    }

    return filePath; // Retornar ruta relativa

  } catch (error) {
    console.error('❌ Error en subirPortadaCartelera:', error);
    throw error;
  }
}

// Función para obtener URL pública de la portada
export async function obtenerUrlPortada(portadaPath) {
  try {
    if (!portadaPath) return null;

    // Si ya es una URL absoluta, devolver tal como está
    if (portadaPath.startsWith('http')) {
      return portadaPath;
    }

    // Obtener URL pública del storage
    const { data } = supabase.storage
      .from('cartelera')
      .getPublicUrl(portadaPath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error al obtener URL de portada:', error);
    return null;
  }
}

// Función para eliminar imagen de portada del storage
export async function eliminarPortadaCartelera(portadaPath) {
  try {
    if (!portadaPath) {
      console.log('No hay portada para eliminar');
      return true;
    }

    // No eliminar URLs externas (http/https)
    if (portadaPath.startsWith('http')) {
      console.log('No se elimina URL externa:', portadaPath);
      return true;
    }

    console.log('🗑️ Eliminando portada del storage:', portadaPath);

    const { error } = await supabase.storage
      .from('cartelera')
      .remove([portadaPath]);

    if (error) {
      console.error('Error al eliminar portada:', error);
      
      // Si el archivo no existe, no es un error crítico
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.log('El archivo ya no existe en el storage');
        return true;
      }
      
      throw error;
    }

    console.log('✅ Portada eliminada exitosamente del storage');
    return true;
  } catch (error) {
    console.error('Error en eliminarPortadaCartelera:', error);
    throw error;
  }
}

// Función específica para actualizar portada (elimina la anterior automáticamente)
export async function actualizarPortadaCartelera(file, carteleraId, portadaAnterior) {
  try {
    console.log('🔄 Actualizando portada cartelera:', { carteleraId, portadaAnterior });
    
    // Subir nueva portada (esto ya maneja la eliminación de la anterior)
    const nuevaPortada = await subirPortadaCartelera(file, carteleraId, portadaAnterior);
    
    console.log('✅ Portada actualizada exitosamente:', {
      anterior: portadaAnterior,
      nueva: nuevaPortada
    });
    
    return nuevaPortada;
  } catch (error) {
    console.error('❌ Error al actualizar portada:', error);
    throw error;
  }
}

// Función para validar dimensiones de imagen
export function validarDimensionesPortada(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      
      // Validar dimensiones mínimas recomendadas para portada (800x600 mínimo)
      if (width >= 800 && height >= 600) {
        resolve(true);
      } else {
        reject(new Error(`La portada debe tener dimensiones mínimas de 800x600px. Tu imagen es ${width}x${height}px`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}