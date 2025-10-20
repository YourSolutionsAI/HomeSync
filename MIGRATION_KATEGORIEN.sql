-- Migration: Alte Kategorien auf neue Kategorien aktualisieren
-- Führen Sie dieses SQL aus, um bestehende Aufgaben mit neuen Kategorien zu aktualisieren

-- ============================================
-- KATEGORIE-MIGRATION FÜR REISE-AUFGABEN
-- ============================================

-- "Vorbereitungen zuhause (Packen)" → "Vorbereitung Abreisehaus" (für Reise-Tasks)
UPDATE tasks 
SET category = 'Vorbereitung Abreisehaus'
WHERE category = 'Vorbereitungen zuhause (Packen)'
AND type = 'Reise';

-- Falls Sie einige als "Am Abreisetag" markieren möchten (Beispiele):
-- UPDATE tasks 
-- SET category = 'Am Abreisetag'
-- WHERE category = 'Vorbereitung Abreisehaus' 
-- AND type = 'Reise'
-- AND title IN ('Müll leeren und mitnehmen', 'Geschirr spülen', 'Kühlschrank leerräumen');

-- "Sonstiges" → "Spezielles" (für Reise-Tasks)
UPDATE tasks 
SET category = 'Spezielles'
WHERE category = 'Sonstiges'
AND type = 'Reise';

-- Für REISE bleiben gleich:
-- - Aufgaben unterwegs/Flughafen
-- - Bei Ankunft im Zielhaus
-- - Hausverwaltung
-- - Haus verschließen
-- - Sicherheit

-- ============================================
-- KATEGORIE-MIGRATION FÜR VOR ORT-AUFGABEN
-- ============================================

-- "Sonstiges" → "Spezielles" (für Vor Ort-Tasks)
UPDATE tasks 
SET category = 'Spezielles'
WHERE category = 'Sonstiges'
AND type = 'Vor Ort';

-- "Hausverwaltung" → "Haustechnik" (für Vor Ort-Tasks)
UPDATE tasks 
SET category = 'Haustechnik'
WHERE category = 'Hausverwaltung'
AND type = 'Vor Ort';

-- Falls Sie Pool-Aufgaben haben, die noch in anderen Kategorien sind:
-- UPDATE tasks 
-- SET category = 'Pool & Garten'
-- WHERE type = 'Vor Ort'
-- AND (subcategory = 'Pool' OR title ILIKE '%pool%');

-- Falls Sie Wartungs-Aufgaben identifizieren möchten:
-- UPDATE tasks 
-- SET category = 'Regelmäßige Wartung'
-- WHERE type = 'Vor Ort'
-- AND (title ILIKE '%wartung%' OR title ILIKE '%check%' OR title ILIKE '%prüfen%');

-- Falls Sie Reinigungs-Aufgaben haben:
-- UPDATE tasks 
-- SET category = 'Reinigung & Ordnung'
-- WHERE type = 'Vor Ort'
-- AND (title ILIKE '%reinig%' OR title ILIKE '%putz%' OR title ILIKE '%sauber%');

-- Alle "Vorbereitungen zuhause (Packen)" für Vor Ort → Standardmäßig "Regelmäßige Wartung"
UPDATE tasks 
SET category = 'Regelmäßige Wartung'
WHERE category = 'Vorbereitungen zuhause (Packen)'
AND type = 'Vor Ort';

-- ============================================
-- ÜBERPRÜFUNG
-- ============================================

-- Zeige alle Kategorien nach Migration (getrennt nach Typ)
SELECT type, category, COUNT(*) as anzahl_aufgaben
FROM tasks
GROUP BY type, category
ORDER BY 
  type,
  CASE 
    -- REISE Kategorien
    WHEN category = 'Spezielles' AND type = 'Reise' THEN 1
    WHEN category = 'Vorbereitung Abreisehaus' THEN 2
    WHEN category = 'Am Abreisetag' THEN 3
    WHEN category = 'Hausverwaltung' AND type = 'Reise' THEN 4
    WHEN category = 'Haus verschließen' THEN 5
    WHEN category = 'Sicherheit' AND type = 'Reise' THEN 6
    WHEN category = 'Aufgaben unterwegs/Flughafen' THEN 7
    WHEN category = 'Bei Ankunft im Zielhaus' THEN 8
    -- VOR ORT Kategorien
    WHEN category = 'Spezielles' AND type = 'Vor Ort' THEN 11
    WHEN category = 'Regelmäßige Wartung' THEN 12
    WHEN category = 'Pool & Garten' THEN 13
    WHEN category = 'Haustechnik' THEN 14
    WHEN category = 'Reinigung & Ordnung' THEN 15
    WHEN category = 'Einkaufen & Besorgungen' THEN 16
    WHEN category = 'Reparaturen' THEN 17
    WHEN category = 'Sicherheit' AND type = 'Vor Ort' THEN 18
    ELSE 99
  END;

-- Erwartete Kategorien für REISE (type = 'Reise'):
-- Spezielles
-- Vorbereitung Abreisehaus
-- Am Abreisetag
-- Hausverwaltung
-- Haus verschließen
-- Sicherheit
-- Aufgaben unterwegs/Flughafen
-- Bei Ankunft im Zielhaus

-- Erwartete Kategorien für VOR ORT (type = 'Vor Ort'):
-- Spezielles
-- Regelmäßige Wartung
-- Pool & Garten
-- Haustechnik
-- Reinigung & Ordnung
-- Einkaufen & Besorgungen
-- Reparaturen
-- Sicherheit

-- ============================================
-- HINWEIS
-- ============================================
-- Falls Sie alte Kategorien haben, die nicht gemappt wurden:
-- Für REISE-Tasks:
SELECT DISTINCT category, COUNT(*) as anzahl
FROM tasks 
WHERE type = 'Reise'
AND category NOT IN (
  'Spezielles',
  'Vorbereitung Abreisehaus',
  'Am Abreisetag',
  'Hausverwaltung',
  'Haus verschließen',
  'Sicherheit',
  'Aufgaben unterwegs/Flughafen',
  'Bei Ankunft im Zielhaus'
)
GROUP BY category;

-- Für VOR ORT-Tasks:
SELECT DISTINCT category, COUNT(*) as anzahl
FROM tasks 
WHERE type = 'Vor Ort'
AND category NOT IN (
  'Spezielles',
  'Regelmäßige Wartung',
  'Pool & Garten',
  'Haustechnik',
  'Reinigung & Ordnung',
  'Einkaufen & Besorgungen',
  'Reparaturen',
  'Sicherheit'
)
GROUP BY category;

