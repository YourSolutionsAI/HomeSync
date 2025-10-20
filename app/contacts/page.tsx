'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Contact, Location } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import ContactModal from '@/components/ContactModal';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Location | 'all'>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('location', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts =
    filter === 'all'
      ? contacts
      : contacts.filter((c) => c.location === filter);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:underline mb-4 flex items-center"
            >
              ← Zurück zur Startseite
            </button>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">📞 Kontakte</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                + Kontakt hinzufügen
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="card mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setFilter('Niederlauterbach')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'Niederlauterbach'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Niederlauterbach
              </button>
              <button
                onClick={() => setFilter('Benissa')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'Benissa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Benissa
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-4">
            {filteredContacts.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">
                  Keine Kontakte gefunden. Fügen Sie Ihren ersten Kontakt hinzu!
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {contact.name}
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {contact.location}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{contact.role}</p>

                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline block mb-1"
                        >
                          📞 {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline block mb-1"
                        >
                          ✉️ {contact.email}
                        </a>
                      )}
                      {contact.address && (
                        <p className="text-sm text-gray-600 mb-1">
                          📍 {contact.address}
                        </p>
                      )}
                      {contact.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {contact.notes}
                        </p>
                      )}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-xl">
                      ℹ️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={loadContacts}
        />
      )}
      {showAddModal && (
        <ContactModal
          contact={null}
          onClose={() => setShowAddModal(false)}
          onUpdate={loadContacts}
        />
      )}
    </AuthGuard>
  );
}

