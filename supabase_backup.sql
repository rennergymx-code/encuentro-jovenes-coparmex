-- SUPABASE BACKUP - ENCUENTRO JÓVENES COPARMEX
-- Fecha: 2026-04-07
-- Este archivo contiene la estructura y políticas de seguridad (RLS) actuales.

-- 1. ESTRUCTURA DE TABLAS (Resumen)
-- Tabla: tickets (id, purchase_id, attendee_name, attendee_email, attendee_phone, type, qr_code, status, scanned_at, created_at)
-- Tabla: purchases (id, customer_name, customer_email, amount, status, created_at)
-- Tabla: questions (id, session_id, user_name, content, is_answered, created_at)
-- Tabla: agenda (id_string, time, type, badge, title, subtitle, tagline, value, speakers, is_public, is_surprise, bg_color)
-- Tabla: sponsors (id, name, logo, tier, contribution, payment_status)

-- 2. POLÍTICAS DE SEGURIDAD (RLS)

-- TICKETS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read own tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public update ticket status" ON public.tickets FOR UPDATE USING (true) WITH CHECK (true);

-- PURCHASES
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read own purchases" ON public.purchases FOR SELECT USING (true);

-- QUESTIONS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read questions" ON public.questions FOR SELECT USING (true);

-- AGENDA
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agenda viewable by everyone" ON public.agenda FOR SELECT USING (true);
CREATE POLICY "Allow anon update agenda" ON public.agenda FOR UPDATE USING (true) WITH CHECK (true);

-- SPONSORS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors are viewable by everyone" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Allow anon update sponsors" ON public.sponsors FOR UPDATE USING (true) WITH CHECK (true);

-- SETTINGS / CONFIG
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow anon update settings" ON public.settings FOR UPDATE USING (true) WITH CHECK (true);

-- 3. CONFIGURACIÓN DE REALTIME
-- Asegurar que la tabla tickets tenga identidad completa para el monitor en vivo
ALTER TABLE public.tickets REPLICA IDENTITY FULL;

-- Asegurar que las tablas estén en la publicación de realtime
-- (Ejecutar en el editor SQL de Supabase si es necesario)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
