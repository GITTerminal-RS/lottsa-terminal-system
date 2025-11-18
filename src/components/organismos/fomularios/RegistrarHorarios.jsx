import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btnsave,
  ConvertirCapitalize,
  useHorariosStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useOperadoraStore } from "../../../store/OperadoraStore";
import Swal from "sweetalert2";
import { MdAccessTime } from "react-icons/md";
import { BiTrash } from "react-icons/bi";
import { MdAddCircle } from "react-icons/md";
import { GetHorariosForPizarra } from "../../../supabase/crudHorarios";

export function RegistrarHorarios({ onClose, dataSelect, accion }) {
  const [currentColor, setColor] = useState("#F44336");
  const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);
  const [horarioEspecial, setHorarioEspecial] = useState(false); // NUEVO ESTADO
  const { insertarhorarios, editarhorarios, mostrarhorarios, eliminarhorarios, mostrarhorariosagrupados } = useHorariosStore();
  const { dataoperadora } = useOperadoraStore();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm();

  const getColorByTime = (time, especial = false) => {
    if (especial) return "#21618C"; // Color especial
    if (!time) return "#607D8B"; // Default grey
    const [hours] = time.split(":").map(Number);
    if (hours >= 0 && hours < 12) {
      return "#4CAF50"; // Green for AM
    } else if (hours >= 12 && hours <= 23) {
      return "#FFC107"; // Yellow for PM
    }
    return "#607D8B"; // Default grey for invalid times
  };

  useEffect(() => {
    console.log("accion (inside useEffect):", accion);
    console.log("dataSelect (inside useEffect):", dataSelect);
    console.log("dataSelect.horarios (inside useEffect):", dataSelect?.horarios);

    if (accion === "Editar" && dataSelect?.id_destino) {
      console.log("Entering 'Editar' branch.");
      // Si la acción es editar, carga los horarios existentes del destino
      setValue("nombre", ""); // Limpia el campo de hora
      if (dataSelect.horarios && Array.isArray(dataSelect.horarios)) {
        console.log("dataSelect.horarios is valid for mapping.");
        const mappedHorarios = dataSelect.horarios.map(h => ({
          id: h.id,
          descripcion: h.descripcion,
          color: h.color,
          id_operadora: h.id_operadora,
          id_destino: h.id_destino
        }));
        setHorariosSeleccionados(mappedHorarios);
        console.log("horariosSeleccionados set in 'Editar' branch to:", mappedHorarios);
      } else {
        setHorariosSeleccionados([]);
        console.log("horariosSeleccionados set to empty in 'Editar' branch (no valid schedules):", []);
      }
    } else {
      console.log("Entering 'Nuevo/No id' branch.");
      // Para nuevo registro o si no hay id de destino, reinicia el formulario y los horarios
      reset({
        nombre: "",
      });
      setHorariosSeleccionados([]);
      console.log("horariosSeleccionados set to empty in 'Nuevo/No id' branch:", []);
      if (accion === "Nuevo") {
        // onClose(); // Comentado para evitar que se cierre si se intenta registrar horarios sin un destino existente
      }
    }
  }, [accion, dataSelect, reset, setValue, onClose]);

  console.log("horariosSeleccionados antes de renderizar:", horariosSeleccionados);

  const elegirColor = (color) => {
    setColor(color.hex);
  };

  const handleAgregarHorario = async (formData) => {
    const hora = formData.nombre?.trim();
    if (!hora) {
      Swal.fire("Error", "La hora del horario no puede estar vacía", "error");
      return;
    }

    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora)) {
      Swal.fire("Error", "Formato de hora inválido. Use formato 24h (HH:mm)", "error");
      return;
    }

    if (!dataSelect?.id_destino || !dataoperadora?.id) {
      console.log("Datos faltantes:", { 
        id_destino: dataSelect?.id_destino, 
        id_operadora: dataoperadora?.id,
        dataSelect_completo: dataSelect,
        dataoperadora_completo: dataoperadora
      });
      Swal.fire("Error", "Debe seleccionar un destino y una operadora para agregar horarios.", "error");
      return;
    }

    try {
      const nuevoHorario = {
        _descripcion: ConvertirCapitalize(hora),
        _idoperadora: parseInt(dataoperadora.id),
        _iddestino: parseInt(dataSelect.id_destino),
        _color: getColorByTime(hora, horarioEspecial), // MODIFICADO
      };

      console.log("Intentando insertar horario con datos:", nuevoHorario);
      console.log("Tipo de datos:", {
        descripcion: typeof nuevoHorario._descripcion,
        idoperadora: typeof nuevoHorario._idoperadora,
        iddestino: typeof nuevoHorario._iddestino,
        color: typeof nuevoHorario._color
      });

      const response = await insertarhorarios(nuevoHorario);
      console.log("Respuesta completa del servidor:", response);

      if (response?.success) {
        setValue("nombre", ""); // Limpiar el campo de hora después de agregar
        reset();
        setHorarioEspecial(false); // RESETEAR CHECKBOX
        setHorariosSeleccionados([]);
        // Recargar horarios agrupados para actualizar la pizarra
        const updatedHorarios = await GetHorariosForPizarra(dataoperadora.id, dataSelect.id_destino);
        setHorariosSeleccionados(updatedHorarios[0]?.horarios || []);
      } else {
        console.error("Error en la respuesta:", response);
        throw new Error(response?.error || "Error al agregar el horario");
      }
    } catch (error) {
      console.error("Error detallado al agregar horario:", error);
      console.error("Stack trace:", error.stack);
      console.error("Error completo:", {
        message: error.message,
        name: error.name,
        cause: error.cause,
        response: error.response
      });

      // Manejo específico para el error de duplicados
      if (error.message.includes("Ya existe un horario con esta hora para este destino")) {
        Swal.fire({
          title: "Horario duplicado",
          text: "Ya existe un horario con esta hora para este destino. Por favor, ingrese una hora diferente.",
          icon: "warning",
          confirmButtonText: "Entendido"
        });
      } else {
        Swal.fire({
          title: "Error",
          text: `Error al agregar el horario: ${error.message}`,
          icon: "error",
          confirmButtonText: "Entendido"
        });
      }
    }
  };

  const handleEliminarHorario = async (id) => {
    console.log("Intentando eliminar horario con ID:", id);

    if (horariosSeleccionados.length === 1) {
      Swal.fire({
        title: "Advertencia",
        text: "Debe haber al menos un horario en la pizarra.",
        icon: "warning",
        confirmButtonText: "Entendido"
      });
      return;
    }

    try {
      console.log("Llamando a eliminarhorarios...");
      const response = await eliminarhorarios({ id: id });
      console.log("Respuesta de eliminarhorarios:", response);
      if (response?.success) {
        const updatedHorarios = await GetHorariosForPizarra(dataoperadora.id, dataSelect.id_destino);
        setHorariosSeleccionados(updatedHorarios[0]?.horarios || []);
        console.log("Pizarra actualizada después de eliminar.");
      } else {
        console.error("Error en la respuesta al eliminar:", response);
        Swal.fire("Error", response?.error || "No se pudo eliminar el horario.", "error");
      }
    } catch (error) {
      console.error("Error al eliminar horario (catch block):");
      console.error("  Message:", error.message);
      console.error("  Stack:", error.stack);
      Swal.fire("Error", error.message || "No se pudo eliminar el horario.", "error");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(handleAgregarHorario)(); 
    }
  };

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>{accion === "Editar" ? "Editar Horarios del Destino" : "Registrar Horario"}</h1>
            {accion === "Editar" && dataSelect?.descripcion && (
              <h2>Destino: {dataSelect.descripcion}</h2>
            )}
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>

        <form className="formulario" onSubmit={handleSubmit(handleAgregarHorario)}>
          <section className="seccion1">
            <article>
              <InputText icono={<MdAccessTime />}>
                <input
                  className="form__field"
                  type="time"
                  step="60"
                  min="00:00"
                  max="23:59"
                  placeholder=""
                  {...register("nombre", {
                    // Eliminadas validaciones de requerido y patrón
                  })}
                  onKeyPress={handleKeyPress}
                />
                <label className="form__label">Hora del horario (formato 24h)</label>
                {/* Eliminados mensajes de error */}
              </InputText>
              {/* CHECKBOX HORARIO ESPECIAL */}
              <div style={{marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="checkbox"
                  id="horarioEspecial"
                  checked={horarioEspecial}
                  onChange={e => setHorarioEspecial(e.target.checked)}
                />
                <label htmlFor="horarioEspecial" style={{fontSize: '15px', cursor: 'pointer'}}>Horario especial</label>
              </div>
            </article>
            <AddButton type="button" onClick={handleSubmit(handleAgregarHorario)}>
              <MdAddCircle />
            </AddButton>
          </section>
          
          <HorariosPizarra>
            {horariosSeleccionados.length > 0 ? (
              horariosSeleccionados.map((horario) => (
                <HorarioItem key={horario.id} color={horario.color}>
                  <span>🕒 {horario.descripcion}</span>
                  <TrashIcon onClick={() => handleEliminarHorario(horario.id)} />
                </HorarioItem>
              ))
            ) : (
              <p>No hay horarios añadidos para este destino.</p>
            )}
          </HorariosPizarra>

          {/* LEYENDA DE COLORES */}
          <div style={{marginTop: '12px', marginBottom: '8px'}}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16}}>
              <span style={{width: 18, height: 18, borderRadius: '50%', background: '#4CAF50', display: 'inline-block', border: '1px solid #888'}}></span>
              Mañana (AM)
            </span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16}}>
              <span style={{width: 18, height: 18, borderRadius: '50%', background: '#FFC107', display: 'inline-block', border: '1px solid #888'}}></span>
              Tarde/Noche (PM)
            </span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16}}>
              <span style={{width: 18, height: 18, borderRadius: '50%', background: '#21618C', display: 'inline-block', border: '1px solid #888'}}></span>
              Horario especial
            </span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
              <span style={{width: 18, height: 18, borderRadius: '50%', background: '#607D8B', display: 'inline-block', border: '1px solid #888'}}></span>
              Sin hora válida
            </span>
          </div>

            <div className="btnguardarContent">
              
            </div>
        </form>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .sub-contenedor {
    background: ${({ theme }) => theme.bg};
    border-radius: 20px;
    padding: 20px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 24px;
        color: ${({ theme }) => theme.text};
      }

      h2 {
        font-size: 18px;
        color: ${({ theme }) => theme.text};
        margin-top: 5px;
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
      display: flex;
      flex-direction: column;
        gap: 10px;

      .seccion1 {
        display: flex;
        flex-direction: row; /* Cambiado a fila para el input y el botón */
        align-items: center;
        gap: 10px; /* Espacio entre el input y el botón */

        article {
          flex: 1;
        }
      }
      
      .seccion2 {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }
  }
`;

const AddButton = styled.button`
  background-color: #28a745; /* Color verde */
  color: white;
  border: none;
  border-radius: 50%; /* Hacerlo circular */
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0; /* Evita que se encoja */

  &:hover {
    background-color: #218838;
  }
`;

const HorariosPizarra = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
  background-color: #f9f9f9;

  p {
    width: 100%;
    text-align: center;
    color: #757575;
    font-style: italic;
  }
`;

const HorarioItem = styled.div`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.color || "#fc6027"};
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 500;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const TrashIcon = styled(BiTrash)`
  cursor: pointer;
  font-size: 1.1em;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    color: #f44336;
  }
`;
