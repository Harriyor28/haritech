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
    // Only an explicit rejection hides a saved project. Entries written before
    // the flag existed, or restored from the cloud without it, still belong to
    // the owner and must stay visible instead of silently disappearing.
    const published = (parsed as ProjectData[]).filter(
      project => project && project.approved !== false
    );
    return published.length ? published : seededProjects;
  } catch {
    return seededProjects;
  }
};

/** Resolves true when the copy reached Supabase, false when it only lives in
    this browser (for example, an expired admin session). */
export const setStoredProjects = async (data: ProjectData[]): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  const approved = data.map(project => ({ ...project, approved: true }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(approved));
  const pushed = await pushToCloud(STORAGE_KEY, approved);
  window.dispatchEvent(new Event('haritech-projects-updated'));
  return pushed;
};
