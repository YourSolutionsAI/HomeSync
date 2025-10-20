-- Migration: Alte Szenarien auf neue vereinheitlichte Szenarien migrieren
-- Führen Sie dieses SQL aus, wenn Sie bereits Aufgaben mit den alten Scenario-IDs haben

-- ============================================
-- MIGRATION DER SCENARIO-IDS
-- ============================================

-- Von "Abfahrt" zu "Reise" (Niederlauterbach → Benissa)
UPDATE tasks 
SET scenario = 'reise-nl-ben', type = 'Reise'
WHERE scenario = 'abfahrt-nl-ben';

-- Von "Abflug" zu "Reise" (Niederlauterbach → Benissa)
UPDATE tasks 
SET scenario = 'reise-nl-ben', type = 'Reise', transport_type = 'Flugzeug'
WHERE scenario = 'abflug-nl-ben';

-- Von "Abfahrt" zu "Reise" (Benissa → Niederlauterbach)
UPDATE tasks 
SET scenario = 'reise-ben-nl', type = 'Reise'
WHERE scenario = 'abfahrt-ben-nl';

-- Von "Abflug" zu "Reise" (Benissa → Niederlauterbach)
UPDATE tasks 
SET scenario = 'reise-ben-nl', type = 'Reise', transport_type = 'Flugzeug'
WHERE scenario = 'abflug-ben-nl';

-- ============================================
-- ÜBERPRÜFUNG
-- ============================================

-- Zeige alle Szenarien nach Migration
SELECT DISTINCT scenario, type, COUNT(*) as anzahl_aufgaben
FROM tasks
GROUP BY scenario, type
ORDER BY scenario;

-- Erwartetes Ergebnis:
-- reise-nl-ben    | Reise    | X
-- reise-ben-nl    | Reise    | Y
-- vor-ort-nl      | Vor Ort  | Z
-- vor-ort-ben     | Vor Ort  | W

-- ============================================
-- HINWEIS
-- ============================================
-- Diese Migration ist nur notwendig, wenn Sie bereits Aufgaben mit den alten
-- Scenario-IDs (abfahrt-*, abflug-*) in der Datenbank haben.
-- 
-- Falls Sie mit einer frischen Datenbank starten, können Sie dieses SQL ignorieren
-- und direkt AUFGABEN_BENISSA_NIEDERLAUTERBACH.sql verwenden.

