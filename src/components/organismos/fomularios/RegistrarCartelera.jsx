import { useState } from "react";
import styled from "styled-components";
import { InputText, InputTextArea, Btnsave } from "../../../index";
import { useForm } from "react-hook-form";
import { useCarteleraQuery } from '../../../hooks/useCarteleraQuery';
import { useQueryClient } from '@tanstack/react-query';
import { subirPortadaCartelera, actualizarPortadaCartelera, validarDimensionesPortada, obtenerUrlPortada } from '../../../supabase/crudCarteleraImages';
import { insertarInfoCartelera, obtenerInfoCartelera, actualizarInfoCartelera, validarInfoCartelera } from '../../../supabase/crudInfoCartelera';
import { insertarCartelera as insertarCarteleraDirecto, editarCartelera as editarCarteleraDirecto } from '../../../supabase/crudCartelera';
import React, { useEffect } from "react";
import { FaCheck, FaRegImage, FaRegFileAlt, FaRegCalendarAlt, FaUser, FaMapMarkerAlt, FaLink, FaUpload, FaEye, FaInfoCircle, FaImage } from 'react-icons/fa';
import Swal from "sweetalert2";

const MensajeExito = ({ mensaje, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <BannerExito>
      <span className="icono"><FaCheck /></span>
      <span className="texto">{mensaje}</span>
    </BannerExito>
  );
};

const BannerExito = styled.div`
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
  max-width: 90vw;
  background: #fff;
  color: #222;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  padding: 10px 24px 10px 18px;
  text-align: center;
  z-index: 2000;
  font-weight: 500;
  font-size: 1.08rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  .icono {
    width: 32px;
    height: 32px;
    background: #4cd964;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4em;
  }
  .texto {
    flex: 1;
    text-align: left;
    font-size: 1.13em;
    font-weight: 500;
    color: #222;
  }
`;

