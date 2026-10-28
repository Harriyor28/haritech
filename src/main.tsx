import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import CloudSync from './components/CloudSync';
import HaritechWelcomeChatWidget from './components/HaritechWelcomeChatWidget';
import { initSmoothScroll, scrollToElement, scrollToTop } from './utils/smoothScroll';
import { migrateLegacyHaritechContent } from './utils/haritechContent';
import './index.css';
import './utils/designTheme';

/* Routes are split so a phone only downloads the page it opened. The home page
   ships without the admin dashboard, the project hub or the 3D studios. */
const App = lazy(() => import('./App'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const AdminAuth = lazy(() => import('./components/admin/AdminAuth'));
const HaritechLayout = lazy(() => import('./layouts/HaritechLayout'));
const HaritechHome = lazy(() => import('./pages/haritech/HaritechHome'));
const About = lazy(() => import('./pages/haritech/About'));
const WhatWeDo = lazy(() => import('./pages/haritech/WhatWeDo'));
const Services = lazy(() => import('./pages/haritech/Services'));
const Industries = lazy(() => import('./pages/haritech/Industries'));
const HaritechPortfolio = lazy(() => import('./pages/haritech/HaritechPortfolio'));
const CACRegistration = lazy(() => import('./pages/haritech/CACRegistration'));
const Blog = lazy(() => import('./pages/haritech/Blog'));
const FAQ = lazy(() => import('./pages/haritech/FAQ'));
const Contact = lazy(() => import('./pages/haritech/Contact'));
const RequestQuote = lazy(() => import('./pages/haritech/RequestQuote'));
const SolarEnergy = lazy(() => import('./pages/haritech/SolarEnergy'));
const Importation = lazy(() => import('./pages/haritech/Importation'));
const ProjectManagement = lazy(() => import('./pages/haritech/ProjectManagement'));
const ClientPortal = lazy(() => import('./pages/haritech/ClientPortal'));
const ThreeDEpoxy = lazy(() => import('./pages/haritech/ThreeDEpoxy'));

const ChatGate: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <HaritechWelcomeChatWidget />;
};

/** Every navigation starts at the top of the new page, and #links still land
 *  on their section — both routed through the active scroll engine. */
const ScrollReset: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(hash.replace('#', ''));
        if (target && scrollToElement(target)) return;
      }
      scrollToTop(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
};

/** Shown for the moment a lazy route is fetched — sized so the layout does not jump. */
const RouteFallback: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
    <span
      className="h-9 w-9 rounded-full border-2 border-white/15 animate-spin"
      style={{ borderTopColor: 'var(--ht-accent-bright, #5eead4)' }}
    />
    <span className="sr-only">Loading page…</span>
  </div>
);

initSmoothScroll();
migrateLegacyHaritechContent();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ScrollReset />
        <CloudSync />
        <ChatGate />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/admin" element={<AdminAuth />} />
            <Route path="/haritech" element={<HaritechLayout />}>
              <Route index element={<HaritechHome />} />
              <Route path="about" element={<About />} />
              <Route path="what-we-do" element={<WhatWeDo />} />
              <Route path="services" element={<Services />} />
              <Route path="industries" element={<Industries />} />
              <Route path="portfolio" element={<HaritechPortfolio />} />
              <Route path="cac-registration" element={<CACRegistration />} />
              <Route path="blog" element={<Blog />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="request-quote" element={<RequestQuote />} />
              <Route path="solar-energy" element={<SolarEnergy />} />
              <Route path="importation" element={<Importation />} />
              <Route path="project-management" element={<ProjectManagement />} />
              <Route path="client-portal" element={<ClientPortal />} />
              <Route path="3d-epoxy" element={<ThreeDEpoxy />} />
            </Route>
          </Routes>
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
);
// REBUILD
