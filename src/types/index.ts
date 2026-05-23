export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string; // Optional custom color code or class name
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string; // ISO string format YYYY-MM-DD
  priority: Priority;
  tag?: string;
  recurring?: 'daily' | 'weekly' | 'none';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  tag?: string;
  color?: string;
  createdAt: string;
}
