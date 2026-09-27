import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE = 'HARITECH';

const titleFor = (path: string): string => {
  if (path === '/' || path.startsWith('/haritech')) {
    const sub = path.replace(/^\/haritech\/?/, '');
    if (!sub) return `${BASE} — Digital Agency, IT & Web Services`;
    const label = sub
      .split('-')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `${label} | ${BASE}`;
  }
  if (path.startsWith('/portfolio')) {
    const sub = path.replace(/^\/portfolio\/?/, '');
    if (!sub) return `Portfolio — ${BASE}`;
    const label = sub
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `${label} | ${BASE} Portfolio`;
  }
  if (path.startsWith('/project/')) return `Project | ${BASE} Portfolio`;
  if (path.startsWith('/admin')) return `Admin | ${BASE}`;
  return BASE;
};

const RouteEffects: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.title = titleFor(pathname);
  }, [pathname]);

  return null;
};

export default RouteEffects;
