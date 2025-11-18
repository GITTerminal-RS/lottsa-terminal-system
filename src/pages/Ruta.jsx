import { useQuery } from "@tanstack/react-query";
import {
  BloqueoPagina,
  RutaTemplate,
  SpinnerLoader,
  useOperadoraStore,
  useRutaStore,
  useUsuariosStore,
} from "../index";

export function Ruta() {
  const {datapermisos} = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto)=>objeto.modulos.nombre.includes("Ruta de destinos"))

  const { mostrarRuta, dataruta, buscarRuta, buscador } = useRutaStore();
  const { dataoperadora } = useOperadoraStore();

  // Consulta principal para mostrar rutas
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar ruta", { id_operadora: dataoperadora?.id }],
    queryFn: () => mostrarRuta({ id_operadora: dataoperadora?.id }),
    enabled: dataoperadora?.id != null,
  });

  // Consulta de búsqueda
  const { data: buscardata } = useQuery({
    queryKey: ["buscar ruta", { 
      id_operadora: dataoperadora?.id, 
      descripcion: buscador || "" 
    }],
    queryFn: async () => {
      if (!dataoperadora?.id) return [];
      const result = await buscarRuta({ 
        id_operadora: dataoperadora.id, 
        descripcion: buscador || "" 
      });
      return result || [];
    },
    enabled: dataoperadora?.id != null && buscador !== undefined,
    staleTime: 0,
    cacheTime: 0,
  });

  if (statePermiso == false) {
    return <BloqueoPagina />;
  }
  if (isLoading) {
    return <SpinnerLoader />;
  }
  if (error) {
    return <span>Error...</span>;
  }

  return <RutaTemplate data={dataruta}/>;
}
