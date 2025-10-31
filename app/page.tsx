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

export default function HomePage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [scenarioToReset, setScenarioToReset] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    // Check if there are active scenarios in localStorage - benutzerspezifisch
    if (user) {
      const saved = localStorage.getItem(`activeScenarios_${user.id}`);
      if (saved) {
        try {
          const scenarios = JSON.parse(saved);
          setActiveScenarios(Array.isArray(scenarios) ? scenarios : []);
        } catch {
          setActiveScenarios([]);
        }
      } else {
        setActiveScenarios([]);
      }
    } else {
      setActiveScenarios([]);
    }
  }, [user]);

  const handleScenarioSelect = (scenarioId: string) => {
    if (!user) return;
    // Add to active scenarios if not already there - benutzerspezifisch
    const updated = activeScenarios.includes(scenarioId)
      ? activeScenarios
      : [...activeScenarios, scenarioId];
    setActiveScenarios(updated);
    localStorage.setItem(`activeScenarios_${user.id}`, JSON.stringify(updated));
    router.push(`/checklist/${scenarioId}`);
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

      // Entferne aus aktiven Checklisten - benutzerspezifisch
      const updated = activeScenarios.filter((id) => id !== scenarioToReset);
      setActiveScenarios(updated);
      localStorage.setItem(`activeScenarios_${user.id}`, JSON.stringify(updated));

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
      // Versuche Abmelden (funktioniert auch ohne Session)
      try {
        await signOut();
      } catch (error) {
        // Ignoriere Fehler - Session könnte bereits abgelaufen sein
        console.log('SignOut-Fehler ignoriert (möglicherweise bereits abgemeldet):', error);
      }

      // Bereinige lokale Daten
      if (user) {
        // Entferne alle benutzerspezifischen localStorage-Einträge
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`activeScenarios_${user.id}`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Entferne auch veraltete Einträge für Rückwärtskompatibilität
        localStorage.removeItem('activeScenario');
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🧳 Reise Checkliste
              </h1>
              <p className="text-gray-600 text-sm mt-1">Verwalte deine Reisen zwischen Niederlauterbach und Benissa</p>
            </div>
            <div className="flex gap-2">
              <Tooltip text="Hilfe und Anleitung anzeigen">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="btn-secondary text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span className="text-lg">❓</span>
                  <span className="hidden sm:inline">Hilfe</span>
                </button>
              </Tooltip>
              <Tooltip text="Alle aktiven Checklisten als PDF herunterladen">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="btn-secondary text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span className="text-lg">📄</span>
                  <span className="hidden sm:inline">PDFs</span>
                </button>
              </Tooltip>
              <Tooltip text="Vom aktuellen Konto abmelden">
                <button 
                  onClick={handleLogout} 
                  className="btn-secondary text-sm sm:text-base"
                >
                  Abmelden
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Active Scenarios */}
          {activeScenarios.length > 0 && (
            <div className="card mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📋</span>
                <h2 className="text-2xl font-bold text-gray-800">
                  Aktive Checklisten ({activeScenarios.length})
                </h2>
              </div>
              <div className="space-y-3">
                {activeScenarios.map((scenarioId, index) => {
                  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
                  if (!scenario) return null;
                  return (
                    <div
                      key={scenarioId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Titel */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-3xl flex-shrink-0">{scenario.icon}</span>
                        <span className="font-semibold text-gray-800 text-lg truncate">
                          {scenario.title}
                        </span>
                      </div>
                      
                      {/* Buttons */}
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Tooltip text="Setzt alle Aufgaben zurück und entfernt die Liste von hier.">
                          <button
                            onClick={() => handleResetClick(scenarioId)}
                            className="flex-1 sm:flex-none px-4 py-2 text-sm border-2 border-gray-300 text-gray-600 rounded-xl hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap font-medium"
                          >
                            <span className="text-lg">↻</span>
                            <span className="hidden xs:inline">Zurücksetzen</span>
                          </button>
                        </Tooltip>
                        <Tooltip text="Checkliste öffnen und Aufgaben bearbeiten.">
                          <button
                            onClick={() => router.push(`/checklist/${scenarioId}`)}
                            className="flex-1 sm:flex-none btn-primary text-sm whitespace-nowrap"
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Szenario auswählen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIOS.filter(scenario => !activeScenarios.includes(scenario.id)).map((scenario, index) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all transform hover:scale-105 slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-3">{scenario.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="card mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">Offline-fähig</h3>
                <p className="text-gray-700">
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

