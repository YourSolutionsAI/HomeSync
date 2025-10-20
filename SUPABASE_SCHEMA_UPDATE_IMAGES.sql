-- Schema Update für mehrere Bilder pro Aufgabe
-- Führen Sie dieses SQL in Supabase aus

-- 1. Fügen Sie eine neue Spalte für mehrere Bild-URLs hinzu (als JSON Array)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- 2. Migrieren Sie vorhandene einzelne Bild-URLs in das Array
UPDATE tasks 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- 3. Optional: Alte image_url Spalte kann beibehalten werden für Kompatibilität
-- oder Sie können sie später entfernen:
-- ALTER TABLE tasks DROP COLUMN image_url;

-- 4. Kommentar hinzufügen
COMMENT ON COLUMN tasks.image_urls IS 'Array von Bild-URLs für mehrere Fotos pro Aufgabe';

