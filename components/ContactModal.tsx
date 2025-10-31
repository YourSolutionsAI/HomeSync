'use client';

import { useState } from 'react';
import { Contact, Location } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface ContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ContactModal({
  contact,
  onClose,
  onUpdate,
}: ContactModalProps) {
  const isNew = !contact;
  const [editing, setEditing] = useState(isNew);
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    role: contact?.role || '',
    location: (contact?.location || 'Niederlauterbach') as Location,
    phone: contact?.phone || '',
    email: contact?.email || '',
    address: contact?.address || '',
    notes: contact?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      alert('Name und Rolle sind Pflichtfelder');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const { error } = await (supabase.from('contacts') as any).insert({
          name: formData.name,
          role: formData.role,
          location: formData.location,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          notes: formData.notes || null,
        });

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('contacts') as any)
          .update({
            name: formData.name,
            role: formData.role,
            location: formData.location,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            notes: formData.notes || null,
          })
          .eq('id', contact!.id);

        if (error) throw error;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Kontakts');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchtest Du diesen Kontakt wirklich löschen?')) {
      return;
    }

    try {
      const { error } = await (supabase.from('contacts') as any)
        .delete()
        .eq('id', contact!.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Kontakts');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isNew ? 'Kontakt hinzufügen' : 'Kontakt-Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl transition-transform hover:scale-110 hover:rotate-90 flex-shrink-0 ml-2"
              aria-label="Schließen"
            >
              ×
            </button>
          </div>

          {editing ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input text-sm sm:text-base"
                  placeholder="z.B. Elektriker Müller"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Rolle/Kategorie *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="input text-sm sm:text-base"
                  placeholder="z.B. Elektriker, Hausverwaltung, Werkstatt"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Ort *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value as Location,
                    })
                  }
                  className="input text-sm sm:text-base"
                >
                  <option value="Niederlauterbach">Niederlauterbach</option>
                  <option value="Benissa">Benissa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input text-sm sm:text-base"
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input text-sm sm:text-base"
                  placeholder="kontakt@beispiel.de"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Adresse / Webseite
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input text-sm sm:text-base"
                  placeholder="Straße, PLZ Ort oder https://..."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Notizen
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input text-sm sm:text-base"
                  rows={3}
                  placeholder="Öffnungszeiten, Ansprechpartner, etc."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.role}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base py-2.5 sm:py-3"
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
                {!isNew && (
                  <button
                    onClick={() => setEditing(false)}
                    className="btn-secondary flex-1 text-sm sm:text-base py-2.5 sm:py-3"
                  >
                    Abbrechen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {contact!.name}
                </h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {contact!.role}
                  </span>
                  <span className="text-xs sm:text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {contact!.location}
                  </span>
                </div>
              </div>

              {contact!.phone && (
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Telefon</h4>
                  <a
                    href={`tel:${contact!.phone}`}
                    className="text-sm sm:text-base text-blue-600 hover:underline"
                  >
                    📞 {contact!.phone}
                  </a>
                </div>
              )}

              {contact!.email && (
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">E-Mail</h4>
                  <a
                    href={`mailto:${contact!.email}`}
                    className="text-sm sm:text-base text-blue-600 hover:underline break-all"
                  >
                    ✉️ {contact!.email}
                  </a>
                </div>
              )}

              {contact!.address && (
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">
                    Adresse / Webseite
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600">📍 {contact!.address}</p>
                </div>
              )}

              {contact!.notes && (
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Notizen</h4>
                  <p className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap">
                    {contact!.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t-2">
                <button onClick={() => setEditing(true)} className="btn-primary flex-1 text-sm sm:text-base py-2.5 sm:py-3">
                  Bearbeiten
                </button>
                <button onClick={handleDelete} className="btn-danger flex-1 text-sm sm:text-base py-2.5 sm:py-3">
                  Löschen
                </button>
                <button onClick={onClose} className="btn-secondary flex-1 text-sm sm:text-base py-2.5 sm:py-3">
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

