'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { SCENARIOS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';

export default function HomePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [scenarioToReset, setScenarioToReset] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Check if there are active scenarios in localStorage
    const saved = localStorage.getItem('activeScenarios');
    if (saved) {
      try {
        const scenarios = JSON.parse(saved);
        setActiveScenarios(Array.isArray(scenarios) ? scenarios : []);
      } catch {
        setActiveScenarios([]);
      }
    }
  }, []);

  const handleScenarioSelect = (scenarioId: string) => {
    // Add to active scenarios if not already there
    const updated = activeScenarios.includes(scenarioId)
      ? activeScenarios
      : [...activeScenarios, scenarioId];
    localStorage.setItem('activeScenarios', JSON.stringify(updated));
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
      // Reset alle Tasks dieser Checkliste auf "nicht erledigt"
      const { error } = await (supabase.from('tasks') as any)
        .update({ done: false })
        .eq('scenario', scenarioToReset);

      if (error) throw error;

      // Entferne aus aktiven Checklisten
      const updated = activeScenarios.filter((id) => id !== scenarioToReset);
      setActiveScenarios(updated);
      localStorage.setItem('activeScenarios', JSON.stringify(updated));

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
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">🧳 Reise Checkapp</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/contacts')}
                className="btn-secondary"
              >
                📞 Kontakte
              </button>
              <button onClick={handleLogout} className="btn-secondary">
                Abmelden
              </button>
            </div>
          </div>

          {/* Active Scenarios */}
          {activeScenarios.length > 0 && (
            <div className="card mb-8 bg-blue-50 border-blue-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Aktive Checklisten ({activeScenarios.length})
              </h2>
              <div className="space-y-3">
                {activeScenarios.map((scenarioId) => {
                  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
                  if (!scenario) return null;
                  return (
                    <div
                      key={scenarioId}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{scenario.icon}</span>
                        <span className="font-medium text-gray-800">
                          {scenario.title}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetClick(scenarioId)}
                          className="px-3 py-1.5 text-sm border-2 border-gray-300 text-gray-600 rounded-lg hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-1.5"
                          title="Checkliste zurücksetzen"
                        >
                          <span className="text-base">↻</span>
                          Zurücksetzen
                        </button>
                        <button
                          onClick={() => router.push(`/checklist/${scenarioId}`)}
                          className="btn-primary text-sm"
                        >
                          Öffnen →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scenario Selection */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Szenario auswählen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="text-3xl mb-2">{scenario.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="card mt-8 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">ℹ️ Hinweis</h3>
            <p className="text-gray-600 text-sm">
              Wählen Sie ein Szenario aus, um die entsprechende Checkliste zu starten.
              Die App funktioniert auch offline - alle Änderungen werden automatisch
              synchronisiert, sobald Sie wieder online sind.
            </p>
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
        message={`Möchten Sie die Checkliste "${SCENARIOS.find(s => s.id === scenarioToReset)?.title}" wirklich zurücksetzen? Alle erledigten Aufgaben werden als "nicht erledigt" markiert und die Checkliste wird aus den aktiven Listen entfernt.`}
        confirmText={resetting ? 'Wird zurückgesetzt...' : 'Ja, zurücksetzen'}
        cancelText="Abbrechen"
        type="warning"
      />

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

