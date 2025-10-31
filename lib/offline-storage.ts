import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, UserTaskStatus } from './types';

interface ReiseCheckDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-scenario': string };
  };
  userTaskStatus: {
    key: string;
    value: UserTaskStatus;
    indexes: { 'by-user': string; 'by-user-task': [string, string] };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      action: 'update' | 'insert' | 'delete';
      table: 'tasks' | 'user_task_status';
      data: any;
      timestamp: number;
    };
    autoIncrement: true;
  };
}

let db: IDBPDatabase<ReiseCheckDB> | null = null;

export async function initDB() {
  if (db) return db;

  db = await openDB<ReiseCheckDB>('reise-check-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        // Tasks Store
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-scenario', 'scenario');

        // Sync Queue Store
        db.createObjectStore('syncQueue', { autoIncrement: true });
      }
      
      if (oldVersion < 2) {
        // User Task Status Store (neue Version 2)
        const statusStore = db.createObjectStore('userTaskStatus', { keyPath: 'id' });
        statusStore.createIndex('by-user', 'user_id');
        // Composite index für user_id + task_id
        statusStore.createIndex('by-user-task', ['user_id', 'task_id']);
      }
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

// User Task Status
export async function saveUserTaskStatusOffline(statuses: UserTaskStatus[]) {
  const database = await initDB();
  const tx = database.transaction('userTaskStatus', 'readwrite');
  await Promise.all(statuses.map(status => {
    // Generiere ID wenn nicht vorhanden
    const statusWithId = status.id || `${status.user_id}-${status.task_id}`;
    return tx.store.put({ ...status, id: statusWithId });
  }));
  await tx.done;
}

export async function getUserTaskStatusOffline(userId: string, scenarioId: string): Promise<UserTaskStatus[]> {
  const database = await initDB();
  
  // Hole alle Tasks für dieses Szenario
  const tasks = await database.getAllFromIndex('tasks', 'by-scenario', scenarioId);
  const taskIds = tasks.map(t => t.id);
  
  if (taskIds.length === 0) return [];
  
  // Hole alle Status für diesen Benutzer und diese Tasks
  const allStatuses = await database.getAllFromIndex('userTaskStatus', 'by-user', userId);
  return allStatuses.filter(status => taskIds.includes(status.task_id));
}

export async function updateTaskStatusOffline(userId: string, taskId: string, done: boolean) {
  const database = await initDB();
  const statusId = `${userId}-${taskId}`;
  const status: UserTaskStatus = {
    id: statusId,
    user_id: userId,
    task_id: taskId,
    done,
    updated_at: new Date().toISOString()
  };
  await database.put('userTaskStatus', status);
}

export async function deleteUserTaskStatusOffline(userId: string, taskIds: string[]) {
  const database = await initDB();
  const tx = database.transaction('userTaskStatus', 'readwrite');
  const allStatuses = await database.getAllFromIndex('userTaskStatus', 'by-user', userId);
  const statusesToDelete = allStatuses.filter(status => taskIds.includes(status.task_id));
  await Promise.all(statusesToDelete.map(status => tx.store.delete(status.id)));
  await tx.done;
}

export async function addStatusToSyncQueue(action: 'update' | 'insert' | 'delete', data: any) {
  const database = await initDB();
  await database.add('syncQueue', {
    action,
    table: 'user_task_status',
    data,
    timestamp: Date.now(),
  });
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

