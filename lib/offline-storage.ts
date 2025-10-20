import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, Contact } from './types';

interface ReiseCheckDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-scenario': string };
  };
  contacts: {
    key: string;
    value: Contact;
    indexes: { 'by-location': string };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      action: 'update' | 'insert' | 'delete';
      table: 'tasks' | 'contacts';
      data: any;
      timestamp: number;
    };
    autoIncrement: true;
  };
}

let db: IDBPDatabase<ReiseCheckDB> | null = null;

export async function initDB() {
  if (db) return db;

  db = await openDB<ReiseCheckDB>('reise-check-db', 1, {
    upgrade(db) {
      // Tasks Store
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-scenario', 'scenario');

      // Contacts Store
      const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
      contactStore.createIndex('by-location', 'location');

      // Sync Queue Store
      db.createObjectStore('syncQueue', { autoIncrement: true });
    },
  });

  return db;
}

// Tasks
export async function saveTasks(tasks: Task[]) {
  const database = await initDB();
  const tx = database.transaction('tasks', 'readwrite');
  await Promise.all(tasks.map(task => tx.store.put(task)));
  await tx.done;
}

export async function getTasksByScenario(scenario: string): Promise<Task[]> {
  const database = await initDB();
  return database.getAllFromIndex('tasks', 'by-scenario', scenario);
}

export async function updateTask(task: Task) {
  const database = await initDB();
  await database.put('tasks', task);
}

export async function addTaskToSyncQueue(action: 'update' | 'insert' | 'delete', data: any) {
  const database = await initDB();
  await database.add('syncQueue', {
    action,
    table: 'tasks',
    data,
    timestamp: Date.now(),
  });
}

// Contacts
export async function saveContacts(contacts: Contact[]) {
  const database = await initDB();
  const tx = database.transaction('contacts', 'readwrite');
  await Promise.all(contacts.map(contact => tx.store.put(contact)));
  await tx.done;
}

export async function getContactsByLocation(location: string): Promise<Contact[]> {
  const database = await initDB();
  return database.getAllFromIndex('contacts', 'by-location', location);
}

export async function getAllContacts(): Promise<Contact[]> {
  const database = await initDB();
  return database.getAll('contacts');
}

// Sync Queue
export async function getSyncQueue() {
  const database = await initDB();
  return database.getAll('syncQueue');
}

export async function clearSyncQueue() {
  const database = await initDB();
  const tx = database.transaction('syncQueue', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

