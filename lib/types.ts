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
  done: boolean;
  order: number;
  link?: string | null;
  image_url?: string | null;
  notes?: string | null;
  transport_type?: TransportType | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  location: Location;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
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
    id: 'abfahrt-nl-ben',
    title: 'Abfahrt (Auto) Niederlauterbach → Benissa',
    location: 'Niederlauterbach',
    type: 'Abfahrt',
    description: 'Checkliste für die Autoreise von Frankreich nach Spanien',
    icon: '🚗',
  },
  {
    id: 'abfahrt-ben-nl',
    title: 'Abfahrt (Auto) Benissa → Niederlauterbach',
    location: 'Benissa',
    type: 'Abfahrt',
    description: 'Checkliste für die Autoreise von Spanien nach Frankreich',
    icon: '🚗',
  },
  {
    id: 'abflug-nl-ben',
    title: 'Abflug (Flugzeug) Niederlauterbach → Benissa',
    location: 'Niederlauterbach',
    type: 'Abflug',
    description: 'Checkliste für die Flugreise von Frankreich nach Spanien',
    icon: '✈️',
  },
  {
    id: 'abflug-ben-nl',
    title: 'Abflug (Flugzeug) Benissa → Niederlauterbach',
    location: 'Benissa',
    type: 'Abflug',
    description: 'Checkliste für die Flugreise von Spanien nach Frankreich',
    icon: '✈️',
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

