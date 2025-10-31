'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { SCENARIOS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import DownloadPdfModal from '@/components/DownloadPdfModal';
import HelpModal from '@/components/HelpModal';
import Tooltip from '@/components/Tooltip';
import { 
  getUserActiveScenarios, 
  addActiveScenario, 
  removeActiveScenario,
  syncActiveScenarios 
} from '@/lib/active-scenarios';

export default function HomePage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [scenarioToReset, setScenarioToReset] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const loadActiveScenarios = async () => {
      if (user) {
        setLoading(true);
        try {
          // Synchronisiere aktive Szenarien aus der Datenbank
          const scenarios = await syncActiveScenarios(user.id);
          setActiveScenarios(scenarios);
        } catch (error) {
          console.error('Fehler beim Laden der aktiven Szenarien:', error);
          setActiveScenarios([]);
        } finally {
          setLoading(false);
        }
      } else {
        setActiveScenarios([]);
        setLoading(false);
      }
    };

    loadActiveScenarios();
  }, [user]);

  const handleScenarioSelect = async (scenarioId: string) => {
    if (!user) return;
    
    try {
      // Füge zu aktiven Szenarien hinzu, falls noch nicht vorhanden
      if (!activeScenarios.includes(scenarioId)) {
        const success = await addActiveScenario(user.id, scenarioId);
        if (success) {
          const updated = [...activeScenarios, scenarioId];
          setActiveScenarios(updated);
        }
      }
      
      router.push(`/checklist/${scenarioId}`);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des aktiven Szenarios:', error);
      setToast({
        message: 'Fehler beim Aktivieren der Checkliste',
        type: 'error',
      });
    }
  };

  const handleResetClick = (scenarioId: string) => {
    setScenarioToReset(scenarioId);
    setShowResetModal(true);
  };

  const handleResetConfirm = async () => {
    if (!scenarioToReset) return;

    setResetting(true);
    try {
      if (!user) {
        throw new Error('Benutzer nicht eingeloggt');
      }

      // Hole alle Task-IDs für dieses Szenario
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id')
        .eq('scenario', scenarioToReset);

      const taskIds = (tasksData || []).map((t: { id: string }) => t.id);
      
      if (taskIds.length > 0) {
        // Lösche alle Status-Einträge des aktuellen Benutzers für diese Tasks
        const { error } = await (supabase.from('user_task_status') as any)
          .delete()
          .eq('user_id', user.id)
          .in('task_id', taskIds);

        if (error) throw error;
      }

      // Entferne aus aktiven Checklisten
      const success = await removeActiveScenario(user.id, scenarioToReset);
      if (success) {
        const updated = activeScenarios.filter((id) => id !== scenarioToReset);
        setActiveScenarios(updated);
      }

      // Erfolgsmeldung
      setToast({
        message: 'Checkliste wurde erfolgreich zurückgesetzt!',
        type: 'success',
      });
    } catch (error) {
      console.error('Fehler beim Zurücksetzen:', error);
      setToast({
        message: 'Fehler beim Zurücksetzen der Checkliste',
        type: 'error',
      });
    } finally {
      setResetting(false);
      setScenarioToReset(null);
    }
  };

  const handleLogout = async () => {
    try {
      // Versuche abzumelden - die signOut Funktion ist jetzt robust genug
      await signOut();
      
      // Lokalen Storage für diesen Benutzer löschen (Fallback-Daten)
      if (user?.id) {
        localStorage.removeItem(`activeScenarios_${user.id}`);
      }
      
      // Zur Login-Seite weiterleiten
      router.push('/login');

    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
      // Selbst wenn ein Fehler auftritt, zur Sicherheit weiterleiten
      router.push('/login');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🧳 Reise Checkliste
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Verwalte deine Reisen zwischen Niederlauterbach und Benissa</p>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <Tooltip text="Hilfe und Anleitung anzeigen">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="btn-secondary text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
                >
                  <span className="text-base sm:text-lg">❓</span>
                  <span className="hidden xs:inline">Hilfe</span>
                </button>
              </Tooltip>
              <Tooltip text="Alle aktiven Checklisten als PDF herunterladen">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="btn-secondary text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
                >
                  <span className="text-base sm:text-lg">📄</span>
                  <span className="hidden xs:inline">PDFs</span>
                </button>
              </Tooltip>
              <Tooltip text="Vom aktuellen Konto abmelden">
                <button 
                  onClick={handleLogout} 
                  className="btn-secondary text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
                >
                  <span className="hidden xs:inline">Abmelden</span>
                  <span className="xs:hidden">↪</span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Active Scenarios */}
          {activeScenarios.length > 0 && (
            <div className="card mb-6 sm:mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 fade-in">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">📋</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  Aktive Checklisten ({activeScenarios.length})
                </h2>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {activeScenarios.map((scenarioId, index) => {
                  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
                  if (!scenario) return null;
                  return (
                    <div
                      key={scenarioId}
                      className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 bg-white rounded-lg sm:rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Titel */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">{scenario.icon}</span>
                        <span className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg truncate">
                          {scenario.title}
                        </span>
                      </div>
                      
                      {/* Buttons */}
                      <div className="flex gap-1.5 sm:gap-2 xs:flex-shrink-0">
                        <Tooltip text="Setzt alle Aufgaben zurück und entfernt die Liste von hier.">
                          <button
                            onClick={() => handleResetClick(scenarioId)}
                            className="flex-1 xs:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 text-gray-600 rounded-lg sm:rounded-xl hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap font-medium"
                          >
                            <span className="text-base sm:text-lg">↻</span>
                            <span className="hidden sm:inline">Zurücksetzen</span>
                            <span className="sm:hidden">Reset</span>
                          </button>
                        </Tooltip>
                        <Tooltip text="Checkliste öffnen und Aufgaben bearbeiten.">
                          <button
                            onClick={() => router.push(`/checklist/${scenarioId}`)}
                            className="flex-1 xs:flex-none btn-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-6 py-1.5 sm:py-3"
                          >
                            Öffnen →
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scenario Selection */}
          <div className="card fade-in">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
              Szenario auswählen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {SCENARIOS.filter(scenario => !activeScenarios.includes(scenario.id)).map((scenario, index) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className="text-left p-4 sm:p-5 md:p-6 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all transform hover:scale-105 active:scale-95 slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{scenario.icon}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                    {scenario.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="card mt-6 sm:mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 fade-in">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">ℹ️</span>
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-gray-800">Offline-fähig</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700">
                  Die App funktioniert auch offline - alle Änderungen werden automatisch synchronisiert, sobald du wieder online bist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setScenarioToReset(null);
        }}
        onConfirm={handleResetConfirm}
        title="Checkliste zurücksetzen?"
        message={`Möchtest Du die Checkliste "${SCENARIOS.find(s => s.id === scenarioToReset)?.title}" wirklich zurücksetzen? Alle erledigten Aufgaben werden als "nicht erledigt" markiert und die Checkliste wird aus den aktiven Listen entfernt.`}
        confirmText={resetting ? 'Wird zurückgesetzt...' : 'Ja, zurücksetzen'}
        cancelText="Abbrechen"
        type="warning"
      />

      {/* PDF Download Modal */}
      <DownloadPdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        activeScenarioIds={activeScenarios}
      />

      {/* Help Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthGuard>
  );
}

