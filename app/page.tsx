'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { SCENARIOS } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an active scenario in localStorage
    const saved = localStorage.getItem('activeScenario');
    if (saved) {
      setActiveScenario(saved);
    }
  }, []);

  const handleScenarioSelect = (scenarioId: string) => {
    localStorage.setItem('activeScenario', scenarioId);
    router.push(`/checklist/${scenarioId}`);
  };

  const handleContinue = () => {
    if (activeScenario) {
      router.push(`/checklist/${activeScenario}`);
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

          {/* Active Scenario */}
          {activeScenario && (
            <div className="card mb-8 bg-blue-50 border-blue-300">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Aktive Checkliste
              </h2>
              <p className="text-gray-600 mb-4">
                Sie haben eine laufende Checkliste:{' '}
                <strong>
                  {SCENARIOS.find((s) => s.id === activeScenario)?.title}
                </strong>
              </p>
              <button onClick={handleContinue} className="btn-primary">
                Fortfahren →
              </button>
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
    </AuthGuard>
  );
}

