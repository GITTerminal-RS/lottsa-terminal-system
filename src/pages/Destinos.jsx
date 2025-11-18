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

export function Destinos() {
  const { datapermisos } = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto) => objeto.modulos.nombre.includes("Destinos"));
 
  const { mostrarRuta } = useRutaStore();
  const { mostrarhorarios } = useHorariosStore();
  const { mostrardestinos, datadestinos, buscardestinos, buscador } = useDestinosStore();
  const { dataoperadora } = useOperadoraStore();
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        if (dataoperadora?.id) {
          await mostrardestinos({ id_operadora: dataoperadora.id });
          if (mostrarRuta) await mostrarRuta({ id_operadora: dataoperadora.id });
          if (mostrarhorarios) await mostrarhorarios({ id_operadora: dataoperadora.id });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [dataoperadora?.id]);

  if (statePermiso === false) {
    return <BloqueoPagina />;
  }

  if (isLoading) {
    return <SpinnerLoader />;
  }

  return <DestinosTemplate data={datadestinos || []} />;
}
