export type Location = 'Niederlauterbach' | 'Benissa';
export type TaskType = 'Abfahrt' | 'Abflug' | 'Vor Ort' | 'Reise';
export type TransportType = 'Auto' | 'Flugzeug' | 'Nicht zutreffend';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  location: Location;
  type: TaskType;
  scenario: string;
  done: boolean; // Wird jetzt aus user_task_status berechnet, bleibt für Kompatibilität
  order: number;
  link?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  notes?: string | null;
  transport_type?: TransportType | null;
  created_at: string;
  updated_at: string;
}

export interface UserTaskStatus {
  id: string;
  user_id: string;
  task_id: string;
  done: boolean;
  updated_at: string;
}

export interface UserActiveScenario {
  id: string;
  user_id: string;
  scenario_id: string;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  title: string;
  location: Location;
  type: TaskType;
  description: string;
  icon: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'reise-nl-ben',
    title: 'Reise Niederlauterbach → Benissa',
    location: 'Niederlauterbach',
    type: 'Reise',
    description: 'Checkliste für die Reise von Frankreich nach Spanien (Auto oder Flugzeug)',
    icon: '🧳',
  },
  {
    id: 'reise-ben-nl',
    title: 'Reise Benissa → Niederlauterbach',
    location: 'Benissa',
    type: 'Reise',
    description: 'Checkliste für die Reise von Spanien nach Frankreich (Auto oder Flugzeug)',
    icon: '🧳',
  },
  {
    id: 'vor-ort-nl',
    title: 'Vor Ort in Niederlauterbach',
    location: 'Niederlauterbach',
    type: 'Vor Ort',
    description: 'To-Do-Liste für Aufgaben während des Aufenthalts in Frankreich',
    icon: '🏡',
  },
  {
    id: 'vor-ort-ben',
    title: 'Vor Ort in Benissa',
    location: 'Benissa',
    type: 'Vor Ort',
    description: 'To-Do-Liste für Aufgaben während des Aufenthalts in Spanien',
    icon: '🏡',
  },
];

