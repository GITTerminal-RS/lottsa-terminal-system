import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { Device } from "../../../styles/breackpoints";
import {
  InputText,
  Btnsave,
  ConvertirCapitalize,
  useDestinosStore,
  ContainerSelector,
  Selector,
  useRutaStore,
  Btnfiltro,
  ListaGenerica,
  useHorariosStore,
  supabase,
  MostrarHorariosXDestino,
} from "../../../index";
import { RegistrarRuta } from "./RegistrarRuta";
import { RegistrarHorarios } from "./RegistrarHorarios";
import { useForm } from "react-hook-form";
import { useOperadoraActiva } from "../../../hooks/useOperadoraActiva";
import Swal from "sweetalert2";
import ecuadorData from "../../../utils/Ecuador.json";
import { FaCloudUploadAlt, FaVideo, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { 
  ObtenerMultimediaPorDestino, 
  SubirVideoAlStorage, 
  ActualizarMultimedia, 
  EliminarMultimedia,
  EliminarVideoDelStorage,
  ActualizarMultimediaSinVideo
} from "../../../supabase/crudMultimedia";

// Obtener las provincias del archivo JSON
const PROVINCIAS = ecuadorData.Ecuador.map(item => ConvertirCapitalize(item.provincia));

const HorariosPizarra = styled.div`
  margin-top: 15px;
  padding: 12px;
  background: ${({ theme }) => theme.bg};
  border: 2px solid ${({ theme }) => theme.bg2};
  border-radius: 12px;
  min-height: 120px;

  .pizarra-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.bg2};

    h3 {
      font-size: 15px;
      color: ${({ theme }) => theme.text};
      font-weight: 500;
    }

    .horario-actual {
      font-size: 13px;
      color: #fc6027;
      font-weight: 500;
    }
  }

  .timeline {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-height: 250px;
    overflow-y: auto;
    padding-right: 5px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.bg2};
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #fc6027;
      border-radius: 3px;
    }
  }

  .horario-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: ${({ theme }) => theme.bg2};
    border-radius: 6px;
    transition: all 0.2s ease;
    min-height: 40px;
    cursor: pointer;

    &:hover {
      background: ${({ theme }) => theme.bg3};
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .horario-icon {
      font-size: 16px;
      flex-shrink: 0;
      color: ${({ theme, color }) => color || theme.text};
    }

    .horario-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .horario-texto {
        font-size: 13px;
        color: ${({ theme }) => theme.text};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .horario-color {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        align-self: flex-end;
      }
    }

    .horario-acciones {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
      flex-shrink: 0;

      button {
        background: none;
        border: none;
        cursor: pointer;
        color: ${({ theme }) => theme.text};
        font-size: 14px;
        padding: 2px;
        border-radius: 3px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;

        &:hover {
          background: ${({ theme }) => theme.bg3};
          color: #007BFF;
        }
      }
    }

    &:hover .horario-acciones {
      opacity: 1;
    }
  }

  .pizarra-vacia {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    color: ${({ theme }) => theme.text};
    opacity: 0.7;
    text-align: center;

    .icono {
      font-size: 20px;
      margin-bottom: 8px;
    }

    p {
      font-size: 13px;
      margin: 2px 0;
    }
  }
`;

const HorarioInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .horario-input {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid ${({ theme }) => theme.bg2};
    border-radius: 8px;
    font-size: 14px;
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.bg};
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #fc6027;
      box-shadow: 0 0 0 2px rgba(252, 96, 39, 0.1);
    }

    &::-webkit-calendar-picker-indicator {
      background: transparent;
      cursor: pointer;
      position: absolute;
      right: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }

    &::-webkit-datetime-edit {
      padding: 0;
    }

    &::-webkit-datetime-edit-fields-wrapper {
      padding: 0;
    }

    &::-webkit-datetime-edit-text {
      padding: 0 2px;
      color: ${({ theme }) => theme.text};
    }

    &::-webkit-datetime-edit-hour-field,
    &::-webkit-datetime-edit-minute-field {
      padding: 0 2px;
      color: ${({ theme }) => theme.text};
    }

    &::-webkit-datetime-edit-second-field {
      display: none;
    }

    &::-webkit-datetime-edit-ampm-field {
      display: none;
    }
  }
