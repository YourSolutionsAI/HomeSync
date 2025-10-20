'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
}

// Kategorien für REISE-Szenarien
const CATEGORIES_REISE = [
  'Spezielles',
  'Vor der Abreise',
  'Am Abreisetag',
  'Hausverwaltung',
  'Haus verschließen',
  'Sicherheit',
  'Aufgaben unterwegs/Flughafen',
  'Bei Ankunft im Zielhaus',
];

// Kategorien für VOR ORT-Szenarien
const CATEGORIES_VOR_ORT = [
  'Spezielles',
  'Regelmäßige Wartung',
  'Pool & Garten',
  'Haustechnik',
  'Reinigung & Ordnung',
  'Einkaufen & Besorgungen',
  'Reparaturen',
  'Sicherheit',
];

// Räume für Benissa
const ROOMS_BENISSA = [
  'Allgemein',
  'Küche',
  'Schlafzimmer',
  'Wohnzimmer',
  'Balkon',
  'Hauswirtschaftsraum',
  'Gäste WC',
  'Außenbereich',
  'Pool',
  'Garage',
  'Büro',
  'Gäste Appartment',
];

// Räume für Niederlauterbach
const ROOMS_NIEDERLAUTERBACH = [
  'Allgemein',
  'Schlafzimmer',
  'Hobbyraum',
  'WC 1. Stock',
  'Badezimmer',
  'Büro',
  'Küche',
  'Ankleidezimmer',
  'Wohnzimmer',
  'Terrasse',
  'Außenbereich',
  'Garage',
  'Treppenhaus Garage',
];

// Funktion zum Abrufen der Unterkategorien basierend auf Location
const getSubcategoriesReise = (category: string, location: 'Benissa' | 'Niederlauterbach'): string[] => {
  const rooms = location === 'Benissa' ? ROOMS_BENISSA : ROOMS_NIEDERLAUTERBACH;
  
  switch (category) {
    case 'Spezielles':
      return ['Allgemein', 'Wichtige Informationen'];
    case 'Vor der Abreise':
    case 'Am Abreisetag':
      return rooms; // Gleiche Räume für beide Kategorien
    case 'Hausverwaltung':
      return ['Allgemein', 'Elektronik', 'Heizung/Klima', 'Wasser', 'Gas', 'Außenbereich', 'Pool'];
    case 'Haus verschließen':
      return ['Allgemein', 'Fenster und Türen', 'Schlüssel', ...rooms.filter(r => r !== 'Allgemein')];
    case 'Sicherheit':
      return ['Allgemein', 'Alarmanlage'];
    case 'Aufgaben unterwegs/Flughafen':
      return ['Allgemein', 'Check-in', 'Gepäck', 'Sicherheit', 'Boarding'];
    case 'Bei Ankunft im Zielhaus':
      return ['Allgemein', 'Elektronik einschalten', 'Heizung/Klima', 'Küche', 'Sicherheit'];
    default:
      return ['Allgemein'];
  }
};

// Funktion zum Abrufen der Unterkategorien für VOR ORT basierend auf Location
const getSubcategoriesVorOrt = (category: string, location: 'Benissa' | 'Niederlauterbach'): string[] => {
  const rooms = location === 'Benissa' ? ROOMS_BENISSA : ROOMS_NIEDERLAUTERBACH;
  
  switch (category) {
    case 'Spezielles':
      return ['Allgemein', 'Wichtige Informationen'];
    case 'Regelmäßige Wartung':
      return ['Allgemein', 'Wöchentlich', 'Monatlich', 'Saisonal', 'Heizung/Klima', 'Elektronik', 'Wasser'];
    case 'Pool & Garten':
      return location === 'Benissa' 
        ? ['Allgemein', 'Pool Pflege', 'Poolchemie', 'Rasen', 'Pflanzen', 'Bewässerung', 'Terrasse']
        : ['Allgemein', 'Rasen', 'Pflanzen', 'Bewässerung', 'Terrasse'];
    case 'Haustechnik':
      return ['Allgemein', 'Heizung/Klima', 'Elektrik', 'Wasser/Sanitär', 'Gas', 'Alarmanlage', 'Rollläden'];
    case 'Reinigung & Ordnung':
      return rooms; // Alle Räume für Reinigung
    case 'Einkaufen & Besorgungen':
      return location === 'Benissa'
        ? ['Allgemein', 'Lebensmittel', 'Haushalt', 'Poolbedarf', 'Garten', 'Werkzeug']
        : ['Allgemein', 'Lebensmittel', 'Haushalt', 'Garten', 'Werkzeug'];
    case 'Reparaturen':
      return ['Allgemein', 'Dringend', 'Geplant', 'Kleinreparaturen'];
    case 'Sicherheit':
      return ['Allgemein', 'Alarmanlage', 'Schlüssel', 'Beleuchtung'];
    default:
      return ['Allgemein'];
  }
};

