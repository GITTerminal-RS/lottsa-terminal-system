import { supabase } from "../index"
import Swal from "sweetalert2"

export async function InsertarHorarios(p) {
    try {
        console.log("InsertarHorarios - Datos recibidos:", JSON.stringify(p, null, 2));
        
        // Validar datos requeridos
        if (!p._descripcion?.trim()) {
            throw new Error("La descripción del horario es requerida");
        }
        if (!p._idoperadora) {
            throw new Error("El ID de la operadora es requerido");
        }
        if (!p._iddestino) {
            throw new Error("El ID del destino es requerido");
        }
        if (!p._color) {
            throw new Error("El color del horario es requerido");
        }

        // Asegurar que los tipos de datos sean correctos
        const params = {
            _descripcion: String(p._descripcion).trim(),
            _idoperadora: parseInt(p._idoperadora),
            _iddestino: parseInt(p._iddestino),
            _color: String(p._color)
        };

        console.log("InsertarHorarios - Parámetros procesados:", JSON.stringify(params, null, 2));

        const { data, error } = await supabase.rpc("insertarhorarios", params);
        
        if (error) {
            console.error("InsertarHorarios - Error en la llamada RPC:", error);
            if (error.message.includes('Ya existe un horario con esta hora para este destino')) {
                throw new Error("Ya existe un horario con esta hora para este destino");
            }
            throw new Error(error.message || "Error al insertar el horario");
        }

        console.log("InsertarHorarios - Horario insertado exitosamente");
        return { success: true };
    } catch (error) {
        console.error("InsertarHorarios - Error:", error);
        throw error; // Re-lanzar el error para manejarlo en el store
    }
}

export async function MostrarHorarios(p) {
    try {
        console.log("MostrarHorarios - Buscando horarios para operadora:", p.id_operadora);
        
        if (!p.id_operadora) {
            throw new Error("El ID de la operadora es requerido");
        }
 
        const { data, error } = await supabase
      .from("horarios")
            .select("*")
      .eq("id_operadora", p.id_operadora)
      .order("id", { ascending: true });
            
        if (error) {
            console.error("MostrarHorarios - Error:", error);
            throw new Error(error.message || "Error al obtener los horarios");
        }

        console.log("MostrarHorarios - Horarios encontrados:", data?.length || 0);
        return data || [];
    } catch (error) {
        console.error("MostrarHorarios - Error:", error);
        throw error;
    }
}

export async function EliminarHorarios(p) {
    try {
        console.log("EliminarHorarios - Intentando eliminar horario:", p.id);
        
        if (!p.id) {
            throw new Error("El ID del horario es requerido");
        }
 
    const { error } = await supabase
      .from("horarios")
      .delete()
      .eq("id", p.id);
            
    if (error) {
            console.error("EliminarHorarios - Error:", error);
            throw new Error(error.message || "Error al eliminar el horario");
        }

        console.log("EliminarHorarios - Horario eliminado exitosamente");
        return { success: true };
    } catch (error) {
        console.error("EliminarHorarios - Error:", error);
        return { success: false, error: error.message };
    }
}

export async function EditarHorarios(p) {
    try {
        console.log("EditarHorarios - Datos recibidos:", JSON.stringify(p, null, 2));
        
        if (!p.id || !p.descripcion || !p.id_operadora || !p.color) {
            throw new Error("Faltan datos requeridos para la actualización");
        }

        const datosActualizados = {
            descripcion: String(p.descripcion).trim(),
            color: String(p.color),
            id_operadora: parseInt(p.id_operadora)
        };

        console.log("EditarHorarios - Datos a actualizar:", JSON.stringify(datosActualizados, null, 2));

    const { error } = await supabase
      .from("horarios")
            .update(datosActualizados)
      .eq("id", p.id);

    if (error) {
            console.error("EditarHorarios - Error:", error);
            throw new Error(error.message || "Error al actualizar el horario");
    }

        console.log("EditarHorarios - Horario actualizado exitosamente");
        return true;
    } catch (error) {
        console.error("EditarHorarios - Error:", error);
        throw error;
    }
}

export async function BuscarHorarios(p) {
    try {
        console.log("BuscarHorarios - Parámetros de búsqueda:", JSON.stringify(p, null, 2));
        
        if (!p.id_operadora) {
            throw new Error("El ID de la operadora es requerido");
        }

        const query = supabase
    .from("horarios")
            .select("*")
            .eq("id_operadora", p.id_operadora);

        if (p.descripcion && p.descripcion.trim() !== "") {
            query.ilike("descripcion", "%" + p.descripcion.trim() + "%");
        }

        const { data, error } = await query;
        
        if (error) {
            console.error("BuscarHorarios - Error:", error);
            throw new Error(error.message || "Error al buscar horarios");
        }

        console.log("BuscarHorarios - Resultados encontrados:", data?.length || 0);
        return data || [];
    } catch (error) {
        console.error("BuscarHorarios - Error:", error);
        throw error;
    }
}

export async function MostrarHorariosAgrupados(p) {
    try {
        console.log("MostrarHorariosAgrupados - Iniciando consulta con datos:", p);
        
        if (!p?.id_operadora) {
            console.error("ID de operadora no proporcionado en MostrarHorariosAgrupados");
            return [];
        }

        const { data, error } = await supabase.rpc("mostrarhorariosagrupados", {
            _id_operadora: p.id_operadora,
            _id_destino: p.id_destino || null
        });

        if (error) {
            console.error("Error en MostrarHorariosAgrupados:", error);
            throw new Error(error.message || "Error al obtener los horarios agrupados");
        }

        if (!data) {
            console.warn("No se recibieron datos en MostrarHorariosAgrupados");
            return [];
        }

        console.log("MostrarHorariosAgrupados - Datos obtenidos:", data);
        return data;
    } catch (error) {
        console.error("Error en MostrarHorariosAgrupados:", error);
        return [];
    }
}

export async function GetHorariosForPizarra(id_operadora, id_destino) {
    try {
        console.log("GetHorariosForPizarra - Iniciando consulta con datos:", { id_operadora, id_destino });

        if (!id_operadora) {
            console.error("ID de operadora no proporcionado en GetHorariosForPizarra");
            return [];
        }

        const { data, error } = await supabase.rpc("mostrarhorariosagrupados", {
            _id_operadora: id_operadora,
            _id_destino: id_destino || null
        });

        if (error) {
            console.error("Error en GetHorariosForPizarra:", error);
            throw new Error(error.message || "Error al obtener los horarios para la pizarra");
        }

        if (!data) {
            console.warn("No se recibieron datos en GetHorariosForPizarra");
            return [];
        }

        console.log("GetHorariosForPizarra - Datos obtenidos:", data);
        return data;
    } catch (error) {
        console.error("Error en GetHorariosForPizarra:", error);
        throw error; // Propagar el error para que sea manejado por el componente
    }
}

// Consulta RPC para "¡Viajá ya!" (horarios especiales)
export async function obtenerViajaYa() {
  console.log("obtenerViajaYa - Iniciando consulta...");
  
  const { data, error } = await supabase.rpc('viaja_ya');
  
  if (error) {
    console.error("obtenerViajaYa - Error:", error);
    throw error;
  }
  
  console.log("obtenerViajaYa - Datos obtenidos:", data);
  console.log("obtenerViajaYa - Cantidad de registros:", data?.length || 0);
  
  return data;
}