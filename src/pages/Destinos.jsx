import {
  BloqueoPagina,
  DestinosTemplate,
  SpinnerLoader,
  useHorariosStore,
  useOperadoraStore,
  useRutaStore,
  useDestinosStore,
  useUsuariosStore,
} from "../index";
import { useEffect, useState } from "react";
import { MostrarUsuarios } from "../supabase/crudUsuarios";
import { obtenerOperadorasAdmin } from "../supabase/crudOperadora";

export function Destinos() {
  const { datapermisos } = useUsuariosStore();
  const { mostrarRuta } = useRutaStore();
  const { mostrarhorarios } = useHorariosStore();
  const { mostrardestinos } = useDestinosStore();
  const { dataoperadora, operadoraContexto } = useOperadoraStore();
  const [isRoot, setIsRoot] = useState(false);
  const [operadoras, setOperadoras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const operadoraActivaId = isRoot ? operadoraContexto?.id : dataoperadora?.id;
  const statePermiso =
    isRoot ||
    datapermisos.some((objeto) => objeto.modulos.nombre.includes("Destinos"));

  useEffect(() => {
    async function initRoot() {
      const usuario = await MostrarUsuarios();
      const root = usuario?.tipouser === "root";
      setIsRoot(root);
      if (root) {
        const lista = await obtenerOperadorasAdmin();
        setOperadoras(lista);
      }
      setCheckingAccess(false);
    }

    initRoot();
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setIsLoading(true);
        if (!operadoraActivaId) {
          return;
        }

        await mostrardestinos({ id_operadora: operadoraActivaId });
        await mostrarRuta({ id_operadora: operadoraActivaId });
        await mostrarhorarios({ id_operadora: operadoraActivaId });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    cargarDatos();
  }, [operadoraActivaId, mostrardestinos, mostrarRuta, mostrarhorarios]);

  if (checkingAccess) {
    return <SpinnerLoader />;
  }

  if (!statePermiso) {
    return <BloqueoPagina />;
  }

  if (isLoading && (!isRoot || operadoraActivaId)) {
    return <SpinnerLoader />;
  }

  return (
    <DestinosTemplate
      isRoot={isRoot}
      operadoras={operadoras}
      operadoraSeleccionada={operadoraContexto}
    />
  );
}
