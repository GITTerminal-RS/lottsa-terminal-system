import { BuscarRuta, EditarRuta, EliminarRuta, InsertarRuta, MostrarRuta } from "../api/apicrud";

export async function BuscarRutas(p) {
  try {
    console.log("Buscando rutas con parámetros:", p);
    
    if (!p.id_operadora) {
      throw new Error("Se requiere el ID de la operadora para buscar rutas");
    }

    const searchParams = {
      id_operadora: parseInt(p.id_operadora),
      descripcion: p.descripcion?.trim() || null,
      precio: p.precio ? parseFloat(p.precio) : null,
      precioespecial: p.precioespecial ? parseFloat(p.precioespecial) : null
    };

    console.log("Parámetros de búsqueda procesados:", searchParams);
    const response = await BuscarRuta(searchParams);
    
    if (!response || !Array.isArray(response)) {
      console.warn("Respuesta de búsqueda inválida:", response);
      return [];
    }

    console.log("Rutas encontradas:", response.length);
    return response;
  } catch (error) {
    console.error("Error en BuscarRutas:", error);
    throw error;
  }
}

export async function MostrarRutas(p) {
  try {
    console.log("Mostrando rutas para operadora:", p.id_operadora);
    
    if (!p.id_operadora) {
      throw new Error("Se requiere el ID de la operadora para mostrar rutas");
    }

    const response = await MostrarRuta({ id_operadora: parseInt(p.id_operadora) });
    
    if (!response || !Array.isArray(response)) {
      console.warn("Respuesta de mostrar rutas inválida:", response);
      return [];
    }

    console.log("Rutas encontradas:", response.length);
    return response;
  } catch (error) {
    console.error("Error en MostrarRutas:", error);
    throw error;
  }
}

export async function InsertarRutas(p) {
  try {
    console.log("Intentando insertar ruta:", p);
    
    if (!p._descripcion || !p._idoperadora) {
      throw new Error("Faltan datos requeridos para insertar la ruta");
    }

    const datos = {
      _descripcion: p._descripcion.trim(),
      _idoperadora: parseInt(p._idoperadora),
      _precio: parseFloat(p._precio) || 0,
      _precioespecial: parseFloat(p._precioespecial) || 0
    };

    console.log("Datos procesados para inserción:", datos);
    const response = await InsertarRuta(datos);
    
    if (!response) {
      throw new Error("No se pudo insertar la ruta");
    }

    console.log("Ruta insertada exitosamente");
    return true;
  } catch (error) {
    console.error("Error en InsertarRutas:", error);
    throw error;
  }
}

export async function EditarRutas(p) {
  try {
    console.log("Intentando editar ruta:", p);
    
    if (!p.id || !p.descripcion || !p.id_operadora) {
      throw new Error("Faltan datos requeridos para editar la ruta");
    }

    const datos = {
      id: parseInt(p.id),
      descripcion: p.descripcion.trim(),
      precio: parseFloat(p.precio) || 0,
      precioespecial: parseFloat(p.precioespecial) || 0,
      id_operadora: parseInt(p.id_operadora)
    };

    console.log("Datos procesados para edición:", datos);
    const response = await EditarRuta(datos);
    
    if (!response) {
      throw new Error("No se pudo editar la ruta");
    }

    console.log("Ruta editada exitosamente");
    return true;
  } catch (error) {
    console.error("Error en EditarRutas:", error);
    throw error;
  }
}

export async function EliminarRutas(p) {
  try {
    console.log("Intentando eliminar ruta:", p);
    
    if (!p.id) {
      throw new Error("Se requiere el ID de la ruta para eliminarla");
    }

    const response = await EliminarRuta({ id: parseInt(p.id) });
    
    if (!response) {
      throw new Error("No se pudo eliminar la ruta");
    }

    console.log("Ruta eliminada exitosamente");
    return true;
  } catch (error) {
    console.error("Error en EliminarRutas:", error);
    throw error;
  }
} 