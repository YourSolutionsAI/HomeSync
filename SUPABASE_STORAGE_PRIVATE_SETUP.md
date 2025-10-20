# Supabase Storage Setup - NUR für eingeloggte Benutzer

## ⚠️ WICHTIG: Bilder sollen NICHT öffentlich sein!

Die Bilder sollen nur von **eingeloggten Benutzern** der App gesehen werden können, nicht von der ganzen Welt.

---

## 🔒 Schritt 1: Bucket als PRIVAT konfigurieren

1. Gehen Sie in Supabase zu **Storage**
2. Falls der `task-images` Bucket noch nicht existiert:
   - Klicken Sie auf **"Create a new bucket"**
   - Name: `task-images`
   - **WICHTIG**: **DEAKTIVIEREN** Sie "Public bucket" (Schalter auf OFF)
   - Klicken Sie auf **"Create bucket"**

3. Falls der Bucket bereits existiert:
   - Klicken Sie auf den **task-images** Bucket
   - Klicken Sie auf **"Configuration"** (Zahnrad-Symbol)
   - **DEAKTIVIEREN** Sie "Public bucket" (Schalter auf OFF)
   - Speichern Sie

---

## 🔐 Schritt 2: Policies für authentifizierte Benutzer

Gehen Sie zum **SQL Editor** und führen Sie diesen Code aus:

```sql
-- Alte Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Public read access for task-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;

-- Policy: NUR authentifizierte Benutzer können Bilder LESEN
CREATE POLICY "Authenticated users can read task-images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-images');

-- Policy: NUR authentifizierte Benutzer können Bilder HOCHLADEN
CREATE POLICY "Authenticated users can upload task-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-images');

-- Policy: NUR authentifizierte Benutzer können Bilder LÖSCHEN
CREATE POLICY "Authenticated users can delete task-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-images');

-- Policy: NUR authentifizierte Benutzer können Bilder AKTUALISIEREN
CREATE POLICY "Authenticated users can update task-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-images');
```

---

## ✅ Ergebnis

- ✅ Bilder können **NUR von eingeloggten Benutzern** gesehen werden
- ✅ Nicht-eingeloggte Benutzer können die Bilder **NICHT** sehen
- ✅ Uploads funktionieren weiterhin normal
- ✅ Ihre Daten sind geschützt!

---

## 📝 Technischer Hinweis

Die App verwendet jetzt **authentifizierte Requests** statt öffentlicher URLs. Das bedeutet:
- Jede Bildanfrage sendet den Auth-Token mit
- Supabase prüft, ob der Benutzer eingeloggt ist
- Nur dann wird das Bild ausgeliefert

