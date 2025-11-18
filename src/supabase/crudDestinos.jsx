import {supabase} from "../index"
import Swal from "sweetalert2"
const tabla="destinos";

export async function InsertarDestinos(p) {
    try {
        console.log("InsertarDestinos - Iniciando inserción con datos:", JSON.stringify(p, null, 2));
        
        if (!p._id_operadora) {
            throw new Error("ID de operadora no proporcionado");
        }

        const { data, error } = await supabase.rpc("insertardestinos", {
            _descripcion: p._descripcion,
            _idruta: p._idruta,
            _id_operadora: p._id_operadora,
            _provinciadestino: p._provinciadestino,
            _ciudaddestino: p._ciudaddestino,
            _direcciondestino: p._direcciondestino,
            _frecuenciapaso: p._frecuenciapaso || null
        });

        if (error) {
            console.error("Error en InsertarDestinos:", error);
            throw new Error(error.message || "Error al insertar el destino");
        }

        console.log("Destino insertado exitosamente:", data);
        return { 
            success: true, 
            data,
            id_operadora: p._id_operadora // Devolvemos el id_operadora para actualizar la tabla
        };
    } catch (error) {
        console.error("Error en InsertarDestinos:", error);
        return { 
            success: false, 
            error: error.message || "Error al insertar el destino"
        };
    }
}

export async function MostrarDestinos(p) {
    try {
        console.log("MostrarDestinos - Iniciando consulta con datos:", p);
        
        if (!p?.id_operadora) {
            console.error("ID de operadora no proporcionado en MostrarDestinos");
            return [];
        }

        const { data, error } = await supabase.rpc("mostrardestinos", {
            _id_operadora: p.id_operadora
        });

        if (error) {
            console.error("Error en MostrarDestinos:", error);
            throw new Error(error.message || "Error al obtener los destinos");
        }

        if (!data) {
            console.warn("No se recibieron datos en MostrarDestinos");
            return [];
        }

        // Transformar los datos para mantener la estructura exacta que devuelve la RPC
        const destinosTransformados = data.map(destino => ({
            id: destino.id,
            descripcion: destino.descripcion,
            idruta: destino.idruta,
            id_operadora: destino.id_operadora,
            provinciadestino: destino.provinciadestino,
            ciudaddestino: destino.ciudaddestino,
            direcciondestino: destino.direcciondestino,
            ruta: destino.ruta,
            frecuenciapaso: destino.frecuenciapaso
        }));

        console.log("MostrarDestinos - Datos obtenidos:", destinosTransformados);
        return destinosTransformados;
    } catch (error) {
        console.error("Error en MostrarDestinos:", error);
        return [];
    }
}

export async function EliminarDestinos(p) {
    try {
        console.log("EliminarDestinos - Iniciando eliminación con ID:", p.id);
        if (!p.id) {
            throw new Error("ID de destino no proporcionado");
        }

        // Primero verificar si el registro existe
        const { data: registroExistente, error: errorVerificacion } = await supabase
            .from(tabla)
            .select('id, id_operadora')
            .eq('id', p.id)
            .single();

        if (errorVerificacion) {
            console.error("Error al verificar el registro:", errorVerificacion);
            throw new Error("Error al verificar el registro: " + errorVerificacion.message);
        }

        if (!registroExistente) {
            throw new Error("El registro no existe");
        }

        // Realizar la eliminación
        const { error: errorEliminacion } = await supabase
            .from(tabla)
      .delete()
      .eq("id", p.id);

        if (errorEliminacion) {
            console.error("Error al eliminar el registro:", errorEliminacion);
            throw new Error(errorEliminacion.message);
        }

        // Verificar que realmente se eliminó
        const { data: verificacion, error: errorVerificacionPost } = await supabase
            .from(tabla)
            .select('id')
            .eq('id', p.id)
            .single();

        if (errorVerificacionPost && errorVerificacionPost.code !== 'PGRST116') {
            console.error("Error al verificar la eliminación:", errorVerificacionPost);
            throw new Error("Error al verificar la eliminación");
        }

        if (verificacion) {
            throw new Error("El registro no se eliminó correctamente");
        }

        console.log("Destino eliminado exitosamente");
        return { 
            success: true, 
            message: "Destino eliminado correctamente",
            id_operadora: registroExistente.id_operadora // Devolvemos el id_operadora para actualizar la tabla
        };

    } catch (error) {
        console.error("Error en EliminarDestinos:", error);
        return { 
            success: false, 
            error: error.message || "Error al eliminar el destino"
        };
    }
}