export default function TaskDetailModal({
  task,
  onClose,
  onUpdate,
}: TaskDetailModalProps) {
  // Wähle Kategorien basierend auf Task-Typ
  const isVorOrt = task.type === 'Vor Ort';
  const CATEGORIES = isVorOrt ? CATEGORIES_VOR_ORT : CATEGORIES_REISE;
  
  // Funktion zum Abrufen der Unterkategorien basierend auf Kategorie
  const getSubcategories = (category: string): string[] => {
    return isVorOrt 
      ? getSubcategoriesVorOrt(category, task.location)
      : getSubcategoriesReise(category, task.location);
  };

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    category: task.category,
    subcategory: task.subcategory || 'Allgemein',
    link: task.link || '',
    notes: task.notes || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCategoryChange = (newCategory: string) => {
    const subcategories = getSubcategories(newCategory);
    setFormData({
      ...formData,
      category: newCategory,
      subcategory: subcategories[0] || 'Allgemein',
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Datei ist zu groß! Maximale Größe: 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Bitte wählen Sie eine Bilddatei aus!');
        return;
      }
      setImageFile(file);
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
      const filePath = fileName; // Kein "task-images/" Präfix, da der Bucket bereits "task-images" heißt
      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, imageFile);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('task-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      alert('Fehler beim Hochladen des Bildes');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload new image if exists
      let imageUrl: string | null = task.image_url || null;
      if (imageFile) {
        const newUrl = await uploadImage();
        if (newUrl) imageUrl = newUrl;
        else if (imageFile) {
          setSaving(false);
          return;
        }
      }

      const { error } = await (supabase.from('tasks') as any)
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          subcategory: formData.subcategory || null,
          link: formData.link || null,
          image_url: imageUrl,
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

              {(() => {
                const subcategories = getSubcategories(formData.category);
                return subcategories.length > 1 && (
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
                      {subcategories.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

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
                  Foto {task.image_url ? 'ändern' : 'hinzufügen'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input"
                />
                {(imagePreview || task.image_url) && (
                  <div className="mt-2">
                    <img
                      src={imagePreview || task.image_url!}
                      alt="Vorschau"
                      className="w-full max-w-xs rounded-lg border"
                    />
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-red-600 text-sm mt-1 hover:underline"
                      >
                        Neues Bild entfernen
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max. 5MB, Formate: JPG, PNG, GIF, WebP
                </p>
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
                  disabled={saving || uploading || !formData.title}
                  className="btn-primary flex-1"
                >
                  {uploading
                    ? 'Bild wird hochgeladen...'
                    : saving
                    ? 'Speichern...'
                    : 'Speichern'}
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
                  <div className="mt-2">
                    <img
                      src={task.image_url}
                      alt={task.title}
                      className="rounded-lg max-w-full h-auto border border-gray-200 shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700';
                        errorDiv.innerHTML = '⚠️ Bild konnte nicht geladen werden.<br/>URL: <span class="text-xs break-all">' + task.image_url + '</span>';
                        target.parentElement?.appendChild(errorDiv);
                      }}
                    />
                  </div>
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

