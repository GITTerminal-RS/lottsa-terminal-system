-- Completar restauracion: RLS public + policies de Storage (backup gitterminal)
-- Ejecutar en SQL Editor de Supabase o via psql

-- RLS tablas public (faltaron por corte de conexion en restore)
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operadora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Storage policies (imagenes, videos, logos)
CREATE POLICY "Allow All Authenticated - Cartelera" ON storage.objects
  USING ((bucket_id = 'cartelera' AND auth.role() = 'authenticated'))
  WITH CHECK ((bucket_id = 'cartelera' AND auth.role() = 'authenticated'));

CREATE POLICY "Multimedia es público para lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'multimedia');

CREATE POLICY "Permitir actualización de archivos a usuarios autenticados" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'operadora');

CREATE POLICY "Permitir delete a usuarios autenticados" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'operadora');

CREATE POLICY "Permitir eliminación de archivos a usuarios autenticados" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'operadora');

CREATE POLICY "Permitir lectura de archivos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'operadora');

CREATE POLICY "Permitir lectura pública de archivos" ON storage.objects
  FOR SELECT USING (bucket_id = 'operadora');

CREATE POLICY "Permitir subida de archivos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'operadora');

CREATE POLICY "Permitir subida de archivos a usuarios autenticados" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'operadora');

CREATE POLICY "Public Read - Cartelera" ON storage.objects
  FOR SELECT USING (bucket_id = 'cartelera');

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'operadora');

CREATE POLICY "Usuarios autenticados pueden actualizar multimedia" ON storage.objects
  FOR UPDATE USING (bucket_id = 'multimedia' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar multimedia" ON storage.objects
  FOR DELETE USING (bucket_id = 'multimedia' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden subir multimedia" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'multimedia' AND auth.role() = 'authenticated');

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
