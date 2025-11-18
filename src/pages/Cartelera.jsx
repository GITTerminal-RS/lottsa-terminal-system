import { useUsuariosStore } from "../index";
import CarteleraTemplate from "../components/templates/CarteleraTemplate";
import { useState, useEffect } from "react";

export function Cartelera() {
  const { datapermisos } = useUsuariosStore();
  const statePermiso = datapermisos.some((objeto) => objeto.modulos.nombre.includes("Cartelera"));
  const [isLoading, setIsLoading] = useState(false);
  // TODO: cargar datos de cartelera si es necesario

  if (statePermiso === false) {
    return <div>Sin permiso para ver este módulo</div>;
  }
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  return <CarteleraTemplate data={[]} />;
} 