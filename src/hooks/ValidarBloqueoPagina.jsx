import { BloqueoPagina, useUsuariosStore } from "../index";
export function ValidarBloqueoPagina(modulo) {
    const { datapermisos } = useUsuariosStore();
    const statePermiso = datapermisos.some((objeto) =>
      objeto.modulos.nombre.includes("Horario de destinos")
    );
    // if (statePermiso == false) {
    //   return <BloqueoPagina />;
    // }
    return statePermiso
}
