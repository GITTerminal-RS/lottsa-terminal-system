import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, InputTextArea, Btnsave, usePublicidadStore, ConvertirCapitalize, useOperadoraStore } from "../../../index";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { FaCloudUploadAlt, FaVideo, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { 
  SubirVideoPublicidadAlStorage, 
  ActualizarPublicidadConVideo, 
  EliminarVideoPublicidad,
  EliminarVideoPublicidadDelStorage
} from "../../../supabase/crudPublicidadMultimedia";

export function RegistrarPublicidad({ onClose, dataSelect, accion, setdataSelect }) {
  const { insertarPublicidad, actualizarPublicidad, cargarPublicidad } = usePublicidadStore();
  const { dataoperadora } = useOperadoraStore();
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el video
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const fileInputRef = useRef(null);
  
  // Estado local para mantener los datos actualizados
  const [localDataSelect, setLocalDataSelect] = useState(dataSelect);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues
  } = useForm();

  useEffect(() => {
    console.log("RegistrarPublicidad - useEffect principal ejecutándose:", { accion, dataSelect });
    
    if (accion === "Editar" && dataSelect) {
      console.log("RegistrarPublicidad - Inicializando formulario para edición:", dataSelect);
      
      setValue("descripcion", dataSelect.descripcion || "");
      setValue("referencia", dataSelect.referencia || "");
      setValue("direccion", dataSelect.direccion || "");
      setValue("mapa", dataSelect.mapa || "");
      setValue("numerocelular", dataSelect.numerocelular || "");
      setValue("video", dataSelect.video || "");
      
      // Establecer video actual si existe
      if (dataSelect.video) {
        console.log("RegistrarPublicidad - Estableciendo video actual:", dataSelect.video);
        setCurrentVideoUrl(dataSelect.video);
      }
    } else {
      console.log("RegistrarPublicidad - Inicializando formulario para nuevo registro");
      reset({
        descripcion: "",
        referencia: "",
        direccion: "",
        mapa: "",
        numerocelular: "",
        video: ""
      });
      setCurrentVideoUrl(null);
      setSelectedVideo(null);
    }
  }, [accion, dataSelect, reset, setValue]);

  // Sincronizar estado local cuando cambie dataSelect
  useEffect(() => {
    setLocalDataSelect(dataSelect);
  }, [dataSelect]);

  // Efecto específico para manejar cambios de video en dataSelect
  useEffect(() => {
    if (accion === "Editar" && dataSelect?.video !== undefined) {
      console.log("RegistrarPublicidad - Actualizando video desde dataSelect:", dataSelect.video);
      console.log("RegistrarPublicidad - dataSelect completo:", dataSelect);
      console.log("RegistrarPublicidad - currentVideoUrl actual:", currentVideoUrl);
      
      // Actualizar el estado del video cuando cambie dataSelect
      setCurrentVideoUrl(dataSelect.video);
      
      // Actualizar el campo video en el formulario
      setValue("video", dataSelect.video || "");
      
      // Limpiar video seleccionado si hay uno
      setSelectedVideo(null);
      
      console.log("RegistrarPublicidad - Después de actualizar estados");
    }
  }, [dataSelect?.video, accion, setValue]);

  // Función para manejar la selección de archivo
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tipo de archivo
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

    setSelectedVideo(file);
    setCurrentVideoUrl(null); // Limpiar video actual
    
    // Actualizar el campo video en el formulario (vacío hasta que se suba)
    setValue("video", "");
  };

  // Función para manejar drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Función para manejar click en el área de upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar cambio en input de archivo
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Función para eliminar video seleccionado
  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setCurrentVideoUrl(null);
    
    // Actualizar el campo video en el formulario
    setValue("video", "");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para manejar la subida y actualización del video
  const handleVideoSubmit = async (idPublicidad, showIndividualMessages = true) => {
    try {
      if (!selectedVideo) {
        console.log("No hay video nuevo para subir");
        return;
      }

      setIsUploadingVideo(true);
      if (showIndividualMessages) {
        toast.loading("Video subiendo...");
      }

      // Subir video al storage
      const videoUrl = await SubirVideoPublicidadAlStorage(selectedVideo, idPublicidad, dataoperadora?.id);
      
      // Actualizar publicidad en la base de datos (incluye eliminación automática del video anterior)
      await ActualizarPublicidadConVideo(idPublicidad, videoUrl);
      
      // Limpiar estados y actualizar estado local
      setSelectedVideo(null);
      setCurrentVideoUrl(videoUrl);
      
      // Actualizar estado local con el nuevo video
      setLocalDataSelect(prev => ({
        ...prev,
        video: videoUrl
      }));
      
      // Actualizar el campo video en el formulario
      setValue("video", videoUrl);
      
      if (showIndividualMessages) {
        toast.dismiss();
        toast.success("Video subido exitosamente");
      }
      
    } catch (error) {
      console.error("Error al subir video:", error);
      if (showIndividualMessages) {
        toast.dismiss();
        toast.error(error.message || "Error al subir el video");
      }
      throw error; // Re-lanzar el error para que sea manejado por la función padre
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Función para eliminar video existente
  const handleVideoDelete = async () => {
    try {
      if (!dataSelect?.id) {
        toast.error("No se puede eliminar el video");
        return;
      }

      toast.loading("Eliminando video...");
      
      await EliminarVideoPublicidad(dataSelect.id);
      
      setCurrentVideoUrl(null);
      setSelectedVideo(null);
      
      // Actualizar estado local eliminando el video
      setLocalDataSelect(prev => ({
        ...prev,
        video: null
      }));
      
      // Actualizar el campo video en el formulario
      setValue("video", "");
      
      toast.dismiss();
      toast.success("Video eliminado exitosamente");
      
    } catch (error) {
      console.error("Error al eliminar video:", error);
      toast.dismiss();
      toast.error(error.message || "Error al eliminar el video");
    }
  };

  async function insertar(data) {
    try {
      setIsLoading(true);

      if (!data.descripcion?.trim()) {
        throw new Error("La descripción no puede estar vacía");
      }

      if (accion === "Editar") {
        if (!localDataSelect?.id) {
          throw new Error("No hay datos de publicidad seleccionada para editar");
        }

        const datosActualizados = {
          id: parseInt(localDataSelect.id),
          descripcion: ConvertirCapitalize(data.descripcion.trim()),
          referencia: data.referencia?.trim() || "",
          direccion: ConvertirCapitalize(data.direccion?.trim() || ""),
          mapa: data.mapa?.trim() || "",
          numerocelular: data.numerocelular?.trim() || "",
          video: currentVideoUrl || "" // Usar el estado actual del video
        };

        // Verificar que los datos no sean iguales a los actuales
        const datosActuales = {
          id: parseInt(localDataSelect.id),
          descripcion: localDataSelect.descripcion,
          referencia: localDataSelect.referencia,
          direccion: localDataSelect.direccion,
          mapa: localDataSelect.mapa,
          numerocelular: localDataSelect.numerocelular,
          video: localDataSelect.video
        };

        // Verificar cambios en campos normales
        const hayCambiosCampos = JSON.stringify(datosActuales) !== JSON.stringify(datosActualizados);
        
        // Verificar cambios en video
        const hayCambiosVideo = selectedVideo !== null || 
          (localDataSelect.video && !currentVideoUrl) || // Video eliminado
          (!localDataSelect.video && currentVideoUrl); // Video agregado
        
        const hayCambios = hayCambiosCampos || hayCambiosVideo;
        
        if (!hayCambios) {
          await Swal.fire({
            icon: "info",
            title: "Sin cambios",
            text: "No se detectaron cambios en los datos",
            timer: 1500,
            showConfirmButton: false
          });
          onClose();
          return;
        }

        const resultado = await actualizarPublicidad(datosActualizados);
        
        if (!resultado) {
          throw new Error("Error al actualizar la publicidad");
        }

        let videoFinal = resultado.video; // Video final que se guardará
        
        // Manejar video si hay uno seleccionado o si se eliminó
        if (selectedVideo) {
          try {
            // Subir video y obtener la URL
            const videoUrl = await SubirVideoPublicidadAlStorage(selectedVideo, resultado.id, dataoperadora?.id);
            await ActualizarPublicidadConVideo(resultado.id, videoUrl);
            videoFinal = videoUrl;
            
            // Limpiar estados
            setSelectedVideo(null);
            setCurrentVideoUrl(videoUrl);
          } catch (error) {
            console.error("Error al subir video:", error);
            // No lanzar error aquí para no interrumpir la actualización
          }
        } else if (localDataSelect.video && !currentVideoUrl) {
          // Si había un video y ahora no hay ninguno, eliminar el video
          try {
            await EliminarVideoPublicidad(resultado.id);
            videoFinal = null;
            
            // Actualizar estado local eliminando el video
            setLocalDataSelect(prev => ({
              ...prev,
              video: null
            }));
            
            // Limpiar estados
            setCurrentVideoUrl(null);
            setSelectedVideo(null);
            
            // Actualizar el campo video en el formulario
            setValue("video", "");
          } catch (error) {
            console.error("Error al eliminar video:", error);
            // No lanzar error aquí para no interrumpir la actualización
          }
        }
        
        // Actualizar estado local con el resultado completo incluyendo el video final
        setLocalDataSelect(prev => ({
          ...prev,
          ...resultado,
          video: videoFinal
        }));
        
        // Actualizar el campo video en el formulario con el valor final
        setValue("video", videoFinal || "");
        
        // Recargar los datos del store para asegurar sincronización
        await cargarPublicidad();
        
        // Actualizar el dataSelect del componente padre con los datos actualizados
        if (setdataSelect) {
          const datosActualizados = {
            id: resultado.id,
            descripcion: resultado.descripcion,
            referencia: resultado.referencia,
            direccion: resultado.direccion,
            mapa: resultado.mapa,
            numerocelular: resultado.numerocelular,
            video: videoFinal
          };
          console.log("RegistrarPublicidad - Actualizando dataSelect del padre:", datosActualizados);
          setdataSelect(datosActualizados);
        }

        onClose();
      } else {
        const nuevoRegistro = {
          descripcion: ConvertirCapitalize(data.descripcion.trim()),
          referencia: data.referencia?.trim() || "",
          direccion: ConvertirCapitalize(data.direccion?.trim() || ""),
          mapa: data.mapa?.trim() || "",
          numerocelular: data.numerocelular?.trim() || "",
          video: data.video?.trim() || ""
        };

        const resultado = await insertarPublicidad(nuevoRegistro);
        
        if (!resultado) {
          throw new Error("Error al crear la publicidad");
        }

        // Manejar video si hay uno seleccionado
        if (selectedVideo) {
          try {
            await handleVideoSubmit(resultado.id, false);
          } catch (error) {
            console.error("Error al subir video:", error);
            // No lanzar error aquí para no interrumpir la creación
          }
        }

        reset();
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al guardar los datos de la publicidad",
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>
              {accion === "Editar" ? "Editar publicidad" : "Registrar nueva publicidad"}
            </h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>

        <form className="formulario" onSubmit={handleSubmit(insertar)}>
          <section>
            <article>
              <InputTextArea icono={<v.icononombre />}>
                <textarea
                  className="form__field textarea-field"
                  placeholder=""
                  rows="3"
                  {...register("descripcion", {
                    required: true,
                  })}
                />
                <label className="form__label">Descripción</label>
                {errors.descripcion?.type === "required" && <p>Campo requerido</p>}
              </InputTextArea>
            </article>

            <article>
              <InputText icono={<v.icononombre />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder=""
                  {...register("referencia")}
                />
                <label className="form__label">Referencia</label>
              </InputText>
            </article>

            <article>
              <InputTextArea icono={<v.icononombre />}>
                <textarea
                  className="form__field textarea-field"
                  placeholder=""
                  rows="2"
                  {...register("direccion")}
                />
                <label className="form__label">Dirección</label>
              </InputTextArea>
            </article>

            <article>
              <InputText icono={<v.icononombre />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder=""
                  {...register("mapa")}
                />
                <label className="form__label">Mapa (URL)</label>
              </InputText>
            </article>

            <article>
              <InputText icono={<v.icononombre />}>
                <input
                  className="form__field"
                  type="tel"
                  placeholder=""
                  {...register("numerocelular")}
                />
                <label className="form__label">Número de celular</label>
              </InputText>
            </article>

            <article>
              <VideoUploadSection>
                <label className="form__label">Video</label>
                
                {/* Debug info */}
                {console.log("RegistrarPublicidad - Render - selectedVideo:", selectedVideo)}
                {console.log("RegistrarPublicidad - Render - currentVideoUrl:", currentVideoUrl)}
                {console.log("RegistrarPublicidad - Render - dataSelect.video:", dataSelect?.video)}
                
                {/* Área de upload */}
                <VideoUploadArea
                  isDragOver={isDragOver}
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  
                  {selectedVideo ? (
                    <div className="video-selected">
                      <FaVideo className="video-icon" />
                      <div className="video-info">
                        <p className="video-name">{selectedVideo.name}</p>
                        <p className="video-size">
                          {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideo();
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : currentVideoUrl ? (
                    <div className="video-current">
                      <FaVideo className="video-icon" />
                      <div className="video-info">
                        <p className="video-name">Video actual</p>
                        <a 
                          href={currentVideoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="video-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver video
                        </a>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoDelete();
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FaCloudUploadAlt className="upload-icon" />
                      <p className="upload-text">Arrastra un video MP4 aquí o haz clic para seleccionar</p>
                      <p className="upload-hint">Máximo 100MB, duración máxima 35 segundos</p>
                    </div>
                  )}
                </VideoUploadArea>
                
                {isUploadingVideo && (
                  <div className="uploading-indicator">
                    <div className="spinner"></div>
                    <span>Subiendo video...</span>
                  </div>
                )}
              </VideoUploadSection>
            </article>
          </section>

          <section className="actions">
            <Btnsave
              icono={<v.iconoguardar />}
              titulo={isLoading ? "Guardando..." : accion === "Editar" ? "Actualizar" : "Guardar"}
              funcion={handleSubmit(insertar)}
              loading={isLoading}
            />
          </section>
        </form>
      </div>
    </Container>
  );
}

const VideoUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .form__label {
    font-size: 0.9rem;
    color: ${(props) => props.theme.text2};
    margin-bottom: 8px;
    font-weight: 500;
  }

  .uploading-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: ${(props) => props.theme.bg2};
    border-radius: 8px;
    color: ${(props) => props.theme.text};

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid ${(props) => props.theme.bg3};
      border-top: 2px solid ${(props) => props.theme.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

const VideoUploadArea = styled.div`
  border: 2px dashed ${(props) => props.isDragOver ? props.theme.primary : props.theme.bg3};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${(props) => props.isDragOver ? `${props.theme.primary}10` : props.theme.bg};
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${(props) => props.theme.primary};
    background-color: ${(props) => props.theme.bg2};
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    .upload-icon {
      font-size: 2rem;
      color: ${(props) => props.theme.text2};
    }

    .upload-text {
      font-size: 1rem;
      color: ${(props) => props.theme.text};
      margin: 0;
      font-weight: 500;
    }

    .upload-hint {
      font-size: 0.8rem;
      color: ${(props) => props.theme.text2};
      margin: 0;
    }
  }

  .video-selected,
  .video-current {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    padding: 10px;
    background-color: ${(props) => props.theme.bg2};
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.bg3};

    .video-icon {
      font-size: 1.5rem;
      color: ${(props) => props.theme.primary};
    }

    .video-info {
      flex: 1;
      text-align: left;

      .video-name {
        font-size: 0.9rem;
        color: ${(props) => props.theme.text};
        margin: 0 0 4px 0;
        font-weight: 500;
      }

      .video-size {
        font-size: 0.8rem;
        color: ${(props) => props.theme.text2};
        margin: 0;
      }

      .video-link {
        font-size: 0.8rem;
        color: ${(props) => props.theme.primary};
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .remove-btn {
      background: ${(props) => props.theme.colorError};
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background: ${(props) => props.theme.colorError}dd;
      }
    }
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .sub-contenedor {
    background-color: ${(props) => props.theme.bg};
    border-radius: 20px;
    box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.16);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 0;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid ${(props) => props.theme.bg3};

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: ${(props) => props.theme.text};
        margin: 0;
      }

      span {
        font-size: 1.5rem;
        cursor: pointer;
        color: ${(props) => props.theme.text2};
        transition: color 0.3s;

        &:hover {
          color: ${(props) => props.theme.text};
        }
      }
    }

    .formulario {
      padding: 30px;

      section {
        display: flex;
        flex-direction: column;
        gap: 20px;

        article {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }

      .actions {
        margin-top: 30px;
        display: flex;
        justify-content: center;
      }
    }
  }

  @media (max-width: 768px) {
    .sub-contenedor {
      width: 95%;
      margin: 20px;
      
      .headers {
        padding: 15px 20px;
        
        h1 {
          font-size: 1.3rem;
        }
      }
      
      .formulario {
        padding: 20px;
      }
    }
  }
`;
