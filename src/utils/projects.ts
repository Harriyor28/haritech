import { projects as defaultProjects } from '../data/projects';
import { pushToCloud, emitStorageError } from './cloudSync';

export type ProjectData = typeof defaultProjects[0];

const STORAGE_KEY = 'haritech-projects';

export const getStoredProjects = (): ProjectData[] => {
  if (typeof window === 'undefined') return defaultProjects;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
};

export const setStoredProjects = (data: ProjectData[]): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    emitStorageError('Could not save projects — browser storage is full. Remove old images/data, then try again.');
    return false;
  }
  void pushToCloud(STORAGE_KEY, data);
  window.dispatchEvent(new Event('haritech-projects-updated'));
  return true;
};
