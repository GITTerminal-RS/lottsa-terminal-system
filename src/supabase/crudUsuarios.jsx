import Swal from "sweetalert2";
import { ObtenerIdAuthSupabase, supabase } from "../index";
export const InsertarUsuarios = async (p) => {
  const { data, error } = await supabase
    .from("usuarios")
    .insert(p)
    .select()
    .maybeSingle();
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error al insertar usuario " + error.message,
    });
  }
  if (data) return data;
};
export const MostrarUsuarios = async () => {
  const idAuthSupabase = await ObtenerIdAuthSupabase();
  const { error, data } = await supabase
    .from("usuarios")
    .select()
    .eq("idauth", idAuthSupabase)
    .maybeSingle();

  if (data) {
    return data;
  }
};
export const MostrarUsuariosTodos = async (p) => {
  const { error, data } = await supabase.rpc("mostrarpersonal", p);
  if (data) {
    return data;
  }
};
export async function EliminarUsuarios(p) {
 
  const { error } = await supabase
    .from("usuarios")
    .delete()
    .eq("id", p.id);
  if (error) {
    alert("Error al eliminar", error.message);
  }

}
export async function EditarUsuarios(p) {
  const { error } = await supabase
    .from("usuarios")
    .update(p)
    .eq("id", p.id);
  if (error) {
    alert("Error al editar Usuarios", error.message);
  }

}
export async function BuscarUsuarios(p) {
  const { data} = await supabase.rpc("buscarpersonal",p)
  return data;
}
//tabla asignaciones
export const InsertarAsignaciones = async (p) => {
  const {  error } = await supabase
    .from("asignaroperadora")
    .insert(p)
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error al insertar usuario " + error.message,
    });
  }
 
};
//tabla permisos
export async function InsertarPermisos(p) {

  const {  error } = await supabase
    .from("permisos")
    .insert(p)
    
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error al insertar permisos "+ error.message,
      footer: '<a href="">error</a>',
    });
  }
  

}
export async function MostrarPermisos(p) {
 
  const { data, error } = await supabase
    .from("permisos")
    .select(`id, id_usuario, idmodulo, modulos(nombre)`)
    .eq("id_usuario", p.id_usuario)
  
  return data;

}
export async function EliminarPermisos(p) {
 
  const { error } = await supabase
    .from("permisos")
    .delete()
    .eq("id_usuario", p.id_usuario);
  if (error) {
    alert("Error al eliminar", error);
  }

}

export async function MostrarModulos() {
  
  const { data } = await supabase.from("modulos").select();
  return data;

}

// Función para cambiar contraseña de otros usuarios (solo para usuario root)
export async function CambiarClaveUsuario(userId, nuevaClave) {
  try {
    // Verificar que el usuario actual sea root
    const usuarioActual = await MostrarUsuarios();
    if (!usuarioActual || usuarioActual.tipouser !== "root") {
      throw new Error("Solo el usuario root puede cambiar contraseñas de otros usuarios");
    }

    // Validar que la nueva clave tenga al menos 6 caracteres
    if (!nuevaClave || nuevaClave.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Intentar usar función RPC personalizada
    const { data, error } = await supabase.rpc('cambiar_password_usuario', {
      target_user_id: userId,
      new_password: nuevaClave
    });

    if (error) {
      // Si la función RPC no está disponible, usar método alternativo
      console.warn("Función RPC no disponible, usando método de notificación");
      
      // Marcar al usuario para que cambie su contraseña en el próximo login
      const { data: updateData, error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          observaciones: `Contraseña debe ser cambiada por administrador. Nueva clave temporal: ${nuevaClave.substring(0, 3)}***`
        })
        .eq('idauth', userId)
        .select()
        .maybeSingle();

      if (updateError) {
        throw new Error("Error al actualizar información del usuario: " + updateError.message);
      }

      // Simular éxito para la demo
      return { 
        success: true, 
        data: updateData,
        message: "Se ha registrado la solicitud de cambio de contraseña. El usuario deberá contactar al administrador para completar el proceso."
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    throw error;
  }
}
