-- ============================================
-- AUFGABEN: Reise Niederlauterbach → Benissa
-- ============================================
-- Szenario: reise-nl-ben
-- Location: Niederlauterbach (Abreiseort)
-- Type: Reise
-- 
-- HINWEIS: Führen Sie dieses SQL in Supabase aus, um die Aufgaben hinzuzufügen
-- ============================================

-- ============================================
-- KATEGORIE: Spezielles - Medikamente
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Medikamente einpacken', 'Mirtazapin, Schlaftabs Dalmadorm, Trama, Kortison, Minocyclin!!!', 'Spezielles', 'Medikamente', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 1, false, null),
('Nahrungsergänzungsmittel einpacken', 'Nahrungsergänzungsmittel einsortieren und mitnehmen', 'Spezielles', 'Medikamente', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 2, false, null),
('Reise-Kulturbeutel vorbereiten', 'Mirtazapin, Schlaftabs Dalmadorm, Trama für 2 Übernachtungen', 'Spezielles', 'Medikamente', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 3, false, null),
('Info: Medikamente in Benissa vorhanden', 'Storage room: 2 Pariboi, Salbutamol, Sanasthmax, Mucoclear, Vitaminspritzen für 10 Tage (20x), Nasenspülsalz, Nasendusche (Kulturbeutel). Wohnung 9B Waschtisch: 2 Levofloxacin 500mg (26 Stck.), Cefuhexal 500mg (17 Stck.), Co-Fluampicil 250mg (112 Stck.). Eingerichteter Kulturbeutel vorhanden.', 'Spezielles', 'Wichtige Informationen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 4, false, null);

-- ============================================
-- KATEGORIE: Spezielles - Dokumente & Wertsachen
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Portemonnaie abspecken', 'Zulassung GA, DHL Karte usw. raus', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 5, false, null),
('Personalausweis & Pass KD', 'Perso KD, Pass KD wegen ev. CAIXA Termin!', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 6, false, null),
('Fahrzeugpapiere', 'Zulassung, Führerschein', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 7, false, null),
('Bargeld & Buchungsbestätigungen', 'Geld, Buchungsbestätigungen mitnehmen', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 8, false, null),
('Pass & Aufenthaltsgenehmigung Li', 'Pass Li, Aufenthaltsgenehmigung Li', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 9, false, null),
('Impfpässe!!', 'Impfpässe mitnehmen (WICHTIG!)', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 10, false, null),
('Kreditkarte Visa', '1x Kreditkarte Visa (MC = Handy - Apple Pay)', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 11, false, null),
('2x EC Karte', 'BBB und Caixa', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 12, false, null),
('Kleines Portemonnaie', 'Kleines Portemonnaie einpacken', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 13, false, null),
('Geld für Juan (Pool)', '800 € - besser in Spanien abheben vom spanischen Konto', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 14, false, null),
('ChipTan BBBank', 'ChipTan BBBank (in NLB Schreibtischschublade rechts)', 'Spezielles', 'Dokumente & Wertsachen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 15, false, null);

-- ============================================
-- KATEGORIE: Spezielles - Schlüssel
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Autoschlüssel 2x', '2 Autoschlüssel mitnehmen', 'Spezielles', 'Schlüssel', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 16, false, null),
('Schlüssel Fanadix 2x', '2 Schlüssel für Fanadix (Benissa)', 'Spezielles', 'Schlüssel', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 17, false, null),
('Info: Schlüssel Honda', 'Schlüssel Honda ist je 2x im Büro vorhanden', 'Spezielles', 'Wichtige Informationen', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 18, false, null),
('Beide Schlüssel Kassette weg', 'Kassettenschlüssel sicher verwahren', 'Haus verschließen', 'Schlüssel', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 19, false, null);

-- ============================================
-- KATEGORIE: Vor der Abreise - Sonstiges
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Rucksack einpacken', 'Rucksack für die Reise vorbereiten', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 20, false, null),
('Ersatzbrillen einpacken', 'K: Handschuhfach Auto / Li: hat selbst', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 21, false, null),
('Sonnenclip überprüfen', 'Sonnenclip liegt im Handschuhfach Hyundai', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 22, false, null),
('Hörgerät-Zubehör einpacken', 'Hörgerät, Reinigungsgerät, Ersatzbatterien usw.', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 23, false, null),
('Kopfhörer K & L einpacken', 'Noise Cancelling Kopfhörer für beide', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 24, false, null),
('Elektronik einpacken', 'iPhone KD/Li, 2x iPad klein (wg. WELT!) und groß K & L, Macbook, DJI Pocket 2, DJI Osmo Li', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 25, false, null),
('Powerbanks einpacken', 'Powerbanks in Rucksack', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 26, false, null),
('1 Paar dicke lange Socken', 'Für Flugzeug einpacken', 'Vor der Abreise', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 27, false, null);

-- ============================================
-- KATEGORIE: Am Abreisetag - Verschiedene Räume
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Drucker abdecken', 'Drucker im Büro abdecken', 'Am Abreisetag', 'Büro', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 28, false, null),
('Crosstrainer & Laufband abdecken', 'Beide Fitnessgeräte abdecken', 'Am Abreisetag', 'Hobbyraum', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 29, false, null),
('Kühlschrank leerräumen', 'Alle verderblichen Lebensmittel entfernen', 'Am Abreisetag', 'Küche', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 30, false, null),
('Geschirr spülen', 'Alles spülen und wegräumen', 'Am Abreisetag', 'Küche', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 31, false, null),
('Steckdosen ziehen', 'Teekocher, Reiskocher, Fernseher usw. ausstecken', 'Am Abreisetag', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 32, false, null),
('Mülleimer leeren', 'Alle Mülleimer leeren', 'Am Abreisetag', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 33, false, null),
('Briefkasten', 'Briefkasten leeren/Nachsendung organisieren', 'Am Abreisetag', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 34, false, null),
('Info: Postnachsendungen', 'Umschläge für Postnachsendungen sind unter dem Dach NLB, Zugang Gäste WC', 'Am Abreisetag', 'Allgemein', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 35, false, null);

-- ============================================
-- KATEGORIE: Hausverwaltung
-- ============================================

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Heizung regulieren', 'Ggf. Heizung an- bzw. abstellen', 'Hausverwaltung', 'Heizung/Klima', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 36, false, null),
('Warmwasser auf 10 Grad', 'Warmwasser auf 10 Grad (kann nicht abgestellt werden)', 'Hausverwaltung', 'Wasser', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 37, false, null),
('Wasserleitung Garten leeren', 'Wasserleitung Garten leeren, abstellen (Gefriergefahr)', 'Hausverwaltung', 'Außenbereich', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 38, false, null),
('Pumpe Wasser Terrasse abstellen', 'Stecker ziehen von Wasserpumpe Terrasse', 'Hausverwaltung', 'Außenbereich', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 39, false, null);

-- ============================================
-- KATEGORIE: Aufgaben unterwegs/Flughafen - NUR FÜR AUTO
-- ============================================
-- Diese Aufgaben erscheinen nur, wenn Transportmittel = Auto

INSERT INTO tasks (title, description, category, subcategory, location, type, scenario, "order", done, transport_type) VALUES
('Badge anbringen', 'Maut-Badge im Auto anbringen', 'Spezielles', 'Auto-Vorbereitung', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 40, false, 'Auto'),
('Ersatzbrille ins Auto', 'Ersatzbrillen im Auto platzieren', 'Spezielles', 'Auto-Vorbereitung', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 41, false, 'Auto'),
('Getränke & Verpflegung', 'Getränke, Obst, Tee, Kaffee, Knabbereien ins Auto', 'Spezielles', 'Auto-Vorbereitung', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 42, false, 'Auto'),
('Komfort-Items ins Auto', 'Kissen, Decke ins Auto', 'Spezielles', 'Auto-Vorbereitung', 'Niederlauterbach', 'Reise', 'reise-nl-ben', 43, false, 'Auto');

-- ============================================
-- ZUSAMMENFASSUNG
-- ============================================
-- Kategorien verwendet:
--   - Spezielles (mit Unterkategorien: Medikamente, Dokumente & Wertsachen, Schlüssel, Auto-Vorbereitung, Wichtige Informationen)
--   - Vor der Abreise (Allgemein)
--   - Am Abreisetag (Büro, Hobbyraum, Küche, Allgemein)
--   - Hausverwaltung (Heizung/Klima, Wasser, Außenbereich)
--   - Haus verschließen (Schlüssel)
--
-- Transport-Type:
--   - null = Immer anzeigen
--   - 'Auto' = Nur bei Auto-Reise anzeigen
--   - 'Flugzeug' = Nur bei Flug-Reise anzeigen
--
-- ============================================
-- WICHTIG: Neue Unterkategorien
-- ============================================
-- Diese neuen Unterkategorien wurden hinzugefügt:
--   - Spezielles > Medikamente
--   - Spezielles > Dokumente & Wertsachen
--   - Spezielles > Schlüssel
--   - Spezielles > Auto-Vorbereitung
--
-- Diese werden automatisch in der App angezeigt!
-- ============================================

