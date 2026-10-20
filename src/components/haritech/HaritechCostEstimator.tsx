import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Check, ArrowRight, MessageCircle, 
  Sparkles, ShieldCheck, Clock, X
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';

export interface EstimatorProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean;
}

type ServiceType = 'web' | 'solar' | 'epoxy' | 'cac';
type ProjectTier = 'starter' | 'professional' | 'enterprise';

interface OptionAddon {
  id: string;
  label: string;
  priceNgn: number;
  timeDays: number;
}

const serviceData: Record<ServiceType, {
  name: string;
  tiers: Record<ProjectTier, { label: string; baseNgn: number; days: number; features: string[] }>;
  addons: OptionAddon[];
}> = {
  web: {
    name: 'Web & Digital Systems',
    tiers: {
      starter: {
        label: 'Business Landing & Brand Site',
        baseNgn: 150000,
        days: 5,
        features: ['Up to 5 Pages', 'Mobile Responsive', 'Contact & WhatsApp Form', 'Basic SEO Setup', 'Free Domain Setup']
      },
      professional: {
        label: 'Dynamic Corporate Portal / E-Commerce',
        baseNgn: 350000,
        days: 12,
        features: ['Full Product Store / Custom CMS', 'Online Payment Gateway', 'Customer Management', 'Speed Optimization', 'Admin Control Panel']
      },
      enterprise: {
        label: 'Custom SaaS & Cloud Architecture',
        baseNgn: 750000,
        days: 25,
        features: ['Bespoke Database & API', 'Role-based Access & Auth', 'Real-time Analytics', 'High-volume Architecture', 'Priority SLA Support']
      }
    },
    addons: [
      { id: 'seo', label: 'Advanced SEO & Google Indexing', priceNgn: 50000, timeDays: 2 },
      { id: 'logo', label: 'Complete Brand Identity & Logo Kit', priceNgn: 40000, timeDays: 3 },
      { id: 'maintenance', label: '1-Year Maintenance & Server Backups', priceNgn: 80000, timeDays: 0 },
      { id: 'rush', label: 'Fast-Track Priority Delivery (2x speed)', priceNgn: 60000, timeDays: -3 }
    ]
  },
  solar: {
    name: 'Solar & Renewable Inverter Grids',
    tiers: {
      starter: {
        label: '1.5kVA - 2.5kVA Essential Solar Backup',
        baseNgn: 480000,
        days: 2,
        features: ['Powers Lights, TVs, Fans, Laptops, WiFi', 'Pure Sine Wave Inverter', 'Deep-Cycle Battery Bank', 'Surge & Thunder Protection', 'Professional Cable Trunking']
      },
      professional: {
        label: '3.5kVA - 5kVA Whole Home / Executive Office',
        baseNgn: 1100000,
        days: 3,
        features: ['Powers Refrigerators, Inverter ACs, Full Office', 'Tier-1 High-Efficiency PV Panels', 'High-Capacity Lithium LiFePO4', 'Smart Display & Mobile Monitoring', 'Automatic Grid Changeover']
      },
      enterprise: {
        label: '10kVA - 20kVA Commercial Micro-Grid',
        baseNgn: 2900000,
        days: 6,
        features: ['Powers Heavy Machinery & Multi-Unit Complexes', 'Industrial Hybrid Inverters', 'Extended LiFePO4 Rack System', 'Zero-Downtime Guarantee', '2-Year Free Maintenance Contract']
      }
    },
    addons: [
      { id: 'lithium', label: 'Upgrade to Ultra-Grade Lithium LiFePO4', priceNgn: 250000, timeDays: 0 },
      { id: 'remote_monitor', label: 'IoT Smart Mobile Phone Monitoring Hub', priceNgn: 45000, timeDays: 1 },
      { id: 'roof_reinforce', label: 'Heavy-Duty Anti-Corrosion Roof Rails', priceNgn: 65000, timeDays: 1 }
    ]
  },
  epoxy: {
    name: '3D Epoxy & Luxury Resin Floors',
    tiers: {
      starter: {
        label: 'Single Room / Boutique Living Space (Up to 25 sqm)',
        baseNgn: 220000,
        days: 3,
        features: ['Surface Prep & Diamond Grinding', 'High-Gloss Protective Topcoat', 'Seamless Joint-Free Finish', 'Waterproof & Stain Resistant', 'Choice of Custom Colorway']
      },
      professional: {
        label: 'Full Apartment / Corporate Lounge (Up to 80 sqm)',
        baseNgn: 650000,
        days: 5,
        features: ['3D Visual Artwork / Italian Marble Vein', 'UV-Stable Anti-Yellowing Resin', 'Scratch-Resistant Polyurethane Seal', 'Anti-Microbial & Chemical Safe', 'Mirror-Reflective Sheen']
      },
      enterprise: {
        label: 'Commercial Showroom / Industrial Floor (150+ sqm)',
        baseNgn: 1450000,
        days: 8,
        features: ['Heavy Forklift & High-Traffic Grade', 'Non-Slip Quartz / Metallic Quartz Blend', '12,500 PSI Compressive Strength', 'Rapid-Cure Industrial Formulation', '5-Year Structural Warranty']
      }
    },
    addons: [
      { id: 'metallic', label: 'Deep Pearl Metallic 3D Pigment Infusion', priceNgn: 60000, timeDays: 1 },
      { id: 'antislip', label: 'Commercial Anti-Slip Diamond Grit Matrix', priceNgn: 35000, timeDays: 0 },
      { id: 'moisture_barrier', label: 'High-Pressure Hydrostatic Vapor Barrier', priceNgn: 55000, timeDays: 1 }
    ]
  },
  cac: {
    name: 'CAC Corporate Affairs Registration',
    tiers: {
      starter: {
        label: 'Business Name Registration (Sole Proprietor)',
        baseNgn: 35000,
        days: 4,
        features: ['Name Availability Search & Reservation', 'Official CAC Certificate of Registration', 'Status Report Document', 'Corporate Bank Account Ready', 'Free Legal Consultation']
      },
      professional: {
        label: 'Private Limited Liability Company (Ltd/LLC)',
        baseNgn: 85000,
        days: 6,
        features: ['1 Million Share Capital Incorporation', 'Memorandum & Articles of Association (MEMART)', 'Official CAC Registration Certificate', 'TIN & Corporate Tax Profile Setup', 'SCUML & Bank Resolution Documentation']
      },
      enterprise: {
        label: 'Corporate Conglomerate / NGO / Incorporated Trustees',
        baseNgn: 195000,
        days: 14,
        features: ['Constitution Drafting & Newspaper Gazette', 'Trustee Vetting & Federal Approval', 'Complete Legal Compliance Seal', 'Trademark & IP Consultation', 'Dedicated Corporate Attorney Filing']
      }
    },
    addons: [
      { id: 'fast_track', label: 'Express Rush Processing (Government Liaison)', priceNgn: 25000, timeDays: -2 },
      { id: 'tin', label: 'FIRS Corporate Tax Identification Number (TIN)', priceNgn: 20000, timeDays: 1 },
      { id: 'scuml', label: 'EFCC / SCUML Compliance Certificate Support', priceNgn: 35000, timeDays: 3 }
    ]
  }
};