`;

const CheckboxContainer = styled.div`
  margin: 10px 0;
  
  .checkbox-label {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    font-size: 16px;
    color: ${({ theme }) => theme.text};
    user-select: none;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      left: 0;
      height: 25px;
      width: 25px;
      background-color: ${({ theme }) => theme.bg};
      border: 2px solid #fc6027;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:after {
        content: "";
        position: absolute;
        display: none;
        left: 8px;
        top: 4px;
        width: 5px;
        height: 12px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    &:hover input ~ .checkmark {
      background-color: ${({ theme }) => theme.bg2};
    }

    input:checked ~ .checkmark {
      background-color: #fc6027;
    }

    input:checked ~ .checkmark:after {
      display: block;
    }
  }
`;

const TimeInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  .time-label {
    font-size: 16px;
    color: ${({ theme }) => theme.text};
    font-weight: 500;
  }

  .time-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: ${({ theme }) => theme.bg};
    border: 2px solid ${({ theme }) => theme.bg2};
    border-radius: 8px;
    padding: 0 15px;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: #fc6027;
      box-shadow: 0 0 0 2px rgba(252, 96, 39, 0.1);
    }

    .time-input {
      width: 100%;
      padding: 12px 0;
      font-size: 16px;
      color: ${({ theme }) => theme.text};
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;

      &::-webkit-calendar-picker-indicator {
        background: transparent;
        cursor: pointer;
        position: absolute;
        right: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
      }

      &::-webkit-datetime-edit {
        padding: 0;
      }

      &::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
      }

      &::-webkit-datetime-edit-text {
        padding: 0 2px;
        color: ${({ theme }) => theme.text};
      }

      &::-webkit-datetime-edit-hour-field,
      &::-webkit-datetime-edit-minute-field {
        padding: 0 2px;
        color: ${({ theme }) => theme.text};
      }

      /* Ocultar los segundos */
      &::-webkit-datetime-edit-second-field {
        display: none;
      }

      /* Ocultar el separador de segundos */
      &::-webkit-datetime-edit-ampm-field {
        display: none;
      }
    }

    .time-icon {
      position: absolute;
      right: 15px;
      font-size: 18px;
      pointer-events: none;
      color: ${({ theme }) => theme.text};
    }
  }

  .error-message {
    color: #007BFF;
    font-size: 14px;
    margin-top: 4px;
  }
`;

const VideoUploadContainer = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: ${({ theme }) => theme.bg};
  border: 2px dashed ${({ theme, isDragOver }) => isDragOver ? '#007BFF' : theme.bg2};
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 75px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  position: relative;

  &:hover {
    border-color: #007BFF;
    background: ${({ theme }) => theme.bg2};
  }

  .upload-icon {
    font-size: 1.5rem;
    color: #007BFF;
    margin-bottom: 5px;
  }

  .upload-text {
    font-size: 12px;
    color: ${({ theme }) => theme.text};
    margin-bottom: 0px;
    font-weight: 500;
  }

  .upload-hint {
    font-size: 12px;
    color: ${({ theme }) => theme.text};
    opacity: 0.7;
  }

  .video-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 100%;
  }

  .remove-video {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 0, 0, 1);
      transform: scale(1.1);
    }
  }
`;

const ContentCard = styled.div`
  background-color: ${({ theme }) => theme.bg};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.text};
