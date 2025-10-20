'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Task, SCENARIOS, Contact } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import TaskItem from '@/components/TaskItem';
import TaskDetailModal from '@/components/TaskDetailModal';
import AddTaskModal from '@/components/AddTaskModal';
import {
  saveTasks,
  getTasksByScenario,
  updateTask as updateTaskOffline,
  saveContacts,
  getContactsByLocation,
  isOnline,
} from '@/lib/offline-storage';

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenario as string;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [online, setOnline] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAllCompleted, setShowAllCompleted] = useState(false);

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
    if (scenario) {
      loadData();
    }
  }, [scenario]);

  const loadData = async () => {
    try {
      if (online) {
        // Load from Supabase
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('scenario', scenarioId)
          .order('order', { ascending: true });

        if (tasksError) throw tasksError;

        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('location', scenario!.location);

        if (contactsError) throw contactsError;

        setTasks(tasksData || []);
        setContacts(contactsData || []);

        // Save to offline storage
        if (tasksData) await saveTasks(tasksData);
        if (contactsData) await saveContacts(contactsData);
      } else {
        // Load from offline storage
        const offlineTasks = await getTasksByScenario(scenarioId);
        const offlineContacts = await getContactsByLocation(scenario!.location);
        setTasks(offlineTasks);
        setContacts(offlineContacts);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, done: !task.done, updated_at: new Date().toISOString() };
    
    // Update locally
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    
    // Save offline
    await updateTaskOffline(updatedTask);

    // Update in Supabase if online
    if (online) {
      try {
        const { error } = await (supabase.from('tasks') as any)
          .update({
            done: updatedTask.done,
            updated_at: updatedTask.updated_at
          })
          .eq('id', taskId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      }
    }
  };

  const handleReset = async () => {
    if (!confirm('Möchten Sie die Checkliste wirklich zurücksetzen?')) {
      return;
    }

    try {
      if (online) {
        const { error } = await (supabase.from('tasks') as any)
          .update({
            done: false
          })
          .eq('scenario', scenarioId);
        
        if (error) throw error;
      }

      // Reset locally
      const resetTasks = tasks.map((t) => ({ ...t, done: false }));
      setTasks(resetTasks);
      await saveTasks(resetTasks);

      // Remove from active scenarios
      const saved = localStorage.getItem('activeScenarios');
      if (saved) {
        try {
          const scenarios = JSON.parse(saved);
          const updated = scenarios.filter((id: string) => id !== scenarioId);
          localStorage.setItem('activeScenarios', JSON.stringify(updated));
        } catch {
          // Ignore errors
        }
      }
      // Also remove old single scenario for backwards compatibility
      localStorage.removeItem('activeScenario');
      
      router.push('/');
    } catch (error) {
      console.error('Fehler beim Zurücksetzen:', error);
    }
  };

  const toggleCategoryCompleted = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
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
    'Vorbereitung Abreisehaus',
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

  // Unterkategorie-Reihenfolge für bessere Sortierung
  const SUBCATEGORY_ORDER_REISE: Record<string, string[]> = {
    'Vorbereitung Abreisehaus': [
      'Schlafzimmer', 'Büro', 'Gäste Apartment', 'Küche', 'Hauswirtschaftsraum',
      'Garage', 'Wohnzimmer', 'Badezimmer', 'Außenbereich', 'Allgemein'
    ],
    'Am Abreisetag': ['Schlafzimmer', 'Küche', 'Garage', 'Außenbereich', 'Allgemein'],
    'Hausverwaltung': ['Elektronik', 'Heizung/Klima', 'Wasser', 'Gas', 'Außenbereich', 'Pool', 'Allgemein'],
    'Haus verschließen': [
      'Fenster und Türen', 'Schlafzimmer', 'Büro', 'Gäste Apartment',
      'Garage', 'Hauswirtschaftsraum', 'Wohnzimmer', 'Schlüssel', 'Allgemein'
    ],
  };

  const SUBCATEGORY_ORDER_VOR_ORT: Record<string, string[]> = {
    'Regelmäßige Wartung': ['Wöchentlich', 'Monatlich', 'Saisonal', 'Heizung/Klima', 'Elektronik', 'Wasser', 'Allgemein'],
    'Pool & Garten': ['Pool Pflege', 'Poolchemie', 'Rasen', 'Pflanzen', 'Bewässerung', 'Terrasse', 'Allgemein'],
    'Haustechnik': ['Heizung/Klima', 'Elektrik', 'Wasser/Sanitär', 'Gas', 'Alarmanlage', 'Rollläden', 'Allgemein'],
    'Reinigung & Ordnung': ['Schlafzimmer', 'Küche', 'Bad', 'Wohnzimmer', 'Garage', 'Außenbereich', 'Fenster', 'Allgemein'],
    'Einkaufen & Besorgungen': ['Lebensmittel', 'Haushalt', 'Poolbedarf', 'Garten', 'Werkzeug', 'Allgemein'],
    'Reparaturen': ['Dringend', 'Geplant', 'Kleinreparaturen', 'Allgemein'],
    'Sicherheit': ['Alarmanlage', 'Schlüssel', 'Beleuchtung', 'Allgemein'],
  };

  const SUBCATEGORY_ORDER = isVorOrt ? SUBCATEGORY_ORDER_VOR_ORT : SUBCATEGORY_ORDER_REISE;

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
    const order = SUBCATEGORY_ORDER[category];
    if (!order) return subcategories.sort();
    
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:underline mb-4 flex items-center"
            >
              ← Zurück zur Auswahl
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">{scenario.icon}</span>
                  {scenario.title}
                </h1>
                <p className="text-gray-600 text-sm mt-1">{scenario.description}</p>
              </div>
              {!online && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  📡 Offline
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Fortschritt: {completedCount} von {totalCount}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Completion Message */}
          {allCompleted && (
            <div className="card mb-6 bg-green-50 border-green-300">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                🎉 Alle Aufgaben erledigt!
              </h2>
              <p className="text-green-700 mb-4">
                Herzlichen Glückwunsch! Sie haben alle Aufgaben abgeschlossen. Gute
                Reise!
              </p>
              <button onClick={handleReset} className="btn-primary">
                Checkliste zurücksetzen und zur Auswahl
              </button>
            </div>
          )}

          {/* Tasks List */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Aufgaben</h2>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <button
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    {showAllCompleted ? (
                      <>
                        <span className="text-green-600">✓</span>
                        Erledigte ausblenden
                      </>
                    ) : (
                      <>
                        <span className="text-green-600">✓</span>
                        Alle Erledigten anzeigen
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary text-sm"
                >
                  + Aufgabe hinzufügen
                </button>
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
              const isCategoryExpanded = showAllCompleted || expandedCategories[categoryKey];
              
              return (
              <div key={category} className="mb-8 last:mb-0">
                {/* Kategorie-Überschrift */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 pb-2 border-b-2 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent px-3 py-2 rounded-t flex-1">
                    {category}
                  </h3>
                  {categoryCompletedCount > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      {categoryCompletedCount} / {categoryTotalCount} ✓
                    </span>
                  )}
                </div>
                
                {/* Unterkategorien */}
                <div className="space-y-4">
                  {subcategories.map((subcategory) => {
                    const subcategoryTasks = categorySubcategories[subcategory];
                    const showSubcategoryHeader = hasMultipleSubcategories && subcategory !== 'Allgemein';
                    
                    // Teile Tasks in offen und erledigt
                    const openTasks = subcategoryTasks.filter(t => !t.done);
                    const completedTasks = subcategoryTasks.filter(t => t.done);
                    
                    return (
                      <div key={`${category}-${subcategory}`} className={showSubcategoryHeader ? 'ml-4' : ''}>
                        {/* Unterkategorie-Überschrift (nur wenn mehrere Unterkategorien) */}
                        {showSubcategoryHeader && (
                          <h4 className="text-sm font-semibold text-gray-600 mb-2 pl-3 border-l-4 border-gray-300 bg-gray-50 py-1.5 rounded">
                            📌 {subcategory}
                            {completedTasks.length > 0 && (
                              <span className="text-xs text-gray-400 ml-2">
                                ({completedTasks.length}/{subcategoryTasks.length} ✓)
                              </span>
                            )}
                          </h4>
                        )}
                        
                        {/* Offene Tasks der Unterkategorie */}
                        <div className={`space-y-2 ${showSubcategoryHeader ? 'ml-4' : ''}`}>
                          {openTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onToggle={toggleTask}
                              onDetail={() => setSelectedTask(task)}
                            />
                          ))}
                        </div>
                        
                        {/* Erledigte Tasks - eingeklappt mit Toggle */}
                        {completedTasks.length > 0 && (
                          <div className={`mt-2 ${showSubcategoryHeader ? 'ml-4' : ''}`}>
                            {!isCategoryExpanded ? (
                              <button
                                onClick={() => toggleCategoryCompleted(categoryKey)}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-green-600">✓</span>
                                {completedTasks.length} {completedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} erledigt
                                <span className="text-xs">▼</span>
                              </button>
                            ) : (
                              <div>
                                <button
                                  onClick={() => toggleCategoryCompleted(categoryKey)}
                                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-50 transition-colors mb-2"
                                >
                                  <span className="text-green-600">✓</span>
                                  {completedTasks.length} {completedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} erledigt
                                  <span className="text-xs">▲</span>
                                </button>
                                <div className="space-y-2 opacity-60">
                                  {completedTasks.map((task) => (
                                    <TaskItem
                                      key={task.id}
                                      task={task}
                                      onToggle={toggleTask}
                                      onDetail={() => setSelectedTask(task)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            })}

            {tasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Keine Aufgaben vorhanden. Fügen Sie Ihre erste Aufgabe hinzu!
              </p>
            )}
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📞 Wichtige Kontakte - {scenario.location}
              </h2>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.role}</p>
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 text-sm hover:underline block mt-1"
                      >
                        📞 {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 text-sm hover:underline block"
                      >
                        ✉️ {contact.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="mt-6 text-center">
            <button onClick={handleReset} className="btn-danger">
              Checkliste zurücksetzen
            </button>
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

