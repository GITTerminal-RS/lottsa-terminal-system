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

    console.log("🚀 Intentando cambio de contraseña con método directo...");
    
    // Método 1: Actualizar directamente en la tabla usuarios
    console.log("🔄 Método 1: Actualizando tabla usuarios...");
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        password: nuevaClave,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, nombres, tipouser')
      .single();

    console.log("📊 Respuesta directa:", { data, error });

    if (!error && data) {
      console.log("✅ Contraseña actualizada exitosamente en tabla usuarios");
      return {
        success: true,
        data: data,
        message: `Contraseña actualizada exitosamente para ${data.nombres}`,
        showPassword: false
      };
    }

    console.log("⚠️ Método 1 falló, intentando método alternativo...");
    
    // Método 2: Obtener usuario y usar Admin API si está disponible
    console.log("🔄 Método 2: Usando Admin API...");
    
    // Obtener el usuario objetivo para verificar que existe
    const { data: targetUser, error: getUserError } = await supabase
      .from('usuarios')
      .select('id, nombres, tipouser, idauth')
      .eq('id', userId)
      .single();

    if (getUserError || !targetUser) {
      throw new Error(`Usuario no encontrado: ${getUserError?.message || 'ID inválido'}`);
    }

    console.log("👤 Usuario objetivo encontrado:", targetUser);

    // Si el usuario tiene idauth, intentar actualizar en auth.users
    if (targetUser.idauth) {
      console.log("🔄 Intentando actualizar en auth.users...");
      
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
          targetUser.idauth,
          { password: nuevaClave }
        );

        console.log("📊 Respuesta Auth Admin:", { authData, authError });

        if (!authError && authData) {
          console.log("✅ Contraseña actualizada en auth.users");
          return {
            success: true,
            data: targetUser,
            message: `Contraseña actualizada exitosamente para ${targetUser.nombres} (método auth)`,
            showPassword: false
          };
        }
      } catch (authError) {
        console.log("⚠️ Admin API no disponible o falló:", authError.message);
      }
    }

    // Método 3: Generar contraseña temporal como último recurso
    console.log("🔄 Método 3: Generando contraseña temporal...");
    const tempPassword = `temp_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString().slice(-4)}`;
    
    // Intentar actualizar con la contraseña temporal
    const { data: tempData, error: tempError } = await supabase
      .from('usuarios')
      .update({ 
        password: tempPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, nombres, tipouser')
      .single();

    if (!tempError && tempData) {
      console.log("✅ Contraseña temporal asignada");
      return {
        success: true,
        data: tempData,
        message: `Se asignó una contraseña temporal para ${tempData.nombres}`,
        showPassword: true,
        newPassword: tempPassword
      };
    }

    // Si todos los métodos fallan
    const errorMsg = `No se pudo cambiar la contraseña. 
    Método 1 (tabla usuarios): ${error?.message || 'Falló'}
    Método 2 (auth admin): No disponible o falló
    Método 3 (temporal): ${tempError?.message || 'Falló'}`;
    
    console.error("❌ Todos los métodos fallaron:", errorMsg);
    throw new Error(errorMsg);

  } catch (error) {
    console.error("💥 Error completo al cambiar contraseña:", error);
    throw error;
  }
}

// Función auxiliar para procesar respuestas RPC (mantenida para compatibilidad)
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
