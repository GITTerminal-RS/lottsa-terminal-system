-- Función RPC para cambiar contraseña de usuarios (solo para usuario root)
-- INSTRUCCIONES DE INSTALACIÓN:
-- 1. Ir a Supabase Dashboard > SQL Editor
-- 2. Ejecutar este script completo
-- 3. Verificar que la función se creó correctamente

-- Primero, verificar que tenemos los permisos necesarios
-- Esta función debe ejecutarse con privilegios de service_role

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
BEGIN
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
  SELECT u.tipouser INTO current_user_role
  FROM usuarios u
  WHERE u.idauth = auth.uid();
  
  IF current_user_role != 'root' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solo el usuario root puede cambiar contraseñas'
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
      'error', 'No se pudo actualizar la contraseña'
    );
  END IF;
  
  -- Retornar éxito
  RETURN json_build_object(
    'success', true,
    'message', 'Contraseña actualizada exitosamente',
    'user_id', target_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar el mensaje de error detallado
    RETURN json_build_object(
      'success', false,
      'error', 'Error interno: ' || SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO service_role;

-- Comentario explicativo
COMMENT ON FUNCTION cambiar_password_usuario IS 'Permite al usuario root cambiar contraseñas de otros usuarios. Actualiza directamente la tabla auth.users con hash bcrypt.';
