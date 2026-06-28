-- Si ya ejecutaste create-agencia.sql antes, corre solo este script
-- para habilitar la lectura pública de agencias en Conócenos.

CREATE OR REPLACE FUNCTION public.obtener_agencias_publico(_id_operadora bigint)
RETURNS TABLE (
  id bigint,
  lugar text,
  direccion text,
  contactos text,
  hora_atencion text,
  encomiendas_contacto text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.lugar,
    a.direccion,
    a.contactos,
    a.hora_atencion,
    a.encomiendas_contacto
  FROM public.agencia a
  WHERE a.id_operadora = _id_operadora
  ORDER BY a.lugar ASC;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_agencias_publico(bigint) TO anon, authenticated;
