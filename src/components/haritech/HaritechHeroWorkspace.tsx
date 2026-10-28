import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Sun, Paintbrush, FileText,
  ArrowRight, Zap, Shield, Ship, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppUrl } from '../../utils/haritechContent';

export type WorkspaceTab = 'tech' | 'solar' | 'epoxy' | 'import';

interface HaritechHeroWorkspaceProps {
  onOpenCacModal: () => void;
  onOpenEstimator: () => void;
}

/* Division spotlight used on the home page. Each panel explains what the
   division does and what the customer needs to prepare. Nothing here quotes
   a capacity, a success rate or a lead time the business has not confirmed. */

const TABS: { id: WorkspaceTab; label: string; icon: typeof Monitor }[] = [
  { id: 'tech', label: 'Tech & Accessories', icon: Monitor },
  { id: 'import', label: 'Importation', icon: Ship },
  { id: 'epoxy', label: 'Epoxy & Décor', icon: Paintbrush },
  { id: 'solar', label: 'Solar Energy', icon: Sun },
];

interface Panel {
  badge: string;
  badgeIcon: typeof Monitor;
  title: string;
  body: string;
  facts: { label: string; value: string }[];
  primary: { label: string; to: string };
  secondary: { label: string; message: string };
  panelTitle: string;
  checklist: string[];
  note: string;
}

const PANELS: Record<WorkspaceTab, Panel> = {
  tech: {
    badge: 'Laptop & Tech Accessories',
    badgeIcon: Monitor,
    title: 'Sourcing laptops, accessories and the parts that actually fit',
    body: 'Tell us what the machine is for and what you can spend. We compare options and confirm what is available before you pay — no claim of stock we do not have.',
    facts: [
      { label: 'First step', value: 'Specification' },
      { label: 'We confirm', value: 'Availability' },
      { label: 'Before payment', value: 'Written quote' },
    ],
    primary: { label: 'See the Service Division', to: '/haritech/services' },
    secondary: { label: 'Ask About a Device', message: 'Hello Haritech, I would like to ask about a laptop or accessory.' },
    panelTitle: 'What helps us advise you',
    checklist: [
      'What the machine will be used for',
      'Your budget range',
      'Preferred brand or specification, if any',
      'Whether you need accessories or setup too',
    ],
    note: 'Inventory varies. We confirm what is available before taking payment.',
  },
  import: {
    badge: 'Importation Consultation',
    badgeIcon: Ship,
    title: 'Sourcing, shipping and landed-cost planning — with the risks named',
    body: 'We help you clarify specifications, compare supplier quotations and understand what duty, freight and clearing add to the factory price. Final cost depends on rates at the time of import.',
    facts: [
      { label: 'We plan', value: 'Landed cost' },
      { label: 'We explain', value: 'Duty & freight' },
      { label: 'We never', value: 'Guarantee dates' },
    ],
    primary: { label: 'Open the Importation Page', to: '/haritech/importation' },
    secondary: { label: 'Discuss an Import', message: 'Hello Haritech, I would like help planning an import.' },
    panelTitle: 'What to send first',
    checklist: [
      'Product name and specification',
      'Quantity and packaging preference',
      'Target budget and currency',
      'Destination and any supplier details you have',
    ],
    note: 'Duty bands shown on the importation page are indicative — confirm the tariff for your HS code.',
  },
  epoxy: {
    badge: '3D Epoxy & Interior Décor',
    badgeIcon: Paintbrush,
    title: 'Surface-first advice before any finish is specified',
    body: 'Resin finishes depend on the substrate, moisture and traffic. We inspect first, explain what the surface can take, and only then quote a finish. Gallery images are design references.',
    facts: [
      { label: 'First step', value: 'Surface check' },
      { label: 'We quote', value: 'Per space' },
      { label: 'Gallery', value: 'Concepts' },
    ],
    primary: { label: 'See Finishes & Examples', to: '/haritech/3d-epoxy' },
    secondary: { label: 'Send a Photo of the Space', message: 'Hello Haritech, I would like to discuss an epoxy floor or interior décor.' },
    panelTitle: 'What helps us quote',
    checklist: [
      'A photo of the space',
      'Approximate floor area',
      'How the room is used',
      'Finish direction you like',
    ],
    note: 'Images on the site are illustrative concepts unless a specific project is confirmed.',
  },
  solar: {
    badge: 'Solar Energy',
    badgeIcon: Sun,
    title: 'Size the requirement before anyone sells you a system',
    body: 'A solar conversation starts with your appliances and how long you run them, not with a package price. We help with assessment, equipment guidance and installation coordination.',
    facts: [
      { label: 'Start with', value: 'Load list' },
      { label: 'We advise on', value: 'Sizing' },
      { label: 'Installation', value: 'Coordinated' },
    ],
    primary: { label: 'Open the Solar Page', to: '/haritech/solar-energy' },
    secondary: { label: 'Send Your Load List', message: 'Hello Haritech, I would like to discuss a solar requirement.' },
    panelTitle: 'What we need to assess',
    checklist: [
      'Appliances and their wattage',
      'Hours of use per day',
      'What must stay on during an outage',
      'Roof or mounting space available',
    ],
    note: 'Installed capacity and past installation records are to be confirmed by the owner.',
  },
};

export const HaritechHeroWorkspace: React.FC<HaritechHeroWorkspaceProps> = ({
  onOpenCacModal,
  onOpenEstimator,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('tech');
  const panel = PANELS[activeTab];

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      {/* Division tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 mb-3 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 px-3">
          <button
            onClick={onOpenEstimator}
            className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
          >
            <Zap className="h-3 w-3" /> COST ESTIMATOR
          </button>
          <button
            onClick={onOpenCacModal}
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-slate-200"
          >
            <Shield className="h-3 w-3" /> BUSINESS DETAILS
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-400/40" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block border border-yellow-400/40" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block border border-green-400/40" />
            </div>
            <span className="hidden sm:inline-block font-mono text-slate-400 ml-2">
              haritech.co/divisions/{activeTab}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            {panel.badge}
          </span>
        </div>

        <div className="p-6 md:p-8 min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-slate-300 text-xs font-mono font-medium">
                  <panel.badgeIcon className="h-3.5 w-3.5" /> {panel.badge}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                  {panel.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{panel.body}</p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {panel.facts.map(fact => (
                    <div key={fact.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-sm font-bold text-cyan-300">{fact.value}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{fact.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link to={panel.primary.to} className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold flex items-center gap-2">
                    {panel.primary.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href={getWhatsAppUrl(panel.secondary.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-2.5 px-5 rounded-xl font-semibold"
                  >
                    {panel.secondary.label}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white">{panel.panelTitle}</span>
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <ul className="space-y-2">
                    {panel.checklist.map(item => (
                      <li key={item} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="pt-2 border-t border-white/5 text-[10px] leading-relaxed text-slate-500">
                    {panel.note}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
