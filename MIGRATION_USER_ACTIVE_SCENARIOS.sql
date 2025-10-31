-- Migration: Benutzerspezifische aktive Szenarien
-- Erstellt eine neue Tabelle user_active_scenarios für benutzerspezifische aktive Checklisten
-- Ersetzt die localStorage-basierte Lösung durch eine datenbankbasierte Lösung

-- 1. Neue Tabelle user_active_scenarios erstellen
CREATE TABLE IF NOT EXISTS user_active_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, scenario_id)
);

-- 2. Indexes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_user_active_scenarios_user_id ON user_active_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_active_scenarios_scenario_id ON user_active_scenarios(scenario_id);

-- 3. Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_user_active_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_active_scenarios_updated_at_trigger
  BEFORE UPDATE ON user_active_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_user_active_scenarios_updated_at();

-- 4. Row Level Security (RLS) Policies
ALTER TABLE user_active_scenarios ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen aktiven Szenarien lesen
DROP POLICY IF EXISTS "Users can view own active scenarios" ON user_active_scenarios;
CREATE POLICY "Users can view own active scenarios"
ON user_active_scenarios FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen aktiven Szenarien einfügen
DROP POLICY IF EXISTS "Users can insert own active scenarios" ON user_active_scenarios;
CREATE POLICY "Users can insert own active scenarios"
ON user_active_scenarios FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen aktiven Szenarien aktualisieren
DROP POLICY IF EXISTS "Users can update own active scenarios" ON user_active_scenarios;
CREATE POLICY "Users can update own active scenarios"
ON user_active_scenarios FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen aktiven Szenarien löschen
DROP POLICY IF EXISTS "Users can delete own active scenarios" ON user_active_scenarios;
CREATE POLICY "Users can delete own active scenarios"
ON user_active_scenarios FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Kommentare für Dokumentation
COMMENT ON TABLE user_active_scenarios IS 'Speichert die aktiven Szenarien/Checklisten pro Benutzer';
COMMENT ON COLUMN user_active_scenarios.user_id IS 'Referenz auf den Benutzer';
COMMENT ON COLUMN user_active_scenarios.scenario_id IS 'ID des aktiven Szenarios (entspricht den SCENARIOS aus der App)';
COMMENT ON COLUMN user_active_scenarios.created_at IS 'Zeitpunkt, wann das Szenario aktiviert wurde';
COMMENT ON COLUMN user_active_scenarios.updated_at IS 'Zeitpunkt der letzten Aktualisierung';
