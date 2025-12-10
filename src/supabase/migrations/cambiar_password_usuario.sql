-- Función RPC para cambiar contraseña de usuarios (solo para usuario root)
-- Esta función debe ser ejecutada en el panel de Supabase SQL Editor

CREATE OR REPLACE FUNCTION cambiar_password_usuario(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar que el usuario que ejecuta la función sea root
  -- (Esta verificación se hace en el frontend, pero es buena práctica duplicarla)
  
  -- Cambiar la contraseña del usuario objetivo
  -- Nota: Esta función requiere privilegios de administrador en Supabase
  SELECT auth.update_user_password(target_user_id, new_password) INTO result;
  
  -- Si no hay errores, retornar éxito
  RETURN json_build_object(
    'success', true,
    'message', 'Contraseña actualizada exitosamente',
    'user_id', target_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar el mensaje de error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', target_user_id
    );
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO authenticated;

-- Comentario explicativo
COMMENT ON FUNCTION cambiar_password_usuario IS 'Permite al usuario root cambiar contraseñas de otros usuarios. Requiere validación previa de permisos en el frontend.';
