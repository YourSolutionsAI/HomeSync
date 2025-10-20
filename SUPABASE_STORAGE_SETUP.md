# Supabase Storage Setup für Foto-Upload

## Schritt 1: Storage Bucket erstellen

1. Gehen Sie in Ihrer Supabase-Console zu **"Storage"** (linke Seitenleiste)
2. Klicken Sie auf **"Create a new bucket"**
3. Bucket-Name: `task-images`
4. Wählen Sie **"Public bucket"** (damit Bilder ohne Auth angezeigt werden können)
5. Klicken Sie auf **"Create bucket"**

## Schritt 2: Storage Policies erstellen

Gehen Sie zum **SQL Editor** und führen Sie folgenden Code aus:

```sql
-- Policy: Authentifizierte Benutzer können Bilder hochladen
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-images');

-- Policy: Jeder kann Bilder anzeigen (auch ohne Login)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Policy: Authentifizierte Benutzer können Bilder löschen
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-images');

-- Policy: Authentifizierte Benutzer können Bilder aktualisieren
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-images');
```

## Schritt 3: Bucket-Einstellungen überprüfen

1. Gehen Sie zu **Storage** → **task-images**
2. Klicken Sie auf **"Settings"** (Zahnrad-Symbol)
3. Stellen Sie sicher, dass **"Public"** aktiviert ist
4. Optional: Setzen Sie ein File Size Limit (z.B. 5MB)

## Fertig!

Ihre App kann jetzt Fotos zu Aufgaben hochladen! Die Bilder werden in Supabase Storage gespeichert und sind öffentlich zugänglich (aber nur authentifizierte Benutzer können hochladen).

## Verwendung in der App

- Beim **Aufgabe hinzufügen**: Foto-Upload-Feld nutzen
- Beim **Aufgabe bearbeiten**: Bilder können angezeigt werden
- In der **Aufgaben-Liste**: 📷-Symbol zeigt an, dass ein Foto vorhanden ist

## Wichtige Hinweise

- Maximale Dateigröße: 5MB pro Bild
- Unterstützte Formate: JPG, PNG, GIF, WebP
- Bilder werden automatisch mit eindeutigen Namen gespeichert
- Alte Bilder werden NICHT automatisch gelöscht (manuelles Löschen möglich in Storage-Console)

