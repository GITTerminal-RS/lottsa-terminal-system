import { useQuery } from "@tanstack/react-query";
import {
  BloqueoPagina,
  RutaTemplate,
  ReportesTemplate,
  SpinnerLoader,
  useOperadoraStore,
  useRutaStore,
  useUsuariosStore,
} from "../index";

export function Reportes() {
  const {datapermisos} = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto)=>objeto.modulos.nombre.includes("Ruta de destinos"))

  // const { mostrarkardex } = useKardexStore();
  // const { dataoperadora } = useOperadoraStore();
  // const { isLoading, error } = useQuery({
  //   queryKey: ["mostrar kardex", { _id_operadora: dataoperadora?.id }],
  //   queryFn: () => mostrarkardex({ _id_operadora: dataoperadora?.id }),
  //   enabled: dataoperadora?.id != null,
  // });
 
  if (statePermiso == false) {
    return <BloqueoPagina />;
  }
  // if (isLoading) {
  //   return <SpinnerLoader />;
  // }
  // if (error) {
  //   return <span>Error...</span>;
  // }
  return <ReportesTemplate/>;
}
