-- Fügen Sie dieses SQL in Supabase aus, um die Datenbank zu aktualisieren

-- 1. Neue Spalte für Unterkategorie hinzufügen
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_tasks_subcategory ON tasks(subcategory);

-- 3. Vereinfachtes Type-Enum (kombiniert Abflug/Abfahrt zu "Reise")
-- Hinweis: Bestehende Daten bleiben erhalten, neue Einträge können "Reise" nutzen
-- Sie können später entscheiden, ob Sie alte Daten migrieren möchten

-- 4. Neue Spalte für Transportmittel (Auto oder Flugzeug)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS transport_type TEXT CHECK (transport_type IN ('Auto', 'Flugzeug', 'Nicht zutreffend'));

-- 5. Update-Trigger bleibt aktiv
-- (Trigger wurde bereits in vorherigem Schema erstellt)

