import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, InputTextArea, Btnsave, useRutaStore, ConvertirCapitalize } from "../../../index";
import { useForm } from "react-hook-form";
import { useOperadoraStore } from "../../../store/OperadoraStore";
import Swal from "sweetalert2";

export function RegistrarRuta({ onClose, dataSelect, accion }) {
  const { insertarRuta, editarRuta } = useRutaStore();
  const { dataoperadora } = useOperadoraStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    if (accion === "Editar" && dataSelect) {
      setValue("descripcion", dataSelect.descripcion || "");
      setValue("precio", dataSelect.precio || 0);
      setValue("precioespecial", dataSelect.precioespecial || 0);
    } else {
      reset({
        descripcion: "",
        precio: 0,
        precioespecial: 0
      });
    }
  }, [accion, dataSelect, reset, setValue]);

  async function insertar(data) {
    try {
      setIsLoading(true);

      if (!data.descripcion?.trim()) {
        throw new Error("La descripción no puede estar vacía");
      }

      if (!dataoperadora?.id) {
        throw new Error("No hay operadora seleccionada");
      }

    if (accion === "Editar") {
        if (!dataSelect?.id) {
          throw new Error("No hay datos de ruta seleccionada para editar");
        }

        const datosActualizados = {
          id: parseInt(dataSelect.id),
          descripcion: ConvertirCapitalize(data.descripcion.trim()),
          precio: parseFloat(data.precio),
          precioespecial: parseFloat(data.precioespecial),
          id_operadora: parseInt(dataoperadora.id)
        };

        // Verificar que los datos no sean iguales a los actuales
        const datosActuales = {
          id: parseInt(dataSelect.id),
          descripcion: dataSelect.descripcion,
          precio: parseFloat(dataSelect.precio),
          precioespecial: parseFloat(dataSelect.precioespecial),
          id_operadora: parseInt(dataSelect.id_operadora)
        };

        const hayCambios = JSON.stringify(datosActuales) !== JSON.stringify(datosActualizados);
        
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

        const resultado = await editarRuta(datosActualizados);
        
        if (!resultado) {
          throw new Error("Error al actualizar la ruta");
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Ruta actualizada correctamente",
          timer: 1500,
          showConfirmButton: false
        });
        reset();
    } else {
        const nuevoRegistro = {
          _descripcion: ConvertirCapitalize(data.descripcion.trim()),
          _precio: parseFloat(data.precio),
          _precioespecial: parseFloat(data.precioespecial),
          _idoperadora: parseInt(dataoperadora.id)
      };

        const resultado = await insertarRuta(nuevoRegistro);
        
        if (resultado?.error) {
          throw new Error(resultado.error);
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Ruta creada correctamente",
          timer: 1500,
          showConfirmButton: false
        });
        reset();
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al guardar los datos de la ruta",
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
              {accion === "Editar" ? "Editar ruta" : "Registrar nueva ruta"}
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
                  rows="5"
                  {...register("descripcion", {
                    required: true,
                  })}
                />
                <label className="form__label">Nombre de la ruta</label>
                {errors.descripcion?.type === "required" && <p>Campo requerido</p>}
              </InputTextArea>
            </article>

            <article>
              <InputText icono={<v.iconoprecioventa />}>
                <input
                  className="form__field"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder=""
                  {...register("precio", {
                    required: true,
                    min: 0,
                  })}
                />
                <label className="form__label">Precio Normal</label>
                {errors.precio?.type === "required" && <p>Campo requerido</p>}
                {errors.precio?.type === "min" && <p>El precio debe ser mayor o igual a 0</p>}
              </InputText>
            </article>

            <article>
              <InputText icono={<v.iconoprecioventa />}>
                <input
                  className="form__field"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder=""
                  {...register("precioespecial", {
                    required: true,
                    min: 0,
                  })}
                />
                <label className="form__label">Precio Especial</label>
                {errors.precioespecial?.type === "required" && <p>Campo requerido</p>}
                {errors.precioespecial?.type === "min" && <p>El precio debe ser mayor o igual a 0</p>}
              </InputText>
            </article>

            <div className="btnguardarContent">
              <Btnsave
                icono={<v.iconoguardar />}
                titulo={isLoading ? "Guardando..." : "Guardar"}
                bgcolor="#007BFF"
                disabled={isLoading}
              />
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

  .sub-contenedor {
    width: 700px;
    max-width: 90%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 20px 45px 30px 45px;
    z-index: 100;
    max-height: 90vh;
    overflow-y: auto;

    /* Media queries para responsividad */
    @media (max-width: 768px) {
      width: 95%;
      max-width: 95%;
      padding: 10px 20px 15px 20px;
    }

    @media (max-width: 480px) {
      width: 98%;
      max-width: 98%;
      padding: 10px 15px 15px 15px;
      margin: 10px auto;
    }

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      h1 {
        font-size: 20px;
        font-weight: 500;
        color: ${({ theme }) => theme.text};
      }
      span {
        font-size: 20px;
        cursor: pointer;
        color: ${({ theme }) => theme.text};
        &:hover {
          color: #007BFF;
        }
      }
    }

    .formulario {
      section {
        gap: 25px;
        display: flex;
        flex-direction: column;

        article {
          position: relative;
        }

        .btnguardarContent {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
      }
    }
  }
`;