export async function EditarDestinos(p) {
    try {
        console.log("EditarDestinos - Iniciando actualización con datos:", JSON.stringify(p, null, 2));
        
        if (!p.id || !p.descripcion || !p.id_operadora) {
            console.error("Datos faltantes:", { id: p.id, descripcion: p.descripcion, id_operadora: p.id_operadora });
            throw new Error("Faltan datos requeridos para la actualización");
        }

        // Primero verificar si el registro existe
        console.log("Verificando existencia del registro con ID:", p.id);
        const { data: registroExistente, error: errorVerificacion } = await supabase
            .from(tabla)
            .select('*')  // Seleccionar todos los campos para ver el estado actual
            .eq('id', p.id)
            .single();

        if (errorVerificacion) {
            console.error("Error al verificar el registro:", errorVerificacion);
            throw new Error("Error al verificar el registro: " + errorVerificacion.message);
        }

        if (!registroExistente) {
            console.error("Registro no encontrado con ID:", p.id);
            throw new Error("El registro no existe");
        }

        console.log("Registro existente:", JSON.stringify(registroExistente, null, 2));

        if (registroExistente.id_operadora !== p.id_operadora) {
            console.error("Error de permisos - ID operadora actual:", registroExistente.id_operadora, "ID operadora solicitada:", p.id_operadora);
            throw new Error("No tiene permiso para editar este registro");
        }

        // Eliminar el campo id_horario que ya no existe en la tabla
        const datosActualizados = {
            descripcion: p.descripcion,
            idruta: parseInt(p.idruta),
            id_operadora: parseInt(p.id_operadora),
            provinciadestino: p.provinciadestino,
            ciudaddestino: p.ciudaddestino,
            direcciondestino: p.direcciondestino,
            frecuenciapaso: p.frecuenciapaso || null
        };

        console.log("Intentando actualizar con datos:", JSON.stringify(datosActualizados, null, 2));

        // Intentar la actualización
        const { data, error } = await supabase
            .from(tabla)
            .update(datosActualizados)
            .eq('id', p.id)
            .select('*')  // Seleccionar todos los campos para verificar la actualización
            .single();

        if (error) {
            console.error("Error en la actualización:", error);
            throw new Error(`Error al actualizar: ${error.message}`);
        }

        if (!data) {
            console.error("No se recibieron datos después de la actualización");
            throw new Error("No se pudo actualizar el registro");
        }

        console.log("Actualización exitosa. Datos actualizados:", JSON.stringify(data, null, 2));

        // Verificar que los datos se actualizaron correctamente
        const { data: verificacion, error: errorVerificacionPost } = await supabase
            .from(tabla)
            .select('*')
            .eq('id', p.id)
            .single();

        if (errorVerificacionPost) {
            console.error("Error al verificar la actualización:", errorVerificacionPost);
            throw new Error("Error al verificar la actualización");
        }

        console.log("Verificación post-actualización:", JSON.stringify(verificacion, null, 2));

        return { 
            success: true, 
            data: verificacion
        };
    } catch (error) {
        console.error("Error en EditarDestinos:", error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

export async function BuscarDestinos(p) {
    try {
        console.log("BuscarDestinos - Iniciando búsqueda con:", p);

        if (!p._id_operadora) {
            throw new Error("ID de operadora no proporcionado");
        }

        if (!p.provincia) {
            throw new Error("Provincia no proporcionada");
        }

        // Normalizar la provincia antes de enviarla a la RPC
        const provinciaNormalizada = p.provincia
            .toLowerCase()
            .trim();

        console.log("BuscarDestinos - Provincia normalizada:", {
            original: p.provincia,
            normalizada: provinciaNormalizada
        });

        const { data, error } = await supabase.rpc("buscardestinosporprovincia", {
            _id_operadora: p._id_operadora,
            _provincia: provinciaNormalizada
        });

        if (error) {
            console.error("Error en BuscarDestinos:", error);
            throw error;
        }

        // Transformar los datos para mantener la estructura esperada
        const destinosTransformados = data.map(destino => ({
            id: destino.id_destino,
            descripcion: destino.descripcion_destino,
            provinciadestino: destino.provincia_destino,
            descripcion_horario: destino.descripcion_horario,
            precio_ruta: destino.precio_ruta,
            descripcion_ruta: destino.descripcion_ruta,
            nombre_operadora: destino.nombre_operadora,
            dirigente: destino.dirigente,
            frecuenciapaso: destino.frecuenciapaso
        }));

        console.log("BuscarDestinos - Respuesta de búsqueda:", {
            totalResultados: destinosTransformados?.length || 0,
            resultados: destinosTransformados
        });

        return destinosTransformados;
    } catch (error) {
        console.error("Error en BuscarDestinos:", error);
        throw error;
    }
}

export async function BuscarDestino(p) {
    const { data } = await supabase.rpc("buscardestinos", {
    _id_operadora: p.id_operadora, 
    buscador: p.buscador,
  });
  return data;
}

// Mantener las funciones de reportes sin cambios
export async function ReportStockDestinosTodos(p) {
    const { data, error } = await supabase
        .rpc('reportstockdestinostodos', { _id_operadora: p._id_operadora })
        .order('descripcion_destino', { ascending: true });

    if (error) {
        console.error('Error al obtener el reporte de destinos:', error);
        throw error;
    }

    return data;
}

export async function ReportStockXDestino(p) {
    try {
        if (!p._id_operadora || !p.id) {
            throw new Error("ID de operadora o ID de destino no proporcionados");
        }

  const { data, error } = await supabase
            .rpc('reportstockxdestino', { 
                _id_operadora: p._id_operadora,
                _id_destino: p.id 
            });

  if (error) {
            console.error('Error al obtener el reporte del destino:', error);
            throw error;
  }

  return data;
    } catch (error) {
        console.error('Error en ReportStockXDestino:', error);
        throw error;
    }
}

export async function ReportStockBajoMinimo(p) {
  const { data, error } = await supabase.rpc("reportdestinobajominimo", p);
  if (error) {
        return error;
  }
  return data;
}

export async function ReportInventarioValorado(p) {
  const { data, error } = await supabase.rpc("inventariovalorado", p);
  if (error) {
        return error;
  }
  return data;
}

export async function MostrarHorariosXDestino(id_destino) {
    try {
        console.log("MostrarHorariosXDestino - Iniciando consulta para destino:", id_destino);
        
        if (!id_destino) {
            console.error("ID de destino no proporcionado en MostrarHorariosXDestino");
            return [];
        }

        const { data, error } = await supabase.rpc("mostrarhorariosxdestino", {
            _id_destino: id_destino
        });

        if (error) {
            console.error("Error en MostrarHorariosXDestino:", error);
            throw new Error(error.message || "Error al obtener los horarios del destino");
        }

        if (!data) {
            console.warn("No se recibieron horarios para el destino");
            return [];
        }

        console.log("MostrarHorariosXDestino - Horarios obtenidos:", data);
        return data;
    } catch (error) {
        console.error("Error en MostrarHorariosXDestino:", error);
        return [];
    }
}