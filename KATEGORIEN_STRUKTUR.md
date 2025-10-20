# Kategorien-Struktur der Reise-Checkapp

Die App verwendet **unterschiedliche Kategorien** für verschiedene Szenario-Typen, damit die Aufgaben logisch und kontextbezogen organisiert sind.

---

## 🧳 REISE-Szenarien (Abfahrt/Anreise)

Für "Reise Niederlauterbach → Benissa" und "Reise Benissa → Niederlauterbach"

### Kategorien (in Reihenfolge):

1. **Spezielles**
   - Wichtige Informationen
   - Besondere Hinweise (z.B. Schlüsselverwaltung)

2. **Vorbereitung Abreisehaus**
   - Aufgaben, die 1-2 Tage vor Abreise erledigt werden können
   - Unterkategorien: Schlafzimmer, Büro, Gäste Apartment, Küche, Hauswirtschaftsraum, Garage, Wohnzimmer, Badezimmer, Außenbereich

3. **Am Abreisetag**
   - Aufgaben, die direkt vor dem Verschließen des Hauses erledigt werden müssen
   - Unterkategorien: Schlafzimmer, Küche, Garage, Außenbereich

4. **Hausverwaltung**
   - Gas, Wasser, Heizung, Elektrik abstellen/regeln
   - Unterkategorien: Elektronik, Heizung/Klima, Wasser, Gas, Außenbereich, Pool

5. **Haus verschließen**
   - Alle Sicherheitsmaßnahmen zum Abschließen
   - Unterkategorien: Fenster und Türen, Schlüssel, einzelne Räume (Schlafzimmer, Büro, etc.)

6. **Sicherheit**
   - Alarmanlage, Sicherheitschecks
   - Unterkategorien: Alarmanlage

7. **Aufgaben unterwegs/Flughafen**
   - Während der Reise zu erledigende Aufgaben
   - Unterkategorien: Check-in, Gepäck, Sicherheit, Boarding

8. **Bei Ankunft im Zielhaus**
   - Aufgaben direkt nach Ankunft
   - Unterkategorien: Elektronik einschalten, Heizung/Klima, Küche, Sicherheit

---

## 🏡 VOR ORT-Szenarien

Für "Vor Ort in Niederlauterbach" und "Vor Ort in Benissa"

### Kategorien (in Reihenfolge):

1. **Spezielles**
   - Wichtige Informationen
   - Besondere Hinweise

2. **Regelmäßige Wartung**
   - Wiederkehrende Wartungsarbeiten
   - Unterkategorien: Wöchentlich, Monatlich, Saisonal, Heizung/Klima, Elektronik, Wasser

3. **Pool & Garten**
   - Poolpflege, Gartenpflege, Außenanlagen
   - Unterkategorien: Pool Pflege, Poolchemie, Rasen, Pflanzen, Bewässerung, Terrasse

4. **Haustechnik**
   - Technische Anlagen und Installationen
   - Unterkategorien: Heizung/Klima, Elektrik, Wasser/Sanitär, Gas, Alarmanlage, Rollläden

5. **Reinigung & Ordnung**
   - Haushaltsreinigung und Ordnung halten
   - Unterkategorien: Schlafzimmer, Küche, Bad, Wohnzimmer, Garage, Außenbereich, Fenster

6. **Einkaufen & Besorgungen**
   - Einkäufe und Besorgungen für den Haushalt
   - Unterkategorien: Lebensmittel, Haushalt, Poolbedarf, Garten, Werkzeug

7. **Reparaturen**
   - Reparaturen und Instandhaltung
   - Unterkategorien: Dringend, Geplant, Kleinreparaturen

8. **Sicherheit**
   - Sicherheitsaspekte und -checks
   - Unterkategorien: Alarmanlage, Schlüssel, Beleuchtung

---

## 🔄 Migration bestehender Aufgaben

Falls Sie bereits Aufgaben mit alten Kategorien haben:

### Für REISE-Aufgaben:
- `Vorbereitungen zuhause (Packen)` → `Vorbereitung Abreisehaus`
- `Sonstiges` → `Spezielles`

### Für VOR ORT-Aufgaben:
- `Hausverwaltung` → `Haustechnik`
- `Sonstiges` → `Spezielles`
- Pool-bezogene Aufgaben → `Pool & Garten`
- Wartungsaufgaben → `Regelmäßige Wartung`
- Reinigungsaufgaben → `Reinigung & Ordnung`

**Verwenden Sie die Datei `MIGRATION_KATEGORIEN.sql` für die automatische Migration.**

---

## 💡 Tipps zur Verwendung

### Unterkategorien:
- Unterkategorien werden nur angezeigt, wenn mehr als "Allgemein" zur Auswahl steht
- Sie helfen, Aufgaben innerhalb einer Kategorie weiter zu strukturieren
- Besonders nützlich bei umfangreichen Kategorien wie "Vorbereitung Abreisehaus"

### Sortierung:
- Die Kategorien werden in der App **automatisch in der oben genannten Reihenfolge** sortiert
- Diese Reihenfolge folgt dem logischen Ablauf der Tätigkeiten

### Anpassung:
- Die Kategorien sind in den Dateien definiert:
  - `components/AddTaskModal.tsx`
  - `components/TaskDetailModal.tsx`
  - `app/checklist/[scenario]/page.tsx`
- Änderungen müssen in allen drei Dateien vorgenommen werden

---

## 📝 Beispiele

### REISE-Aufgabe:
```
Titel: Kühlschrank ausräumen
Kategorie: Vorbereitung Abreisehaus
Unterkategorie: Küche
Typ: Reise
```

### VOR ORT-Aufgabe:
```
Titel: Pool reinigen und pH-Wert prüfen
Kategorie: Pool & Garten
Unterkategorie: Pool Pflege
Typ: Vor Ort
```

