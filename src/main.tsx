import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ProjectDetail from './pages/ProjectDetail';
import AdminAuth from './components/admin/AdminAuth';
import CloudSync from './components/CloudSync';
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
import ThreeDEpoxy from './pages/haritech/ThreeDEpoxy';
import './index.css';
import './utils/designTheme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CloudSync />
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
          <Route path="3d-epoxy" element={<ThreeDEpoxy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
// REBUILD
