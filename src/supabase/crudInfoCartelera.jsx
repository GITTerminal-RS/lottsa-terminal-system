import { supabase } from '../index';
import Swal from "sweetalert2";

export async function insertarInfoCartelera(idCartelera, infoData) {
    try {
        console.log("insertarInfoCartelera - Datos recibidos:", { idCartelera, infoData });
        
        if (!idCartelera) {
            throw new Error("El ID de la cartelera es requerido");
        }
        
        if (!Array.isArray(infoData) || infoData.length !== 3) {
            throw new Error("Se requieren exactamente 3 registros de información");
        }

        const registrosParaInsertar = infoData.map((info, index) => ({
            descripcion: info.descripcion?.trim() || '',
            imagen: info.imagen?.trim() || '',
            idcartelera: parseInt(idCartelera)
        }));

        console.log("insertarInfoCartelera - Registros preparados:", registrosParaInsertar);

        const { data, error } = await supabase
            .from('infocartelera')
            .insert(registrosParaInsertar)
            .select();

        if (error) {
            console.error("insertarInfoCartelera - Error:", error);
            throw new Error(error.message || "Error al insertar la información de cartelera");
        }

        console.log("insertarInfoCartelera - Registros insertados exitosamente:", data);
        return true;

    } catch (error) {
        console.error("insertarInfoCartelera - Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al guardar la información de cartelera",
            timer: 2000,
            showConfirmButton: false
        });
        return false;
    }
}

export async function obtenerInfoCartelera(idCartelera) {
    try {
        console.log("obtenerInfoCartelera - ID cartelera:", idCartelera);
        
        if (!idCartelera) {
            throw new Error("El ID de la cartelera es requerido");
        }

        const { data, error } = await supabase
            .from('infocartelera')
            .select('id, descripcion, imagen, idcartelera')
            .eq('idcartelera', idCartelera)
            .order('id', { ascending: true });

        if (error) {
            console.error("obtenerInfoCartelera - Error:", error);
            throw new Error(error.message || "Error al obtener la información de cartelera");
        }

        console.log("obtenerInfoCartelera - Datos obtenidos:", data);

        if (!data || data.length === 0) {
            console.log("obtenerInfoCartelera - No hay registros, devolviendo estructura vacía");
            return [
                { descripcion: '', imagen: '' },
                { descripcion: '', imagen: '' },
                { descripcion: '', imagen: '' }
            ];
        }

        const registrosCompletos = [];
        for (let i = 0; i < 3; i++) {
            if (data[i]) {
                registrosCompletos.push({
                    id: data[i].id,
                    descripcion: data[i].descripcion || '',
                    imagen: data[i].imagen || ''
                });
            } else {
                registrosCompletos.push({
                    descripcion: '',
                    imagen: ''
                });
            }
        }

        return registrosCompletos;

    } catch (error) {
        console.error("obtenerInfoCartelera - Error:", error);
        return [
            { descripcion: '', imagen: '' },
            { descripcion: '', imagen: '' },
            { descripcion: '', imagen: '' }
        ];
    }
}

export async function actualizarInfoCartelera(idCartelera, infoData) {
    try {
        console.log("actualizarInfoCartelera - Datos recibidos:", { idCartelera, infoData });
        
        if (!idCartelera) {
            throw new Error("El ID de la cartelera es requerido");
        }
        
        if (!Array.isArray(infoData) || infoData.length !== 3) {
            throw new Error("Se requieren exactamente 3 registros de información");
        }

        const registrosExistentes = await obtenerInfoCartelera(idCartelera);
        console.log("actualizarInfoCartelera - Registros existentes:", registrosExistentes);

        const operaciones = [];

        for (let i = 0; i < 3; i++) {
            const datosNuevos = {
                descripcion: infoData[i].descripcion?.trim() || '',
                imagen: infoData[i].imagen?.trim() || '',
                idcartelera: parseInt(idCartelera)
            };

            if (registrosExistentes[i]?.id) {
                operaciones.push(
                    supabase
                        .from('infocartelera')
                        .update(datosNuevos)
                        .eq('id', registrosExistentes[i].id)
                );
            } else {
                operaciones.push(
                    supabase
                        .from('infocartelera')
                        .insert(datosNuevos)
                );
            }
        }

        const resultados = await Promise.all(operaciones);
        
        for (let i = 0; i < resultados.length; i++) {
            if (resultados[i].error) {
                console.error(`actualizarInfoCartelera - Error en operación ${i + 1}:`, resultados[i].error);
                throw new Error(`Error al actualizar el registro ${i + 1}: ${resultados[i].error.message}`);
            }
        }

        console.log("actualizarInfoCartelera - Todos los registros actualizados exitosamente");
        return true;

    } catch (error) {
        console.error("actualizarInfoCartelera - Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al actualizar la información de cartelera",
            timer: 2000,
            showConfirmButton: false
        });
        return false;
    }
}

export function validarInfoCartelera(infoData) {
    const errores = [];
    
    if (!Array.isArray(infoData)) {
        errores.push("Los datos deben ser un array");
        return { isValid: false, errores };
    }
    
    if (infoData.length !== 3) {
        errores.push("Se requieren exactamente 3 registros de información");
        return { isValid: false, errores };
    }
    
    infoData.forEach((info, index) => {
        if (!info.descripcion?.trim()) {
            errores.push(`La descripción del registro ${index + 1} es requerida`);
        }
        
        if (info.descripcion && info.descripcion.length > 500) {
            errores.push(`La descripción del registro ${index + 1} no puede exceder 500 caracteres`);
        }
        
        if (info.imagen && info.imagen.length > 255) {
            errores.push(`El nombre/URL de imagen del registro ${index + 1} no puede exceder 255 caracteres`);
        }
    });
    
    return {
        isValid: errores.length === 0,
        errores
    };
}