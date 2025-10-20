# Vercel Setup-Anleitung

## 1. Vercel-Konto erstellen

1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf "Sign Up"
3. Melden Sie sich mit GitHub, GitLab oder Bitbucket an (empfohlen) oder mit E-Mail

## 2. Git-Repository vorbereiten

### Option A: Neues GitHub-Repository erstellen

1. Gehen Sie zu [github.com/new](https://github.com/new)
2. Geben Sie einen Repository-Namen ein (z.B. "papa-reise-checkapp")
3. Wählen Sie "Private" (wenn es nicht öffentlich sein soll)
4. Klicken Sie auf "Create repository"

### Option B: Bestehendes Repository verwenden

Stellen Sie sicher, dass Ihr Code in einem Git-Repository ist:

```bash
# Im Projektverzeichnis
git init
git add .
git commit -m "Initial commit: Reise Checkapp"
git branch -M main
git remote add origin https://github.com/IHR-BENUTZERNAME/papa-reise-checkapp.git
git push -u origin main
```

## 3. Projekt in Vercel importieren

1. Melden Sie sich bei [vercel.com](https://vercel.com) an
2. Klicken Sie auf "Add New..." → "Project"
3. Wählen Sie Ihr Git-Repository aus (z.B. "papa-reise-checkapp")
4. Klicken Sie auf "Import"

## 4. Projekt-Einstellungen konfigurieren

### Framework Preset
- Vercel sollte automatisch "Next.js" erkennen
- Falls nicht, wählen Sie manuell "Next.js" aus

### Build & Development Settings
Die Standard-Einstellungen sollten funktionieren:
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Root Directory
- Lassen Sie dies leer, wenn das `package.json` im Root des Repos liegt

## 5. Umgebungsvariablen einrichten

**WICHTIG:** Fügen Sie Ihre Supabase-Credentials hinzu:

1. Unter "Environment Variables" klicken Sie auf "Add"
2. Fügen Sie folgende Variablen hinzu:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
(Ihr Supabase Project URL)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Ihr Supabase Anon Public Key)
```

3. Stellen Sie sicher, dass beide für alle Environments (Production, Preview, Development) aktiviert sind

## 6. Deployment starten

1. Klicken Sie auf "Deploy"
2. Vercel wird jetzt:
   - Ihr Repository klonen
   - Dependencies installieren (`npm install`)
   - Die Next.js-App bauen (`npm run build`)
   - Die App deployen

Dies dauert ca. 2-5 Minuten.

## 7. Domain erhalten

Nach dem Deployment:
1. Sie erhalten automatisch eine URL wie `https://papa-reise-checkapp.vercel.app`
2. Diese URL ist sofort erreichbar und funktioniert als PWA

### Custom Domain hinzufügen (Optional)

Falls Sie eine eigene Domain haben:
1. Gehen Sie zu "Settings" → "Domains"
2. Klicken Sie auf "Add"
3. Geben Sie Ihre Domain ein (z.B. `reise.ihre-domain.de`)
4. Folgen Sie den Anweisungen zur DNS-Konfiguration

## 8. PWA installieren (auf dem Smartphone)

### iOS (Safari)
1. Öffnen Sie die Vercel-URL in Safari
2. Tippen Sie auf das Teilen-Symbol (Quadrat mit Pfeil)
3. Scrollen Sie nach unten und tippen Sie auf "Zum Home-Bildschirm"
4. Tippen Sie auf "Hinzufügen"

### Android (Chrome)
1. Öffnen Sie die Vercel-URL in Chrome
2. Tippen Sie auf das Menü (⋮)
3. Tippen Sie auf "App installieren" oder "Zum Startbildschirm hinzufügen"
4. Tippen Sie auf "Installieren"

Die App sollte jetzt als Icon auf Ihrem Home-Bildschirm erscheinen!

## 9. Automatische Deployments

Vercel ist jetzt mit Ihrem Git-Repository verbunden:
- **Jeder Push zum `main` Branch** → Automatisches Production Deployment
- **Jeder Push zu anderen Branches** → Preview Deployment mit eigener URL
- **Jeder Pull Request** → Preview Deployment zum Testen

## 10. Lokale Entwicklung

Für die lokale Entwicklung auf Ihrem Computer:

1. Erstellen Sie eine `.env.local` Datei im Projektverzeichnis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Installieren Sie Dependencies:
```bash
npm install
```

3. Starten Sie den Development Server:
```bash
npm run dev
```

4. Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser

## Troubleshooting

### Build-Fehler
- Überprüfen Sie die Build-Logs in Vercel
- Stellen Sie sicher, dass alle Dependencies in `package.json` vorhanden sind
- Prüfen Sie, ob TypeScript-Fehler vorhanden sind

### Umgebungsvariablen funktionieren nicht
- Stellen Sie sicher, dass die Variablen mit `NEXT_PUBLIC_` beginnen (für client-seitige Nutzung)
- Nach dem Ändern von Umgebungsvariablen müssen Sie neu deployen

### App lädt nicht
- Überprüfen Sie die Browser-Konsole auf Fehler
- Stellen Sie sicher, dass Supabase richtig eingerichtet ist
- Prüfen Sie, ob die Supabase-URL und der Key korrekt sind

## Nützliche Vercel-Features

### Analytics
- Gehen Sie zu "Analytics" um Zugriffs-Statistiken zu sehen

### Logs
- Gehen Sie zu "Logs" um Laufzeit-Logs und Fehler zu sehen

### Deployments
- Gehen Sie zu "Deployments" um alle bisherigen Deployments zu sehen
- Sie können zu früheren Versionen zurückkehren ("Rollback")

## Fertig!

Ihre App ist jetzt online unter Ihrer Vercel-URL verfügbar! 🎉

Sie können die URL mit Familie und Freunden teilen, damit diese die App installieren können.

