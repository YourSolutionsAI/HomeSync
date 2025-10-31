-- Migration: Benutzerspezifische Aufgaben-Status
-- Erstellt eine neue Tabelle user_task_status für benutzerspezifische Status
-- Die Aufgaben bleiben in der tasks Tabelle, aber jeder Benutzer hat seinen eigenen Fortschritt

-- 1. Neue Tabelle user_task_status erstellen
CREATE TABLE IF NOT EXISTS user_task_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  done BOOLEAN DEFAULT false NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, task_id)
);

-- 2. Indexes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_user_task_status_user_id ON user_task_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_status_task_id ON user_task_status(task_id);
CREATE INDEX IF NOT EXISTS idx_user_task_status_user_scenario ON user_task_status(user_id, task_id);

-- 3. Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_user_task_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_task_status_updated_at_trigger
  BEFORE UPDATE ON user_task_status
  FOR EACH ROW
  EXECUTE FUNCTION update_user_task_status_updated_at();

-- 4. Row Level Security (RLS) Policies
ALTER TABLE user_task_status ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Status lesen
DROP POLICY IF EXISTS "Users can view own task status" ON user_task_status;
CREATE POLICY "Users can view own task status"
ON user_task_status FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen Status einfügen
DROP POLICY IF EXISTS "Users can insert own task status" ON user_task_status;
CREATE POLICY "Users can insert own task status"
ON user_task_status FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen Status aktualisieren
DROP POLICY IF EXISTS "Users can update own task status" ON user_task_status;
CREATE POLICY "Users can update own task status"
ON user_task_status FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen Status löschen
DROP POLICY IF EXISTS "Users can delete own task status" ON user_task_status;
CREATE POLICY "Users can delete own task status"
ON user_task_status FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Optional: Migration bestehender Daten (falls gewünscht)
-- Diese Funktion migriert alle bestehenden tasks.done Werte zu user_task_status
-- für den ersten authentifizierten Benutzer (falls vorhanden)
-- ACHTUNG: Nur ausführen, wenn Sie wirklich wollen, dass bestehende Daten migriert werden
-- COMMENT: Diese Migration wird NICHT automatisch ausgeführt, da wir nicht wissen,
-- welcher Benutzer die bestehenden Status haben sollte.
-- 
-- Falls Sie bestehende Daten migrieren möchten:
-- INSERT INTO user_task_status (user_id, task_id, done)
-- SELECT 
--   (SELECT id FROM auth.users LIMIT 1), -- Erster Benutzer
--   id,
--   done
-- FROM tasks
-- WHERE done = true
-- ON CONFLICT (user_id, task_id) DO NOTHING;