`;

const ContainerEmojiPicker = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

// Función auxiliar para determinar el color según AM/PM
const getColorByTime = (time) => {
  const [hours] = time.split(':').map(Number);
  return hours < 12 ? '#4CAF50' : '#FFC107'; // Verde para AM, Amarillo para PM
};

export function RegistrarDestinos({ onClose, dataSelect, accion }) {
  const { insertardestinos, editardestinos } = useDestinosStore();
  const operadoraActiva = useOperadoraActiva();
  const { rutaItemSelect, dataruta, selectRuta, mostrarRuta } = useRutaStore();
  const { horariosItemSelect, datahorarios, selecthorarios, mostrarhorarios, horarios, sethorarios, eliminahorarios, edithorarios } = useHorariosStore();
  const [stateRuta, setStateRuta] = useState(false);
  const [stateProvincia, setStateProvincia] = useState(false);
  const [stateCiudad, setStateCiudad] = useState(false);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState(null);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
  const [openRegistroRuta, SetopenRegistroRuta] = useState(false);
  const [openRegistroHorario, SetopenRegistroHorario] = useState(false);
  const [subaccion, setAccion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarFrecuencia, setMostrarFrecuencia] = useState(false);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState("");

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm();

  // Estados para el video
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
      try {
        setIsLoading(true);
      
      if (accion === "Editar" && dataSelect) {
        // Cargar datos del destino
        const fields = [
          'id', 'descripcion', 'idruta', 'provinciadestino',
          'ciudaddestino', 'direcciondestino', 'frecuenciapaso'
        ];
        fields.forEach(field => setValue(field, dataSelect[field]));

        // Configurar frecuencia de paso si existe
        if (dataSelect.frecuenciapaso) {
          setMostrarFrecuencia(true);
          setValue("frecuencia", dataSelect.frecuenciapaso);
        } else {
          setMostrarFrecuencia(false);
          setValue("frecuencia", "");
        }

        // Cargar provincia y ciudades
        if (dataSelect.provinciadestino) {
          try {
            setProvinciaSeleccionada(dataSelect.provinciadestino);
            const provinciaData = ecuadorData.Ecuador.find(p => 
              ConvertirCapitalize(p.provincia) === ConvertirCapitalize(dataSelect.provinciadestino) ||
              p.provincia.toLowerCase() === dataSelect.provinciadestino.toLowerCase()
            );
            if (provinciaData && provinciaData.ciudades) {
              setCiudadesDisponibles(provinciaData.ciudades.map(c => ConvertirCapitalize(c)));
            } else {
              console.warn(`Provincia no encontrada o sin ciudades: ${dataSelect.provinciadestino}`);
              setCiudadesDisponibles([]);
        }
      } catch (error) {
            console.error("Error al cargar provincia:", error);
            setCiudadesDisponibles([]);
          }
        }
        
        if (dataSelect.ciudaddestino) {
          setCiudadSeleccionada(dataSelect.ciudaddestino);
        }

        // Cargar ruta
        if (dataSelect.idruta) {
          const rutaData = dataruta.find(r => r.id === dataSelect.idruta);
          if (rutaData) {
            selectRuta(rutaData);
          }
        }

        // Cargar horarios
        try {
          const horariosCargados = await MostrarHorariosXDestino(dataSelect.id);
          if (horariosCargados && Array.isArray(horariosCargados)) {
            setHorariosSeleccionados(horariosCargados);
          }
        } catch (error) {
          console.error("Error al cargar horarios:", error);
          setHorariosSeleccionados([]);
        }

        // Cargar multimedia
        try {
          const multimedia = await ObtenerMultimediaPorDestino(dataSelect.id);
          if (multimedia && multimedia.video && multimedia.video !== 'link') {
            setCurrentVideoUrl(multimedia.video);
          }
        } catch (error) {
          console.error("Error al cargar multimedia:", error);
        }
      } else if (accion === "Nuevo") {
        // Seleccionar ruta 'General' por defecto si existe
        const rutaGeneral = dataruta.find(r => r.descripcion?.toLowerCase() === 'general');
        if (rutaGeneral) {
          selectRuta(rutaGeneral);
        } else {
          selectRuta(null);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos del destino");
    } finally {
      setIsLoading(false);
    }
  }, [accion, dataSelect, setValue, selectRuta, dataruta]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cargar rutas al montar el componente
  useEffect(() => {
    if (operadoraActiva?.id) {
      mostrarRuta({ id_operadora: operadoraActiva.id });
    }
  }, [operadoraActiva?.id, mostrarRuta]);

  const nuevoRegistroRuta = useCallback(() => {
    SetopenRegistroRuta(true);
    setAccion("Nuevo");
  }, []);

  const nuevoRegistroHorario = useCallback(() => {
    SetopenRegistroHorario(true);
    setAccion("Nuevo");
  }, []);

  const handleCloseRuta = useCallback(() => {
    SetopenRegistroRuta(false);
    setAccion("");
  }, []);

  const handleCloseHorario = useCallback(() => {
    SetopenRegistroHorario(false);
    setAccion("");
  }, []);

  const handleSelectProvincia = (provincia) => {
    setProvinciaSeleccionada(provincia);
    setValue("provinciadestino", provincia);
    setStateProvincia(false);
    
    // Actualizar las ciudades disponibles según la provincia seleccionada
    const provinciaData = ecuadorData.Ecuador.find(item => 
      item.provincia === provincia ||
      item.provincia.toLowerCase() === provincia.toLowerCase()
    );
    if (provinciaData && provinciaData.ciudades) {
      setCiudadesDisponibles(provinciaData.ciudades);
      setCiudadSeleccionada(null); // Resetear la ciudad seleccionada
      setValue("ciudaddestino", ""); // Resetear el valor del campo ciudad
    } else {
      console.warn(`Provincia no encontrada o sin ciudades: ${provincia}`);
      setCiudadesDisponibles([]);
      setCiudadSeleccionada(null);
      setValue("ciudaddestino", "");
    }
  };

  const handleSelectCiudad = (ciudad) => {
    setCiudadSeleccionada(ciudad);
    setValue("ciudaddestino", ciudad);
    setStateCiudad(false);
  };

  // Función para agregar un nuevo horario a la pizarra
  const handleAgregarHorario = () => {
    if (!nuevoHorario) {
      Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Por favor, ingrese un horario",
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Verificar si el horario ya existe en la pizarra actual
    const existe = horariosSeleccionados.some(h => h.descripcion === nuevoHorario);
    if (existe) {
      Swal.fire({
        icon: "warning",
        title: "Horario duplicado",
        text: "Este horario ya está en la pizarra",
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Crear un nuevo objeto de horario con el color según AM/PM
    const horario = {
      id: Date.now(),
      descripcion: nuevoHorario,
      color: getColorByTime(nuevoHorario)
    };

    setHorariosSeleccionados(prev => [...prev, horario]);
    selecthorarios(horario);
    setNuevoHorario("");
  };

  // Función para manejar la tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgregarHorario();
    }
  };

  // Función para eliminar un horario de la pizarra
  const handleEliminarHorario = (id) => {
    setHorariosSeleccionados(prev => prev.filter(h => h.id !== id));
    // Si el horario eliminado era el seleccionado, limpiar la selección
    if (horariosItemSelect?.id === id) {
      selecthorarios(null);
    }
  };

  // Función para registrar los horarios en la base de datos
  const registrarHorarios = async (idDestino, esEdicion = false) => {
    try {
      if (!horariosSeleccionados.length) {
        throw new Error("No hay horarios para registrar");
      }

      if (!operadoraActiva?.id) {
        throw new Error("No hay operadora seleccionada");
      }

      if (esEdicion) {
        // Primero eliminar los horarios existentes
        const { error: deleteError } = await supabase
          .from('horarios')
          .delete()
          .eq('id_destino', idDestino);

        if (deleteError) {
          throw new Error("Error al eliminar horarios existentes");
        }
      }

      // Registrar cada horario
      const promesas = horariosSeleccionados.map(horario => 
        supabase.rpc('insertarhorarios', {
          _descripcion: horario.descripcion,
          _idoperadora: operadoraActiva.id,
          _iddestino: idDestino,
          _color: horario.color
        })
      );

      await Promise.all(promesas);
    } catch (error) {
      console.error("Error al registrar horarios:", error);
      throw error;
    }
  };

  const handleVideoUpload = (file) => {
    // Validar tipo de archivo
    if (file.type !== 'video/mp4') {
      toast.error("Solo se permiten archivos MP4");
      return;
    }

    // Validar extensión
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'mp4') {
      toast.error("Solo se permiten archivos MP4");
      return;
    }

    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 100MB");
      return;
    }

    // Validar duración del video
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      if (video.duration > 35) {
        toast.error("El video debe tener una duración máxima de 35 segundos");
        return;
      }
      
      // Si pasa todas las validaciones, establecer el video
      setSelectedVideo(file);
      toast.success("Video seleccionado correctamente");
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      toast.error("No se pudo validar el video. Asegúrate de que sea un archivo MP4 válido");
    };
    
    video.src = URL.createObjectURL(file);
  };

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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleVideoUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  // Función para manejar la subida y actualización del video
  const handleVideoSubmit = async (idDestino, showIndividualMessages = true) => {
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
      const videoUrl = await SubirVideoAlStorage(selectedVideo, idDestino, operadoraActiva.id);
      
      // Actualizar multimedia en la base de datos (incluye eliminación automática del video anterior)
      await ActualizarMultimedia(idDestino, videoUrl);
      
      // Limpiar estados
      setSelectedVideo(null);
      setCurrentVideoUrl(videoUrl);
      
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
        toast.error("No hay destino seleccionado");
        return;
      }

      const confirmed = await Swal.fire({
        title: "¿Eliminar video?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (confirmed.isConfirmed) {
        toast.loading("Eliminando video...");
        
        await EliminarMultimedia(dataSelect.id);
        
        setCurrentVideoUrl(null);
        
        toast.dismiss();
        toast.success("Video eliminado exitosamente");
      }
    } catch (error) {
      console.error("Error al eliminar video:", error);
      toast.dismiss();
      toast.error(error.message || "Error al eliminar el video");
    }
  };

  async function insertar(data) {
    try {
      if (!data.descripcion?.trim()) {
        throw new Error("La descripción no puede estar vacía");
      }

      if (!rutaItemSelect?.id) {
        throw new Error("Debe seleccionar una ruta");
      }

      if (!horariosSeleccionados.length) {
        throw new Error("Debe registrar al menos un horario");
      }

      if (!operadoraActiva?.id) {
        throw new Error("No hay operadora seleccionada");
      }

      if (mostrarFrecuencia && !data.frecuencia) {
        throw new Error("Debe ingresar la frecuencia de paso");
      }

      const nuevoRegistro = {
        _descripcion: ConvertirCapitalize(data.descripcion.trim()),
        _idruta: parseInt(rutaItemSelect.id),
        _id_operadora: parseInt(operadoraActiva.id),
        _provinciadestino: ConvertirCapitalize(data.provinciadestino.trim()),
        _ciudaddestino: ConvertirCapitalize(data.ciudaddestino.trim()),
        _direcciondestino: ConvertirCapitalize(data.direcciondestino.trim()),
        _frecuenciapaso: mostrarFrecuencia ? data.frecuencia : null
      };

      // 1. Insertar destino
      const resultado = await insertardestinos(nuevoRegistro);
      
      const idInsertado = resultado?.data?.[0]?.id;
      if (!resultado?.success || !idInsertado || idInsertado === -1) {
        throw new Error(idInsertado === -1 ? "No se puede registrar el mismo destino con la misma ruta para esta operadora" : (resultado?.error || "Error al registrar el destino"));
      }

      const idDestino = idInsertado;
      
      // 2. Registrar horarios
      try {
        await registrarHorarios(idDestino, false);
      } catch (error) {
        throw new Error(`Error al registrar horarios: ${error.message}`);
      }
      
      // 3. Manejar multimedia
      try {
        if (selectedVideo) {
          toast.loading("Video subiendo...");
          await handleVideoSubmit(idDestino, false);
        } else {
          await ActualizarMultimediaSinVideo(idDestino);
        }
      } catch (error) {
        toast.dismiss();
        throw new Error(`Error al registrar multimedia: ${error.message}`);
      }
      
      // Solo mostrar éxito cuando todo se complete correctamente
      toast.dismiss();
      toast.success("Destino registrado exitosamente");
      reset();
      setProvinciaSeleccionada("");
      setCiudadSeleccionada("");
      selectRuta(null);
      setHorariosSeleccionados([]);
      setSelectedVideo(null);
      setMostrarFrecuencia(false);
      onClose();
      
    } catch (error) {
      console.error("Error al registrar destino:", error);
      toast.dismiss();
      toast.error(error.message || "Error al registrar el destino");
    }
  }

  async function editar(data) {
    try {
        if (!dataSelect?.id) {
        throw new Error("No hay destino seleccionado para editar");
      }

      if (!data.descripcion?.trim()) {
        throw new Error("La descripción no puede estar vacía");
      }

      if (!rutaItemSelect?.id) {
        throw new Error("Debe seleccionar una ruta");
      }

      if (!horariosSeleccionados.length) {
        throw new Error("Debe registrar al menos un horario");
      }

      if (!operadoraActiva?.id) {
        throw new Error("No hay operadora seleccionada");
      }

      if (mostrarFrecuencia && !data.frecuencia) {
        throw new Error("Debe ingresar la frecuencia de paso");
        }

        const datosActualizados = {
          id: parseInt(dataSelect.id),
          descripcion: ConvertirCapitalize(data.descripcion.trim()),
          idruta: parseInt(rutaItemSelect.id),
          id_operadora: parseInt(operadoraActiva.id),
          provinciadestino: ConvertirCapitalize(data.provinciadestino.trim()),
          ciudaddestino: ConvertirCapitalize(data.ciudaddestino.trim()),
          direcciondestino: ConvertirCapitalize(data.direcciondestino.trim()),
          frecuenciapaso: mostrarFrecuencia ? data.frecuencia : null
        };

        // 1. Actualizar destino
        const resultado = await editardestinos(datosActualizados);
        
        if (!resultado?.success) {
          throw new Error(resultado?.error || "Error al actualizar el destino");
        }

        // 2. Actualizar horarios
        try {
          await registrarHorarios(dataSelect.id, true);
        } catch (error) {
          throw new Error(`Error al actualizar horarios: ${error.message}`);
        }

        // 3. Manejar multimedia
        try {
          if (selectedVideo) {
            toast.loading("Video subiendo...");
            await handleVideoSubmit(dataSelect.id, false);
          } else {
            await ActualizarMultimediaSinVideo(dataSelect.id);
          }
        } catch (error) {
          toast.dismiss();
          throw new Error(`Error al actualizar multimedia: ${error.message}`);
        }
        
        // Solo mostrar éxito cuando todo se complete correctamente
        toast.dismiss();
        toast.success("Destino actualizado exitosamente");
        reset();
        setProvinciaSeleccionada("");
        setCiudadSeleccionada("");
        selectRuta(null);
        setHorariosSeleccionados([]);
        setSelectedVideo(null);
        setMostrarFrecuencia(false);
        onClose();
        
    } catch (error) {
      console.error("Error al editar destino:", error);
      toast.dismiss();
      toast.error(error.message || "Error al editar el destino");
    }
  }

  // Función que maneja tanto inserción como edición
  const onSubmit = (data) => {
    if (accion === "Editar") {
      editar(data);
    } else {
      insertar(data);
    }
  };

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>
              {accion === "Editar" ? "Editar destino" : "Registrar nuevo destino"}
            </h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>

        <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
          <section>
            <div className="form-column">
              <article>
                <InputText icono={<v.icononombre />}>
                  <input
                    className="form__field"
                    type="text"
                    placeholder=""
                    {...register("descripcion", {
                      required: true,
                    })}
                  />
                  <label className="form__label">Lugar de destino</label>
                  {errors.descripcion?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoruta />}>
                  <input
                    className="form__field"
                    type="text"
                    placeholder=""
                    {...register("direcciondestino", {
                      required: true,
                    })}
                  />
                  <label className="form__label">Dirección de destino</label>
                  {errors.direcciondestino?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <ContainerSelector>
                  <label>Provincia / País destino: </label>
                  <Selector
                    funcion={() => setStateProvincia(!stateProvincia)}
                    state={stateProvincia}
                    color="#fc6027"
                    texto1="🌍"
                    texto2={provinciaSeleccionada || "Seleccione..."}
                  />
                  {stateProvincia && (
                    <ListaGenerica
                      setState={() => setStateProvincia(false)}
                      bottom="-260px"
                      scroll="scroll"
                      data={PROVINCIAS.map(prov => ({ id: prov, descripcion: prov }))}
                      funcion={(item) => handleSelectProvincia(item.descripcion)}
                    />
                  )}
                  <input
                    type="hidden"
                    {...register("provinciadestino", {
                      required: true,
                    })}
                  />
                  {errors.provinciadestino?.type === "required" && <p>Campo requerido</p>}
                </ContainerSelector>
              </article>

              <article>
                <ContainerSelector>
                  <label>Ciudad destino: </label>
                  <Selector
                    funcion={() => setStateCiudad(!stateCiudad)}
                    state={stateCiudad}
                    color="#fc6027"
                    texto1="🏙️"
                    texto2={ciudadSeleccionada || "Seleccione..."}
                    disabled={!provinciaSeleccionada}
                  />
                  {stateCiudad && (
                    <ListaGenerica
                      setState={() => setStateCiudad(false)}
                      bottom="-260px"
                      scroll="scroll"
                      data={ciudadesDisponibles.map(ciudad => ({ id: ciudad, descripcion: ciudad }))}
                      funcion={(item) => handleSelectCiudad(item.descripcion)}
                    />
                  )}
                  <input
                    type="hidden"
                    {...register("ciudaddestino", {
                      required: true,
                    })}
                  />
                  {errors.ciudaddestino?.type === "required" && <p>Campo requerido</p>}
                </ContainerSelector>
              </article>

              <article>
                <ContainerSelector>
                  <label>Ruta destino: </label>
                  <Selector
                    funcion={() => setStateRuta(!stateRuta)}
                    state={stateRuta}
                    color="#fc6027"
                    texto1={<v.iconoruta />}
                    texto2={rutaItemSelect?.descripcion}
                  />
                  {stateRuta && (
                    <ListaGenerica
                      setState={() => setStateRuta(!stateRuta)}
                      bottom="-260px"
                      scroll="scroll"
                      data={dataruta}
                      funcion={selectRuta}
                    />
                  )}
                  <Btnfiltro
                    bgcolor="#f6f3f3"
                    funcion={nuevoRegistroRuta}
                    textcolor="#353535"
                    icono={<v.agregar />}
                  />
                </ContainerSelector>
              </article>
            </div>

            <div className="form-column">
              <article>
                <ContainerSelector>
                  <label>Horarios: </label>
                  <HorarioInputContainer>
                    <input
                      type="time"
                      value={nuevoHorario}
                      onChange={(e) => setNuevoHorario(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="horario-input"
                      step="60"
                    />
                    <Btnfiltro
                      bgcolor="#f6f3f3"
                      funcion={handleAgregarHorario}
                      textcolor="#353535"
                      icono={<v.agregar />}
                    />
                  </HorarioInputContainer>
                </ContainerSelector>

                <HorariosPizarra>
                  <div className="pizarra-header">
                    <h3>Horarios Registrados</h3>
                    {/* Leyenda de colores para horarios */}
                    <div style={{marginTop: '8px', marginBottom: '4px', fontSize: '75%'}}>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16}}>
                        <span style={{width: 16, height: 16, borderRadius: '50%', background: '#4CAF50', display: 'inline-block', border: '1px solid #888'}}></span>
                        AM
                      </span>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16}}>
                        <span style={{width: 16, height: 16, borderRadius: '50%', background: '#FFC107', display: 'inline-block', border: '1px solid #888'}}></span>
                        PM
                      </span>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <span style={{width: 16, height: 16, borderRadius: '50%', background: '#21618C', display: 'inline-block', border: '1px solid #888'}}></span>
                        Horario especial
                      </span>
                    </div>
                  </div>
                  
                  {horariosSeleccionados.length > 0 ? (
                    <div className="timeline">
                      {horariosSeleccionados.map((horario) => (
                        <div key={horario.id} className="horario-item">
                          <span className="horario-icon" color={horario.color}>🕒</span>
                          <div className="horario-info">
                            <span className="horario-texto">{horario.descripcion}</span>
                            <div 
                              className="horario-color" 
                              style={{ backgroundColor: horario.color }}
                            />
                          </div>
                          <div className="horario-acciones">
                            <button 
                              onClick={() => handleEliminarHorario(horario.id)}
                              title="Eliminar horario"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pizarra-vacia">
                      <span className="icono">📝</span>
                      <p>No hay horarios registrados</p>
                      <p>Ingrese un horario y presione + para agregarlo</p>
                    </div>
                  )}
                </HorariosPizarra>
              </article>

              <div className="checkbox-column">
                <CheckboxContainer>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={mostrarFrecuencia}
                      onChange={(e) => setMostrarFrecuencia(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Registrar frecuencia de paso
                  </label>
                </CheckboxContainer>

                {mostrarFrecuencia && (
                  <TimeInputContainer>
                    <label className="time-label">Frecuencia de paso (HH:mm)</label>
                    <div className="time-input-wrapper">
                      <input
                        type="time"
                        className="time-input"
                        step="60"
                        {...register("frecuencia", {
                          required: mostrarFrecuencia,
                          pattern: {
                            value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                            message: "Formato inválido (HH:mm)"
                          }
                        })}
                      />
                      <span className="time-icon">🕒</span>
                    </div>
                    {errors.frecuencia?.type === "required" && mostrarFrecuencia && (
                      <p className="error-message">Campo requerido</p>
                    )}
                    {errors.frecuencia?.type === "pattern" && (
                      <p className="error-message">Formato inválido (HH:mm)</p>
                    )}
                  </TimeInputContainer>
                )}
              </div>

              {accion === 'Editar' && (
                <ContentCard>
                  <Title>Video del destino</Title>
                  <VideoUploadContainer
                    isDragOver={isDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('video-input').click()}
                  >
                    {selectedVideo ? (
                      <div style={{ position: 'relative', width: '100%' }}>
                        <div className="video-info">
                          <FaVideo className="upload-icon" />
                          <div className="upload-text">{selectedVideo.name}</div>
                          <div className="upload-hint">{(selectedVideo.size / 1024 / 1024).toFixed(2)} MB</div>
                          {isUploadingVideo && <div className="upload-hint" style={{ color: '#007BFF' }}>Subiendo...</div>}
                        </div>
                        <button 
                          className="remove-video" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVideo();
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : currentVideoUrl && currentVideoUrl !== 'link' ? (
                      <div style={{ position: 'relative', width: '100%' }}>
                        <div className="video-info">
                          <FaVideo className="upload-icon" />
                          <div className="upload-text">Video actual</div>
                          <div className="upload-hint">Haz clic para cambiar</div>
                        </div>
                        <button 
                          className="remove-video" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVideoDelete();
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="upload-icon" />
                        <div className="upload-text">Arrastra y suelta el video aquí</div>
                        <div className="upload-hint">Solo MP4, máximo 35 segundos</div>
                      </>
                    )}
                    <input
                      id="video-input"
                      type="file"
                      accept="video/mp4"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </VideoUploadContainer>
                </ContentCard>
              )}
            </div>

            <div className="btnguardarContent">
              <Btnsave
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#007BFF"
              />
            </div>
          </section>
        </form>

        {openRegistroRuta && (
          <RegistrarRuta
            accion={subaccion}
            onClose={handleCloseRuta}
            dataSelect={null}
          />
        )}
        {openRegistroHorario && (
          <RegistrarHorarios
            accion={subaccion}
            onClose={handleCloseHorario}
            dataSelect={null}
          />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px 0;

  .sub-contenedor {
    width: 1100px;
    max-width: 95%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 20px 40px 30px 40px;
    z-index: 100;
    margin: auto;
    max-height: calc(100vh - 40px);
    overflow-y: auto;

    /* Estilos para la barra de desplazamiento */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #007bff, #0056b3);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #0056b3, #004085);
      background-clip: content-box;
    }

    /* Para Firefox */
    scrollbar-width: thin;
    scrollbar-color: #007bff rgba(0, 0, 0, 0.1);

    /* Responsive para pantallas pequeñas */
    @media (max-height: 800px) {
      max-height: calc(100vh - 20px);
      padding: 15px 30px 20px 30px;
    }

    @media (max-height: 600px) {
      max-height: calc(100vh - 10px);
      padding: 10px 20px 15px 20px;
    }

    @media (max-width: 768px) {
      width: 95%;
      max-width: 95%;
      padding: 15px 20px 20px 20px;
      border-radius: 15px;
    }

    @media (max-width: 480px) {
      width: 98%;
      max-width: 98%;
      padding: 10px 15px 15px 15px;
      border-radius: 10px;
      margin: 5px auto;
    }

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      /* Responsive para headers */
      @media (max-height: 600px) {
        margin-bottom: 15px;
      }

      @media (max-width: 480px) {
        margin-bottom: 10px;
      }

      h1 {
        font-size: 24px;
        font-weight: 500;
        color: ${({ theme }) => theme.text};

        @media (max-width: 768px) {
          font-size: 20px;
        }

        @media (max-width: 480px) {
          font-size: 18px;
        }
      }
      span {
        font-size: 24px;
        cursor: pointer;
        color: ${({ theme }) => theme.text};
        &:hover {
          color: #007BFF;
        }
      }
    }
    .formulario {
      section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .checkbox-column {
          grid-column: 2;
          grid-row: 4 / span 2;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-top: 10px;
        }

        .btnguardarContent {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        /* Responsive para formulario */
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 12px;

          .form-column {
            gap: 12px;
          }

          .checkbox-column {
            grid-column: 1;
            grid-row: auto;
            padding-top: 0;
          }

          .btnguardarContent {
            margin-top: 15px;
          }
        }

        @media (max-height: 600px) {
          gap: 10px;

          .form-column {
            gap: 10px;
          }

          .btnguardarContent {
            margin-top: 10px;
          }
        }
      }
    }
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: transparent;
    padding: 2px;
    width: 40px;
    font-size: 28px;
  }
`;