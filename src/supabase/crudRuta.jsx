import {supabase} from "../index"
import Swal from "sweetalert2"

export async function InsertarRuta(p) {
    try {
        console.log("InsertarRuta - Datos recibidos:", JSON.stringify(p, null, 2));
        
        // Validar datos requeridos
        if (!p._descripcion?.trim()) {
            throw new Error("La descripción es requerida");
        }
        if (!p._idoperadora) {
            throw new Error("El ID de la operadora es requerido");
        }

        // Asegurar que los tipos de datos sean correctos y estén en el formato esperado
        const params = {
            _descripcion: String(p._descripcion).trim(),
            _idoperadora: parseInt(p._idoperadora),
            _precio: p._precio !== undefined && p._precio !== null ? parseFloat(p._precio) : 0,
            _precioespecial: p._precioespecial !== undefined && p._precioespecial !== null ? parseFloat(p._precioespecial) : 0
        };

        console.log("InsertarRuta - Parámetros procesados:", JSON.stringify(params, null, 2));

        // Llamar a la función RPC con los parámetros exactamente como se esperan
        const { data, error } = await supabase.rpc("insertarruta", params);
        
        if (error) {
            console.error("InsertarRuta - Error en la llamada RPC:", error);
            if (error.message.includes('Datos duplicados')) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Ya existe una ruta con la misma descripción para esta operadora",
                    timer: 2000,
                    showConfirmButton: false
                });
                return false;
            }
            throw new Error(error.message || "Error al insertar la ruta");
        }

        // Si no hay error, la inserción fue exitosa
        console.log("InsertarRuta - Ruta insertada exitosamente");
        return true;
    } catch (error) {
        console.error("InsertarRuta - Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al insertar la ruta",
            timer: 2000,
            showConfirmButton: false
        });
        return false;
    }
}

export async function MostrarRuta(p) {
    try {
        const { data, error } = await supabase
      .from("ruta")
            .select("id, descripcion, precio, precioespecial, id_operadora")
      .eq("id_operadora", p.id_operadora)
      .order("id", { ascending: true });
            
        if (error) {
            console.error("Error en MostrarRuta:", error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error("Error en MostrarRuta:", error);
        return [];
    }
}

export async function EliminarRuta(p) {
    try {
    const { error } = await supabase
      .from("ruta")
      .delete()
      .eq("id", p.id);
            
    if (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar la ruta: " + error.message,
            });
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error en EliminarRuta:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al eliminar la ruta",
        });
        return false;
    }
}

export async function EditarRuta(p) {
    try {
        if (!p.id || !p.descripcion || !p.id_operadora) {
            throw new Error("Faltan datos requeridos para la actualización");
        }

        const datosActualizados = {
            descripcion: p.descripcion,
            precio: p.precio === null ? 0 : parseFloat(p.precio),
            precioespecial: p.precioespecial === null ? 0 : parseFloat(p.precioespecial),
            id_operadora: parseInt(p.id_operadora)
        };

        console.log("Actualizando ruta con datos:", datosActualizados);

        const { data, error: updateError } = await supabase
      .from("ruta")
            .update(datosActualizados)
            .eq("id", p.id)
            .select();

        if (updateError) {
            console.error("Error al actualizar ruta:", updateError);
            throw new Error(updateError.message || "Error al actualizar la ruta");
        }

        console.log("Ruta actualizada exitosamente:", data);
        return true;

    } catch (error) {
        console.error("Error en EditarRuta:", error);
        Swal.fire({
            icon: "error",
            title: "Error al actualizar",
            text: error.message || "Error al editar la ruta",
            timer: 2000,
            showConfirmButton: false
        });
        return false;
    }
}

export async function BuscarRuta(p) {
    try {
        const query = supabase
    .from("ruta")
            .select("id, descripcion, precio, precioespecial, id_operadora")
            .eq("id_operadora", p.id_operadora);

        if (p.descripcion && p.descripcion.trim() !== "") {
            query.ilike("descripcion", "%" + p.descripcion + "%");
        }

        const { data, error } = await query;
        
        if (error) {
            console.error("Error en BuscarRuta:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error en BuscarRuta:", error);
        return [];
    }
}