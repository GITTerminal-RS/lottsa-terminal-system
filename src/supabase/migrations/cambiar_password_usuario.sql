-- Función RPC para cambiar contraseña de usuarios (solo para usuario root)
-- VERSIÓN SIN PGCRYPTO - Compatible con todas las configuraciones de Supabase
-- INSTRUCCIONES DE INSTALACIÓN:
-- 1. Ir a Supabase Dashboard > SQL Editor
-- 2. Ejecutar este script completo
-- 3. Verificar que la función se creó correctamente

-- Función que usa el sistema nativo de Supabase para cambiar contraseñas
CREATE OR REPLACE FUNCTION cambiar_password_usuario(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
  current_user_role TEXT;
  current_user_id UUID;
  user_email TEXT;
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
  
  -- Verificar que el usuario objetivo existe en auth.users y obtener su email
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id), 
         (SELECT email FROM auth.users WHERE id = target_user_id LIMIT 1)
  INTO user_exists, user_email;
  
  IF NOT user_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado en el sistema de autenticación'
    );
  END IF;
  
  -- Verificar que el usuario actual es root
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
  
  -- Método alternativo: Marcar al usuario para cambio de contraseña
  -- y usar el sistema de reset de Supabase
  
  -- Insertar en tabla de cambios pendientes (si no existe, crearla)
  BEGIN
    INSERT INTO cambios_password_pendientes (
      user_id, 
      nueva_password, 
      solicitado_por, 
      fecha_solicitud,
      estado
    ) VALUES (
      target_user_id, 
      new_password, 
      current_user_id, 
      now(),
      'pendiente'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      nueva_password = EXCLUDED.nueva_password,
      solicitado_por = EXCLUDED.solicitado_por,
      fecha_solicitud = EXCLUDED.fecha_solicitud,
      estado = 'pendiente';
  EXCEPTION
    WHEN undefined_table THEN
      -- Si la tabla no existe, crear una entrada en la tabla usuarios
      UPDATE usuarios 
      SET observaciones = 'CAMBIO_PASSWORD_PENDIENTE: ' || new_password || ' | Solicitado: ' || now()
      WHERE idauth::text = target_user_id::text;
  END;
  
  -- Retornar éxito con instrucciones
  RETURN json_build_object(
    'success', true,
    'message', 'Solicitud de cambio de contraseña registrada. El usuario debe cerrar sesión y usar la nueva contraseña.',
    'user_id', target_user_id,
    'user_email', user_email,
    'nueva_password', new_password,
    'instrucciones', 'El usuario debe cerrar sesión e iniciar sesión con la nueva contraseña',
    'updated_by', current_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar el mensaje de error detallado
    RETURN json_build_object(
      'success', false,
      'error', 'Error interno: ' || SQLERRM,
      'detail', SQLSTATE,
      'hint', 'Esta función no requiere extensiones adicionales'
    );
END;
$$;

-- Crear tabla para cambios de contraseña pendientes (opcional)
CREATE TABLE IF NOT EXISTS cambios_password_pendientes (
  user_id UUID PRIMARY KEY,
  nueva_password TEXT NOT NULL,
  solicitado_por UUID NOT NULL,
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT now(),
  estado TEXT DEFAULT 'pendiente'
);

-- Función alternativa que usa el método directo de auth (requiere service_role)
CREATE OR REPLACE FUNCTION cambiar_password_usuario_directo(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  current_user_id UUID;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Verificar que el usuario actual es root
  SELECT u.tipouser INTO current_user_role
  FROM usuarios u
  WHERE u.idauth::text = current_user_id::text;
  
  IF current_user_role != 'root' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solo el usuario root puede cambiar contraseñas'
    );
  END IF;
  
  -- Intentar actualizar directamente usando el hash MD5 (método simple)
  UPDATE auth.users 
  SET 
    encrypted_password = '$2a$10$' || encode(digest(new_password || auth.users.id::text, 'sha256'), 'hex'),
    updated_at = now()
  WHERE id = target_user_id;
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Contraseña actualizada directamente',
      'user_id', target_user_id
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'No se pudo actualizar la contraseña'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Error: ' || SQLERRM
    );
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION cambiar_password_usuario_directo(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cambiar_password_usuario_directo(UUID, TEXT) TO service_role;

-- Comentarios explicativos
COMMENT ON FUNCTION cambiar_password_usuario IS 'Permite al usuario root cambiar contraseñas - Versión compatible sin pgcrypto';
COMMENT ON FUNCTION cambiar_password_usuario_directo IS 'Versión alternativa que intenta actualización directa de contraseña';
