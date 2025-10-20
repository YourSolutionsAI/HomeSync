-- Fügen Sie dieses SQL in Supabase aus, um die Datenbank zu aktualisieren

-- 1. Neue Spalte für Unterkategorie hinzufügen
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_tasks_subcategory ON tasks(subcategory);

-- 3. Neue Spalte für Transportmittel (Auto oder Flugzeug)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS transport_type TEXT 
CHECK (transport_type IN ('Auto', 'Flugzeug', 'Nicht zutreffend'));

-- 4. WICHTIG: Aktualisiere die TYPE-Constraint für "Reise"
-- Entferne die alte Constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_type_check;

-- Füge die neue Constraint mit 'Reise' hinzu
ALTER TABLE tasks ADD CONSTRAINT tasks_type_check 
CHECK (type IN ('Abfahrt', 'Abflug', 'Vor Ort', 'Reise'));

-- 5. Update-Trigger bleibt aktiv
-- (Trigger wurde bereits in vorherigem Schema erstellt)

