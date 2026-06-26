-- Columnas que la app React espera pero no estaban en el backup de agosto 2025
ALTER TABLE public.malla ADD COLUMN IF NOT EXISTS video text DEFAULT 'link';
ALTER TABLE public.malla ADD COLUMN IF NOT EXISTS videomovil text DEFAULT 'link';
