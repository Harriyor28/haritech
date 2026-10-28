import { projects as defaultProjects } from '../data/projects';
import { pushToCloud } from './cloudSync';

export interface ProjectData {
  /** Set when a project is saved through the admin dashboard. Rows without it
      are earlier seeds and are not published. */
  approved?: boolean;
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  year: string;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  liveDemo: string;
  challenges: string;
  solutions: string;
  features: string[];
  technology: string[];
  metrics: { loadTime: string; performanceScore: number; mobileScore: number };
}

const STORAGE_KEY = 'haritech-projects';

const seededProjects: ProjectData[] = defaultProjects as ProjectData[];

export const getStoredProjects = (): ProjectData[] => {
  if (typeof window === 'undefined') return seededProjects;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return seededProjects;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return seededProjects;
    const approved = (parsed as ProjectData[]).filter(project => project && project.approved === true);
    return approved.length ? approved : seededProjects;
  } catch {
    return seededProjects;
  }
};

export const setStoredProjects = (data: ProjectData[]): void => {
  if (typeof window === 'undefined') return;
  const approved = data.map(project => ({ ...project, approved: true }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(approved));
  void pushToCloud(STORAGE_KEY, approved);
  window.dispatchEvent(new Event('haritech-projects-updated'));
};
