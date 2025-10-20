# ⚠️ LÖSUNG: Bilder können nicht angezeigt werden

## Problem
Bilder werden erfolgreich in Supabase hochgeladen, aber die App zeigt die Fehlermeldung:
```
⚠️ Bild konnte nicht geladen werden.
URL: https://...supabase.co/storage/v1/object/public/task-images/...
```

## Ursache
Der Storage Bucket ist nicht richtig als **öffentlich** konfiguriert.

---

## 🔧 Lösung (Schritt für Schritt)

### Option 1: Bucket-Einstellungen überprüfen (EINFACHSTE METHODE)

1. Gehen Sie in Supabase zu **Storage** (linke Seitenleiste)
2. Klicken Sie auf den **task-images** Bucket
3. Klicken Sie oben rechts auf **"Configuration"** oder das **Zahnrad-Symbol**
4. Stellen Sie sicher, dass **"Public bucket"** AKTIVIERT ist:
   - Schalter muss auf **ON/grün** stehen
   - Falls nicht, aktivieren Sie ihn jetzt
5. Klicken Sie auf **"Save"**

### Option 2: Policies über SQL Editor erstellen

Falls Option 1 nicht funktioniert, führen Sie diesen SQL-Code aus:

1. Gehen Sie zu **SQL Editor** (linke Seitenleiste in Supabase)
2. Klicken Sie auf **"+ New query"**
3. Fügen Sie folgenden Code ein:

```sql
-- WICHTIG: Zuerst alte Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- NEUE POLICY: Jeder kann Bilder aus task-images lesen (auch ohne Login)
CREATE POLICY "Public read access for task-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Policy für Upload (nur authentifizierte Benutzer)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload to task-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-images');

-- Policy für Löschen (nur authentifizierte Benutzer)
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete from task-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-images');

-- Policy für Update (nur authentifizierte Benutzer)
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update in task-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-images');
```

4. Klicken Sie auf **"Run"** (oder drücken Sie `Ctrl+Enter`)
5. Sie sollten die Meldung sehen: `Success. No rows returned`

---

## ✅ Test: Funktioniert es jetzt?

1. Öffnen Sie eine Aufgabe mit Foto in Ihrer App
2. Das Bild sollte jetzt angezeigt werden
3. Wenn nicht, öffnen Sie die Browser-Konsole (`F12`) und prüfen Sie auf Fehler

### Alternativ: Direkter Test der Bild-URL

Kopieren Sie die Bild-URL aus der Fehlermeldung und öffnen Sie sie direkt im Browser:
```
https://ivhhayztdgpohvdnjjlt.supabase.co/storage/v1/object/public/task-images/6v2atgv01dq-1760967523218.png
```

- ✅ **Funktioniert**: Sie sehen das Bild
- ❌ **Funktioniert nicht**: Sie sehen einen Fehler (z.B. "The resource you are looking for could not be found")

Wenn der direkte Zugriff nicht funktioniert, ist der Bucket definitiv nicht öffentlich!

---

## 🔍 Zusätzliche Überprüfung

### Policies überprüfen:

1. Gehen Sie zu **Storage** → **Policies** (linke Seitenleiste)
2. Suchen Sie nach Policies für `storage.objects`
3. Es sollte eine Policy namens **"Public read access for task-images"** oder ähnlich geben
4. Die Policy sollte:
   - **Operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**: `bucket_id = 'task-images'`

---

## 🆘 Immer noch Probleme?

Wenn die Bilder immer noch nicht angezeigt werden:

### 1. Bucket neu erstellen (LETZTER AUSWEG)

1. **ACHTUNG**: Sichern Sie zuerst alle Bilder!
2. Löschen Sie den `task-images` Bucket
3. Erstellen Sie ihn neu:
   - Name: `task-images`
   - **WICHTIG**: Aktivieren Sie **"Public bucket"** beim Erstellen!
4. Führen Sie die SQL-Policies aus (siehe oben)
5. Laden Sie Ihre Bilder erneut hoch

### 2. Browser-Cache leeren

- Drücken Sie `Ctrl+Shift+Delete` (Windows) oder `Cmd+Shift+Delete` (Mac)
- Löschen Sie Cache und Cookies
- Laden Sie die App neu

---

## 📝 Zusammenfassung

Das Problem tritt auf, wenn:
- ❌ Der Bucket als **privat** erstellt wurde
- ❌ Keine **SELECT Policy für public** existiert
- ❌ Die Policy falsch konfiguriert ist

Die Lösung:
- ✅ Bucket auf **Public** setzen
- ✅ SELECT Policy für `public` erstellen
- ✅ Policy muss `bucket_id = 'task-images'` prüfen

