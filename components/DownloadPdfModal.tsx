'use client';

import { useState, useEffect } from 'react';
import { SCENARIOS, Scenario, Task } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { generateChecklistPDF } from '@/lib/pdf-generator';
import { getTasksByScenario } from '@/lib/offline-storage';

interface DownloadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioIds: string[];
}

export default function DownloadPdfModal({
  isOpen,
  onClose,
  activeScenarioIds,
}: DownloadPdfModalProps) {
  const { user } = useAuth();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(activeScenarioIds);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (isOpen) {
      setSelectedScenarios(activeScenarioIds);
    }
  }, [isOpen, activeScenarioIds]);

  const handleToggleScenario = (scenarioId: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleDownload = async () => {
    if (!user || selectedScenarios.length === 0) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: selectedScenarios.length });

    for (let i = 0; i < selectedScenarios.length; i++) {
      const scenarioId = selectedScenarios[i];
      setProgress({ current: i + 1, total: selectedScenarios.length });
      
      const scenario = SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) continue;

      try {
        // Daten für das PDF abrufen
        const online = navigator.onLine;
        let tasks: Task[] = [];
        
        if (online) {
            const { data: tasksData } = await supabase.from('tasks').select('*').eq('scenario', scenarioId).returns<Task[]>();
            const { data: statusData } = await supabase.from('user_task_status').select('task_id, done').eq('user_id', user.id).returns<{ task_id: string; done: boolean; }[]>();
            const statusMap = (statusData || []).reduce((acc, status) => ({ ...acc, [status.task_id]: status.done }), {} as Record<string, boolean>);
            tasks = (tasksData || []).map(t => ({ ...t, done: statusMap[t.id] ?? false }));
        } else {
            tasks = await getTasksByScenario(scenarioId);
            // Offline-Status muss hier noch implementiert werden falls nötig
        }
        
        // Tasks gruppieren und sortieren (vereinfachte Logik hier, sollte idealerweise aus einer zentralen Quelle kommen)
        const groupedTasks = tasks.reduce((acc, task) => {
            const cat = task.category || 'Allgemein';
            const sub = task.subcategory || 'Allgemein';
            if (!acc[cat]) acc[cat] = {};
            if (!acc[cat][sub]) acc[cat][sub] = [];
            acc[cat][sub].push(task);
            return acc;
        }, {} as Record<string, Record<string, Task[]>>);

        const categoryOrder = Object.keys(groupedTasks); // Vereinfacht, für Pro-Layout ggf. anpassen
        const getSubcategoryOrder = (cat: string) => Object.keys(groupedTasks[cat] || {});

        await generateChecklistPDF(scenario, tasks, groupedTasks, categoryOrder, getSubcategoryOrder);

      } catch (error) {
        console.error(`Fehler beim Erstellen des PDFs für ${scenario.title}:`, error);
        alert(`Ein Fehler ist aufgetreten beim Erstellen des PDFs für "${scenario.title}".`);
        break; 
      }
    }

    setIsGenerating(false);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-slideUp">
        <div className="p-4 sm:p-6 md:p-8 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Checklisten als PDF herunterladen
            </h2>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl transition-transform hover:scale-110 hover:rotate-90 disabled:opacity-50 flex-shrink-0 ml-2"
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Wähle die Checklisten aus, die du als druckfertiges PDF exportieren möchtest.</p>
        </div>

        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
          <div className="space-y-3 sm:space-y-4">
            {SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => handleToggleScenario(scenario.id)}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedScenarios.includes(scenario.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 ${
                    selectedScenarios.includes(scenario.id)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-400'
                  }`}
                >
                  {selectedScenarios.includes(scenario.id) && '✓'}
                </div>
                <span className="text-2xl sm:text-3xl">{scenario.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">{scenario.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{scenario.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 border-t bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
          {isGenerating ? (
            <div className="text-center">
              <p className="font-semibold text-blue-700 text-sm sm:text-base">PDFs werden erstellt...</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                ({progress.current} / {progress.total}) {SCENARIOS.find(s => s.id === selectedScenarios[progress.current - 1])?.title}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mt-2">
                <div className="bg-blue-600 h-2 sm:h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={onClose}
                className="btn-secondary flex-1 text-sm sm:text-base py-2.5 sm:py-3"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDownload}
                disabled={selectedScenarios.length === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2.5 sm:py-3"
              >
                {selectedScenarios.length} Liste{selectedScenarios.length !== 1 && 'n'} herunterladen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
