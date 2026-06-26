-- Aumenta el límite de subida del bucket multimedia (Supabase Storage).
-- Ejecutar en: Supabase Dashboard → SQL Editor → proyecto drdluixfeolnwcwxhgeg
--
-- NOTA: En plan Free el límite GLOBAL máximo es 50 MB por archivo.
-- Si el video pesa más de 50 MB, debes comprimirlo o subir de plan.

-- 1) Ver límites actuales
SELECT
  name,
  file_size_limit,
  round(coalesce(file_size_limit, 0) / 1024.0 / 1024.0, 2) AS limit_mb
FROM storage.buckets
WHERE name IN ('multimedia', 'operadora', 'cartelera');

-- 2) Subir límite del bucket multimedia a 50 MB (52428800 bytes)
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE name = 'multimedia';

-- 3) Confirmar cambio
SELECT
  name,
  file_size_limit,
  round(file_size_limit / 1024.0 / 1024.0, 2) AS limit_mb
FROM storage.buckets
WHERE name = 'multimedia';
