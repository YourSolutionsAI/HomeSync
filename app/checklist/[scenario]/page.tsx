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
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
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
    if (!confirm('Möchtest Du die Checkliste wirklich zurücksetzen?')) {
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
          <div className="mb-6 fade-in">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-semibold transition-colors"
            >
              <span className="text-xl">←</span> Zurück zur Auswahl
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-4xl">{scenario.icon}</span>
                  {scenario.title}
                </h1>
                <p className="text-gray-600 mt-2">{scenario.description}</p>
              </div>
              {!online && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  📡 Offline
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card mb-6 fade-in">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-semibold text-gray-700">
                Fortschritt: {completedCount} von {totalCount}
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Completion Message */}
          {allCompleted && (
            <div className="card mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 fade-in">
              <div className="flex items-start gap-3">
                <span className="text-4xl">🎉</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Alle Aufgaben erledigt!
                  </h2>
                  <p className="text-green-700 mb-4 font-medium">
                    Herzlichen Glückwunsch! Du hast alle Aufgaben abgeschlossen. Gute Reise!
                  </p>
                  <button onClick={handleReset} className="btn-primary">
                    Checkliste zurücksetzen und zur Auswahl
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="card mb-6 fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-gray-800">Aufgaben</h2>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <button
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="text-sm px-4 py-2 rounded-xl border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-2 font-semibold"
                  >
                    {showAllCompleted ? (
                      <>
                        <span className="text-green-600 text-lg">✓</span>
                        Erledigte ausblenden
                      </>
                    ) : (
                      <>
                        <span className="text-green-600 text-lg">✓</span>
                        Alle Erledigten anzeigen
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <span className="text-lg">+</span>
                  Aufgabe hinzufügen
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
              const allCategoryTasksCompleted = categoryCompletedCount === categoryTotalCount && categoryTotalCount > 0;
              const isCategoryExpanded = showAllCompleted || expandedCategories[categoryKey] || !allCategoryTasksCompleted;
              
              return (
              <div key={category} className="mb-8 last:mb-0">
                {/* Kategorie-Überschrift - klickbar wenn alle erledigt */}
                <div 
                  className={`flex items-center justify-between mb-4 ${allCategoryTasksCompleted ? 'cursor-pointer hover:bg-gray-50 rounded-lg transition-colors' : ''}`}
                  onClick={allCategoryTasksCompleted ? () => toggleCategory(categoryKey) : undefined}
                >
                  <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent px-4 py-3 rounded-t-xl flex-1 flex items-center gap-2">
                    {allCategoryTasksCompleted && (
                      <span className="text-lg">{isCategoryExpanded ? '▼' : '▶'}</span>
                    )}
                    {category}
                  </h3>
                  {categoryCompletedCount > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      {categoryCompletedCount} / {categoryTotalCount} ✓
                    </span>
                  )}
                </div>
                
                {/* Unterkategorien - nur anzeigen wenn Kategorie expanded */}
                {isCategoryExpanded && (
                  <div className="space-y-4">
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
                        <div key={subcategoryKey} className={showSubcategoryHeader ? 'ml-4' : ''}>
                          {/* Unterkategorie-Überschrift - klickbar wenn alle erledigt */}
                          {showSubcategoryHeader && (
                            <h4 
                              className={`text-base font-bold text-gray-700 mb-3 pl-4 border-l-4 border-blue-400 bg-gradient-to-r from-gray-50 to-transparent py-2 rounded-lg flex items-center gap-2 ${allSubcategoryTasksCompleted ? 'cursor-pointer hover:bg-gray-100 transition-all' : ''}`}
                              onClick={allSubcategoryTasksCompleted ? () => toggleSubcategory(subcategoryKey) : undefined}
                            >
                              {allSubcategoryTasksCompleted && (
                                <span className="text-base">{isSubcategoryExpanded ? '▼' : '▶'}</span>
                              )}
                              <span className="text-lg">📌</span>
                              <span>{subcategory}</span>
                              {completedTasks.length > 0 && (
                                <span className="text-sm text-gray-500 ml-auto bg-gray-200 px-2 py-1 rounded-full">
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
                              )}
                              
                              {/* Erledigte Tasks */}
                              {completedTasks.length > 0 && (
                                <div className={`space-y-2 ${showSubcategoryHeader ? 'ml-4' : ''} ${openTasks.length > 0 ? 'mt-2' : ''} opacity-60`}>
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
              <p className="text-gray-500 text-center py-8">
                Keine Aufgaben vorhanden. Füge die erste Aufgabe hinzu!
              </p>
            )}
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div className="card fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-3xl">📞</span>
                Wichtige Kontakte - {scenario.location}
              </h2>
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <h3 className="font-bold text-gray-800 text-lg">{contact.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 text-sm hover:underline block mt-1 font-medium"
                      >
                        📞 {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 text-sm hover:underline block font-medium"
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
          <div className="mt-8 text-center fade-in">
            <button onClick={handleReset} className="btn-danger px-8">
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

