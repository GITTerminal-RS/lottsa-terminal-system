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

    console.log("🚀 Intentando cambio de contraseña con método compatible...");
    
    // Intentar con la función principal (sin pgcrypto)
    const { data, error } = await supabase.rpc('cambiar_password_usuario', {
      target_user_id: userId,
      new_password: nuevaClave
    });

    console.log("📊 Respuesta RPC:", { data, error });

    if (error) {
      console.error("❌ Error en función principal:", error);
      
      // Intentar con función alternativa
      console.log("🔄 Intentando con función alternativa...");
      const { data: data2, error: error2 } = await supabase.rpc('cambiar_password_usuario_directo', {
        target_user_id: userId,
        new_password: nuevaClave
      });
      
      console.log("📊 Respuesta función alternativa:", { data: data2, error: error2 });
      
      if (error2) {
        throw new Error(`Error en ambas funciones: ${error.message} | ${error2.message}`);
      }
      
      // Usar resultado de función alternativa
      return procesarRespuestaRPC(data2, "función alternativa");
    }

    return procesarRespuestaRPC(data, "función principal");

  } catch (error) {
    console.error("💥 Error completo al cambiar contraseña:", error);
    throw error;
  }
}

// Función auxiliar para procesar respuestas RPC
function procesarRespuestaRPC(data, metodo) {
  console.log(`🔍 Procesando respuesta de ${metodo}:`, data);
  
  if (data && typeof data === 'object') {
    if (data.success === false) {
      console.error("❌ Función reporta fallo:", data.error);
      throw new Error(data.error || 'Error desconocido en el cambio de contraseña');
    }
    
    if (data.success === true) {
      console.log(`✅ Contraseña procesada exitosamente con ${metodo}`);
      
      // Si incluye la nueva contraseña en la respuesta, mostrar instrucciones especiales
      if (data.nueva_password) {
        return { 
          success: true, 
          data: data,
          message: `${data.message}\n\nNueva contraseña: ${data.nueva_password}\n\nEl usuario debe cerrar sesión e iniciar con esta contraseña.`,
          showPassword: true,
          newPassword: data.nueva_password
        };
      }
      
      return { 
        success: true, 
        data: data,
        message: data.message || 'Contraseña actualizada exitosamente'
      };
    }
  }

  // Si llegamos aquí, asumir éxito básico
  console.log("✅ Cambio completado (respuesta sin formato específico)");
  return { 
    success: true, 
    data: data,
    message: 'Contraseña procesada correctamente'
  };
}
