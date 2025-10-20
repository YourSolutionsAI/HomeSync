# App-Icons erstellen

Für die PWA benötigen Sie App-Icons in verschiedenen Größen.

## Benötigte Icons

Die folgenden Dateien müssen im `public/` Verzeichnis erstellt werden:

- `icon-192x192.png` (192x192 Pixel)
- `icon-512x512.png` (512x512 Pixel)
- `favicon.ico` (32x32 Pixel)

## Option 1: Online-Generator (Empfohlen)

### Schritt 1: Design erstellen
1. Erstellen Sie ein einfaches Logo/Icon (z.B. ein Koffer-Symbol 🧳)
2. Oder nutzen Sie ein Emoji als Basis

### Schritt 2: Icons generieren
Nutzen Sie einen dieser kostenlosen Dienste:

#### PWA Asset Generator
1. Gehen Sie zu [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Laden Sie Ihr Basis-Bild hoch (mindestens 512x512px)
3. Laden Sie das ZIP-Paket herunter
4. Extrahieren Sie die benötigten Dateien

#### Favicon.io
1. Gehen Sie zu [https://favicon.io](https://favicon.io)
2. Wählen Sie eine der Optionen:
   - "Text" → Geben Sie "🧳" oder "RC" ein
   - "Image" → Laden Sie Ihr Logo hoch
   - "Emoji" → Wählen Sie das Koffer-Emoji
3. Klicken Sie auf "Download"
4. Extrahieren Sie die ZIP-Datei

#### RealFaviconGenerator
1. Gehen Sie zu [https://realfavicongenerator.net](https://realfavicongenerator.net)
2. Laden Sie Ihr Basis-Bild hoch (mindestens 512x512px)
3. Passen Sie die Vorschau für verschiedene Plattformen an
4. Klicken Sie auf "Generate your Favicons and HTML code"
5. Laden Sie das Paket herunter

## Option 2: Manuell mit Bildbearbeitungssoftware

### Mit GIMP (kostenlos)
1. Öffnen Sie GIMP
2. Erstellen Sie ein neues Bild (512x512px)
3. Gestalten Sie Ihr Icon
4. Exportieren als PNG:
   - `icon-512x512.png` (512x512)
   - Bild skalieren auf 192x192 → `icon-192x192.png`
   - Bild skalieren auf 32x32 → als ICO exportieren → `favicon.ico`

### Mit Photoshop
1. Erstellen Sie ein neues Dokument (512x512px)
2. Gestalten Sie Ihr Icon
3. Speichern Sie:
   - Als PNG mit Transparenz für `icon-512x512.png`
   - Bildgröße ändern und erneut speichern für kleinere Versionen

## Option 3: Einfaches Text-basiertes Icon

Falls Sie kein Design-Tool haben, können Sie ein einfaches Icon mit einer Online-Lösung erstellen:

### Canva (kostenlos)
1. Gehen Sie zu [https://www.canva.com](https://www.canva.com)
2. Erstellen Sie ein Design mit 512x512px
3. Fügen Sie Text oder Emojis hinzu
4. Laden Sie als PNG herunter
5. Nutzen Sie dann Favicon.io um verschiedene Größen zu generieren

## Design-Empfehlungen

### Farben
- Haupt-Blau: `#3b82f6` (passend zur App)
- Weißer/Transparenter Hintergrund
- Hoher Kontrast für gute Lesbarkeit

### Motiv-Ideen
- 🧳 Koffer-Symbol
- 🏡 Haus-Symbol
- ✓ Checkmark-Symbol
- Initialen "RC" (Reise Check)
- Kombination: Koffer + Checkmark

### Wichtige Punkte
- **Einfaches Design**: Icons müssen auch in kleinen Größen erkennbar sein
- **Keine feinen Details**: Diese sind auf kleinen Icons nicht sichtbar
- **Zentriert**: Icon sollte zentriert sein mit etwas Abstand zum Rand
- **Safe Zone**: Lassen Sie 10% Rand um das Icon herum frei

## Installation der Icons

1. Laden Sie die generierten Icons herunter
2. Benennen Sie sie entsprechend um:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `favicon.ico`
3. Kopieren Sie sie in den `public/` Ordner Ihres Projekts
4. Fertigen Sie ein neues Deployment auf Vercel an

## Icons testen

Nach dem Upload:
1. Öffnen Sie die App im Browser
2. Prüfen Sie, ob das Favicon angezeigt wird
3. Versuchen Sie, die App zu installieren (PWA)
4. Prüfen Sie, ob das Icon auf dem Home-Bildschirm korrekt angezeigt wird

## Backup-Lösung (Temporär)

Falls Sie noch keine Icons haben, können Sie temporär diese Platzhalter nutzen:

### Schnell mit Favicon.io
1. Gehen Sie zu [https://favicon.io/emoji-favicons/luggage](https://favicon.io/emoji-favicons/luggage)
2. Klicken Sie auf "Download"
3. Extrahieren Sie die ZIP-Datei
4. Kopieren Sie die Dateien in den `public/` Ordner

Dies gibt Ihnen ein einfaches Koffer-Emoji als Icon, das Sie später durch ein eigenes ersetzen können.

