
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Willkommen bei der Reise Check-App!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
            title="Schließen"
            aria-label="Schließen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3">
            <a
                href="https://wa.me/4915906261555?text=Hallo%20Jonas%2C%20ich%20habe%20eine%20Frage%20zur%20Reise-Check-App."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full sm:w-auto text-center text-sm sm:text-base"
            >
                Whatsapp an Jonas
            </a>
            <a
                href="tel:+4915906261555"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full sm:w-auto text-center text-sm sm:text-base"
            >
                Jonas anrufen
            </a>
        </div>

        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base">
            <p>
              Diese App hilft dir, deine Reisen zwischen <strong>Niederlauterbach</strong> und <strong>Benissa</strong> zu organisieren.
              Vergiss nie wieder wichtige Aufgaben!
            </p>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">So funktioniert's:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Szenario auswählen:</strong> Wähle auf der Startseite aus, welche Reise du planst (z.B. "Von Niederlauterbach nach Benissa").
                  Dadurch wird eine neue, aktive Checkliste für dich erstellt.
                </li>
                <li>
                  <strong>Checkliste bearbeiten:</strong> Öffne eine aktive Checkliste. Hier siehst du alle Aufgaben, sortiert nach Kategorien.
                  Du kannst Aufgaben als erledigt markieren, neue Aufgaben hinzufügen oder bestehende bearbeiten und löschen.
                </li>
                <li>
                  <strong>Aktive Checklisten:</strong> Alle deine ausgewählten Szenarien erscheinen als "Aktive Checklisten" auf der Startseite.
                  So hast du immer einen schnellen Zugriff.
                </li>
                <li>
                  <strong>Checkliste zurücksetzen:</strong> Wenn du eine Reise abgeschlossen hast, kannst du die Checkliste zurücksetzen.
                  Alle Aufgaben werden auf "nicht erledigt" gesetzt und die Liste wird von deinen aktiven Checklisten entfernt.
                </li>
                <li>
                  <strong>PDF-Download:</strong> Du kannst deine Checklisten als PDF-Datei herunterladen, um sie auszudrucken oder offline parat zu haben.
                </li>
                <li>
                  <strong>Offline-Funktionalität:</strong> Die App ist offline-fähig! Alle Änderungen, die du ohne Internetverbindung machst, werden automatisch synchronisiert, sobald du wieder online bist.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">Tipps für die Nutzung:</h3>
               <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Fahre mit der Maus über verschiedene Buttons und Symbole. Oft erscheinen kleine Hilfetexte (Tooltips), die die Funktion erklären.</li>
                <li>Du kannst für jede Aufgabe detaillierte Notizen und sogar Bilder hinzufügen. Klicke dazu einfach auf eine Aufgabe.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl sm:rounded-b-2xl flex flex-col sm:flex-row justify-end items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="bg-[#9966CC] hover:bg-[#8A5FB5] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full sm:w-auto text-sm sm:text-base"
          >
            Verstanden!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
