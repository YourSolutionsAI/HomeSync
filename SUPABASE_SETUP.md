# Supabase Setup-Anleitung

## 1. Supabase-Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein kostenloses Konto oder melden Sie sich an
3. Klicken Sie auf "New Project"
4. Geben Sie einen Projektnamen ein (z.B. "reise-checkapp")
5. Wählen Sie ein sicheres Datenbank-Passwort
6. Wählen Sie eine Region (am besten Frankfurt für Europa)
7. Klicken Sie auf "Create new project"

## 2. Datenbank-Schema einrichten

Nachdem Ihr Projekt erstellt wurde:

1. Gehen Sie in der linken Seitenleiste zu "SQL Editor"
2. Klicken Sie auf "New query"
3. Kopieren Sie den folgenden SQL-Code und führen Sie ihn aus:

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('Niederlauterbach', 'Benissa')),
  type TEXT NOT NULL CHECK (type IN ('Abfahrt', 'Abflug', 'Vor Ort')),
  scenario TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  "order" INTEGER NOT NULL,
  link TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_scenario ON tasks(scenario);
CREATE INDEX idx_tasks_location ON tasks(location);
CREATE INDEX idx_tasks_order ON tasks("order");

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for tasks table
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Tasks policies
CREATE POLICY "Authenticated users can view all tasks" 
ON tasks FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert tasks" 
ON tasks FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" 
ON tasks FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete tasks" 
ON tasks FOR DELETE 
TO authenticated 
USING (true);
```

4. Klicken Sie auf "Run" (oder drücken Sie Strg+Enter)
5. Sie sollten die Meldung "Success. No rows returned" sehen

## 3. Beispieldaten einfügen (Optional)

Wenn Sie möchten, können Sie einige Beispieldaten einfügen:

```sql
-- Beispiel-Aufgaben für "Abflug Niederlauterbach → Benissa"
INSERT INTO tasks (title, description, category, location, type, scenario, "order", done) VALUES
('Koffer packen', 'Kleidung, Dokumente, Medikamente einpacken', 'Vorbereitungen zuhause (Packen)', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 1, false),
('Reisedokumente prüfen', 'Personalausweis, Bordkarten, Buchungsbestätigungen', 'Vorbereitungen zuhause (Packen)', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 2, false),
('Fenster schließen', 'Alle Fenster im Haus schließen', 'Vorbereitungen zuhause (Packen)', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 3, false),
('Kühlschrank ausschalten', 'Kühlschrank leeren und ausschalten', 'Vorbereitungen zuhause (Packen)', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 4, false),
('Heizung herunterdrehen', 'Heizung auf Mindesttemperatur stellen', 'Vorbereitungen zuhause (Packen)', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 5, false),
('Alarmanlage aktivieren', 'Alarmanlage einschalten vor dem Verlassen', 'Vorbereitungen zuhause (Packen)', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 6, false),
('Check-in am Flughafen', 'Online Check-in oder am Schalter', 'Aufgaben unterwegs/Flughafen', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 7, false),
('Gepäck aufgeben', 'Koffer am Check-in Schalter aufgeben', 'Aufgaben unterwegs/Flughafen', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 8, false),
('Sicherheitskontrolle passieren', 'Metalldetektor und Handgepäckkontrolle', 'Aufgaben unterwegs/Flughafen', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 9, false),
('Alarmanlage deaktivieren', 'Alarmanlage bei Ankunft ausschalten', 'Bei Ankunft im Zielhaus', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 10, false),
('Wasser anstellen', 'Hauptwasserhahn aufdrehen', 'Bei Ankunft im Zielhaus', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 11, false),
('Heizung/Klimaanlage einstellen', 'Temperatur auf Wohlfühltemperatur einstellen', 'Bei Ankunft im Zielhaus', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 12, false),
('Kühlschrank auffüllen', 'Erste Einkäufe für den Aufenthalt', 'Bei Ankunft im Zielhaus', 'Niederlauterbach', 'Abflug', 'abflug-nl-ben', 13, false);
```

## 4. Authentication einrichten

1. Gehen Sie in der linken Seitenleiste zu "Authentication"
2. Klicken Sie auf "Providers"
3. Stellen Sie sicher, dass "Email" aktiviert ist
4. Optional: Deaktivieren Sie "Confirm email" unter "Email Auth" → "Settings", wenn Sie keine E-Mail-Bestätigung möchten (nur für Entwicklung!)

## 5. Storage einrichten (Optional, für Bilder)

Falls Sie später Bilder zu Aufgaben hinzufügen möchten:

1. Gehen Sie in der linken Seitenleiste zu "Storage"
2. Klicken Sie auf "Create a new bucket"
3. Name: "task-images"
4. Wählen Sie "Public bucket" (damit Bilder ohne Auth angezeigt werden können)
5. Klicken Sie auf "Create bucket"

Fügen Sie dann diese Policy hinzu (SQL Editor):

```sql
-- Storage Policy für task-images bucket
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-images');

CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

CREATE POLICY "Authenticated users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-images');
```

## 6. API-Schlüssel erhalten

1. Gehen Sie in der linken Seitenleiste zu "Project Settings" (Zahnrad-Symbol)
2. Klicken Sie auf "API"
3. Kopieren Sie:
   - **Project URL** (beginnt mit https://xxxxx.supabase.co)
   - **anon public** key (ein langer String, beginnt mit eyJ...)

Diese beiden Werte benötigen Sie für die `.env.local` Datei in Ihrer Next.js-App!

## 7. Realtime-Updates aktivieren (Optional)

Wenn Sie Echtzeit-Synchronisation zwischen mehreren Geräten möchten:

1. Gehen Sie zu "Database" → "Replication"
2. Aktivieren Sie Realtime für die Tabelle `tasks`

## Fertig!

Ihre Supabase-Datenbank ist jetzt eingerichtet. Kopieren Sie die API-Schlüssel aus Schritt 6 und fügen Sie sie in Ihre `.env.local` Datei ein.

