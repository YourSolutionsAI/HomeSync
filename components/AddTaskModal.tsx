'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SCENARIOS, TransportType } from '@/lib/types';

interface AddTaskModalProps {
  scenarioId: string;
  onClose: () => void;
  onAdd: () => void;
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
      return ['Allgemein', 'Medikamente', 'Dokumente & Wertsachen', 'Schlüssel', 'Auto-Vorbereitung', 'Wichtige Informationen'];
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

export default function AddTaskModal({
  scenarioId,
  onClose,
  onAdd,
}: AddTaskModalProps) {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  
  // Wähle Kategorien basierend auf Szenario-Typ
  const isVorOrt = scenario?.type === 'Vor Ort';
  const CATEGORIES = isVorOrt ? CATEGORIES_VOR_ORT : CATEGORIES_REISE;
  
  // Funktion zum Abrufen der Unterkategorien basierend auf Kategorie
  const getSubcategories = (category: string): string[] => {
    if (!scenario) return ['Allgemein'];
    return isVorOrt 
      ? getSubcategoriesVorOrt(category, scenario.location)
      : getSubcategoriesReise(category, scenario.location);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    subcategory: 'Allgemein',
    link: '',
    notes: '',
  });
  // State für mehrere Bilder
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Kein Größenlimit mehr oder sehr hoch (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`Datei "${file.name}" ist zu groß! Maximale Größe: 20MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`"${file.name}" ist keine Bilddatei!`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Füge neue Dateien hinzu
    setImageFiles([...imageFiles, ...validFiles]);

    // Erstelle Vorschauen
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('task-images').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Fehler beim Hochladen der Bilder:', error);
      alert('Fehler beim Hochladen eines oder mehrerer Bilder');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url || url.trim() === '') return '';
    const trimmedUrl = url.trim();
    // Prüfe ob URL bereits mit http:// oder https:// beginnt
    if (trimmedUrl.match(/^https?:\/\//i)) {
      return trimmedUrl;
    }
    // Füge https:// hinzu
    return `https://${trimmedUrl}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !scenario) return;

    setSaving(true);
    try {
      // Upload images if exist
      const uploadedUrls = await uploadImages();

      // Get the max order for this scenario
      const { data: existingTasks } = await (supabase.from('tasks') as any)
        .select('order')
        .eq('scenario', scenarioId)
        .order('order', { ascending: false })
        .limit(1);

      const maxOrder = existingTasks?.[0]?.order || 0;

      // Normalisiere den Link
      const normalizedLink = formData.link ? normalizeUrl(formData.link) : null;

      const { error } = await (supabase.from('tasks') as any).insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        location: scenario.location,
        type: scenario.type,
        scenario: scenarioId,
        order: maxOrder + 1,
        link: normalizedLink,
        image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null, // Erstes Bild für Kompatibilität
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null, // Alle Bilder als Array
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aufgabe hinzufügen
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl transition-transform hover:scale-110 hover:rotate-90"
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
                placeholder="beispiel.de oder https://beispiel.de"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tipp: https:// wird automatisch hinzugefügt
              </p>
            </div>

            {/* Bilder Vorschau */}
            {imagePreviews.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ausgewählte Fotos ({imagePreviews.length})
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Vorschau ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Bild entfernen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fotos hinzufügen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotos hinzufügen (optional, mehrere möglich)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max. 20MB pro Bild, Formate: JPG, PNG, GIF, WebP. Du kannst mehrere Dateien gleichzeitig auswählen.
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

            <div className="flex gap-3 pt-6 border-t-2">
              <button
                type="submit"
                disabled={saving || uploading || !formData.title}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading
                  ? `Bilder werden hochgeladen... (${imageFiles.length})`
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

