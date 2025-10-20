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

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Group tasks by category
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Aufgaben</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary text-sm"
              >
                + Aufgabe hinzufügen
              </button>
            </div>

            {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDetail={() => setSelectedTask(task)}
                    />
                  ))}
                </div>
              </div>
            ))}

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