export default function RegistrarCartelera({ onClose, dataSelect, accion }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const queryClient = useQueryClient();
  // 🚀 TanStack Query: Hook optimizado para cartelera
  const { 
    insertarCartelera, 
    editarCartelera, 
    isInserting, 
    isEditing 
  } = useCarteleraQuery();
  const [mensajeExito, setMensajeExito] = useState("");
  const [selectedPortada, setSelectedPortada] = useState(null);
  const [uploadingPortada, setUploadingPortada] = useState(false);
  const [portadaPreview, setPortadaPreview] = useState(null);

  // Estado de loading combinado
  const loading = isInserting || isEditing || uploadingPortada;

  // Cargar datos cuando se está editando
  useEffect(() => {
    const cargarDatos = async () => {
      if (accion === "Editar" && dataSelect?.id) {
        try {
          // Cargar datos básicos de la cartelera
          if (dataSelect.titulo) setValue("titulo", dataSelect.titulo);
          if (dataSelect.edicion) setValue("edicion", dataSelect.edicion);
          if (dataSelect.fechafin_inicio) setValue("fechafin_inicio", dataSelect.fechafin_inicio);
          if (dataSelect.ciudad_provincia) setValue("ciudad_provincia", dataSelect.ciudad_provincia);
          if (dataSelect.responsable) setValue("responsable", dataSelect.responsable);
          if (dataSelect.googlemap) setValue("googlemap", dataSelect.googlemap);
          if (dataSelect.linkresponsable) setValue("linkresponsable", dataSelect.linkresponsable);

          // Cargar información de cartelera
          console.log("🔄 Cargando información de cartelera para ID:", dataSelect.id);
          const infoCartelera = await obtenerInfoCartelera(dataSelect.id);
          console.log("📄 Información de cartelera cargada:", infoCartelera);

          // Mapear a los campos del formulario
          if (infoCartelera && infoCartelera.length >= 3) {
            setValue("info1_descripcion", infoCartelera[0]?.descripcion || '');
            setValue("info1_imagen", infoCartelera[0]?.imagen || '');
            setValue("info2_descripcion", infoCartelera[1]?.descripcion || '');
            setValue("info2_imagen", infoCartelera[1]?.imagen || '');
            setValue("info3_descripcion", infoCartelera[2]?.descripcion || '');
            setValue("info3_imagen", infoCartelera[2]?.imagen || '');
          }

        } catch (error) {
          console.error("Error al cargar datos de información de cartelera:", error);
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: "No se pudo cargar la información adicional de la cartelera",
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    };

    cargarDatos();
  }, [accion, dataSelect, setValue]);

  // Función para manejar selección de archivo de portada
  const handlePortadaSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validar dimensiones
      await validarDimensionesPortada(file);
      
      setSelectedPortada(file);
      
      // Crear preview
      const previewUrl = URL.createObjectURL(file);
      setPortadaPreview(previewUrl);
      
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de imagen",
        text: error.message,
      });
    }
  };

  // Función para ver portada actual
  const handleVerPortada = async () => {
    const portadaPath = dataSelect?.portada;
    if (!portadaPath) {
      Swal.fire({
        icon: "info",
        title: "Sin portada",
        text: "No se ha agregado portada aún",
      });
      return;
    }

    try {
      const imageUrl = await obtenerUrlPortada(portadaPath);
      if (imageUrl) {
        Swal.fire({
          title: 'Portada actual',
          imageUrl: imageUrl,
          imageAlt: 'Portada de cartelera',
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la portada",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      let finalData = { ...data };

      // Preparar datos de información de cartelera (3 registros)
      const infoCarteleraData = [
        {
          descripcion: data.info1_descripcion || '',
          imagen: data.info1_imagen || ''
        },
        {
          descripcion: data.info2_descripcion || '',
          imagen: data.info2_imagen || ''
        },
        {
          descripcion: data.info3_descripcion || '',
          imagen: data.info3_imagen || ''
        }
      ];

      // Validar datos de información de cartelera
      const validacion = validarInfoCartelera(infoCarteleraData);
      if (!validacion.isValid) {
        throw new Error(`Errores en información de cartelera: ${validacion.errores.join(', ')}`);
      }

      // Remover los campos individuales del objeto final
      delete finalData.info1_descripcion;
      delete finalData.info1_imagen;
      delete finalData.info2_descripcion;
      delete finalData.info2_imagen;
      delete finalData.info3_descripcion;
      delete finalData.info3_imagen;

      console.log('📝 Datos de información de cartelera preparados:', infoCarteleraData);

      // Si hay una nueva portada seleccionada, subirla
      if (selectedPortada) {
        setUploadingPortada(true);
        
        if (accion === "Editar" && dataSelect?.portada) {
          // Modo edición: actualizar portada (elimina la anterior automáticamente)
          const portadaPath = await actualizarPortadaCartelera(selectedPortada, dataSelect.id, dataSelect.portada);
          finalData.portada = portadaPath;
          console.log('🔄 Portada actualizada:', { anterior: dataSelect.portada, nueva: portadaPath });
        } else {
          // Modo creación: subir nueva portada
          const portadaPath = await subirPortadaCartelera(selectedPortada, dataSelect?.id);
          finalData.portada = portadaPath;
          console.log('📸 Nueva portada creada:', portadaPath);
        }
      }

      if (accion === "Editar" && dataSelect?.id) {
        // Actualizar cartelera usando la función directa de CRUD
        await editarCarteleraDirecto(dataSelect.id, finalData);
        
        // Actualizar información de cartelera
        const infoActualizada = await actualizarInfoCartelera(dataSelect.id, infoCarteleraData);
        if (!infoActualizada) {
          throw new Error("Error al actualizar la información adicional de cartelera");
        }
        
        console.log('✅ Cartelera e información actualizada correctamente');
        
        // Invalidar cache para que la tabla se actualice
        await queryClient.invalidateQueries(['cartelera']);
        // También forzar refetch inmediato para asegurar actualización
        await queryClient.refetchQueries(['cartelera']);
        console.log('🔄 Cache de cartelera invalidado y refetched después de actualizar');
        
        setMensajeExito("Registro modificado con éxito");
      } else {
        // Insertar cartelera usando la función directa de CRUD
        const carteleraInsertada = await insertarCarteleraDirecto(finalData);
        
        if (!carteleraInsertada?.id) {
          throw new Error("No se pudo obtener el ID de la cartelera insertada");
        }
        
        // Insertar información de cartelera
        const infoInsertada = await insertarInfoCartelera(carteleraInsertada.id, infoCarteleraData);
        if (!infoInsertada) {
          throw new Error("Error al guardar la información adicional de cartelera");
        }
        
        console.log('✅ Cartelera e información guardada correctamente');
        
        // Invalidar cache para que la tabla se actualice
        await queryClient.invalidateQueries(['cartelera']);
        // También forzar refetch inmediato para asegurar actualización
        await queryClient.refetchQueries(['cartelera']);
        console.log('🔄 Cache de cartelera invalidado y refetched después de insertar');
        
        setMensajeExito("Registro guardado con éxito");
      }
      
      reset();
      setTimeout(() => {
        onClose();
      }, 2500);
      
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al procesar: " + error.message,
      });
    } finally {
      setUploadingPortada(false);
    }
  };

  return (
    <Container>
      <div className="sub-contenedor">
        {mensajeExito && <MensajeExito mensaje={mensajeExito} onClose={() => setMensajeExito("")} />}
        <div className="headers">
          <section>
            <h1>{accion === "Editar" ? "Editar cartelera" : "Registrar cartelera"}</h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>
        <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
          <section>
            <div className="form-column">
              <InputText icono={<FaRegFileAlt />}>
                <input className="form__field" {...register("titulo", { required: true })} placeholder=" " />
                <label className="form__label">Título</label>
                {errors.titulo && <p>Campo requerido</p>}
              </InputText>
              <InputText icono={<FaRegFileAlt />}>
                <input className="form__field" {...register("edicion", { required: true })} placeholder=" " />
                <label className="form__label">Edición</label>
                {errors.edicion && <p>Campo requerido</p>}
              </InputText>
              <InputText icono={<FaRegCalendarAlt />}>
                <input className="form__field" {...register("fechafin_inicio", { required: true })} placeholder=" " />
                <label className="form__label">Fecha fin-inicio</label>
                <span style={{fontSize: '13px', color: '#888'}}>Ej: 01/12/2024 - 15/12/2024</span>
                {errors.fechafin_inicio && <p>Campo requerido</p>}
              </InputText>
              <InputText icono={<FaMapMarkerAlt />}>
                <input className="form__field" {...register("ciudad_provincia", { required: true })} placeholder=" " />
                <label className="form__label">Ciudad/Provincia</label>
                {errors.ciudad_provincia && <p>Campo requerido</p>}
              </InputText>
              <InputText icono={<FaUser />}>
                <input className="form__field" {...register("responsable", { required: true })} placeholder=" " />
                <label className="form__label">Responsable</label>
                {errors.responsable && <p>Campo requerido</p>}
              </InputText>
            </div>
            <div className="form-column">
              <div className="portada-section">
                <label className="portada-label">
                  <FaRegImage style={{ marginRight: '8px' }} />
                  Portada del evento
                </label>
                <div className="portada-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortadaSelect}
                    style={{ display: 'none' }}
                    id="portada-input"
                  />
                  <label htmlFor="portada-input" className="upload-btn">
                    <FaUpload style={{ marginRight: '8px' }} />
                    Seleccionar imagen
                  </label>
                  {dataSelect?.portada && (
                    <button type="button" onClick={handleVerPortada} className="view-btn">
                      <FaEye style={{ marginRight: '8px' }} />
                      Ver actual
                    </button>
                  )}
                </div>
                {portadaPreview && (
                  <div className="preview-container">
                    <img src={portadaPreview} alt="Preview" className="image-preview" />
                    <span className="preview-text">Vista previa</span>
                  </div>
                )}
                <span style={{fontSize: '13px', color: '#888'}}>Dimensiones mínimas: 800x600px. Máximo 5MB</span>
              </div>
              <InputText icono={<FaMapMarkerAlt />}>
                <input className="form__field" {...register("googlemap")} placeholder=" " />
                <label className="form__label">Google Maps</label>
                <span style={{fontSize: '13px', color: '#888'}}>Ingrese el enlace de la dirección de Google Maps</span>
              </InputText>
              <InputText icono={<FaLink />}>
                <input className="form__field" {...register("linkresponsable")} placeholder=" " />
                <label className="form__label">Link responsable</label>
                <span style={{fontSize: '13px', color: '#888'}}>Enlace de contacto del responsable</span>
              </InputText>
            </div>

            {/* Nueva sección: Información de Cartelera */}
            <div className="infocartelera-section full-width">
              <div className="section-header">
                <h3>
                  <FaInfoCircle style={{ marginRight: '8px', color: '#007BFF' }} />
                  Información Adicional de Cartelera
                </h3>
                <p>Complete la información detallada para cada aspecto de la cartelera (3 registros)</p>
              </div>

              <div className="info-grid">
                {/* Registro 1 */}
                <div className="info-card">
                  <div className="card-header">
                    <span className="card-number">1</span>
                    <span className="card-title">Información General</span>
                  </div>
                  <div className="card-content">
                    <InputTextArea icono={<FaInfoCircle />}>
                      <textarea
                        className="form__field textarea-field"
                        placeholder=""
                        rows="3"
                        {...register("info1_descripcion", {
                          required: true,
                        })}
                      />
                      <label className="form__label">Descripción</label>
                      {errors.info1_descripcion?.type === "required" && <p>Campo requerido</p>}
                    </InputTextArea>
                    <InputText icono={<FaImage />}>
                      <input
                        className="form__field"
                        type="text"
                        placeholder=""
                        {...register("info1_imagen", {
                          required: true,
                        })}
                      />
                      <label className="form__label">URL/Nombre de Imagen</label>
                      {errors.info1_imagen?.type === "required" && <p>Campo requerido</p>}
                    </InputText>
                  </div>
                </div>

                {/* Registro 2 */}
                <div className="info-card">
                  <div className="card-header">
                    <span className="card-number">2</span>
                    <span className="card-title">Detalles del Evento</span>
                  </div>
                  <div className="card-content">
                    <InputTextArea icono={<FaInfoCircle />}>
                      <textarea
                        className="form__field textarea-field"
                        placeholder=""
                        rows="3"
                        {...register("info2_descripcion", {
                          required: true,
                        })}
                      />
                      <label className="form__label">Descripción</label>
                      {errors.info2_descripcion?.type === "required" && <p>Campo requerido</p>}
                    </InputTextArea>
                    <InputText icono={<FaImage />}>
                      <input
                        className="form__field"
                        type="text"
                        placeholder=""
                        {...register("info2_imagen", {
                          required: true,
                        })}
                      />
                      <label className="form__label">URL/Nombre de Imagen</label>
                      {errors.info2_imagen?.type === "required" && <p>Campo requerido</p>}
                    </InputText>
                  </div>
                </div>

                {/* Registro 3 */}
                <div className="info-card">
                  <div className="card-header">
                    <span className="card-number">3</span>
                    <span className="card-title">Información Adicional</span>
                  </div>
                  <div className="card-content">
                    <InputTextArea icono={<FaInfoCircle />}>
                      <textarea
                        className="form__field textarea-field"
                        placeholder=""
                        rows="3"
                        {...register("info3_descripcion", {
                          required: true,
                        })}
                      />
                      <label className="form__label">Descripción</label>
                      {errors.info3_descripcion?.type === "required" && <p>Campo requerido</p>}
                    </InputTextArea>
                    <InputText icono={<FaImage />}>
                      <input
                        className="form__field"
                        type="text"
                        placeholder=""
                        {...register("info3_imagen", {
                          required: true,
                        })}
                      />
                      <label className="form__label">URL/Nombre de Imagen</label>
                      {errors.info3_imagen?.type === "required" && <p>Campo requerido</p>}
                    </InputText>
                  </div>
                </div>
              </div>
            </div>

            <div className="btnguardarContent full-width">
              <Btnsave icono={null} titulo={loading ? "Guardando..." : "Guardar"} bgcolor="#007BFF" />
            </div>
          </section>
        </form>
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
  overflow-x: auto;
  padding: 20px 10px;
  .form__field {
    font-family: inherit;
    width: 100%;
    border: none;
    border-bottom: 2px solid #9b9b9b;
    outline: 0;
    font-size: 17px;
    color: ${(props) => props.theme.text};
    padding: 7px 0;
    background: transparent;
    transition: border-color 0.2s;
    &.disabled {
      color: #696969;
      background: #2d2d2d;
      border-radius: 8px;
      margin-top: 8px;
      border-bottom: 1px dashed #656565;
      padding: 8px;
    }
  }
  .sub-contenedor {
    width: 1100px;
    max-width: 95%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 20px 40px 30px 40px;
    z-index: 100;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    overflow-x: auto;
    margin: auto;

    /* Estilos personalizados para las barras de desplazamiento */
    &::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      margin: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #0056b3, #004085);
      background-clip: content-box;
    }

    &::-webkit-scrollbar-corner {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
    }

    /* Para Firefox */
    scrollbar-width: thin;
    scrollbar-color: #007bff rgba(0, 0, 0, 0.1);
    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      h1 {
        font-size: 24px;
        font-weight: 500;
        color: ${({ theme }) => theme.text};
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
      overflow-x: auto;
      min-width: 100%;

      section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        min-width: 700px; /* Ancho mínimo para evitar compresión excesiva */
        
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 15px;
          min-width: 300px; /* Ancho mínimo por columna */
        }
        
        .full-width {
          grid-column: 1 / -1;
        }

        /* Media queries para formulario responsivo */
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          min-width: 100%;
          gap: 12px;

          .form-column {
            min-width: 100%;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          gap: 10px;
          
          .form-column {
            gap: 10px;
          }
        }
      }
      
      .btnguardarContent {
        display: flex;
        justify-content: end;
        margin-top: 10px;

        @media (max-width: 768px) {
          justify-content: center;
          margin-top: 15px;
        }
      }
    }
  }
  
  .portada-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    border: 2px dashed #ddd;
    border-radius: 10px;
    background: ${({ theme }) => theme.bg2 || '#fafafa'};
    
    .portada-label {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: ${({ theme }) => theme.text};
      font-size: 16px;
    }
    
    .portada-controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .upload-btn, .view-btn {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }
    
    .upload-btn {
      background: #007BFF;
      color: white;
      
      &:hover {
        background: #0056b3;
      }
    }
    
    .view-btn {
      background: #6c757d;
      color: white;
      
      &:hover {
        background: #545b62;
      }
    }
    
    .preview-container {
      margin-top: 10px;
      text-align: center;
      
      .image-preview {
        max-width: 200px;
        max-height: 150px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        object-fit: cover;
      }
      
      .preview-text {
        display: block;
        margin-top: 8px;
        font-size: 12px;
        color: #666;
        font-style: italic;
      }
    }
  }

  /* Estilos para la sección de información de cartelera */
  .infocartelera-section {
    margin-top: 30px;
    padding: 25px;
    border: 2px solid #e1e8ed;
    border-radius: 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .section-header {
      text-align: center;
      margin-bottom: 25px;
      
      h3 {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        color: ${({ theme }) => theme.text};
        margin: 0 0 8px 0;
      }
      
      p {
        margin: 0;
        color: #6c757d;
        font-size: 14px;
        font-style: italic;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
      overflow-x: auto;
      padding-bottom: 10px;

      /* Barra de scroll horizontal personalizada para la grid */
      &::-webkit-scrollbar {
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #007bff, #0056b3);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #0056b3, #004085);
      }

      /* Para Firefox */
      scrollbar-width: thin;
      scrollbar-color: #007bff rgba(0, 0, 0, 0.05);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 15px;
        overflow-x: visible;
      }

      @media (max-width: 1200px) and (min-width: 769px) {
        /* Para pantallas medianas, permitir scroll horizontal */
        grid-template-columns: repeat(3, minmax(300px, 1fr));
        overflow-x: auto;
      }
    }

    .info-card {
      background: ${({ theme }) => theme.bgtotal};
      border: 1px solid #dee2e6;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        background: linear-gradient(135deg, #007BFF, #0056b3);
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 10px;

        .card-number {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: white;
        }

        .card-title {
          color: white;
          font-weight: 600;
          font-size: 16px;
        }
      }

      .card-content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
    }
  }

  /* Media queries para responsividad y scroll */
  @media (max-width: 1200px) {
    .sub-contenedor {
      width: 95%;
      max-width: 95%;
    }
  }

  @media (max-width: 768px) {
    overflow-x: hidden; /* Evitar scroll horizontal innecesario en móvil */
    padding: 10px 5px;

    .sub-contenedor {
      padding: 15px 20px 25px 20px;
      width: 98%;
      max-width: 98%;
      min-width: auto;
      overflow-x: visible;
    }
    
    .infocartelera-section {
      margin-top: 20px;
      padding: 20px 15px;
      
      .section-header h3 {
        font-size: 18px;
      }
      
      .info-card .card-content {
        padding: 15px;
        gap: 12px;
      }
    }
  }

  @media (max-width: 480px) {
    padding: 5px 2px;

    .sub-contenedor {
      padding: 10px 15px 20px 15px;
      width: 99%;
      max-width: 99%;
      border-radius: 10px;
    }

    .infocartelera-section {
      padding: 15px 10px;
      border-radius: 10px;
      
      .info-grid {
        gap: 12px;
      }
      
      .info-card {
        border-radius: 8px;
        
        .card-header {
          padding: 10px 15px;
          
          .card-title {
            font-size: 14px;
          }
        }

        .card-content {
          padding: 12px;
        }
      }
    }
  }

  /* Media query para pantallas muy anchas */
  @media (min-width: 1400px) {
    .sub-contenedor {
      width: 1200px;
      max-width: 1200px;
    }
  }

  /* Media query para altura pequeña (modo landscape en móvil) */
  @media (max-height: 600px) {
    align-items: flex-start;
    padding-top: 10px;
    padding-bottom: 10px;

    .sub-contenedor {
      margin: 0 auto;
      max-height: calc(100vh - 20px);
    }
  }
`; 