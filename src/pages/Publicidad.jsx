import {
  BloqueoPagina,
  PublicidadTemplate,
  SpinnerLoader,
  usePublicidadStore,
  useUsuariosStore,
} from "../index";
import { useEffect, useState } from "react";

export function Publicidad() {
  const { datapermisos } = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto) => 
    objeto.modulos.nombre.includes("Publicidad")
  );
  
  const { cargarPublicidad } = usePublicidadStore();
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        await cargarPublicidad();
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [cargarPublicidad]);

  if (statePermiso === false) {
    return <BloqueoPagina />;
  }

  if (isLoading) {
    return <SpinnerLoader />;
  }

  return <PublicidadTemplate />;
}

export default Publicidad;
