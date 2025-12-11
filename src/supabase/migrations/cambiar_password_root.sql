-- Función RPC para cambiar contraseñas desde usuario root
-- Esta función se ejecuta en el servidor con permisos de servicio

-- Eliminar todas las versiones existentes de la función de forma segura
DROP FUNCTION IF EXISTS public.cambiar_password_root;

-- Crear la función con los tipos correctos
CREATE OR REPLACE FUNCTION cambiar_password_root(
  target_user_id TEXT, -- Cambiado a TEXT para coincidir con idauth
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos del propietario (servicio)
AS $$
DECLARE
  current_user_id TEXT; -- Cambiado a TEXT
  current_user_record RECORD;
  target_user_record RECORD;
  result JSON;
BEGIN
  -- Obtener el ID del usuario actual y convertir a TEXT
  current_user_id := auth.uid()::text;
  
  -- Verificar que hay un usuario autenticado
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no autenticado'
    );
  END IF;
  
  -- Obtener información del usuario actual desde la tabla usuarios
  SELECT * INTO current_user_record 
  FROM usuarios 
  WHERE idauth = current_user_id;
  
  -- Verificar que el usuario actual existe y es root
  IF current_user_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado en tabla usuarios'
    );
  END IF;
  
  IF current_user_record.tipouser != 'root' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solo el usuario root puede cambiar contraseñas'
    );
  END IF;
  
  -- Obtener información del usuario objetivo
  SELECT * INTO target_user_record 
  FROM usuarios 
  WHERE idauth = target_user_id;
  
  -- Verificar que el usuario objetivo existe
  IF target_user_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario objetivo no encontrado'
    );
  END IF;
  
  -- Verificar que el usuario objetivo es superadmin
  IF target_user_record.tipouser != 'superadmin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solo se pueden cambiar contraseñas de usuarios superadmin'
    );
  END IF;
  
  -- Validar la nueva contraseña
  IF new_password IS NULL OR LENGTH(new_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'La contraseña debe tener al menos 6 caracteres'
    );
  END IF;
  
  -- Cambiar la contraseña usando la extensión auth
  -- Nota: Esta parte requiere que tengas la extensión supabase_auth_admin instalada
  -- o usar una función personalizada que actualice auth.users
  
  BEGIN
    -- Actualizar la contraseña en auth.users
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW()
    WHERE id = target_user_id::uuid;
    
    -- Verificar que se actualizó correctamente
    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'No se pudo actualizar la contraseña en auth.users'
      );
    END IF;
    
    -- Retornar éxito
    RETURN json_build_object(
      'success', true,
      'message', 'Contraseña actualizada exitosamente',
      'user_name', target_user_record.nombres
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Manejar errores de la actualización
    RETURN json_build_object(
      'success', false,
      'error', 'Error al actualizar contraseña: ' || SQLERRM
    );
  END;
  
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION cambiar_password_root(UUID, TEXT) TO authenticated;

-- Comentario sobre la función
COMMENT ON FUNCTION cambiar_password_root(UUID, TEXT) IS 
'Permite al usuario root cambiar contraseñas de usuarios superadmin de forma segura';
