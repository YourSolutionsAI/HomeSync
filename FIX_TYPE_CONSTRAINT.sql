-- Fix: Aktualisiere die CHECK Constraint für das 'type' Feld
-- Führen Sie dieses SQL VOR dem Einfügen der Aufgaben aus!

-- 1. Entferne die alte Constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_type_check;

-- 2. Füge die neue Constraint mit 'Reise' hinzu
ALTER TABLE tasks ADD CONSTRAINT tasks_type_check 
CHECK (type IN ('Abfahrt', 'Abflug', 'Vor Ort', 'Reise'));

-- 3. Überprüfung - sollte die neue Constraint zeigen
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass
AND conname = 'tasks_type_check';

-- Erwartetes Ergebnis:
-- tasks_type_check | CHECK ((type = ANY (ARRAY['Abfahrt'::text, 'Abflug'::text, 'Vor Ort'::text, 'Reise'::text])))

