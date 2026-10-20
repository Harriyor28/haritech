import { projects as defaultProjects } from '../data/projects';
import { pushToCloud } from './cloudSync';

export type ProjectData = typeof defaultProjects[0];

const STORAGE_KEY = 'haritech-projects';

export const getStoredProjects = (): ProjectData[] => {
  if (typeof window === 'undefined') return defaultProjects;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultProjects;
  } catch {
    return defaultProjects;
  }
};

export const setStoredProjects = (data: ProjectData[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  void pushToCloud(STORAGE_KEY, data);
  window.dispatchEvent(new Event('haritech-projects-updated'));
};
