'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import ConfirmModal from './ConfirmModal';

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

  // Lade vorhandene Bilder aus image_urls oder migriere von image_url
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Bevorzuge image_urls, falle aber auf image_url zurück für Kompatibilität
    if ((task as any).image_urls && (task as any).image_urls.length > 0) {
      setExistingImages((task as any).image_urls);
    } else if (task.image_url) {
      setExistingImages([task.image_url]);
    }
  }, [task]);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    category: task.category,
    subcategory: task.subcategory || 'Allgemein',
    link: task.link || '',
    notes: task.notes || '',
  });
  
  // State für mehrere neue Bilder
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State für Bild-Lösch-Bestätigung
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  
  // State für Aufgaben-Lösch-Bestätigung
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);

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
    setNewImageFiles([...newImageFiles, ...validFiles]);

    // Erstelle Vorschauen
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setImageToDelete(imageUrl);
    setShowDeleteImageModal(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      // Extrahiere den Dateinamen aus der URL
      // URL Format: https://.../storage/v1/object/public/task-images/FILENAME.jpg
      const urlParts = imageToDelete.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Lösche Bild aus Supabase Storage
      const { error } = await supabase.storage
        .from('task-images')
        .remove([fileName]);

      if (error) {
        console.error('Fehler beim Löschen des Bildes aus Storage:', error);
        // Trotzdem fortfahren und aus der DB entfernen
      }

      // Entferne aus State
      setExistingImages(prev => prev.filter(url => url !== imageToDelete));
      setImageToDelete(null);
    } catch (error) {
      console.error('Fehler beim Löschen des Bildes:', error);
      alert('Fehler beim Löschen des Bildes aus dem Storage');
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (newImageFiles.length === 0) return [];
    
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of newImageFiles) {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload neue Bilder
      const newUploadedUrls = await uploadImages();
      
      // Kombiniere vorhandene und neue Bilder
      const allImageUrls = [...existingImages, ...newUploadedUrls];

      // Normalisiere den Link
      const normalizedLink = formData.link ? normalizeUrl(formData.link) : null;

      const { error } = await (supabase.from('tasks') as any)
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          subcategory: formData.subcategory || null,
          link: normalizedLink,
          image_url: allImageUrls.length > 0 ? allImageUrls[0] : null, // Erstes Bild für Kompatibilität
          image_urls: allImageUrls.length > 0 ? allImageUrls : null, // Alle Bilder als Array
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      if (error) throw error;

      // Reset neue Bilder
      setNewImageFiles([]);
      setNewImagePreviews([]);
      
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

  const handleDeleteClick = () => {
    setShowDeleteTaskModal(true);
  };

  const confirmDeleteTask = async () => {
    try {
      // Lösche zuerst alle Bilder aus dem Storage
      if (existingImages.length > 0) {
        const fileNames = existingImages.map(url => {
          const urlParts = url.split('/');
          return urlParts[urlParts.length - 1];
        });

        const { error: storageError } = await supabase.storage
          .from('task-images')
          .remove(fileNames);

        if (storageError) {
          console.error('Fehler beim Löschen der Bilder aus Storage:', storageError);
          // Fortfahren trotz Fehler
        }
      }

      // Dann lösche die Aufgabe aus der Datenbank
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
                  placeholder="beispiel.de oder https://beispiel.de"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tipp: https:// wird automatisch hinzugefügt
                </p>
              </div>

              {/* Vorhandene Bilder */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vorhandene Fotos ({existingImages.length})
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Bild ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Bild löschen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Neue Bilder Vorschau */}
              {newImagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neue Fotos ({newImagePreviews.length})
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Vorschau ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-blue-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Bild entfernen"
                        >
                          ×
                        </button>
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Neu
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Foto hinzufügen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fotos hinzufügen (mehrere möglich)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max. 20MB pro Bild, Formate: JPG, PNG, GIF, WebP. Sie können mehrere Dateien gleichzeitig auswählen.
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
                    ? `Bilder werden hochgeladen... (${newImageFiles.length})`
                    : saving
                    ? 'Speichern...'
                    : 'Speichern'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setNewImageFiles([]);
                    setNewImagePreviews([]);
                    // Reset existingImages zu ursprünglichem Zustand
                    if ((task as any).image_urls && (task as any).image_urls.length > 0) {
                      setExistingImages((task as any).image_urls);
                    } else if (task.image_url) {
                      setExistingImages([task.image_url]);
                    }
                  }}
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

              {/* Anzeige aller Bilder */}
              {existingImages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Fotos ({existingImages.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="mt-2">
                        <img
                          src={imageUrl}
                          alt={`${task.title} - Bild ${index + 1}`}
                          className="rounded-lg max-w-full h-auto border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700';
                            errorDiv.innerHTML = '⚠️ Bild konnte nicht geladen werden.<br/>URL: <span class="text-xs break-all">' + imageUrl + '</span>';
                            target.parentElement?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    ))}
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
                <button onClick={handleDeleteClick} className="btn-danger flex-1">
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

      {/* Confirm Modal für Bild löschen */}
      <ConfirmModal
        isOpen={showDeleteImageModal}
        onClose={() => {
          setShowDeleteImageModal(false);
          setImageToDelete(null);
        }}
        onConfirm={confirmDeleteImage}
        title="Bild löschen?"
        message="Möchten Sie dieses Bild wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
        type="danger"
      />

      {/* Confirm Modal für Aufgabe löschen */}
      <ConfirmModal
        isOpen={showDeleteTaskModal}
        onClose={() => setShowDeleteTaskModal(false)}
        onConfirm={confirmDeleteTask}
        title="Aufgabe löschen?"
        message={`Möchten Sie die Aufgabe "${task.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
        type="danger"
      />
    </div>
  );
}
