import styled from "styled-components";
import { InputText } from "./InputText";
import { Btnsave } from "../../moleculas/Btnsave";
import { useMallaStore } from "../../../store/MallaStore";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { FaRegImage, FaVideo, FaTrash, FaUpload, FaPlay } from 'react-icons/fa';
import { SubirVideoMallaAlStorage, ActualizarVideoMalla, SubirVideoMovilMallaAlStorage, ActualizarVideoMovilMalla } from "../../../supabase/crudMalla";
import toast from 'react-hot-toast';

export function ModificarMalla({ dataSelect }) {
  const { actualizarMalla } = useMallaStore();
  const [mensaje, setMensaje] = useState("");
  const { register, setValue, watch } = useForm();
  const debounceRef = useRef();
  
  // Estados para manejo de video web
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef(null);

  // Estados para manejo de video móvil
  const [selectedVideoMovil, setSelectedVideoMovil] = useState(null);
  const [currentVideoMovilUrl, setCurrentVideoMovilUrl] = useState("");
  const [isUploadingVideoMovil, setIsUploadingVideoMovil] = useState(false);
  const videoMovilInputRef = useRef(null);

  useEffect(() => {
    if (dataSelect) {
      setValue("linkimg1", dataSelect.linkimg1 || "");
      setValue("linkimg2", dataSelect.linkimg2 || "");
      setValue("texto", dataSelect.texto || "");
      setValue("video", dataSelect.video || "");
      setValue("videomovil", dataSelect.videomovil || "");
      setCurrentVideoUrl(dataSelect.video || "");
      setCurrentVideoMovilUrl(dataSelect.videomovil || "");
    }
  }, [dataSelect, setValue]);

  // Guardado automático con debounce (excluyendo video)
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (!dataSelect) return;
      // Excluir el campo video del guardado automático
      if (name === 'video') return;
      
      if (dataSelect[name] !== values[name]) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          try {
            await actualizarMalla({ ...dataSelect, ...values });
            setMensaje("¡Malla actualizada con éxito!");
            setTimeout(() => setMensaje(""), 1500);
          } catch (e) {
            setMensaje("Error al actualizar malla");
            setTimeout(() => setMensaje(""), 1500);
          }
        }, 700);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dataSelect, actualizarMalla]);

  // Función auxiliar para obtener la duración del video
  const getVideoDuration = (file) => {
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
  };

  const validarDuracionVideoWeb = (videoDuration) => {
    const segundos = Math.round(videoDuration);
    if (segundos < 30 || segundos > 40) {
      return `El video dura ${segundos}s. Debe estar entre 30 y 40 segundos.`;
    }
    return null;
  };

  const validarDuracionVideoMovil = (videoDuration) => {
    const segundos = Math.round(videoDuration);
    if (segundos < 30 || segundos > 40) {
      return `El video móvil dura ${segundos}s. Debe estar entre 30 y 40 segundos.`;
    }
    return null;
  };

  // Función para manejar la selección de video
  const handleVideoSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea MP4
      if (file.type !== 'video/mp4') {
        toast.error("Solo se permiten archivos MP4");
        return;
      }
      
      // Validar tamaño (máximo 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("El archivo es demasiado grande. Máximo 100MB");
        return;
      }
      
      // Validar duración del video (entre 30 y 40 segundos)
      try {
        const videoDuration = await getVideoDuration(file);
        const errorDuracion = validarDuracionVideoWeb(videoDuration);
        if (errorDuracion) {
          toast.error(errorDuracion);
          return;
        }
      } catch (error) {
        toast.error("No se pudo verificar la duración del video");
        return;
      }
      
      setSelectedVideo(file);
      toast.success("Video seleccionado. Haz clic en 'Subir Video' para guardarlo.");
    }
  };

  // Función para subir el video
  const handleVideoSubmit = async () => {
    if (!selectedVideo || !dataSelect) {
      toast.error("No hay video seleccionado");
      return;
    }

    try {
      setIsUploadingVideo(true);
      toast.loading("Subiendo video...");

      // Subir video al storage
      const videoUrl = await SubirVideoMallaAlStorage(selectedVideo, dataSelect.id);
      
      // Actualizar video en la base de datos (elimina automáticamente el anterior)
      await ActualizarVideoMalla(dataSelect.id, videoUrl, currentVideoUrl);
      
      // Actualizar estados
      setCurrentVideoUrl(videoUrl);
      setValue("video", videoUrl);
      setSelectedVideo(null);
      
      // Limpiar input
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      
      toast.dismiss();
      toast.success("Video subido exitosamente");
      setMensaje("¡Video actualizado con éxito!");
      setTimeout(() => setMensaje(""), 1500);
      
    } catch (error) {
      console.error("Error al subir video:", error);
      toast.dismiss();
      toast.error(error.message || "Error al subir el video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Función para eliminar video
  const handleVideoDelete = async () => {
    if (!currentVideoUrl || !dataSelect) {
      return;
    }

    try {
      setIsUploadingVideo(true);
      toast.loading("Eliminando video...");

      // Actualizar video en la base de datos a null (elimina automáticamente del storage)
      await ActualizarVideoMalla(dataSelect.id, null, currentVideoUrl);
      
      // Actualizar estados
      setCurrentVideoUrl("");
      setValue("video", "");
      setSelectedVideo(null);
      
      // Limpiar input
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      
      toast.dismiss();
      toast.success("Video eliminado exitosamente");
      setMensaje("¡Video eliminado con éxito!");
      setTimeout(() => setMensaje(""), 1500);
      
    } catch (error) {
      console.error("Error al eliminar video:", error);
      toast.dismiss();
      toast.error(error.message || "Error al eliminar el video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // ==================== FUNCIONES PARA VIDEO MÓVIL ====================

  // Función para seleccionar video móvil
  const handleVideoMovilSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea MP4
      if (file.type !== 'video/mp4') {
        toast.error("Solo se permiten archivos MP4");
        return;
      }

      // Validar tamaño (máximo 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error("El archivo es demasiado grande. Máximo 100MB");
        return;
      }

      // Validar duración del video móvil (entre 30 y 40 segundos)
      try {
        const videoDuration = await getVideoDuration(file);
        const errorDuracion = validarDuracionVideoMovil(videoDuration);
        if (errorDuracion) {
          toast.error(errorDuracion);
          return;
        }
      } catch (error) {
        toast.error("No se pudo verificar la duración del video móvil");
        return;
      }

      setSelectedVideoMovil(file);
      toast.success(`Video móvil seleccionado: ${file.name}`);
    }
  };

  // Función para subir video móvil
  const handleVideoMovilSubmit = async () => {
    if (!selectedVideoMovil || !dataSelect) {
      toast.error("No hay video móvil seleccionado");
      return;
    }

    try {
      setIsUploadingVideoMovil(true);
      toast.loading("Subiendo video móvil...");

      // Subir video al storage
      const videoUrl = await SubirVideoMovilMallaAlStorage(selectedVideoMovil, dataSelect.id);
      
      // Actualizar video en la base de datos
      await ActualizarVideoMovilMalla(dataSelect.id, videoUrl, currentVideoMovilUrl);
      
      // Actualizar estados
      setCurrentVideoMovilUrl(videoUrl);
      setValue("videomovil", videoUrl);
      setSelectedVideoMovil(null);
      
      // Limpiar input
      if (videoMovilInputRef.current) {
        videoMovilInputRef.current.value = '';
      }
      
      toast.dismiss();
      toast.success("Video móvil subido exitosamente");
      setMensaje("¡Video móvil subido con éxito!");
      setTimeout(() => setMensaje(""), 1500);
      
    } catch (error) {
      console.error("Error al subir video móvil:", error);
      toast.dismiss();
      toast.error(error.message || "Error al subir el video móvil");
    } finally {
      setIsUploadingVideoMovil(false);
    }
  };

  // Función para eliminar video móvil
  const handleVideoMovilDelete = async () => {
    if (!currentVideoMovilUrl || !dataSelect) {
      return;
    }

    try {
      setIsUploadingVideoMovil(true);
      toast.loading("Eliminando video móvil...");

      // Actualizar video móvil en la base de datos a null (elimina automáticamente del storage)
      console.log("handleVideoMovilDelete - Llamando ActualizarVideoMovilMalla con:", {
        id: dataSelect.id,
        nuevoVideoUrl: null,
        videoAnteriorUrl: currentVideoMovilUrl
      });
      await ActualizarVideoMovilMalla(dataSelect.id, null, currentVideoMovilUrl);
      
      // Actualizar estados
      setCurrentVideoMovilUrl("");
      setValue("videomovil", "");
      setSelectedVideoMovil(null);
      
      // Limpiar input
      if (videoMovilInputRef.current) {
        videoMovilInputRef.current.value = '';
      }
      
      toast.dismiss();
      toast.success("Video móvil eliminado exitosamente");
      setMensaje("¡Video móvil eliminado con éxito!");
      setTimeout(() => setMensaje(""), 1500);
      
    } catch (error) {
      console.error("Error al eliminar video móvil:", error);
      toast.dismiss();
      toast.error(error.message || "Error al eliminar el video móvil");
    } finally {
      setIsUploadingVideoMovil(false);
    }
  };

  return (
    <Container>
      <form className="formulario">
        <h2>Editar Malla Publicitaria</h2>
        <InputText icono={<FaRegImage />}>
          <input className="form__field" {...register("linkimg1", { required: true })} placeholder=" " />
          <label className="form__label">Link imagen 1</label>
          <span style={{fontSize: '13px', color: '#888'}}>Solo acepta links de imágenes. Puedes subir tu imagen a <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" style={{color:'#007BFF',textDecoration:'underline'}}>ImgBB</a> y pegar el enlace aquí.</span>
        </InputText>
        <InputText icono={<FaRegImage />}>
          <input className="form__field" {...register("linkimg2", { required: true })} placeholder=" " />
          <label className="form__label">Link imagen 2</label>
          <span style={{fontSize: '13px', color: '#888'}}>Solo acepta links de imágenes. Puedes subir tu imagen a <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" style={{color:'#007BFF',textDecoration:'underline'}}>ImgBB</a> y pegar el enlace aquí.</span>
        </InputText>
        <InputText icono={<FaRegImage />}>
          <input className="form__field" {...register("texto", { required: true })} placeholder=" " />
          <label className="form__label">Texto descriptivo</label>
        </InputText>

        {/* Sección de Video */}
        <VideoSection>
          <VideoHeader>
            <FaVideo />
            <h3>Video de Portada</h3>
          </VideoHeader>
          
          {/* Mostrar video actual si existe */}
          {currentVideoUrl && currentVideoUrl.trim() !== '' && (
            <CurrentVideoContainer>
              <VideoPreview>
                <video controls width="100%" style={{ maxHeight: '200px', borderRadius: '8px' }}>
                  <source src={currentVideoUrl} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </VideoPreview>
              <VideoActions>
                <DeleteVideoButton 
                  type="button" 
                  onClick={handleVideoDelete}
                  disabled={isUploadingVideo}
                >
                  <FaTrash /> Eliminar Video
                </DeleteVideoButton>
              </VideoActions>
              <VideoReplaceInfo>
                <p>💡 Para subir un nuevo video, primero elimina el video actual</p>
              </VideoReplaceInfo>
            </CurrentVideoContainer>
          )}

          {/* Input para seleccionar nuevo video - Solo mostrar si no hay video actual */}
          {(!currentVideoUrl || currentVideoUrl.trim() === '') && (
            <VideoUploadContainer>
              <VideoInputWrapper>
                <VideoInput
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoSelect}
                  disabled={isUploadingVideo}
                />
                <VideoInputLabel>
                  <FaVideo />
                  {selectedVideo ? selectedVideo.name : 'Seleccionar video MP4'}
                </VideoInputLabel>
              </VideoInputWrapper>
              
              {selectedVideo && (
                <UploadVideoButton 
                  type="button" 
                  onClick={handleVideoSubmit}
                  disabled={isUploadingVideo}
                >
                  <FaUpload /> 
                  {isUploadingVideo ? 'Subiendo...' : 'Subir Video'}
                </UploadVideoButton>
              )}
            </VideoUploadContainer>
          )}

          <VideoInfo>
            <p><strong>Requisitos del video:</strong></p>
            <ul>
              <li>Formato: MP4 únicamente</li>
              <li>Duración: Entre 30 y 40 segundos</li>
              <li>Tamaño máximo: 100MB</li>
            </ul>
          </VideoInfo>
        </VideoSection>

        {/* Sección de Video Móvil */}
        <VideoSection>
          <VideoHeader>
            <FaVideo style={{ color: '#3a4b86', fontSize: '1.2rem' }} />
            <h3 style={{ color: '#3a4b86', margin: 0 }}>Video Móvil (Dispositivos Móviles)</h3>
          </VideoHeader>

          {/* Video móvil actual */}
          {currentVideoMovilUrl && currentVideoMovilUrl.trim() !== '' && (
            <CurrentVideoContainer>
              <VideoPreview>
                <video controls style={{ width: '100%', maxHeight: '200px' }}>
                  <source src={currentVideoMovilUrl} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </VideoPreview>
              <VideoActions>
                <DeleteVideoButton 
                  type="button" 
                  onClick={handleVideoMovilDelete}
                  disabled={isUploadingVideoMovil}
                >
                  <FaTrash /> Eliminar Video Móvil
                </DeleteVideoButton>
              </VideoActions>
              <VideoReplaceInfo>
                <p>💡 Para subir un nuevo video móvil, primero elimina el video actual</p>
              </VideoReplaceInfo>
            </CurrentVideoContainer>
          )}

          {/* Input para seleccionar nuevo video móvil - Solo mostrar si no hay video actual */}
          {(!currentVideoMovilUrl || currentVideoMovilUrl.trim() === '') && (
            <VideoUploadContainer>
              <VideoInputWrapper>
                <VideoInput
                  ref={videoMovilInputRef}
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoMovilSelect}
                  disabled={isUploadingVideoMovil}
                />
                <VideoInputLabel>
                  <FaVideo />
                  {selectedVideoMovil ? selectedVideoMovil.name : 'Seleccionar video móvil MP4'}
                </VideoInputLabel>
              </VideoInputWrapper>
              
              {selectedVideoMovil && (
                <UploadVideoButton 
                  type="button" 
                  onClick={handleVideoMovilSubmit}
                  disabled={isUploadingVideoMovil}
                >
                  <FaUpload /> 
                  {isUploadingVideoMovil ? 'Subiendo...' : 'Subir Video Móvil'}
                </UploadVideoButton>
              )}
            </VideoUploadContainer>
          )}

          <VideoInfo>
            <p><strong>Requisitos del video móvil:</strong></p>
            <ul>
              <li>Formato: MP4 únicamente</li>
              <li>Duración: Entre 30 y 40 segundos</li>
              <li>Tamaño máximo: 100MB</li>
              <li>Optimizado para dispositivos móviles</li>
            </ul>
          </VideoInfo>
        </VideoSection>

        {mensaje && <div className="mensaje-exito">{mensaje}</div>}
      </form>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 32px 24px;
  margin: 0 auto;
  
  h2 {
    color: #3a4b86;
    margin-bottom: 24px;
    text-align: center;
    font-size: 1.5rem;
  }
  
  .formulario {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .btnguardarContent {
    display: flex;
    justify-content: flex-end;
  }
  .mensaje-exito {
    margin-top: 10px;
    color: #1bc47d;
    font-weight: 500;
    text-align: center;
  }
`;

const VideoSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e9ecef;
`;

const VideoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #3a4b86;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  svg {
    font-size: 1.3rem;
  }
`;

const CurrentVideoContainer = styled.div`
  margin-bottom: 20px;
`;

const VideoPreview = styled.div`
  margin-bottom: 12px;
  
  video {
    border: 2px solid #dee2e6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const VideoActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const VideoReplaceInfo = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
  
  p {
    margin: 0;
    color: #856404;
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
  }
`;

const DeleteVideoButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const VideoUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const VideoInputWrapper = styled.div`
  position: relative;
`;

const VideoInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const VideoInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border: 2px dashed #3a4b86;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #3a4b86;
  font-weight: 500;
  
  &:hover {
    background: #f8f9fa;
    border-color: #6c5ce7;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const UploadVideoButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const VideoInfo = styled.div`
  background: #e3f2fd;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #2196f3;
  
  p {
    margin: 0 0 8px 0;
    color: #1565c0;
    font-weight: 600;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: #424242;
    
    li {
      margin-bottom: 4px;
      font-size: 0.9rem;
    }
  }
`; 