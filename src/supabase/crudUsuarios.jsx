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
    console.log("🔐 Iniciando cambio de contraseña para usuario:", userId);
    
    // Verificar que el usuario actual sea root
    const usuarioActual = await MostrarUsuarios();
    console.log("👤 Usuario actual:", usuarioActual);
    
    if (!usuarioActual || usuarioActual.tipouser !== "root") {
      throw new Error("Solo el usuario root puede cambiar contraseñas de otros usuarios");
    }

    // Validar que la nueva clave tenga al menos 6 caracteres
    if (!nuevaClave || nuevaClave.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    console.log("🚀 Llamando función RPC cambiar_password_usuario...");
    
    // Usar función RPC personalizada
    const { data, error } = await supabase.rpc('cambiar_password_usuario', {
      target_user_id: userId,
      new_password: nuevaClave
    });

    console.log("📊 Respuesta RPC:", { data, error });

    if (error) {
      console.error("❌ Error en RPC:", error);
      throw new Error(`Error RPC: ${error.message || error.details || 'Error desconocido'}`);
    }

    // Verificar si la respuesta indica éxito
    if (data && typeof data === 'object') {
      if (data.success === false) {
        throw new Error(data.error || 'Error desconocido en el cambio de contraseña');
      }
      
      if (data.success === true) {
        console.log("✅ Contraseña cambiada exitosamente");
        return { 
          success: true, 
          data: data,
          message: data.message || 'Contraseña actualizada exitosamente'
        };
      }
    }

    // Si llegamos aquí, asumir éxito
    console.log("✅ Cambio completado (respuesta sin formato específico)");
    return { 
      success: true, 
      data: data,
      message: 'Contraseña actualizada exitosamente'
    };

  } catch (error) {
    console.error("💥 Error completo al cambiar contraseña:", error);
    throw error;
  }
}
