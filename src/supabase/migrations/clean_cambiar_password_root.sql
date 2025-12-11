-- Script de limpieza manual para eliminar funciones conflictivas
-- Ejecutar PRIMERO este script, luego el script principal

-- Paso 1: Verificar qué funciones existen
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as returns
FROM pg_proc 
WHERE proname = 'cambiar_password_root';

-- Paso 2: Eliminar funciones específicas (ejecutar solo las que aparezcan en el paso 1)
-- Descomenta y ejecuta SOLO las líneas que correspondan a funciones que realmente existen:

-- DROP FUNCTION IF EXISTS cambiar_password_root(uuid, text);
-- DROP FUNCTION IF EXISTS cambiar_password_root(text, text);

-- Paso 3: Verificar que se eliminaron todas
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'cambiar_password_root';

-- Si el resultado está vacío, entonces puedes ejecutar el script principal
