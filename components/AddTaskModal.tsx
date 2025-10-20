'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SCENARIOS, TransportType } from '@/lib/types';

interface AddTaskModalProps {
  scenarioId: string;
  onClose: () => void;
  onAdd: () => void;
}

const CATEGORIES = [
  'Spezielles', // Immer ganz oben
  'Vorbereitung Abreisehaus',
  'Am Abreisetag',
  'Hausverwaltung',
  'Haus verschließen',
  'Sicherheit',
  'Aufgaben unterwegs/Flughafen',
  'Bei Ankunft im Zielhaus',
];

// Unterkategorien pro Kategorie
const SUBCATEGORIES: Record<string, string[]> = {
  'Spezielles': ['Allgemein', 'Wichtige Informationen'],
  'Vorbereitung Abreisehaus': [
    'Allgemein',
    'Schlafzimmer',
    'Büro',
    'Gäste Apartment',
    'Küche',
    'Hauswirtschaftsraum',
    'Garage',
    'Wohnzimmer',
    'Badezimmer',
    'Außenbereich',
  ],
  'Am Abreisetag': [
    'Allgemein',
    'Schlafzimmer',
    'Küche',
    'Garage',
    'Außenbereich',
  ],
  'Hausverwaltung': [
    'Allgemein',
    'Elektronik',
    'Heizung/Klima',
    'Wasser',
    'Gas',
    'Außenbereich',
    'Pool',
  ],
  'Haus verschließen': [
    'Allgemein',
    'Fenster und Türen',
    'Schlüssel',
    'Schlafzimmer',
    'Büro',
    'Gäste Apartment',
    'Garage',
    'Hauswirtschaftsraum',
    'Wohnzimmer',
  ],
  'Sicherheit': ['Allgemein', 'Alarmanlage'],
  'Aufgaben unterwegs/Flughafen': [
    'Allgemein',
    'Check-in',
    'Gepäck',
    'Sicherheit',
    'Boarding',
  ],
  'Bei Ankunft im Zielhaus': [
    'Allgemein',
    'Elektronik einschalten',
    'Heizung/Klima',
    'Küche',
    'Sicherheit',
  ],
};

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
    subcategory: 'Allgemein',
    link: '',
    notes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCategoryChange = (newCategory: string) => {
    setFormData({
      ...formData,
      category: newCategory,
      subcategory: SUBCATEGORIES[newCategory]?.[0] || 'Allgemein',
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Überprüfe Dateigröße (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Datei ist zu groß! Maximale Größe: 5MB');
        return;
      }

      // Überprüfe Dateityp
      if (!file.type.startsWith('image/')) {
        alert('Bitte wählen Sie eine Bilddatei aus!');
        return;
      }

      setImageFile(file);

      // Erstelle Vorschau
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `task-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Hole die öffentliche URL
      const { data } = supabase.storage
        .from('task-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      alert('Fehler beim Hochladen des Bildes');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !scenario) return;

    setSaving(true);
    try {
      // Upload image if exists
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl && imageFile) {
          // Upload failed but user had selected an image
          setSaving(false);
          return;
        }
      }

      // Get the max order for this scenario
      const { data: existingTasks } = await (supabase.from('tasks') as any)
        .select('order')
        .eq('scenario', scenarioId)
        .order('order', { ascending: false })
        .limit(1);

      const maxOrder = existingTasks?.[0]?.order || 0;

      const { error } = await (supabase.from('tasks') as any).insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        location: scenario.location,
        type: scenario.type,
        scenario: scenarioId,
        order: maxOrder + 1,
        link: formData.link || null,
        image_url: imageUrl,
        notes: formData.notes || null,
        transport_type: null, // Wird auf Checklisten-Ebene gesetzt
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
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Unterkategorie nur anzeigen, wenn mehr als "Allgemein" verfügbar */}
            {SUBCATEGORIES[formData.category] && 
             SUBCATEGORIES[formData.category].length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unterkategorie
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className="input"
                >
                  {SUBCATEGORIES[formData.category].map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                Foto hinzufügen (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Vorschau"
                    className="w-full max-w-xs rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-red-600 text-sm mt-1 hover:underline"
                  >
                    Bild entfernen
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Max. 5MB, Formate: JPG, PNG, GIF, WebP
              </p>
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
                disabled={saving || uploading || !formData.title}
                className="btn-primary flex-1"
              >
                {uploading
                  ? 'Bild wird hochgeladen...'
                  : saving
                  ? 'Speichern...'
                  : 'Aufgabe hinzufügen'}
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

