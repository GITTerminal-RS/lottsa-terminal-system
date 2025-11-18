import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText } from "./InputText";
import { Btnsave } from "../../moleculas/Btnsave";
import { useOperadoraQuery } from "../../../hooks/useOperadoraQuery";
import { useOptimisticDebounce } from "../../../hooks/useOptimisticDebounce";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../index";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BsEye } from "react-icons/bs";
import { RiCloseLine } from "react-icons/ri";

export function ModificarOperadora({ setState, dataSelect, accion }) {
  // 🚀 TanStack Query: Hook optimizado para operadora
  const { actualizarOperadora, isUpdating, updateError } = useOperadoraQuery();
  const navigate = useNavigate();
  
  // 🚀 Hook optimizado para upload de archivos
  const {
    handleFileSelect,
    handleViewImage,
    uploadProgress,
    selectedFiles,
    isUploading,
    uploadError,
    setSelectedFiles
  } = useFileUpload(dataSelect?.id, actualizarOperadora);
  
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState({ type: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef();

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    getValues
  } = useForm();

  // 🚀 TanStack Query: Información institucional con debounce optimista
  const tiposInfo = [
    { tipo: 'mision', label: 'Misión', textarea: true },
    { tipo: 'vision', label: 'Visión', textarea: true },
    { tipo: 'servicios', label: 'Servicios', textarea: true },
    { tipo: 'fotomision', label: 'Foto Misión (link)', textarea: false, nota: true },
    { tipo: 'fotovision', label: 'Foto Visión (link)', textarea: false, nota: true },
    { tipo: 'lema', label: 'Lema', textarea: false },
  ];
  const [infoInstitucional, setInfoInstitucional] = useState({});

  // 🚀 Hook optimista para información institucional
  const infoDebounce = useOptimisticDebounce(
    async ({ tipo, descripcion, id_operadora }) => {
      const { error } = await supabase
        .from('informacion_institucional')
        .update({ descripcion })
        .eq('id_operadora', id_operadora)
        .eq('tipo', tipo);
      if (error) throw error;
      return { tipo, descripcion };
    },
    ['informacion-institucional', dataSelect?.id],
    {
      delay: 500, // Más rápido para info institucional
      showToastOnSuccess: false, // No spam de toasts
      showToastOnError: true,
    }
  );

  useEffect(() => {
    if (dataSelect) {
      console.log('Datos de la operadora:', dataSelect);
      setValue("nombre", dataSelect.nombre);
      setValue("direccion", dataSelect.direccion);
      setValue("telefono", dataSelect.telefono);
      setValue("correo", dataSelect.correo);
      setValue("dirigente", dataSelect.dirigente);
      setValue("sitioweb", dataSelect.sitioweb);
      setValue("horarioatencion", dataSelect.horarioatencion);
      setValue("descripcion", dataSelect.descripcion);
      setValue("servicios", dataSelect.servicios);
      setValue("logo", dataSelect.logo);
      setValue("portada", dataSelect.portada);
    }
  }, [dataSelect, setValue]);

  // 🚀 Guardado automático optimista con TanStack Query
  useEffect(() => {
    if (!dataSelect) return;
    
    const subscription = watch((values, { name, type }) => {
      // Solo guardar si el valor cambió respecto al original
      if (dataSelect[name] !== values[name]) {
        setSaving(true);
        setSaved(false);
        
        // Limpiar timer anterior
        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        debounceRef.current = setTimeout(() => {
          const updatedData = { ...getValues() };
          // No enviar logo ni portada aquí (solo texto)
          delete updatedData.logo;
          delete updatedData.portada;
          
          // 🔥 Update optimístico - UI se actualiza INSTANTÁNEAMENTE
          actualizarOperadora({
            id: dataSelect.id,
            ...updatedData
          });
          
          setSaving(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 1200);
        }, 700);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, dataSelect, actualizarOperadora, getValues]);

  // Cargar datos actuales de informacion_institucional
  useEffect(() => {
    async function fetchInfo() {
      if (!dataSelect?.id) return;
      const { data, error } = await supabase
        .from('informacion_institucional')
        .select('tipo, descripcion')
        .eq('id_operadora', dataSelect.id);
      if (error) return;
      const info = {};
      data?.forEach(item => { info[item.tipo] = item.descripcion; });
      setInfoInstitucional(info);
    }
    fetchInfo();
  }, [dataSelect]);

  // 🚀 Guardado automático optimista de información institucional
  function handleInfoChange(tipo, value) {
    // Update inmediato en estado local (optimista)
    setInfoInstitucional(prev => ({ ...prev, [tipo]: value }));
    
    // Usar hook de debounce optimista
    infoDebounce.debouncedMutation({
      tipo,
      descripcion: value,
      id_operadora: dataSelect.id
    });
  }

  const validateImageDimensions = (file, type) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

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
            reject(`El logo debe tener dimensiones entre 40-100px O 100-860px de ancho y 100-540px de alto. Tu imagen es ${width}x${height}px`);
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
            reject(`La portada debe tener dimensiones mínimas de 1200x675px y máximas de 2560x1440px. Tu imagen es ${width}x${height}px`);
          }
        }
      };
      img.onerror = () => {
        Swal.fire({
          icon: "error",
          title: "Error al cargar la imagen",
          text: "No se pudo cargar la imagen. Por favor, intenta con otra imagen.",
        });
        reject('Error al cargar la imagen');
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // ✅ handleFileSelect ahora provisto por useFileUpload hook

  // ✅ handleViewImage ahora optimizado en useFileUpload hook
  const handleViewImageWithModal = async (type) => {
    const currentImage = type === 'logo' ? dataSelect.logo : dataSelect.portada;
    const imageUrl = await handleViewImage(type, currentImage);
    if (imageUrl) {
      setModalImage({ type, url: imageUrl });
      setShowModal(true);
    }
  };

  // ✅ uploadFile ahora optimizado en useFileUpload hook

  const onSubmit = async (data) => {
    try {
      setIsUploading(true);
      let updatedData = { ...data };

      // Subir imágenes si hay archivos seleccionados
      if (selectedFiles.logo) {
        updatedData.logo = await uploadFile(selectedFiles.logo, 'logo');
      }
      if (selectedFiles.portada) {
        updatedData.portada = await uploadFile(selectedFiles.portada, 'portada');
      }

      console.log('Datos a actualizar:', updatedData);
      const response = await actualizarOperadora({
        id: dataSelect.id,
        ...updatedData,
      });

      if (response) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Operadora actualizada correctamente",
        });
        setState();
        navigate("/configurar");
      }
    } catch (error) {
      console.error("Error al actualizar operadora:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la operadora",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>Actulizar datos Operadora de Transporte</h1>
          </section>
        </div>

        {saving && <span style={{color:'#3a4b86'}}>🔄 Guardando...</span>}
        {saved && <span style={{color:'green'}}>✅ Guardado</span>}
        {isUpdating && <span style={{color:'blue'}}>🚀 Sincronizando...</span>}
        {isUploading && <span style={{color:'purple'}}>📤 Subiendo archivo...</span>}

        <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <article>
              <InputText icono={<v.iconoUser />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Nombre"
                  {...register("nombre", {
                    required: true,
                  })}
                />
                <label className="form__label">Nombre</label>
                {errors.nombre?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoUser />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Dirección"
                  {...register("direccion", {
                    required: true,
                  })}
                />
                <label className="form__label">Dirección matriz</label>
                {errors.direccion?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoUser />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Teléfono"
                  {...register("telefono", {
                    required: true,
                  })}
                />
                <label className="form__label">Teléfono</label>
                {errors.telefono?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoUser />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Dirigente"
                  {...register("dirigente", {
                    required: true,
                  })}
                />
                <label className="form__label">Dirigente</label>
                {errors.dirigente?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoemail />}>
                <input
                  className="form__field"
                  type="email"
                  placeholder="Correo"
                  {...register("correo", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  })}
                />
                <label className="form__label">Correo</label>
                {errors.correo?.type === "required" && <p>Campo requerido</p>}
                {errors.correo?.type === "pattern" && <p>Email inválido</p>}
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoUser />}>
                <input
                  className="form__field"
                  type="url"
                  placeholder="Sitio Web"
                  {...register("sitioweb")}
                />
                <label className="form__label">Sitio Web</label>
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoUser />}>
                <input
                  className="form__field"
                  type="text"
                  placeholder="Horario de Atención"
                  {...register("horarioatencion")}
                />
                <label className="form__label">Horario de Atención</label>
              </InputText>
            </article>

            <article className="full-width">
              <InputText icono={<v.iconoUser />}>
                <textarea
                  className="form__field"
                  placeholder="Descripción"
                  rows="4"
                  {...register("descripcion")}
                />
                <label className="form__label">Descripción</label>
              </InputText>
            </article>

            <article className="full-width">
              <InputText icono={<v.iconoUser />}>
                <textarea
                  className="form__field"
                  placeholder="Servicios"
                  rows="4"
                  {...register("servicios")}
                />
                <label className="form__label">Provincias de servicios</label>
              </InputText>
            </article>

            <article className="full-width">
              <div className="image-upload-container">
                <div className="image-header">
                  <h3>Logo de la Operadora</h3>
                  <button 
                    type="button" 
                    className="view-button"
                                          onClick={() => handleViewImageWithModal('logo')}
                  >
                    <BsEye /> Ver imagen actual
                  </button>
                </div>
                <div className="image-preview-container">
                  <div className="upload-controls">
                    <input
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileSelect(file, 'logo');
                      }}
                      disabled={isUploading}
                    />
                    <p className="help-text">Formatos permitidos: SVG, PNG, JPG. Dimensiones: 40-100px o 100-860px de ancho y 100-540px de alto</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="full-width">
              <div className="image-upload-container">
                <div className="image-header">
                  <h3>Imagen de Portada</h3>
                  <button 
                    type="button" 
                    className="view-button"
                                          onClick={() => handleViewImageWithModal('portada')}
                  >
                    <BsEye /> Ver imagen actual
                  </button>
                </div>
                <div className="image-preview-container">
                  <div className="upload-controls">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileSelect(file, 'portada');
                      }}
                      disabled={isUploading}
                    />
                    <p className="help-text">Dimensiones mínimas: 1200x675px, máximas: 2560x1440px</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </form>

        <hr style={{margin: '32px 0'}} />
        <div style={{marginBottom: 32}}>
          <h2 style={{color:'#3a4b86', fontWeight:700, fontSize:'1.3rem', marginBottom:16}}>Información institucional</h2>
          <InfoGrid>
            {tiposInfo.map(({ tipo, label, textarea, nota }) => (
              <div key={tipo}>
                <label style={{fontWeight:600, color:'#3a4b86', display:'block', marginBottom:4}}>{label}</label>
                <InputText icono={<v.iconoinfo />}>
                {textarea ? (
                  <textarea
                      className="form__field"
                    value={infoInstitucional[tipo] || ''}
                    onChange={e => handleInfoChange(tipo, e.target.value)}
                    rows={tipo==='mision'||tipo==='vision'?6:tipo==='servicios'?4:3}
                      style={{resize:'vertical'}}
                  />
                ) : (
                  <input
                      className="form__field"
                    type="text"
                    value={infoInstitucional[tipo] || ''}
                    onChange={e => handleInfoChange(tipo, e.target.value)}
                  />
                )}
                  <label className="form__label">{label}</label>
                </InputText>
                {tipo === 'servicios' && (
                  <div style={{fontSize:'0.95rem', color:'#888', marginTop:2}}>
                    Los servicios se registran separados por una coma.
                  </div>
                )}
                {nota && (
                  <div style={{fontSize:'0.95rem', color:'#888', marginTop:2}}>
                    Solo acepta links de fotografías. Puedes subir tu imagen a <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer">ImgBB</a> y pegar el enlace aquí.
                  </div>
                )}
              </div>
            ))}
          </InfoGrid>
                      {infoDebounce.isLoading && <span style={{color:'#3a4b86'}}>🔄 Guardando información...</span>}
            {infoDebounce.isSuccess && <span style={{color:'green'}}>✅ Guardado</span>}
            {infoDebounce.isPending && <span style={{color:'orange'}}>⏳ Escribiendo...</span>}
        </div>
      </div>

      {/* Modal para visualizar imágenes */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>{modalImage.type === 'logo' ? 'Logo' : 'Portada'} de la Operadora</h3>
              <button onClick={() => setShowModal(false)}>
                <RiCloseLine />
              </button>
            </ModalHeader>
            <ModalBody>
              {modalImage.url && (
                <img 
                  src={modalImage.url} 
                  alt={modalImage.type === 'logo' ? 'Logo' : 'Portada'} 
                  className={modalImage.type === 'logo' ? 'modal-logo' : 'modal-portada'} 
                  onError={(e) => {
                    console.error('Error al cargar la imagen:', e);
                    console.log('URL que falló:', modalImage.url);
                    Swal.fire({
                      icon: "error",
                      title: "Error al cargar la imagen",
                      text: "No se pudo cargar la imagen. Por favor, verifica la URL.",
                      footer: `URL: ${modalImage.url}`
                    });
                  }}
                />
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px;
  background: ${({ theme }) => theme.bgcards};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .sub-contenedor {
    width: 100%;
  }

  .headers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 20px;
      font-weight: 500;
      color: ${({ theme }) => theme.text};
    }
  }

  .formulario {
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;

      .full-width {
        grid-column: 1 / -1;
      }

      textarea.form__field {
        min-height: 100px;
        resize: vertical;
      }

      .image-upload-container {
        .image-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          h3 {
            margin: 0;
            color: ${({ theme }) => theme.text};
            font-size: 16px;
            font-weight: 500;
          }

          .view-button {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 8px 12px;
            background: ${({ theme }) => theme.bg3};
            border: none;
            border-radius: 4px;
            color: ${({ theme }) => theme.text};
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;

            &:hover {
              background: ${({ theme }) => theme.bg2};
            }

            svg {
              width: 16px;
              height: 16px;
            }
          }
        }

        .image-preview-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 15px;
          border: 2px dashed ${({ theme }) => theme.bg3};
          border-radius: 8px;
          background: ${({ theme }) => theme.bg2};

          .preview-image {
            max-width: 200px;
            max-height: 200px;
            object-fit: contain;
            border-radius: 4px;

            &.portada {
              max-width: 100%;
              max-height: 300px;
              width: 100%;
              object-fit: cover;
            }
          }

          .upload-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;

            input[type="file"] {
              padding: 8px;
              border: 1px solid ${({ theme }) => theme.bg3};
              border-radius: 4px;
              background: ${({ theme }) => theme.bg};
              color: ${({ theme }) => theme.text};
            }

            .help-text {
              font-size: 12px;
              color: ${({ theme }) => theme.text2};
            }
          }
      }
    }
  }

  .btnguardarContent {
    display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.bgcards};
  border-radius: 10px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.text};
    font-size: 18px;
    font-weight: 500;
  }

  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.text};
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.bg3};
      color: #001f3f
;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    max-height: calc(90vh - 100px);
    object-fit: contain;

    &.modal-logo {
      max-width: 200px;
      max-height: 200px;
    }

    &.modal-portada {
      width: 100%;
      height: auto;
    }
  }
`;

// Agrega el styled-component para el grid
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px 18px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`; 