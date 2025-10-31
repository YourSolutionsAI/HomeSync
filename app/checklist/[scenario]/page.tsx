'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Task, SCENARIOS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import TaskItem from '@/components/TaskItem';
import TaskDetailModal from '@/components/TaskDetailModal';
import AddTaskModal from '@/components/AddTaskModal';
import {
  saveTasks,
  getTasksByScenario,
  updateTaskStatusOffline,
  getUserTaskStatusOffline,
  saveUserTaskStatusOffline,
  isOnline,
} from '@/lib/offline-storage';
import { generateChecklistPDF } from '@/lib/pdf-generator';
import { addActiveScenario, removeActiveScenario } from '@/lib/active-scenarios';
import Tooltip from '@/components/Tooltip';

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const scenarioId = params.scenario as string;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [online, setOnline] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setOnline(isOnline());
    
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const initializeScenario = async () => {
      if (scenario && user) {
        await loadData();
        
        // Füge Checkliste zu aktiven Checklisten hinzu, falls noch nicht vorhanden
        try {
          await addActiveScenario(user.id, scenarioId);
        } catch (error) {
          console.error('Fehler beim Hinzufügen des aktiven Szenarios:', error);
        }
      }
    };

    initializeScenario();
  }, [scenario, user, scenarioId]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      if (online) {
        // Load tasks from Supabase (ohne done Feld, da das jetzt in user_task_status ist)
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('scenario', scenarioId)
          .order('order', { ascending: true });

        if (tasksError) throw tasksError;

        // Load user-specific task status from user_task_status
        const taskIds = (tasksData || []).map((t: { id: string }) => t.id);
        let statusMap: Record<string, boolean> = {};
        let statusData: ({ task_id: string; done: boolean; }[] | null) = null;
        
        if (taskIds.length > 0) {
          const { data, error: statusError } = await supabase
            .from('user_task_status')
            .select('task_id, done')
            .eq('user_id', user.id)
            .in('task_id', taskIds);

          statusData = data;

          if (statusError) {
            console.error('Fehler beim Laden der Status:', statusError);
          } else {
            // Erstelle eine Map für schnellen Zugriff
            statusMap = (data || []).reduce((acc, status: { task_id: string, done: boolean }) => {
              acc[status.task_id] = status.done;
              return acc;
            }, {} as Record<string, boolean>);
          }
        }

        // Kombiniere Tasks mit Status (default: false wenn kein Status vorhanden)
        const tasksWithStatus = (tasksData || []).map((task: Omit<Task, 'done'>) => ({
          ...task,
          done: statusMap[task.id] ?? false
        }));

        setTasks(tasksWithStatus);

        // Save to offline storage
        if (tasksData) await saveTasks(tasksData);
        if (statusData && statusData.length > 0) {
          await saveUserTaskStatusOffline(statusData.map((s: {task_id: string, done: boolean}) => ({
            id: `${user.id}-${s.task_id}`, // Generiere ID für Offline-Speicherung
            user_id: user.id,
            task_id: s.task_id,
            done: s.done,
            updated_at: new Date().toISOString()
          })));
        }
      } else {
        // Load from offline storage
        const offlineTasks = await getTasksByScenario(scenarioId);
        const offlineStatuses = await getUserTaskStatusOffline(user.id, scenarioId);
        
        // Erstelle Status-Map
        const statusMap = offlineStatuses.reduce((acc, status) => {
          acc[status.task_id] = status.done;
          return acc;
        }, {} as Record<string, boolean>);
        
        // Kombiniere Tasks mit Status
        const tasksWithStatus = offlineTasks.map(task => ({
          ...task,
          done: statusMap[task.id] ?? false
        }));
        
        setTasks(tasksWithStatus);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newDoneStatus = !task.done;
    
    // Update locally immediately
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: newDoneStatus } : t)));
    
    // Save offline status
    await updateTaskStatusOffline(user.id, taskId, newDoneStatus);

    // Update in Supabase if online
    if (online) {
      try {
        // Upsert: Insert wenn nicht vorhanden, Update wenn vorhanden
        const { error } = await (supabase.from('user_task_status') as any)
          .upsert({
            user_id: user.id,
            task_id: taskId,
            done: newDoneStatus,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,task_id'
          });
        
        if (error) throw error;
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Status:', error);
        // Rollback local state bei Fehler
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: !newDoneStatus } : t)));
      }
    }
  };

  const handleReset = async () => {
    if (!user) return;
    
    if (!confirm('Möchtest Du die Checkliste wirklich zurücksetzen?')) {
      return;
    }

    try {
      if (online) {
        // Hole alle Task-IDs für dieses Szenario
        const taskIds = tasks.map(t => t.id);
        
        if (taskIds.length > 0) {
          // Lösche alle Status-Einträge des aktuellen Benutzers für diese Tasks
          const { error } = await (supabase.from('user_task_status') as any)
            .delete()
            .eq('user_id', user.id)
            .in('task_id', taskIds);
          
          if (error) throw error;
        }
      }

      // Reset locally
      const resetTasks = tasks.map((t) => ({ ...t, done: false }));
      setTasks(resetTasks);
      
      // Reset offline status
      const taskIds = tasks.map(t => t.id);
      for (const taskId of taskIds) {
        await updateTaskStatusOffline(user.id, taskId, false);
      }

      // Remove from active scenarios
      if (user) {
        try {
          await removeActiveScenario(user.id, scenarioId);
        } catch (error) {
          console.error('Fehler beim Entfernen des aktiven Szenarios:', error);
        }
        // Also remove old single scenario for backwards compatibility
        localStorage.removeItem('activeScenario');
      }
      
      router.push('/');
    } catch (error) {
      console.error('Fehler beim Zurücksetzen:', error);
    }
  };

  const handleDownloadPdf = async () => {
    if (!scenario || isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    try {
      // Wir übergeben die bereits gruppierten und sortierten Daten an die PDF-Funktion
      await generateChecklistPDF(
        scenario,
        tasks,
        groupedTasks,
        sortedCategories,
        (category) => getSortedSubcategories(category, Object.keys(groupedTasks[category] || {}))
      );
    } catch (error) {
      console.error("Fehler beim Erstellen des PDFs:", error);
      alert("Das PDF konnte nicht erstellt werden.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const toggleSubcategory = (subcategoryKey: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryKey]: !prev[subcategoryKey]
    }));
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Kategorie-Reihenfolge basierend auf Szenario-Typ
  const isVorOrt = scenario?.type === 'Vor Ort';
  
  const CATEGORY_ORDER_REISE = [
    'Spezielles',
    'Vor der Abreise',
    'Am Abreisetag',
    'Hausverwaltung',
    'Haus verschließen',
    'Sicherheit',
    'Aufgaben unterwegs/Flughafen',
    'Bei Ankunft im Zielhaus',
  ];

  const CATEGORY_ORDER_VOR_ORT = [
    'Spezielles',
    'Regelmäßige Wartung',
    'Pool & Garten',
    'Haustechnik',
    'Reinigung & Ordnung',
    'Einkaufen & Besorgungen',
    'Reparaturen',
    'Sicherheit',
  ];

  const CATEGORY_ORDER = isVorOrt ? CATEGORY_ORDER_VOR_ORT : CATEGORY_ORDER_REISE;

  // Räume für Benissa
  const ROOMS_BENISSA = [
    'Küche', 'Schlafzimmer', 'Wohnzimmer', 'Balkon', 'Hauswirtschaftsraum',
    'Gäste WC', 'Außenbereich', 'Pool', 'Garage', 'Büro', 'Gäste Appartment', 'Allgemein'
  ];

  // Räume für Niederlauterbach
  const ROOMS_NIEDERLAUTERBACH = [
    'Schlafzimmer', 'Hobbyraum', 'WC 1. Stock', 'Badezimmer', 'Büro',
    'Küche', 'Ankleidezimmer', 'Wohnzimmer', 'Terrasse', 'Außenbereich',
    'Garage', 'Treppenhaus Garage', 'Allgemein'
  ];

  // Unterkategorie-Reihenfolge basierend auf Location und Kategorie
  const getSubcategoryOrder = (category: string): string[] => {
    if (!scenario) return [];
    
    const rooms = scenario.location === 'Benissa' ? ROOMS_BENISSA : ROOMS_NIEDERLAUTERBACH;
    
    if (isVorOrt) {
      // VOR ORT Unterkategorien
      switch (category) {
        case 'Regelmäßige Wartung':
          return ['Wöchentlich', 'Monatlich', 'Saisonal', 'Heizung/Klima', 'Elektronik', 'Wasser', 'Allgemein'];
        case 'Pool & Garten':
          return scenario.location === 'Benissa'
            ? ['Pool Pflege', 'Poolchemie', 'Rasen', 'Pflanzen', 'Bewässerung', 'Terrasse', 'Allgemein']
            : ['Rasen', 'Pflanzen', 'Bewässerung', 'Terrasse', 'Allgemein'];
        case 'Haustechnik':
          return ['Heizung/Klima', 'Elektrik', 'Wasser/Sanitär', 'Gas', 'Alarmanlage', 'Rollläden', 'Allgemein'];
        case 'Reinigung & Ordnung':
          return rooms;
        case 'Einkaufen & Besorgungen':
          return scenario.location === 'Benissa'
            ? ['Lebensmittel', 'Haushalt', 'Poolbedarf', 'Garten', 'Werkzeug', 'Allgemein']
            : ['Lebensmittel', 'Haushalt', 'Garten', 'Werkzeug', 'Allgemein'];
        case 'Reparaturen':
          return ['Dringend', 'Geplant', 'Kleinreparaturen', 'Allgemein'];
        case 'Sicherheit':
          return ['Alarmanlage', 'Schlüssel', 'Beleuchtung', 'Allgemein'];
        default:
          return ['Allgemein'];
      }
    } else {
      // REISE Unterkategorien
      switch (category) {
        case 'Vor der Abreise':
        case 'Am Abreisetag':
          return rooms; // Gleiche Räume für beide
        case 'Hausverwaltung':
          return ['Elektronik', 'Heizung/Klima', 'Wasser', 'Gas', 'Außenbereich', 'Pool', 'Allgemein'];
        case 'Haus verschließen':
          return ['Fenster und Türen', 'Schlüssel', ...rooms.filter(r => r !== 'Allgemein'), 'Allgemein'];
        case 'Sicherheit':
          return ['Alarmanlage', 'Allgemein'];
        case 'Aufgaben unterwegs/Flughafen':
          return ['Check-in', 'Gepäck', 'Sicherheit', 'Boarding', 'Allgemein'];
        case 'Bei Ankunft im Zielhaus':
          return ['Elektronik einschalten', 'Heizung/Klima', 'Küche', 'Sicherheit', 'Allgemein'];
        default:
          return ['Allgemein'];
      }
    }
  };

  // Group tasks by category and subcategory
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = {};
    }
    const subcategory = task.subcategory || 'Allgemein';
    if (!acc[task.category][subcategory]) {
      acc[task.category][subcategory] = [];
    }
    acc[task.category][subcategory].push(task);
    return acc;
  }, {} as Record<string, Record<string, Task[]>>);

  // Sort categories according to CATEGORY_ORDER
  const sortedCategories = Object.keys(groupedTasks).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    // If category not in order list, put it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Helper function to sort subcategories
  const getSortedSubcategories = (category: string, subcategories: string[]) => {
    const order = getSubcategoryOrder(category);
    if (order.length === 0) return subcategories.sort();
    
    return subcategories.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!scenario) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Szenario nicht gefunden
            </h1>
            <button onClick={() => router.push('/')} className="btn-primary">
              Zurück zur Auswahl
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-4 sm:mb-6 fade-in">
            <Tooltip text="Zurück zur Startseite mit allen Szenarien." position="right">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-semibold transition-colors"
              >
                <span className="text-lg sm:text-xl">←</span> Zurück zur Auswahl
              </button>
            </Tooltip>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl flex-shrink-0">{scenario.icon}</span>
                  <span className="truncate">{scenario.title}</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">{scenario.description}</p>
              </div>
              {!online && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0">
                  📡 Offline
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card mb-4 sm:mb-6 fade-in">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                Fortschritt: {completedCount} von {totalCount}
              </span>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 sm:h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Completion Message */}
          {allCompleted && (
            <div className="card mb-4 sm:mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 fade-in">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl flex-shrink-0">🎉</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-800 mb-1 sm:mb-2">
                    Alle Aufgaben erledigt!
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-green-700 mb-3 sm:mb-4 font-medium">
                    Herzlichen Glückwunsch! Du hast alle Aufgaben abgeschlossen. Gute Reise!
                  </p>
                  <Tooltip text="Setzt alle Aufgaben zurück und entfernt die Liste von der Startseite.">
                    <button onClick={handleReset} className="btn-primary text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-3">
                      Zurücksetzen und zur Auswahl
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="card mb-4 sm:mb-6 fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Aufgaben</h2>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {completedCount > 0 && (
                  <Tooltip text="Zeigt alle erledigten Aufgaben an oder blendet sie aus.">
                    <button
                      onClick={() => setShowAllCompleted(!showAllCompleted)}
                      className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-1 sm:gap-2 font-semibold"
                    >
                      <span className="text-green-600 text-sm sm:text-base md:text-lg">✓</span>
                      <span className="hidden sm:inline">{showAllCompleted ? 'Erledigte ausblenden' : 'Erledigte anzeigen'}</span>
                      <span className="sm:hidden">{showAllCompleted ? 'Aus' : 'Ein'}</span>
                    </button>
                  </Tooltip>
                )}
                <Tooltip text="Lädt die aktuelle Checkliste als PDF-Datei herunter.">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-1 sm:gap-2 disabled:opacity-50 px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3"
                  >
                    <span className="text-base sm:text-lg">📄</span>
                    <span className="hidden sm:inline">{isGeneratingPdf ? 'PDF...' : 'PDF'}</span>
                  </button>
                </Tooltip>
                <Tooltip text="Fügt eine neue Aufgabe zu dieser Checkliste hinzu.">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3"
                  >
                    <span className="text-base sm:text-lg">+</span>
                    <span className="hidden sm:inline">Aufgabe</span>
                  </button>
                </Tooltip>
              </div>
            </div>

            {sortedCategories.map((category) => {
              const categorySubcategories = groupedTasks[category];
              const subcategories = getSortedSubcategories(category, Object.keys(categorySubcategories));
              const hasMultipleSubcategories = subcategories.length > 1 || (subcategories.length === 1 && subcategories[0] !== 'Allgemein');
              
              // Zähle Tasks in dieser Kategorie
              const allCategoryTasks = Object.values(categorySubcategories).flat();
              const categoryCompletedCount = allCategoryTasks.filter(t => t.done).length;
              const categoryTotalCount = allCategoryTasks.length;
              const categoryKey = category;
              const allCategoryTasksCompleted = categoryCompletedCount === categoryTotalCount && categoryTotalCount > 0;
              const isCategoryExpanded = showAllCompleted || expandedCategories[categoryKey] || !allCategoryTasksCompleted;
              
              return (
              <div key={category} className="mb-6 sm:mb-8 last:mb-0">
                {/* Kategorie-Überschrift - klickbar wenn alle erledigt */}
                <div 
                  className={`flex items-center justify-between mb-3 sm:mb-4 ${allCategoryTasksCompleted ? 'cursor-pointer hover:bg-gray-50 rounded-lg transition-colors' : ''}`}
                  onClick={allCategoryTasksCompleted ? () => toggleCategory(categoryKey) : undefined}
                >
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 pb-1.5 sm:pb-2 border-b-2 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-t-lg sm:rounded-t-xl flex-1 flex items-center gap-1 sm:gap-2">
                    {allCategoryTasksCompleted && (
                      <span className="text-sm sm:text-base md:text-lg">{isCategoryExpanded ? '▼' : '▶'}</span>
                    )}
                    <span className="truncate">{category}</span>
                  </h3>
                  {categoryCompletedCount > 0 && (
                    <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 flex-shrink-0">
                      {categoryCompletedCount}/{categoryTotalCount} ✓
                    </span>
                  )}
                </div>
                
                {/* Unterkategorien - nur anzeigen wenn Kategorie expanded */}
                {isCategoryExpanded && (
                  <div className="space-y-3 sm:space-y-4">
                    {subcategories.map((subcategory) => {
                      const subcategoryTasks = categorySubcategories[subcategory];
                      const showSubcategoryHeader = hasMultipleSubcategories && subcategory !== 'Allgemein';
                      
                      // Teile Tasks in offen und erledigt
                      const openTasks = subcategoryTasks.filter(t => !t.done);
                      const completedTasks = subcategoryTasks.filter(t => t.done);
                      const allSubcategoryTasksCompleted = openTasks.length === 0 && completedTasks.length > 0;
                      const subcategoryKey = `${category}-${subcategory}`;
                      const isSubcategoryExpanded = showAllCompleted || expandedSubcategories[subcategoryKey] || !allSubcategoryTasksCompleted;
                      
                      return (
                        <div key={subcategoryKey} className={showSubcategoryHeader ? 'ml-2 sm:ml-4' : ''}>
                          {/* Unterkategorie-Überschrift - klickbar wenn alle erledigt */}
                          {showSubcategoryHeader && (
                            <h4 
                              className={`text-sm sm:text-base font-bold text-gray-700 mb-2 sm:mb-3 pl-2 sm:pl-4 border-l-2 sm:border-l-4 border-blue-400 bg-gradient-to-r from-gray-50 to-transparent py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 ${allSubcategoryTasksCompleted ? 'cursor-pointer hover:bg-gray-100 transition-all' : ''}`}
                              onClick={allSubcategoryTasksCompleted ? () => toggleSubcategory(subcategoryKey) : undefined}
                            >
                              {allSubcategoryTasksCompleted && (
                                <span className="text-sm sm:text-base">{isSubcategoryExpanded ? '▼' : '▶'}</span>
                              )}
                              <span className="text-base sm:text-lg">📌</span>
                              <span className="truncate flex-1">{subcategory}</span>
                              {completedTasks.length > 0 && (
                                <span className="text-xs sm:text-sm text-gray-500 bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                                  {completedTasks.length}/{subcategoryTasks.length} ✓
                                </span>
                              )}
                            </h4>
                          )}
                          
                          {/* Tasks der Unterkategorie - nur anzeigen wenn expanded */}
                          {isSubcategoryExpanded && (
                            <>
                              {/* Offene Tasks */}
                              {openTasks.length > 0 && (
                                <div className={`space-y-1.5 sm:space-y-2 ${showSubcategoryHeader ? 'ml-2 sm:ml-4' : ''}`}>
                                  {openTasks.map((task) => (
                                    <TaskItem
                                      key={task.id}
                                      task={task}
                                      onToggle={toggleTask}
                                      onDetail={() => setSelectedTask(task)}
                                    />
                                  ))}
                                </div>
                              )}
                              
                              {/* Erledigte Tasks */}
                              {completedTasks.length > 0 && (
                                <div className={`space-y-1.5 sm:space-y-2 ${showSubcategoryHeader ? 'ml-2 sm:ml-4' : ''} ${openTasks.length > 0 ? 'mt-1.5 sm:mt-2' : ''} opacity-60`}>
                                  {completedTasks.map((task) => (
                                    <TaskItem
                                      key={task.id}
                                      task={task}
                                      onToggle={toggleTask}
                                      onDetail={() => setSelectedTask(task)}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
            })}

            {tasks.length === 0 && (
              <p className="text-sm sm:text-base text-gray-500 text-center py-6 sm:py-8">
                Keine Aufgaben vorhanden. Füge die erste Aufgabe hinzu!
              </p>
            )}
          </div>

          {/* Reset Button */}
          <div className="mt-6 sm:mt-8 text-center fade-in">
            <Tooltip text="Setzt den Status aller Aufgaben in dieser Liste zurück. Die Liste bleibt auf der Startseite erhalten.">
              <button onClick={handleReset} className="btn-danger text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3">
                Checkliste zurücksetzen
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadData}
        />
      )}
      {showAddModal && (
        <AddTaskModal
          scenarioId={scenarioId}
          onClose={() => setShowAddModal(false)}
          onAdd={loadData}
        />
      )}
    </AuthGuard>
  );
}

