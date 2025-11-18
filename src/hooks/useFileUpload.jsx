import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../index';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export const useFileUpload = (operadoraId, updateOperadora) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const queryClient = useQueryClient();

  // 🚀 Mutación optimista para upload de archivos
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type, operadoraId }) => {
      // Validar dimensiones de imagen
      await validateImageDimensions(file, type);
      
      // Upload del archivo
      const fileUrl = await uploadFile(file, type, (progress) => {
        setUploadProgress(prev => ({ ...prev, [type]: progress }));
      });
      
      return { type, url: fileUrl };
    },
    onMutate: async ({ file, type }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries(['operadora-data']);
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(['operadora-data']);
      
      // 🔥 Update optimístico - mostrar preview inmediatamente
      const previewUrl = URL.createObjectURL(file);
      queryClient.setQueryData(['operadora-data'], (old) => {
        if (!old) return old;
        return {
          ...old,
          [type]: previewUrl, // Preview temporal
          [`${type}_uploading`]: true // Flag de upload
        };
      });
      
      return { previousData, previewUrl };
    },
    onSuccess: (data, variables, context) => {
      // Limpiar preview temporal
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }
      
      // Actualizar con URL real del servidor
      queryClient.setQueryData(['operadora-data'], (old) => ({
        ...old,
        [data.type]: data.url,
        [`${data.type}_uploading`]: false
      }));
      
      // Actualizar en base de datos
      updateOperadora({
        id: operadoraId,
        [data.type]: data.url
      });
      
      // Limpiar estado de upload
      setUploadProgress(prev => ({ ...prev, [data.type]: 0 }));
      setSelectedFiles(prev => ({ ...prev, [data.type]: null }));
      
      toast.success(`${data.type === 'logo' ? 'Logo' : 'Portada'} actualizada`);
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['operadora-data'], context.previousData);
      }
      
      // Limpiar preview temporal
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }
      
      // Limpiar estados
      setUploadProgress(prev => ({ ...prev, [variables.type]: 0 }));
      setSelectedFiles(prev => ({ ...prev, [variables.type]: null }));
      
      toast.error('Error al subir archivo: ' + error.message);
    }
  });

  // 📏 Validación de dimensiones de imagen
  const validateImageDimensions = (file, type) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        if (type === 'logo') {
          const isValidSmall = width >= 40 && width <= 100 && height >= 40 && height <= 100;
          const isValidLarge = width >= 100 && width <= 860 && height >= 100 && height <= 540;
          
          if (isValidSmall || isValidLarge) {
            resolve(true);
          } else {
            Swal.fire({
              icon: "error",
              title: "Dimensiones incorrectas",
              text: `El logo debe tener dimensiones entre 40-100px O 100-860px de ancho y 100-540px de alto. Tu imagen es ${width}x${height}px`,
              footer: 'Por favor, ajusta el tamaño de tu imagen antes de subirla'
            });
            reject(new Error(`Dimensiones incorrectas: ${width}x${height}px`));
          }
        } else if (type === 'portada') {
          if (width >= 1200 && width <= 2560 && height >= 675 && height <= 1440) {
            resolve(true);
          } else {
            Swal.fire({
              icon: "error",
              title: "Dimensiones incorrectas",
              text: `La portada debe tener dimensiones mínimas de 1200x675px y máximas de 2560x1440px. Tu imagen es ${width}x${height}px`,
              footer: 'Por favor, ajusta el tamaño de tu imagen antes de subirla'
            });
            reject(new Error(`Dimensiones incorrectas: ${width}x${height}px`));
          }
        }
      };
      
      img.onerror = () => {
        Swal.fire({
          icon: "error",
          title: "Error al cargar la imagen",
          text: "No se pudo cargar la imagen. Por favor, intenta con otra imagen.",
        });
        reject(new Error('Error al cargar la imagen'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 📤 Upload del archivo con progress
  const uploadFile = async (file, type, onProgress) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      console.log('🚀 Subiendo archivo:', { filePath, type });

      const { data, error } = await supabase.storage
        .from('operadora')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error al subir archivo:', error);
        throw error;
      }

      console.log('✅ Archivo subido exitosamente:', data);
      return filePath; // Retornar ruta relativa

    } catch (error) {
      console.error('❌ Error en uploadFile:', error);
      throw error;
    }
  };

  // 🖼️ Función principal para manejar selección de archivo
  const handleFileSelect = useCallback(async (file, type) => {
    if (!file || !operadoraId) return;

    // Guardar archivo seleccionado
    setSelectedFiles(prev => ({ ...prev, [type]: file }));
    
    // Iniciar upload optimista
    uploadMutation.mutate({ file, type, operadoraId });
  }, [operadoraId, uploadMutation]);

  // 👀 Ver imagen actual
  const handleViewImage = useCallback(async (type, currentImage) => {
    if (!currentImage) {
      Swal.fire({
        icon: "info",
        title: "Sin imagen",
        text: `No se ha agregado ${type === 'logo' ? 'logo' : 'imagen de portada'} aún`,
      });
      return null;
    }

    try {
      // Si la URL ya es absoluta, usarla directamente
      if (currentImage.startsWith('http')) {
        console.log('🔗 Usando URL absoluta existente:', currentImage);
        return currentImage;
      }

      // Para rutas relativas, construir la URL pública
      const filePath = currentImage.includes('/') ? currentImage : `${type}s/${currentImage}`;
      console.log('🏗️ Construyendo URL pública para:', filePath);

      const { data: { publicUrl }, error } = await supabase.storage
        .from('operadora')
        .getPublicUrl(filePath);

      if (error) {
        console.error('❌ Error al obtener URL pública:', error);
        return null;
      }

      console.log('✅ URL pública obtenida:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('❌ Error al procesar imagen:', error);
      return null;
    }
  }, []);

  return {
    // Función principal
    handleFileSelect,
    handleViewImage,
    
    // Estados
    uploadProgress,
    selectedFiles,
    isUploading: uploadMutation.isLoading,
    uploadError: uploadMutation.error,
    
    // Utilidades
    setSelectedFiles,
    validateImageDimensions,
  };
}; 