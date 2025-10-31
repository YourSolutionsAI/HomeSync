-- SQL Code zum Entfernen der Kontakte-Sektion aus Supabase
-- Führe diesen Code in der Supabase SQL Editor aus

-- 1. Entferne alle RLS (Row Level Security) Policies für die contacts Tabelle
DROP POLICY IF EXISTS "Authenticated users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;

-- 2. Entferne den Index für die contacts Tabelle
DROP INDEX IF EXISTS idx_contacts_location;

-- 3. Entferne die contacts Tabelle
DROP TABLE IF EXISTS contacts;

-- Hinweis: Wenn Realtime für contacts aktiviert war, kannst du es in der Supabase Console deaktivieren:
-- Dashboard > Database > Replication > contacts Tabelle entfernen

