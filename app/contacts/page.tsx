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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-4 sm:mb-6 fade-in">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 flex items-center gap-2 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">←</span> Zurück zur Startseite
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">📞</span>
                  <span className="truncate">Kontakte</span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">Wichtige Kontakte für deine Reisen</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-6 w-full sm:w-auto"
              >
                <span className="text-lg sm:text-xl">+</span>
                <span className="hidden xs:inline">Kontakt hinzufügen</span>
                <span className="xs:hidden">Hinzufügen</span>
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="card mb-6 fade-in">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2.5 rounded-xl transition-all font-semibold ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 transform hover:scale-105'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setFilter('Niederlauterbach')}
                className={`px-5 py-2.5 rounded-xl transition-all font-semibold ${
                  filter === 'Niederlauterbach'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 transform hover:scale-105'
                }`}
              >
                Niederlauterbach
              </button>
              <button
                onClick={() => setFilter('Benissa')}
                className={`px-5 py-2.5 rounded-xl transition-all font-semibold ${
                  filter === 'Benissa'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 transform hover:scale-105'
                }`}
              >
                Benissa
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-4">
            {filteredContacts.length === 0 ? (
              <div className="card text-center py-16 fade-in">
                <div className="text-6xl mb-4">📇</div>
                <p className="text-gray-500 text-lg">
                  Keine Kontakte gefunden. Füge deinen ersten Kontakt hinzu!
                </p>
              </div>
            ) : (
              filteredContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="card hover:shadow-xl transition-all cursor-pointer slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                          {contact.name}
                        </h3>
                        <span className="text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold w-fit">
                          {contact.location}
                        </span>
                      </div>
                      <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-3 font-medium">{contact.role}</p>

                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-700 hover:underline block mb-2 font-medium flex items-center gap-2"
                        >
                          <span className="text-xl">📞</span> {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-700 hover:underline block mb-2 font-medium flex items-center gap-2"
                        >
                          <span className="text-xl">✉️</span> {contact.email}
                        </a>
                      )}
                      {contact.address && (
                        <p className="text-gray-600 mb-2 font-medium flex items-center gap-2">
                          <span className="text-xl">📍</span> {contact.address}
                        </p>
                      )}
                      {contact.notes && (
                        <p className="text-gray-600 mt-3 italic bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                          {contact.notes}
                        </p>
                      )}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-2xl transition-transform hover:scale-110">
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

