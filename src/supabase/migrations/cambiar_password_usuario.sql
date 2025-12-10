-- Función RPC para cambiar contraseña de usuarios (solo para usuario root)
-- INSTRUCCIONES DE INSTALACIÓN:
-- 1. Ir a Supabase Dashboard > SQL Editor
-- 2. Ejecutar este script completo
-- 3. Verificar que la función se creó correctamente

-- Habilitar extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función corregida con tipos de datos apropiados
CREATE OR REPLACE FUNCTION cambiar_password_usuario(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_exists BOOLEAN;
  current_user_role TEXT;
  current_user_id UUID;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Verificar que hay un usuario autenticado
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No hay usuario autenticado'
    );
  END IF;
  
  -- Verificar que el usuario objetivo existe en auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado en el sistema de autenticación'
    );
  END IF;
  
  -- Verificar que el usuario actual es root (verificación adicional)
  -- Corregir la comparación de UUID con TEXT
  SELECT u.tipouser INTO current_user_role
  FROM usuarios u
  WHERE u.idauth::text = current_user_id::text;
  
  IF current_user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado en la tabla usuarios'
    );
  END IF;
  
  IF current_user_role != 'root' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solo el usuario root puede cambiar contraseñas. Tu rol: ' || current_user_role
    );
  END IF;
  
  -- Validar que la nueva contraseña no esté vacía
  IF new_password IS NULL OR length(trim(new_password)) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'La contraseña debe tener al menos 6 caracteres'
    );
  END IF;
  
  -- Actualizar la contraseña en auth.users
  -- Usar crypt para hashear la contraseña
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Verificar que la actualización fue exitosa
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
    'user_id', target_user_id,
    'updated_by', current_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar el mensaje de error detallado
    RETURN json_build_object(
      'success', false,
      'error', 'Error interno: ' || SQLERRM,
      'detail', SQLSTATE,
      'hint', 'Verifica que la extensión pgcrypto esté habilitada'
    );
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO service_role;

-- Comentario explicativo
COMMENT ON FUNCTION cambiar_password_usuario IS 'Permite al usuario root cambiar contraseñas de otros usuarios. Corrige tipos de datos UUID vs TEXT.';
