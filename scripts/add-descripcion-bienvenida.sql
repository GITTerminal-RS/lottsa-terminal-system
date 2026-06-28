-- Campo descripcion_bienvenida en informacion_institucional
-- La tabla usa filas por tipo (no columna nueva). tipo = 'descripcion_bienvenida'
--
-- Ejecutar en Supabase SQL Editor si quieres precargar el registro vacío
-- para todas las operadoras existentes:

INSERT INTO public.informacion_institucional (id_operadora, tipo, descripcion)
SELECT o.id, 'descripcion_bienvenida', ''
FROM public.operadora o
WHERE NOT EXISTS (
  SELECT 1
  FROM public.informacion_institucional ii
  WHERE ii.id_operadora = o.id
    AND ii.tipo = 'descripcion_bienvenida'
);
