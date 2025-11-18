import { useQuery } from "@tanstack/react-query";
import {
  BloqueoPagina,
  HorariosTemplate,
  SpinnerLoader,
  useHorariosStore,
  useOperadoraStore,
  useUsuariosStore,
} from "../index";

export function Horarios() {
  const { datapermisos } = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto) =>
    objeto.modulos.nombre.includes("Horario de destinos")
  );

  const { mostrarhorariosagrupados, datahorarios, buscarhorarios, buscador } = useHorariosStore();
  const { dataoperadora } = useOperadoraStore();

  // Consulta principal para mostrar horarios agrupados por destino
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar horarios agrupados", { id_operadora: dataoperadora?.id }],
    queryFn: () => mostrarhorariosagrupados({ id_operadora: dataoperadora?.id }),
    enabled: !!dataoperadora?.id,
  });

  // Consulta de búsqueda
  const { data: buscardata } = useQuery({
    queryKey: [
      "buscar horarios",
      { id_operadora: dataoperadora?.id, descripcion: buscador },
    ],
    queryFn: () =>
      buscarhorarios({ 
        id_operadora: dataoperadora?.id, 
        descripcion: buscador 
      }),
    enabled: !!dataoperadora?.id && !!buscador,
  });

  if (statePermiso === false) {
    return <BloqueoPagina />;
  }

  if (isLoading) {
    return <SpinnerLoader />;
  }

  if (error) {
    return <span>Error al cargar los horarios: {error.message}</span>;
  }

  // Usar los datos de búsqueda si existen, sino usar los datos normales
  const datosAMostrar = buscardata || datahorarios;

  return <HorariosTemplate data={datosAMostrar} />;
}
