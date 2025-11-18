import { supabase } from "../index";
import Swal from "sweetalert2";

export async function obtenerPublicidad() {
  const { data, error } = await supabase
    .from("publicidad")
    .select("*")
    .order("id", { ascending: false });
  
  if (error) {
    console.error("Error al obtener publicidad:", error);
    return [];
  }
  return data || [];
}

export async function insertarPublicidad(p) {
  const { data, error } = await supabase
    .from("publicidad")
    .insert({
      descripcion: p.descripcion,
      referencia: p.referencia,
      direccion: p.direccion,
      mapa: p.mapa,
      numerocelular: p.numerocelular,
      video: p.video
    })
    .select()
    .single();

  if (error) {
    console.error("Error al insertar publicidad:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al insertar la publicidad: " + error.message,
      timer: 2000,
      showConfirmButton: false
    });
    return null;
  }

  Swal.fire({
    icon: "success",
    title: "¡Éxito!",
    text: "Publicidad creada correctamente",
    timer: 1500,
    showConfirmButton: false
  });

  return data;
}

export async function actualizarPublicidad(p) {
  const { data, error } = await supabase
    .from("publicidad")
    .update({
      descripcion: p.descripcion,
      referencia: p.referencia,
      direccion: p.direccion,
      mapa: p.mapa,
      numerocelular: p.numerocelular,
      video: p.video
    })
    .eq("id", p.id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar publicidad:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al actualizar la publicidad: " + error.message,
      timer: 2000,
      showConfirmButton: false
    });
    return null;
  }

  Swal.fire({
    icon: "success",
    title: "¡Éxito!",
    text: "Publicidad actualizada correctamente",
    timer: 1500,
    showConfirmButton: false
  });

  return data;
}

export async function eliminarPublicidad(id) {
  const { error } = await supabase
    .from("publicidad")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar publicidad:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al eliminar la publicidad: " + error.message,
      timer: 2000,
      showConfirmButton: false
    });
    return false;
  }

  Swal.fire({
    icon: "success",
    title: "¡Éxito!",
    text: "Publicidad eliminada correctamente",
    timer: 1500,
    showConfirmButton: false
  });

  return true;
}