export const HaritechCostEstimator: React.FC<EstimatorProps> = ({ 
  isOpen = false, 
  onClose,
  isInline = false
}) => {
  const [service, setService] = useState<ServiceType>('web');
  const [tier, setTier] = useState<ProjectTier>('professional');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const activeServiceData = serviceData[service];
  const activeTierData = activeServiceData.tiers[tier];

  const { totalPriceNgn, totalDays } = useMemo(() => {
    let price = activeTierData.baseNgn;
    let days = activeTierData.days;

    selectedAddons.forEach(addonId => {
      const addon = activeServiceData.addons.find(a => a.id === addonId);
      if (addon) {
        price += addon.priceNgn;
        days += addon.timeDays;
      }
    });

    return {
      totalPriceNgn: price,
      totalDays: Math.max(days, 2)
    };
  }, [activeTierData, selectedAddons, activeServiceData]);

  const approxUsd = Math.round(totalPriceNgn / 1450);

  const generateWhatsAppMessage = () => {
    const addonsList = selectedAddons
      .map(id => activeServiceData.addons.find(a => a.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    const msg = `*HARITECH ENTERPRISE ESTIMATE*
----------------------------------------
*Service:* ${activeServiceData.name}
*Tier:* ${activeTierData.label}
*Add-ons:* ${addonsList || 'None selected'}
*Est. Investment:* ₦${totalPriceNgn.toLocaleString()} (~$${approxUsd.toLocaleString()})
*Est. Delivery Timeline:* ~${totalDays} Business Days
----------------------------------------
Hello Haritech team, I just configured this estimate on your website and would like to proceed with precision onboarding.`;

    return getWhatsAppUrl(msg);
  };

  const content = (
    <div className="bg-slate-950/95 border border-white/10 rounded-3xl p-6 md:p-8 max-w-4xl w-full mx-auto backdrop-blur-2xl shadow-2xl relative text-left">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-slate-200 text-xs font-mono mb-2">
            <Calculator className="h-3.5 w-3.5 text-white" /> HARITECH ESTIMATION ENGINE
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white font-syne">
            Smart Project & Cost Estimator
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Configure your technical scope, calculate estimated investment, and get instant priority scheduling.
          </p>
        </div>
        {!isInline && onClose && (
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Step 1: Service Category */}
      <div className="space-y-3 mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 1: Choose Your Project Discipline
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(serviceData) as ServiceType[]).map(key => (
            <button
              key={key}
              onClick={() => {
                setService(key);
                setSelectedAddons([]);
              }}
              className={`p-3.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                service === key
                  ? 'border-white bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                  : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {serviceData[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Project Tier */}
      <div className="space-y-3 mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 2: Select Project Scale / Requirement
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['starter', 'professional', 'enterprise'] as ProjectTier[]).map(t => {
            const tData = activeServiceData.tiers[t];
            const isSelected = tier === t;
            return (
              <div
                key={t}
                onClick={() => setTier(t)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 to-slate-900/90 text-white ring-1 ring-cyan-400/50'
                    : 'border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-cyan-400">
                      {t}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div className="font-bold text-sm text-white mb-2 leading-tight">
                    {tData.label}
                  </div>
                  <div className="text-lg font-black font-mono text-white mb-3">
                    ₦{tData.baseNgn.toLocaleString()}
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {tData.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3 text-cyan-400" /> ~{tData.days} Days Delivery
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Add-ons */}
      {activeServiceData.addons.length > 0 && (
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step 3: Optional Power Add-Ons
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeServiceData.addons.map(addon => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    isChecked
                      ? 'border-cyan-400 bg-cyan-500/10 text-white'
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/10 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isChecked ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-600'
                    }`}>
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium">{addon.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    +₦{addon.priceNgn.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Calculation Summary Banner */}
      {/* Bottom Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-white" /> ESTIMATED SCOPE SUMMARY
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white font-mono">
              ₦{totalPriceNgn.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-slate-400 font-mono">
              (~${approxUsd.toLocaleString()} USD)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-300" /> Timeline: ~{totalDays} business days
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Milestone Protected
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <a
            href={generateWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-3.5 px-6 rounded-xl font-bold w-full md:w-auto flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Lock Estimate On WhatsApp</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative z-10 w-full max-w-4xl my-auto"
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
