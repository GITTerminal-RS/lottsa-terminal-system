import Swal from "sweetalert2";
import { ObtenerIdAuthSupabase, supabase } from "../index";

export const MostrarOperadora = async (p) => {
  // Protección: no consultar si el id es undefined o null
  if (!p?.iduseradmin) {
    console.warn("MostrarOperadora: iduseradmin no definido");
    return null;
  }
  console.log("MostrarOperadora - Parámetros recibidos:", p);
  const { error, data } = await supabase
    .from("asignaroperadora")
    .select(`operadora(id,nombre,direccion,telefono,dirigente,correo,sitioweb,horarioatencion,descripcion,servicios,logo,portada)`)
    .eq("id_usuario", p.iduseradmin)
    .maybeSingle();
  
  console.log("MostrarOperadora - Resultado de la consulta:", { data, error });
  
  if (error) {
    console.error("MostrarOperadora - Error en la consulta:", error);
    return null;
  }
  
  if (data) {
    console.log("MostrarOperadora - Datos encontrados:", data);
    return data;
  }
  
  console.log("MostrarOperadora - No se encontraron datos");
  return null;
};

export const ContarUsuariosXoperadora = async (p) => {
  try {
    if (!p?.id_operadora) {
      console.warn("ContarUsuariosXoperadora: No se proporcionó id_operadora");
      return 0;
    }

    const { data, error } = await supabase.rpc("contar_usuarios_por_operadora", {
      _id_operadora: p.id_operadora
    });

    if (error) {
      console.error("Error al contar usuarios por operadora:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Error en ContarUsuariosXoperadora:", error);
    return 0;
  }
};

export const obtenerOperadoraPorAdmin = async (idAdmin) => {
  console.log("Iniciando búsqueda de operadora para admin:", idAdmin);
  
  // Primero verificamos si existe la asignación
  const { data: asignacion, error: errorAsignacion } = await supabase
    .from("asignaroperadora")
    .select("id")
    .eq("id", idAdmin)
    .maybeSingle();

  console.log("Resultado de búsqueda de asignación:", { asignacion, errorAsignacion });

  if (errorAsignacion) {
    console.error("Error al obtener asignación:", errorAsignacion);
    return null;
  }

  if (!asignacion) {
    console.log("No se encontró asignación para el usuario");
    return null;
  }

  // Si existe la asignación, obtenemos los datos de la operadora
  const { data: operadora, error: errorOperadora } = await supabase
    .from("operadora")
    .select(`
      id,
      nombre,
      direccion,
      telefono,
      dirigente,
      correo,
      sitioweb,
      horarioatencion,
      descripcion,
      servicios,
      logo,
      portada
    `)
    .eq("id", asignacion.id_operadora)
    .maybeSingle();

  console.log("Resultado de búsqueda de operadora:", { operadora, errorOperadora });

  if (errorOperadora) {
    console.error("Error al obtener operadora:", errorOperadora);
    return null;
  }

  return operadora;
};

export const actualizarOperadora = async (datos) => {
  console.log('Iniciando actualización de operadora con datos:', datos);
  
  const { data, error } = await supabase
    .from("operadora")
    .update({
      nombre: datos.nombre,
      direccion: datos.direccion,
      telefono: datos.telefono,
      dirigente: datos.dirigente,
      correo: datos.correo,
      sitioweb: datos.sitioweb,
      horarioatencion: datos.horarioatencion,
      descripcion: datos.descripcion,
      servicios: datos.servicios,
      logo: datos.logo,
      portada: datos.portada
    })
    .eq("id", datos.id)
    .select(); // Agregamos .select() para obtener los datos actualizados

  if (error) {
    console.error("Error al actualizar operadora:", error);
    return false;
  }

  console.log('Operadora actualizada exitosamente:', data);
  return true;
};

// Obtener todas las operadoras para el público
export const obtenerOperadorasPublico = async () => {
  const { data, error } = await supabase.rpc('obtener_operadoras_publico');
  if (error) {
    console.error('Error al obtener operadoras:', error);
    return [];
  }
  return data;
};

// Obtener destinos de una operadora para el público
export const obtenerDestinosOperadoraPublico = async (id_operadora) => {
  const { data, error } = await supabase.rpc('destinos_operadora_publico', { _id_operadora: id_operadora });
  if (error) {
    console.error('Error al obtener destinos de la operadora:', error);
    return [];
  }
  return data;
};

export const obtenerOperadorasAdmin = async () => {
  const { data, error } = await supabase
    .from("operadora")
    .select("id, nombre, direccion, telefono, logo, portada")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener operadoras para admin:", error);
    return [];
  }

  return data || [];
};

export const obtenerInfoInstitucional = async (id_operadora) => {
  if (!id_operadora) return null;

  const { data, error } = await supabase.rpc('obtener_info_institucional_publico', {
    _id_operadora: id_operadora
  });

  if (error) {
    console.error('Error al obtener información institucional:', error);
    return null;
  }
  
  if (!data) {
      return null;
  }

  const info = data.reduce((acc, item) => {
    if (item.tipo && item.descripcion) {
      const tipo = item.tipo.toLowerCase().trim();
      if (tipo === 'fotomision') {
        acc['fotomision'] = item.descripcion;
      } else {
        acc[tipo] = item.descripcion;
      }
    }
    return acc;
  }, {});

  return info;
};
