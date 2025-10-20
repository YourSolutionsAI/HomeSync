# 🧳 Reise Checkapp

Eine Progressive Web App (PWA) für Reise-Checklisten zwischen zwei Ferienhäusern in Niederlauterbach (Frankreich) und Benissa (Spanien).

## ✨ Features

- 📱 **Progressive Web App**: Installierbar auf Smartphone und Desktop
- 🔄 **Offline-Funktionalität**: Funktioniert auch ohne Internetverbindung
- ✅ **Interaktive Checklisten**: Abhaken von Aufgaben mit Fortschrittsanzeige
- 📝 **Aufgabenverwaltung**: Hinzufügen, Bearbeiten und Löschen von Aufgaben
- 📞 **Kontaktverwaltung**: Wichtige Kontakte pro Standort hinterlegen
- 🔐 **Sicherer Login**: Authentifizierung über Supabase
- 🌐 **Realtime-Sync**: Änderungen werden automatisch synchronisiert
- 🎨 **Modernes UI**: Responsive Design mit Tailwind CSS

## 🎯 Szenarien

Die App unterstützt 6 verschiedene Reise-Szenarien:

1. 🚗 Abfahrt (Auto) Niederlauterbach → Benissa
2. 🚗 Abfahrt (Auto) Benissa → Niederlauterbach
3. ✈️ Abflug (Flugzeug) Niederlauterbach → Benissa
4. ✈️ Abflug (Flugzeug) Benissa → Niederlauterbach
5. 🏡 Vor Ort in Niederlauterbach
6. 🏡 Vor Ort in Benissa

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 18.x oder höher
- npm oder yarn
- Ein Supabase-Account (kostenlos)
- Ein Vercel-Account (kostenlos)

### 1. Repository klonen

```bash
git clone <repository-url>
cd papa-reise-checkapp
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Supabase einrichten

Folgen Sie der detaillierten Anleitung in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md):
- Supabase-Projekt erstellen
- SQL-Schema ausführen
- API-Schlüssel kopieren

### 4. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local` Datei im Root-Verzeichnis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Development Server starten

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

### 6. Deployment auf Vercel

Folgen Sie der detaillierten Anleitung in [VERCEL_SETUP.md](./VERCEL_SETUP.md).

## 📁 Projektstruktur

```
papa-reise-checkapp/
├── app/                      # Next.js App Router
│   ├── checklist/           # Checklisten-Seiten
│   ├── contacts/            # Kontaktverwaltung
│   ├── login/               # Login-Seite
│   ├── layout.tsx           # Root Layout
│   ├── page.tsx             # Startseite
│   └── globals.css          # Globale Styles
├── components/              # React Komponenten
│   ├── AddTaskModal.tsx     # Modal zum Hinzufügen von Aufgaben
│   ├── AuthGuard.tsx        # Authentifizierungs-Guard
│   ├── ContactModal.tsx     # Modal für Kontakte
│   ├── TaskDetailModal.tsx  # Modal für Aufgaben-Details
│   └── TaskItem.tsx         # Aufgaben-Listeneintrag
├── contexts/                # React Contexts
│   └── AuthContext.tsx      # Authentifizierungs-Context
├── lib/                     # Bibliotheken und Utils
│   ├── supabase.ts         # Supabase Client
│   ├── database.types.ts   # TypeScript Datenbank-Typen
│   ├── types.ts            # App-Typen und Konstanten
│   └── offline-storage.ts  # IndexedDB für Offline-Funktionalität
├── public/                  # Statische Dateien
│   ├── manifest.json       # PWA Manifest
│   └── *.png               # App Icons
├── next.config.js          # Next.js Konfiguration (mit PWA)
├── tailwind.config.ts      # Tailwind CSS Konfiguration
├── package.json            # Dependencies
├── SUPABASE_SETUP.md       # Supabase Setup-Anleitung
├── VERCEL_SETUP.md         # Vercel Setup-Anleitung
└── README.md               # Diese Datei
```

## 🛠️ Technologie-Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Datenbank**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentifizierung**: Supabase Auth
- **Hosting**: [Vercel](https://vercel.com/)
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)
- **Offline Storage**: [IndexedDB](https://developer.mozilla.org/de/docs/Web/API/IndexedDB_API) mit [idb](https://github.com/jakearchibald/idb)
- **Programmiersprache**: TypeScript

## 📱 PWA Installieren

### iOS (Safari)
1. Öffnen Sie die App-URL in Safari
2. Tippen Sie auf das Teilen-Symbol
3. Wählen Sie "Zum Home-Bildschirm"

### Android (Chrome)
1. Öffnen Sie die App-URL in Chrome
2. Tippen Sie auf das Menü (⋮)
3. Wählen Sie "App installieren" oder "Zum Startbildschirm hinzufügen"

### Desktop (Chrome/Edge)
1. Öffnen Sie die App-URL
2. Klicken Sie auf das Install-Icon in der Adressleiste
3. Oder: Menü → "App installieren..."

## 🔧 Entwicklung

### Build für Production

```bash
npm run build
```

### Production Server lokal testen

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🗂️ Datenbank-Schema

Siehe [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) für das vollständige SQL-Schema.

Haupttabellen:
- **tasks**: Alle Aufgaben mit Kategorien, Beschreibungen, Links, etc.
- **contacts**: Wichtige Kontakte pro Standort

## 🔐 Sicherheit

- Row Level Security (RLS) auf allen Tabellen aktiviert
- Authentifizierte Nutzer haben vollen Zugriff (alle Nutzer gleichberechtigt)
- API-Schlüssel über Umgebungsvariablen
- HTTPS durch Vercel automatisch aktiviert

## 🌐 Offline-Funktionalität

Die App nutzt mehrere Strategien für Offline-Betrieb:

1. **Service Worker**: Cached statische Assets (HTML, CSS, JS)
2. **IndexedDB**: Speichert Aufgaben und Kontakte lokal
3. **Sync Queue**: Speichert Änderungen offline und synct bei Online-Verbindung
4. **Network First mit Fallback**: Versucht Online-Daten zu laden, fällt auf Cache zurück

## 🎨 Anpassungen

### Kategorien ändern

Bearbeiten Sie die `CATEGORIES` Konstante in `components/AddTaskModal.tsx`.

### Neue Szenarien hinzufügen

Bearbeiten Sie die `SCENARIOS` Konstante in `lib/types.ts`.

### Farben anpassen

Bearbeiten Sie `tailwind.config.ts` und `app/globals.css`.

## 📄 Lizenz

Privates Projekt - Alle Rechte vorbehalten.

## 🤝 Kontakt

Bei Fragen oder Problemen wenden Sie sich an den Entwickler.

## 📚 Weitere Dokumentation

- [Supabase Setup-Anleitung](./SUPABASE_SETUP.md) - Datenbank einrichten
- [Vercel Setup-Anleitung](./VERCEL_SETUP.md) - Deployment und Hosting
- [Next.js Dokumentation](https://nextjs.org/docs)
- [Supabase Dokumentation](https://supabase.com/docs)
- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)

