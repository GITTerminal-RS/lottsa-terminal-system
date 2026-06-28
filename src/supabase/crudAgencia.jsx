import Swal from "sweetalert2";
import { supabase } from "../index";

const CAMPOS_AGENCIA =
  "id, id_operadora, lugar, direccion, contactos, hora_atencion, encomiendas_contacto";

export async function mostrarAgencias({ id_operadora }) {
  if (!id_operadora) return [];

  const { data, error } = await supabase
    .from("agencia")
    .select(CAMPOS_AGENCIA)
    .eq("id_operadora", id_operadora)
    .order("lugar", { ascending: true });

  if (error) {
    console.error("Error en mostrarAgencias:", error);
    return [];
  }

  return data || [];
}

export async function insertarAgencia(p) {
  try {
    if (!p.id_operadora) throw new Error("La operadora es requerida");
    if (!p.lugar?.trim()) throw new Error("El lugar es requerido");

    const { error } = await supabase.from("agencia").insert({
      id_operadora: parseInt(p.id_operadora, 10),
      lugar: p.lugar.trim(),
      direccion: p.direccion?.trim() || null,
      contactos: p.contactos?.trim() || null,
      hora_atencion: p.hora_atencion?.trim() || null,
      encomiendas_contacto: p.encomiendas_contacto?.trim() || null,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error en insertarAgencia:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "No se pudo registrar la agencia",
    });
    return false;
  }
}

export async function editarAgencia(p) {
  try {
    if (!p.id) throw new Error("ID de agencia requerido");
    if (!p.lugar?.trim()) throw new Error("El lugar es requerido");

    const { error } = await supabase
      .from("agencia")
      .update({
        lugar: p.lugar.trim(),
        direccion: p.direccion?.trim() || null,
        contactos: p.contactos?.trim() || null,
        hora_atencion: p.hora_atencion?.trim() || null,
        encomiendas_contacto: p.encomiendas_contacto?.trim() || null,
      })
      .eq("id", p.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error en editarAgencia:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "No se pudo actualizar la agencia",
    });
    return false;
  }
}

export async function eliminarAgencia({ id }) {
  try {
    const { error } = await supabase.from("agencia").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error en eliminarAgencia:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "No se pudo eliminar la agencia",
    });
    return false;
  }
}
