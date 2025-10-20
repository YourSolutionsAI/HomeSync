'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdate,
}: TaskDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    link: task.link || '',
    notes: task.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await (supabase.from('tasks') as any)
        .update({
          title: formData.title,
          description: formData.description || null,
          link: formData.link || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      if (error) throw error;

      setEditing(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Änderungen');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      return;
    }

    try {
      const { error } = await (supabase.from('tasks') as any).delete().eq('id', task.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen der Aufgabe');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Aufgaben-Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input"
                  required
                />
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
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
                  Notizen
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.title}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {task.title}
                </h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {task.category}
                  </span>
                  {task.subcategory && task.subcategory !== 'Allgemein' && (
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {task.subcategory}
                    </span>
                  )}
                  {task.transport_type && task.transport_type !== 'Nicht zutreffend' && (
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {task.transport_type === 'Auto' ? '🚗' : '✈️'} {task.transport_type}
                    </span>
                  )}
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      task.done
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.done ? '✓ Erledigt' : '○ Offen'}
                  </span>
                </div>
              </div>

              {task.description && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Beschreibung
                  </h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {task.link && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Link</h4>
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    🔗 {task.link}
                  </a>
                </div>
              )}

              {task.image_url && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Bild</h4>
                  <img
                    src={task.image_url}
                    alt={task.title}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}

              {task.notes && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Notizen</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{task.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button onClick={() => setEditing(true)} className="btn-primary flex-1">
                  Bearbeiten
                </button>
                <button onClick={handleDelete} className="btn-danger flex-1">
                  Löschen
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

