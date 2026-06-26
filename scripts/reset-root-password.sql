-- ============================================================
-- Restablecer contraseña del usuario ROOT
-- Proyecto: drdluixfeolnwcwxhgeg
-- Correo:   gitterminal8@gmail.com
--
-- INSTRUCCIONES:
-- 1. Abre Supabase → SQL Editor → New query
-- 2. Reemplaza 'PON_AQUI_TU_NUEVA_CLAVE' por tu contraseña nueva
-- 3. Ejecuta (Run)
-- 4. Debe aparecer: UPDATE 1
-- 5. Inicia sesión en la app con gitterminal8@gmail.com
-- ============================================================

-- Verificar que el usuario existe (opcional)
SELECT id, email, created_at
FROM auth.users
WHERE email = 'gitterminal8@gmail.com';

-- Cambiar contraseña
UPDATE auth.users
SET
  encrypted_password = crypt('PON_AQUI_TU_NUEVA_CLAVE', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'gitterminal8@gmail.com';

-- Confirmar cambio
SELECT
  email,
  updated_at,
  'Contraseña actualizada' AS resultado
FROM auth.users
WHERE email = 'gitterminal8@gmail.com';
