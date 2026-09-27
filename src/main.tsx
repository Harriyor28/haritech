import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import RouteEffects from './components/RouteEffects';
import NotFound from './pages/NotFound';
import ProjectDetail from './pages/ProjectDetail';
import AdminAuth from './components/admin/AdminAuth';
import CloudSync from './components/CloudSync';
import AnalyticsTracker from './components/AnalyticsTracker';
import PortfolioLayout from './layouts/PortfolioLayout';
import Home from './pages/portfolio/Home';
import Projects from './pages/portfolio/Projects';
import PortfolioServices from './pages/portfolio/Services';
import TechStack from './pages/portfolio/TechStack';
import Process from './pages/portfolio/Process';
import Testimonials from './pages/portfolio/Testimonials';
import ContactPage from './pages/portfolio/Contact';
import HaritechLayout from './layouts/HaritechLayout';
import HaritechHome from './pages/haritech/HaritechHome';
import About from './pages/haritech/About';
import WhatWeDo from './pages/haritech/WhatWeDo';
import Services from './pages/haritech/Services';
import Industries from './pages/haritech/Industries';
import HaritechPortfolio from './pages/haritech/HaritechPortfolio';
import CACRegistration from './pages/haritech/CACRegistration';
import Blog from './pages/haritech/Blog';
import FAQ from './pages/haritech/FAQ';
import Contact from './pages/haritech/Contact';
import RequestQuote from './pages/haritech/RequestQuote';
import SolarEnergy from './pages/haritech/SolarEnergy';
import { eventForCloudKey } from './utils/cloudSync';
import './index.css';

// Cross-tab propagation: edits saved in the admin tab write localStorage,
// which fires the NATIVE 'storage' event only in OTHER tabs. Re-emit it as
// the app's custom event so every page (both sides) updates live.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    const eventName = eventForCloudKey(e.key);
    if (eventName) window.dispatchEvent(new Event(eventName));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <RouteEffects />
        <CloudSync />
        <AnalyticsTracker />
        <Routes>
        {/* Haritech Services comes first — site landing */}
        <Route path="/" element={<Navigate to="/haritech" replace />} />
        <Route path="/portfolio" element={<PortfolioLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="services" element={<PortfolioServices />} />
          <Route path="tech-stack" element={<TechStack />} />
          <Route path="process" element={<Process />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
        {/* Legacy portfolio URLs redirect to their new home */}
        <Route path="/projects" element={<Navigate to="/portfolio/projects" replace />} />
        <Route path="/services" element={<Navigate to="/portfolio/services" replace />} />
        <Route path="/tech-stack" element={<Navigate to="/portfolio/tech-stack" replace />} />
        <Route path="/process" element={<Navigate to="/portfolio/process" replace />} />
        <Route path="/testimonials" element={<Navigate to="/portfolio/testimonials" replace />} />
        <Route path="/contact" element={<Navigate to="/portfolio/contact" replace />} />
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
        </Route>
        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
// REBUILD
