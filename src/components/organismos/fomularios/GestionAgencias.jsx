import { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { v } from "../../../styles/variables";
import { InputText } from "./InputText";
import {
  mostrarAgencias,
  insertarAgencia,
  editarAgencia,
  eliminarAgencia,
} from "../../../supabase/crudAgencia";

const CAMPOS_FORM = [
  { name: "lugar", label: "Lugar", required: true },
  { name: "direccion", label: "Dirección", required: false },
  { name: "contactos", label: "Contactos", required: false },
  { name: "hora_atencion", label: "Hora de atención", required: false },
  { name: "encomiendas_contacto", label: "Contacto encomiendas", required: false },
];

export function GestionAgencias({ idOperadora }) {
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [accion, setAccion] = useState("Nuevo");
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lugar: "",
      direccion: "",
      contactos: "",
      hora_atencion: "",
      encomiendas_contacto: "",
    },
  });

  const { data: agencias = [], isLoading } = useQuery({
    queryKey: ["agencias-operadora", idOperadora],
    queryFn: () => mostrarAgencias({ id_operadora: idOperadora }),
    enabled: !!idOperadora,
  });

  useEffect(() => {
    if (!mostrarFormulario) return;

    if (accion === "Editar" && agenciaSeleccionada) {
      CAMPOS_FORM.forEach(({ name }) => {
        setValue(name, agenciaSeleccionada[name] || "");
      });
    } else {
      reset({
        lugar: "",
        direccion: "",
        contactos: "",
        hora_atencion: "",
        encomiendas_contacto: "",
      });
    }
  }, [accion, agenciaSeleccionada, mostrarFormulario, reset, setValue]);

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setAccion("Nuevo");
    setAgenciaSeleccionada(null);
    reset();
  };

  const abrirNueva = () => {
    setAccion("Nuevo");
    setAgenciaSeleccionada(null);
    setMostrarFormulario(true);
  };

  const abrirEditar = (agencia) => {
    setAccion("Editar");
    setAgenciaSeleccionada(agencia);
    setMostrarFormulario(true);
  };

  const onSubmit = async (data) => {
    if (!idOperadora) return;

    setGuardando(true);
    try {
      let ok = false;

      if (accion === "Editar" && agenciaSeleccionada?.id) {
        ok = await editarAgencia({
          id: agenciaSeleccionada.id,
          ...data,
        });
      } else {
        ok = await insertarAgencia({
          id_operadora: idOperadora,
          ...data,
        });
      }

      if (!ok) return;

      await queryClient.invalidateQueries({
        queryKey: ["agencias-operadora", idOperadora],
      });

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text:
          accion === "Editar"
            ? "Agencia actualizada correctamente"
            : "Agencia registrada correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      cerrarFormulario();
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (agencia) => {
    Swal.fire({
      title: "¿Eliminar agencia?",
      text: `Se eliminará "${agencia.lugar}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const ok = await eliminarAgencia({ id: agencia.id });
      if (!ok) return;

      await queryClient.invalidateQueries({
        queryKey: ["agencias-operadora", idOperadora],
      });

      if (
        agenciaSeleccionada?.id === agencia.id &&
        mostrarFormulario
      ) {
        cerrarFormulario();
      }

      Swal.fire({
        icon: "success",
        title: "Eliminada",
        text: "La agencia fue eliminada",
        timer: 1200,
        showConfirmButton: false,
      });
    });
  };

  if (!idOperadora) return null;

  return (
    <Section>
      <SectionHeader>
        <h2>Agencias</h2>
        <AddButton type="button" onClick={abrirNueva}>
          <FaPlus /> Agregar agencia
        </AddButton>
      </SectionHeader>

      <SectionHint>
        Registra las sucursales o puntos de atención de tu operadora.
      </SectionHint>

      {isLoading ? (
        <EmptyMsg>Cargando agencias...</EmptyMsg>
      ) : agencias.length === 0 ? (
        <EmptyMsg>No hay agencias registradas.</EmptyMsg>
      ) : (
        <AgenciasList>
          {agencias.map((agencia) => (
            <AgenciaCard key={agencia.id}>
              <AgenciaCardHeader>
                <AgenciaLugar>{agencia.lugar}</AgenciaLugar>
                <CardActions>
                  <IconButton
                    type="button"
                    title="Editar"
                    onClick={() => abrirEditar(agencia)}
                  >
                    <FaEdit />
                  </IconButton>
                  <IconButton
                    type="button"
                    $danger
                    title="Eliminar"
                    onClick={() => handleEliminar(agencia)}
                  >
                    <FaTrash />
                  </IconButton>
                </CardActions>
              </AgenciaCardHeader>
              {agencia.direccion && (
                <AgenciaDetalle>
                  <b>Dirección:</b> {agencia.direccion}
                </AgenciaDetalle>
              )}
              {agencia.contactos && (
                <AgenciaDetalle>
                  <b>Contactos:</b> {agencia.contactos}
                </AgenciaDetalle>
              )}
              {agencia.hora_atencion && (
                <AgenciaDetalle>
                  <b>Hora de atención:</b> {agencia.hora_atencion}
                </AgenciaDetalle>
              )}
              {agencia.encomiendas_contacto && (
                <AgenciaDetalle>
                  <b>Encomiendas:</b> {agencia.encomiendas_contacto}
                </AgenciaDetalle>
              )}
            </AgenciaCard>
          ))}
        </AgenciasList>
      )}

      {mostrarFormulario && (
        <FormCard onSubmit={handleSubmit(onSubmit)}>
          <FormTitle>
            {accion === "Editar" ? "Modificar agencia" : "Nueva agencia"}
          </FormTitle>
          <FormGrid>
            {CAMPOS_FORM.map(({ name, label, required }) => (
              <FormField key={name} $full={name === "direccion"}>
                <InputText icono={<v.iconoinfo />}>
                  {name === "direccion" ? (
                    <textarea
                      className="form__field"
                      rows={3}
                      {...register(name, {
                        required: required ? "Campo requerido" : false,
                      })}
                      style={{ resize: "vertical" }}
                    />
                  ) : (
                    <input
                      className="form__field"
                      type="text"
                      {...register(name, {
                        required: required ? "Campo requerido" : false,
                      })}
                    />
                  )}
                  <label className="form__label">{label}</label>
                </InputText>
                {errors[name] && <FieldError>{errors[name].message}</FieldError>}
              </FormField>
            ))}
          </FormGrid>
          <FormActions>
            <SecondaryButton type="button" onClick={cerrarFormulario}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : accion === "Editar"
                  ? "Guardar cambios"
                  : "Registrar agencia"}
            </PrimaryButton>
          </FormActions>
        </FormCard>
      )}
    </Section>
  );
}

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;

  h2 {
    color: #3a4b86;
    font-weight: 700;
    font-size: 1.3rem;
    margin: 0;
  }
`;

const SectionHint = styled.p`
  color: #888;
  font-size: 0.95rem;
  margin: 0 0 20px 0;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #3a4b86;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #2f3d6d;
  }
`;

const EmptyMsg = styled.p`
  color: #666;
  padding: 16px;
  background: #f8f9fc;
  border-radius: 8px;
  margin: 0;
`;

const AgenciasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
`;

const AgenciaCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 18px;
  background: #fff;
`;

const AgenciaCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

const AgenciaLugar = styled.h3`
  margin: 0;
  color: #3a4b86;
  font-size: 1.1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ $danger }) => ($danger ? "#fdecea" : "#eef2fa")};
  color: ${({ $danger }) => ($danger ? "#c0392b" : "#3a4b86")};

  &:hover {
    opacity: 0.85;
  }
`;

const AgenciaDetalle = styled.p`
  margin: 4px 0 0;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const FormCard = styled.form`
  border: 2px solid #dce3f5;
  border-radius: 12px;
  padding: 20px;
  background: #f8f9fc;
`;

const FormTitle = styled.h3`
  margin: 0 0 18px;
  color: #3a4b86;
  font-size: 1.1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};
`;

const FieldError = styled.p`
  color: #c0392b;
  font-size: 0.85rem;
  margin: 4px 0 0;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  background: #3a4b86;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  background: #fff;
  color: #3a4b86;
  border: 1px solid #c5cee0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;
