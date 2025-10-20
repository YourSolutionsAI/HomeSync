-- Aufgaben für Reise von Benissa (Spanien) nach Niederlauterbach (Frankreich)
-- Scenario: reise-ben-nl

-- HINWEIS: Das Transportmittel (Auto oder Flugzeug) wird nun über 
-- das Feld 'transport_type' festgelegt, nicht mehr über separate Szenarien.

-- ============================================
-- KATEGORIE: Vorbereitungen zuhause (Packen)
-- ============================================

-- Unterkategorie: Schlafzimmer
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Entfeuchterboxen ins Schlafzimmer', 'Entfeuchterboxen im Schlafzimmer mit Wandschränken platzieren', 'Vorbereitungen zuhause (Packen)', 'Schlafzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 1, 'Auto', false),
('Tagesdecke aufs Bett', 'Tagesdecke aus Wandschrank Schlafzimmer holen und aufs Bett legen', 'Vorbereitungen zuhause (Packen)', 'Schlafzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 2, 'Auto', false),
('Schlafzimmer Fenster kippen', 'WICHTIG: Fenster im Schlafzimmer nur kippen, nicht ganz schließen!', 'Haus verschließen', 'Schlafzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 50, 'Auto', false),
('Stecker iPhone Charger Schlafzimmer raus', 'Netzstecker iPhone Charger im Schlafzimmer ziehen', 'Vorbereitungen zuhause (Packen)', 'Schlafzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 20, 'Auto', false),
('Netzstecker Betten raus', 'Netzstecker der Betten ziehen', 'Vorbereitungen zuhause (Packen)', 'Schlafzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 15, 'Auto', false);

-- Unterkategorie: Büro
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Entfeuchterboxen ins Büro', 'Entfeuchterboxen im Büro mit Wandschränken platzieren', 'Vorbereitungen zuhause (Packen)', 'Büro', 'Benissa', 'Reise', 'reise-ben-nl', 3, 'Auto', false),
('Laptop in Wandschrank verstauen', 'Laptop im Wandschrank Büro bzw. in Garage/Gästeapartment verstauen', 'Vorbereitungen zuhause (Packen)', 'Büro', 'Benissa', 'Reise', 'reise-ben-nl', 14, 'Auto', false),
('Netzstecker Drucker und Bürogeräte raus', 'Netzstecker Drucker und andere Geräte im Büro ziehen', 'Vorbereitungen zuhause (Packen)', 'Büro', 'Benissa', 'Reise', 'reise-ben-nl', 21, 'Auto', false),
('Drucker abdecken', 'Drucker mit Abdeckung schützen', 'Vorbereitungen zuhause (Packen)', 'Büro', 'Benissa', 'Reise', 'reise-ben-nl', 22, 'Auto', false),
('Wandschrank Büro abschließen', 'Wandschrank im Büro abschließen', 'Haus verschließen', 'Büro', 'Benissa', 'Reise', 'reise-ben-nl', 51, 'Auto', false);

-- Unterkategorie: Gäste Apartment
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Entfeuchterboxen ins Gäste Apartment', 'Entfeuchterboxen im Gäste Apartment mit Wandschränken platzieren', 'Vorbereitungen zuhause (Packen)', 'Gäste Apartment', 'Benissa', 'Reise', 'reise-ben-nl', 4, 'Auto', false),
('Gästeapartment checken', 'Fenster und Klappläden im Gästeapartment prüfen und schließen', 'Vorbereitungen zuhause (Packen)', 'Gäste Apartment', 'Benissa', 'Reise', 'reise-ben-nl', 27, 'Auto', false),
('Wandschrank Gästeapartment abschließen', 'Wandschrank im Gästeapartment abschließen', 'Haus verschließen', 'Gäste Apartment', 'Benissa', 'Reise', 'reise-ben-nl', 52, 'Auto', false);

-- Unterkategorie: Küche
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Kühlschrank Küche leerräumen', 'Kühlschrank in der Küche komplett leeren', 'Vorbereitungen zuhause (Packen)', 'Küche', 'Benissa', 'Reise', 'reise-ben-nl', 5, 'Auto', false),
('Geschirr spülen', 'Alle Geschirr spülen und wegräumen', 'Vorbereitungen zuhause (Packen)', 'Küche', 'Benissa', 'Reise', 'reise-ben-nl', 8, 'Auto', false),
('Lebensmittelschrank leermachen', 'Lebensmittelschrank ausräumen, Cola/Wasser ins Auto', 'Vorbereitungen zuhause (Packen)', 'Küche', 'Benissa', 'Reise', 'reise-ben-nl', 11, 'Auto', false),
('Netzstecker Tee-/Reiskocher/Elektrogrill raus', 'Netzstecker von Tee-/Reiskocher und Elektrogrill ziehen', 'Vorbereitungen zuhause (Packen)', 'Küche', 'Benissa', 'Reise', 'reise-ben-nl', 17, 'Auto', false);

-- Unterkategorie: Hauswirtschaftsraum
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Rolladen runter Hauswirtschaftsraum', 'Rolladen im Hauswirtschaftsraum herunterfahren', 'Haus verschließen', 'Hauswirtschaftsraum', 'Benissa', 'Reise', 'reise-ben-nl', 56, 'Auto', false);

-- Unterkategorie: Garage
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Kühlschrank Garage leerräumen', 'Kühlschrank in der Garage komplett leeren', 'Vorbereitungen zuhause (Packen)', 'Garage', 'Benissa', 'Reise', 'reise-ben-nl', 6, 'Auto', false),
('Netzstecker Kühlschrank Garage raus', 'Netzstecker vom Kühlschrank in Garage ziehen und Tür öffnen', 'Vorbereitungen zuhause (Packen)', 'Garage', 'Benissa', 'Reise', 'reise-ben-nl', 7, 'Auto', false),
('Garage checken', 'Auto/Roller an Ladegerät anschließen', 'Vorbereitungen zuhause (Packen)', 'Garage', 'Benissa', 'Reise', 'reise-ben-nl', 26, 'Auto', false),
('Garage abschließen', 'Garage verschließen und abschließen', 'Haus verschließen', 'Garage', 'Benissa', 'Reise', 'reise-ben-nl', 61, 'Auto', false);

-- Unterkategorie: Wohnzimmer
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Stecker iPhone Charger Wohnzimmer raus', 'Netzstecker iPhone Charger im Wohnzimmer ziehen', 'Vorbereitungen zuhause (Packen)', 'Wohnzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 19, 'Auto', false),
('Tür Durchgang Wohnzimmer-Küche schließen', 'VOR dem Verlassen: Tür zwischen Wohnzimmer und Küche schließen!', 'Haus verschließen', 'Wohnzimmer', 'Benissa', 'Reise', 'reise-ben-nl', 62, 'Auto', false);

-- ============================================
-- KATEGORIE: Hausverwaltung
-- ============================================

-- Unterkategorie: Elektronik
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Canon Ferngläser Batterien raus', 'Batterien aus Canon Ferngläsern entfernen', 'Hausverwaltung', 'Elektronik', 'Benissa', 'Reise', 'reise-ben-nl', 9, 'Auto', false),
('Netzstecker Heißwasserboiler raus', 'Netzstecker vom Heißwasserboiler ziehen', 'Hausverwaltung', 'Elektronik', 'Benissa', 'Reise', 'reise-ben-nl', 16, 'Auto', false);

-- Unterkategorie: Heizung/Klima
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Gastherme ausschalten', 'Gastherme ausschalten und Stecker ziehen', 'Hausverwaltung', 'Heizung/Klima', 'Benissa', 'Reise', 'reise-ben-nl', 18, 'Auto', false),
('Radiatoren zudrehen', 'Alle Radiatoren zudrehen', 'Hausverwaltung', 'Heizung/Klima', 'Benissa', 'Reise', 'reise-ben-nl', 18, 'Auto', false),
('Gasflaschen zudrehen', 'Alle Gasflaschen zudrehen', 'Hausverwaltung', 'Heizung/Klima', 'Benissa', 'Reise', 'reise-ben-nl', 18, 'Auto', false);

-- Unterkategorie: Außenbereich
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Briefkasten checken', 'Briefkasten leeren und prüfen', 'Hausverwaltung', 'Außenbereich', 'Benissa', 'Reise', 'reise-ben-nl', 10, 'Auto', false),
('Polster Terrasse nach drinnen', 'Terrassenpolster ins Haus bringen', 'Vorbereitungen zuhause (Packen)', 'Außenbereich', 'Benissa', 'Reise', 'reise-ben-nl', 10, 'Auto', false),
('Alle Markisen rein', 'Alle Markisen einfahren', 'Hausverwaltung', 'Außenbereich', 'Benissa', 'Reise', 'reise-ben-nl', 12, 'Auto', false);

-- ============================================
-- KATEGORIE: Haus verschließen
-- ============================================

-- Unterkategorie: Fenster und Türen
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Seitliche Terrassentüren schließen', 'Alle seitlichen Terrassentüren schließen', 'Haus verschließen', 'Fenster und Türen', 'Benissa', 'Reise', 'reise-ben-nl', 23, 'Auto', false),
('Alle Fenster und Klappläden zu', 'ALLE Fenster und Klappläden schließen (außer Schlafzimmer kippen!)', 'Haus verschließen', 'Fenster und Türen', 'Benissa', 'Reise', 'reise-ben-nl', 54, 'Auto', false),
('Fliegengitter hoch', 'Alle Fliegengitter hochziehen (wegen Verschmutzung)', 'Haus verschließen', 'Fenster und Türen', 'Benissa', 'Reise', 'reise-ben-nl', 57, 'Auto', false),
('Alle Innentüren öffnen und fixieren', 'Alle Innentüren öffnen und fixieren (wegen Alarmanlage)', 'Haus verschließen', 'Fenster und Türen', 'Benissa', 'Reise', 'reise-ben-nl', 58, 'Auto', false);

-- Unterkategorie: Schlüssel
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Autoschlüssel in Garage deponieren', 'Schlüssel Hyundai inkl. Zulassung und Schlüssel i30 zu den anderen in Garage (Behälter Chlortabletten)', 'Haus verschließen', 'Schlüssel', 'Benissa', 'Reise', 'reise-ben-nl', 53, 'Auto', false),
('Gesamtschlüsselbund Fanadix mitnehmen', '2x Gesamtschlüsselbund Fanadix mitnehmen', 'Haus verschließen', 'Schlüssel', 'Benissa', 'Reise', 'reise-ben-nl', 59, 'Auto', false);

-- Unterkategorie: Sicherheit
INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Alarmanlage aktivieren', 'Alarmanlage einschalten bevor das Haus verlassen wird', 'Haus verschließen', 'Sicherheit', 'Benissa', 'Reise', 'reise-ben-nl', 63, 'Auto', false);

-- ============================================
-- KATEGORIE: Sonstiges
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", transport_type, done) VALUES
('Müll leeren und mitnehmen', 'Müll leeren und bei Abfahrt mitnehmen', 'Sonstiges', 'Allgemein', 'Benissa', 'Reise', 'reise-ben-nl', 60, 'Auto', false);

-- ============================================
-- WICHTIGE INFORMATIONEN (als separate Aufgabe mit Notes)
-- ============================================

INSERT INTO tasks (
    title, 
    description, 
    category, 
    subcategory, 
    location, 
    type, 
    scenario, 
    "order", 
    transport_type, 
    done,
    notes
) VALUES (
    'INFORMATION: Schlüssel-Depot',
    'Wichtige Information zum Schlüssel-Depot in der Garage',
    'Haus verschließen',
    'Schlüssel',
    'Benissa',
    'Reise',
    'reise-ben-nl',
    0,
    'Auto',
    false,
    'WICHTIG - Schlüssel-Information:

Aufgrund des versuchten Einbruchs im Dezember 2024 werden alle Schlüssel aus dem Wandschrank im Büro während unserer Abwesenheit in der Garage deponiert.

STANDORT: Rechter Schrank über der Werkbank, in dem runden Plastikbehälter mit Chlortabletten (größerer weißer Behälter mit blauer Aufschrift „Cloro Tabletas").

DORT BEFINDEN SICH:
- Alle wichtigen Schlüssel
- Schlüssel für Wandschränke „Büro" und „Gäste Apartment"

HAUPTSCHLÜSSEL:
Die beiden Hauptschlüssel haben ab sofort neben dem Zugang über die Küche noch einen separaten Schlüsselsatz für das Gäste Apartment. Dies nur zur Sicherheit, falls die Fernbedienung für das Garagentor nicht funktioniert.

IM WANDSCHRANK BÜRO:
Verbleiben nur alte Schlüssel ohne Funktion sowie unwichtige Schlüssel (z.B. Poolhaus).'
);

-- HINWEIS: 
-- Diese Aufgaben sind für scenario 'reise-ben-nl' erstellt.
-- Das Transportmittel (Auto/Flugzeug) wird über das Feld 'transport_type' gesteuert.
-- Sie können für einzelne Aufgaben 'transport_type' auf 'Flugzeug' oder 'Auto' setzen,
-- oder in der App über das Dropdown auswählen.

