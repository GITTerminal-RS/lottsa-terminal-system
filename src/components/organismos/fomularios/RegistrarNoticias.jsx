import { useState } from "react";
import styled from "styled-components";
import { InputText, Btnsave } from "../../../index";
import { useForm } from "react-hook-form";
import { useNoticiasStore } from '../../../store/NoticiasStore';
import React from "react";
import { FaCheck, FaRegImage, FaRegFileAlt, FaLink } from 'react-icons/fa';
import { useUsuariosStore } from '../../../store/UsuariosStore';

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

export default function RegistrarNoticias({ onClose, dataSelect, accion }) {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: dataSelect || {}
  });
  const [loading, setLoading] = useState(false);
  const { insertarNoticia, editarNoticia } = useNoticiasStore();
  const [mensajeExito, setMensajeExito] = useState("");
  const { idusuario } = useUsuariosStore();
  
  // Contadores de caracteres
  const contextoValue = watch("contexto") || "";
  const descripcionValue = watch("descripcion") || "";

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const noticia = {
        ...data,
        iduser: idusuario,
      };
      if (accion === "Editar" && dataSelect?.id) {
        await editarNoticia(dataSelect.id, noticia);
        setMensajeExito("Noticia modificada con éxito");
      } else {
        await insertarNoticia(noticia);
        setMensajeExito("Noticia guardada con éxito");
      }
    } catch (e) {
      alert("Error al guardar noticia");
    }
    setLoading(false);
    reset();
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <Container>
      <div className="sub-contenedor">
        {mensajeExito && <MensajeExito mensaje={mensajeExito} onClose={() => setMensajeExito("")} />}
        <div className="headers">
          <section>
            <h1>{accion === "Editar" ? "Editar noticia" : "Registrar noticia"}</h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>
        <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
          <section>
            <div className="form-column">
              <InputText icono={<FaRegFileAlt />}>
                <input 
                  className="form__field" 
                  {...register("contexto", { 
                    required: true,
                    maxLength: 100,
                    onChange: (e) => {
                      if (e.target.value.length > 100) {
                        e.target.value = e.target.value.slice(0, 100);
                      }
                    }
                  })} 
                  placeholder=" " 
                />
                <label className="form__label">Contexto</label>
                <div className="char-counter">
                  <span className={contextoValue.length > 90 ? "warning" : ""}>
                    {contextoValue.length}/100
                  </span>
                </div>
                {errors.contexto && <p>Campo requerido</p>}
              </InputText>
              <InputText icono={<FaRegFileAlt />}>
                <input 
                  className="form__field" 
                  {...register("descripcion", { 
                    required: true,
                    maxLength: 150,
                    onChange: (e) => {
                      if (e.target.value.length > 150) {
                        e.target.value = e.target.value.slice(0, 150);
                      }
                    }
                  })} 
                  placeholder=" " 
                />
                <label className="form__label">Descripción</label>
                <div className="char-counter">
                  <span className={descripcionValue.length > 135 ? "warning" : ""}>
                    {descripcionValue.length}/150
                  </span>
                </div>
                {errors.descripcion && <p>Campo requerido</p>}
              </InputText>
            </div>
            <div className="form-column">
              <InputText icono={<FaLink />}>
                <input className="form__field" {...register("linknoticia")} placeholder=" " />
                <label className="form__label">Link noticia</label>
              </InputText>
              <InputText icono={<FaRegImage />}>
                <input className="form__field" {...register("linkfoto")} placeholder=" " />
                <label className="form__label">Link foto</label>
                <span style={{fontSize: '13px', color: '#888'}}>Solo acepta links de imágenes. Puedes subir tu imagen a <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" style={{color:'#007BFF',textDecoration:'underline'}}>ImgBB</a> y pegar el enlace aquí.</span>
              </InputText>
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
  .char-counter {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
    font-size: 12px;
    color: #666;
    span {
      padding: 2px 6px;
      border-radius: 4px;
      background: #f0f0f0;
      &.warning {
        color: #ff6b35;
        background: #fff3e0;
      }
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
      }
      .btnguardarContent {
        display: flex;
        justify-content: end;
        margin-top: 10px;
      }
    }
  }
`; 