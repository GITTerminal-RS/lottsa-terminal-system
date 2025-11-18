import { useQuery } from "@tanstack/react-query";
import {
  UsuariosTemplate,
  SpinnerLoader,
  useOperadoraStore,
  useRutaStore,
  useUsuariosStore,
  BloqueoPagina,
} from "../index";

export function Usuarios() {
  const {
    mostrarModulos,
    mostrarusuariosTodos,
    mostrarSuperadmins,
    datausuarios,
    buscarusuarios,
    buscador,
    datapermisos,
  } = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto) =>
    objeto.modulos.nombre.includes("Personal")
  );
  const { dataoperadora } = useOperadoraStore();

  // Si no hay operadora (usuario root), mostrar superadmins
  const isRoot = dataoperadora == null;

  const { isLoading, error } = useQuery({
    queryKey: isRoot
      ? ["mostrar superadmins"]
      : ["mostrar usuarios", { _id_operadora: dataoperadora?.id }],
    queryFn: isRoot
      ? mostrarSuperadmins
      : () => mostrarusuariosTodos({ _id_operadora: dataoperadora?.id }),
    enabled: isRoot || dataoperadora?.id != null,
  });

  const { data: buscardata } = useQuery({
    queryKey: [
      "buscar usuarios",
      { _id_operadora: dataoperadora?.id, buscador: buscador },
    ],
    queryFn: () =>
      buscarusuarios({ _id_operadora: dataoperadora?.id, buscador: buscador }),
    enabled: !isRoot && dataoperadora?.id != null,
  });

  const { data: datamodulos } = useQuery({
    queryKey: ["mostrar modulos"],
    queryFn: mostrarModulos,
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

  return <UsuariosTemplate data={datausuarios} />;
}
