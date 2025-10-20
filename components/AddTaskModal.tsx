'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SCENARIOS } from '@/lib/types';

interface AddTaskModalProps {
  scenarioId: string;
  onClose: () => void;
  onAdd: () => void;
}

const CATEGORIES = [
  'Vorbereitungen zuhause (Packen)',
  'Aufgaben unterwegs/Flughafen',
  'Bei Ankunft im Zielhaus',
  'Hausverwaltung',
  'Sicherheit',
  'Sonstiges',
];

export default function AddTaskModal({
  scenarioId,
  onClose,
  onAdd,
}: AddTaskModalProps) {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    link: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !scenario) return;

    setSaving(true);
    try {
      // Get the max order for this scenario
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('order')
        .eq('scenario', scenarioId)
        .order('order', { ascending: false })
        .limit(1);

      const maxOrder = existingTasks?.[0]?.order || 0;

      const { error } = await supabase.from('tasks').insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        location: scenario.location,
        type: scenario.type,
        scenario: scenarioId,
        order: maxOrder + 1,
        link: formData.link || null,
        notes: formData.notes || null,
        done: false,
      });

      if (error) throw error;

      onAdd();
      onClose();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Aufgabe:', error);
      alert('Fehler beim Hinzufügen der Aufgabe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Aufgabe hinzufügen
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checkliste
              </label>
              <input
                type="text"
                value={scenario?.title || ''}
                className="input bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel der Aufgabe *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input"
                placeholder="z.B. Kühlschrank ausschalten"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input"
                rows={4}
                placeholder="Weitere Details zur Aufgabe..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link (optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="input"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notizen (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input"
                rows={3}
                placeholder="Zusätzliche Bemerkungen..."
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={saving || !formData.title}
                className="btn-primary flex-1"
              >
                {saving ? 'Speichern...' : 'Aufgabe hinzufügen'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

