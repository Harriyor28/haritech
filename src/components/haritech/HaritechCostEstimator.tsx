import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, Check, ArrowRight, MessageCircle,
  Sparkles, ShieldCheck, Clock, X
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import { priceOf } from '../../config/pricing';
import { formatNaira } from '../../utils/money';

export interface EstimatorProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean;
}

type ServiceKey = 'web' | 'solar' | 'epoxy' | 'cac';

interface EstimatorPackage {
  id: string;
  label: string;
  priceNgn: number;
  days: number;
  features: string[];
  perSqm: boolean;
}

interface EstimatorAddon {
  id: string;
  label: string;
  priceNgn: number;
  timeDays: number;
  perMonth: boolean;
  note?: string;
}

interface EstimatorService {
  key: ServiceKey;
  name: string;
  packages: EstimatorPackage[];
  addons: EstimatorAddon[];
  note: string;
}

const SERVICES: Record<ServiceKey, EstimatorService> = {
  web: {
    key: 'web',
    name: 'Web & Digital Systems',
    note: 'Domain, hosting, third-party licences and paid advertising are not included. An add-on already included in a package is shown but not added twice.',
    packages: [
      {
        id: 'WEB-001',
        label: 'Business Landing & Brand Site',
        priceNgn: priceOf('WEB-001'),
        days: 7,
        perSqm: false,
        features: ['Business landing page', 'Mobile responsive', 'Contact & WhatsApp forms', 'Scope confirmed in quotation'],
      },
      {
        id: 'WEB-002',
        label: 'Dynamic Corporate Portal / E-Commerce',
        priceNgn: priceOf('WEB-002'),
        days: 14,
        perSqm: false,
        features: ['Corporate portal or store', 'Payment gateway integration', 'Customer management', 'Admin control panel'],
      },
      {
        id: 'WEB-003',
        label: 'Custom SaaS & Cloud Architecture',
        priceNgn: priceOf('WEB-003'),
        days: 25,
        perSqm: false,
        features: ['Bespoke database & API', 'Role-based access', 'Real-time analytics', 'Priority support'],
      },
    ],
    addons: [
      { id: 'WEB-004', label: 'Advanced SEO & Google Indexing', priceNgn: priceOf('WEB-004'), timeDays: 2, perMonth: false, note: 'No ranking guarantee' },
      { id: 'WEB-005', label: 'Brand Identity & Logo Kit', priceNgn: priceOf('WEB-005'), timeDays: 3, perMonth: false },
      { id: 'WEB-007', label: 'Fast-Track Priority Delivery', priceNgn: priceOf('WEB-007'), timeDays: -3, perMonth: false },
      { id: 'WEB-006', label: 'Maintenance & Server Backups', priceNgn: priceOf('WEB-006'), timeDays: 0, perMonth: true, note: 'Billed monthly' },
    ],
  },
  solar: {
    key: 'solar',
    name: 'Solar & Renewable Systems',
    note: 'Installation is included in every package. Lithium, inverter and panel upgrades are separate. Transport outside the service area is quoted at actual cost.',
    packages: [
      {
        id: 'SOL-001', label: '1.5 kVA Essential', priceNgn: priceOf('SOL-001'), days: 2, perSqm: false,
        features: ['Essential backup package', 'Installation included', 'Specification confirmed in quotation'],
      },
      {
        id: 'SOL-002', label: '3.5 kVA Home Pro', priceNgn: priceOf('SOL-002'), days: 3, perSqm: false,
        features: ['Whole-home package', 'Installation included', 'Site survey may be required'],
      },
      {
        id: 'SOL-003', label: '5 kVA Executive', priceNgn: priceOf('SOL-003'), days: 3, perSqm: false,
        features: ['Executive home or office', 'Installation included', 'Specification confirmed in quotation'],
      },
      {
        id: 'SOL-004', label: '10 kVA Commercial', priceNgn: priceOf('SOL-004'), days: 6, perSqm: false,
        features: ['Commercial package', 'Installation included', 'Switchgear quoted separately'],
      },
      {
        id: 'SOL-005', label: '20 kVA Industrial', priceNgn: priceOf('SOL-005'), days: 8, perSqm: false,
        features: ['Industrial package', 'Installation included', 'Structural work after survey'],
      },
    ],
    addons: [
      { id: 'SOL-008', label: 'Lithium Battery Upgrade', priceNgn: priceOf('SOL-008'), timeDays: 0, perMonth: false, note: 'Scope confirmed before payment' },
      { id: 'SOL-009', label: 'Inverter Upgrade / Replacement', priceNgn: priceOf('SOL-009'), timeDays: 1, perMonth: false },
      { id: 'SOL-010', label: 'Solar Panel Upgrade / Addition', priceNgn: priceOf('SOL-010'), timeDays: 1, perMonth: false },
      { id: 'SOL-006', label: 'Site Survey / Energy Assessment', priceNgn: priceOf('SOL-006'), timeDays: 1, perMonth: false },
      { id: 'SOL-007', label: 'Solar System Maintenance', priceNgn: priceOf('SOL-007'), timeDays: 0, perMonth: false },
    ],
  },
  epoxy: {
    key: 'epoxy',
    name: '3D Epoxy & Resin Floors',
    note: 'Every finish price includes surface preparation and UV topcoat. Do not add the standalone preparation or topcoat rate to a finish. Repairs, moisture mitigation and travel are quoted after assessment.',
    packages: [
      {
        id: 'EPO-003', label: 'Metallic Sheen', priceNgn: priceOf('EPO-003'), days: 4, perSqm: true,
        features: ['Prep & UV topcoat included', 'Mirror-effect pour', 'Priced per m²'],
      },
      {
        id: 'EPO-001', label: 'Solid Colour Gloss', priceNgn: priceOf('EPO-001'), days: 3, perSqm: true,
        features: ['Prep & UV topcoat included', 'Seamless colour finish', 'Priced per m²'],
      },
      {
        id: 'EPO-002', label: 'Decorative Flake', priceNgn: priceOf('EPO-002'), days: 4, perSqm: true,
        features: ['Prep & UV topcoat included', 'Vinyl flake system', 'Priced per m²'],
      },
      {
        id: 'EPO-004', label: '3D Marble Vein', priceNgn: priceOf('EPO-004'), days: 5, perSqm: true,
        features: ['Prep & UV topcoat included', 'Marble & stone veining', 'Priced per m²'],
      },
      {
        id: 'EPO-005', label: 'Glow-in-the-Dark', priceNgn: priceOf('EPO-005'), days: 6, perSqm: true,
        features: ['Prep & UV topcoat included', 'Photoluminescent finish', 'Priced per m²'],
      },
      {
        id: 'EPO-006', label: '3D Art / Mural', priceNgn: priceOf('EPO-006'), days: 8, perSqm: true,
        features: ['Prep & UV topcoat included', 'Custom artwork', 'Design scope confirmed'],
      },
    ],
    addons: [],
  },
  cac: {
    key: 'cac',
    name: 'CAC & Business Registration',
    note: 'Every package includes the official CAC fee and the ₦20,000 Haritech registration assistance fee. Do not add assistance again. TIN is included where applicable. SCUML and newspaper publication are separate.',
    packages: [
      {
        id: 'CAC-001', label: 'Business Name (BN)', priceNgn: priceOf('CAC-001'), days: 5, perSqm: false,
        features: ['Official CAC fee included', 'Assistance fee included', 'TIN where applicable'],
      },
      {
        id: 'CAC-002', label: 'Limited Liability Company (LLC/Ltd)', priceNgn: priceOf('CAC-002'), days: 10, perSqm: false,
        features: ['Official CAC fee included', 'Assistance fee included', 'SCUML quoted separately'],
      },
      {
        id: 'CAC-003', label: 'NGO Registration', priceNgn: priceOf('CAC-003'), days: 14, perSqm: false,
        features: ['Official CAC fee included', 'Assistance fee included', 'Publication charged separately'],
      },
      {
        id: 'CAC-004', label: 'Incorporated Trustees', priceNgn: priceOf('CAC-004'), days: 14, perSqm: false,
        features: ['Official CAC fee included', 'Assistance fee included', 'Trustee verification'],
      },
      {
        id: 'CAC-005', label: 'Foreign Company Assistance', priceNgn: priceOf('CAC-005'), days: 20, perSqm: false,
        features: ['Official CAC fee included', 'Eligibility checked first', 'Disbursements quoted separately'],
      },
    ],
    addons: [
      { id: 'CAC-006', label: 'Express Processing', priceNgn: priceOf('CAC-006'), timeDays: -2, perMonth: false, note: 'Haritech handling only' },
      { id: 'CAC-STAMP', label: 'Company Rubber Stamp', priceNgn: 5000, timeDays: 1, perMonth: false },
      { id: 'CAC-COURIER', label: 'Nationwide Courier Delivery', priceNgn: 8000, timeDays: 1, perMonth: false },
    ],
  },
};

const SERVICE_ORDER: ServiceKey[] = ['web', 'solar', 'epoxy', 'cac'];

export const HaritechCostEstimator: React.FC<EstimatorProps> = ({
  isOpen = false,
  onClose,
  isInline = false,
}) => {
  const [service, setService] = useState<ServiceKey>('web');
  const [packageId, setPackageId] = useState<string>(SERVICES.web.packages[0].id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [areaSqm, setAreaSqm] = useState(20);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const activeService = SERVICES[service];
  const activePackage = activeService.packages.find(p => p.id === packageId) ?? activeService.packages[0];

  const { oneOffTotal, monthlyTotal, totalDays } = useMemo(() => {
    let oneOff = activePackage.perSqm
      ? activePackage.priceNgn * Math.max(1, areaSqm)
      : activePackage.priceNgn;
    let monthly = 0;
    let days = activePackage.days;

    selectedAddons.forEach(addonId => {
      const addon = activeService.addons.find(a => a.id === addonId);
      if (!addon) return;
      if (addon.perMonth) {
        monthly += addon.priceNgn;
      } else {
        oneOff += addon.priceNgn;
        days += addon.timeDays;
      }
    });

    return {
      oneOffTotal: oneOff,
      monthlyTotal: monthly,
      totalDays: Math.max(days, 2),
    };
  }, [activePackage, activeService.addons, selectedAddons, areaSqm]);

  const selectService = (key: ServiceKey) => {
    setService(key);
    setPackageId(SERVICES[key].packages[0].id);
    setSelectedAddons([]);
  };

  const generateWhatsAppMessage = () => {
    const addonsList = selectedAddons
      .map(id => {
        const addon = activeService.addons.find(a => a.id === id);
        return addon ? `${addon.label} (${addon.perMonth ? `${formatNaira(addon.priceNgn)}/month` : formatNaira(addon.priceNgn)})` : null;
      })
      .filter(Boolean)
      .join(', ');

    const areaLine = activePackage.perSqm
      ? `\n*Area:* ${areaSqm} m² × ${formatNaira(activePackage.priceNgn)}/m²`
      : '';
    const monthlyLine = monthlyTotal > 0 ? `\n*Recurring:* ${formatNaira(monthlyTotal)}/month` : '';

    const msg = `*HARITECH ENTERPRISE ESTIMATE*
----------------------------------------
*Service:* ${activeService.name}
*Package:* ${activePackage.label}${areaLine}
*Add-ons:* ${addonsList || 'None selected'}
*Est. Investment:* ${formatNaira(oneOffTotal)}${monthlyLine}
*Est. Delivery Timeline:* ~${totalDays} business days
----------------------------------------
Hello Haritech team, I configured this estimate on your website and would like to confirm the scope.`;

    return getWhatsAppUrl(msg);
  };

  const content = (
    <div className="bg-slate-950/95 border border-white/10 rounded-3xl p-6 md:p-8 max-w-4xl w-full mx-auto backdrop-blur-2xl shadow-2xl relative text-left">
      <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-slate-200 text-xs font-mono mb-2">
            <Calculator className="h-3.5 w-3.5 text-white" /> HARITECH ESTIMATION ENGINE
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white font-syne">
            Smart Project & Cost Estimator
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Configure your scope and see the approved indicative price. Official and third-party costs are confirmed in your quotation.
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

      <div className="space-y-3 mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 1: Choose Your Project Discipline
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SERVICE_ORDER.map(key => (
            <button
              key={key}
              onClick={() => selectService(key)}
              className={`p-3.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                service === key
                  ? 'border-white bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                  : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {SERVICES[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 2: Select Package / Finish
        </label>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeService.packages.length > 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-3`}>
          {activeService.packages.map(pkg => {
            const isSelected = activePackage.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setPackageId(pkg.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 to-slate-900/90 text-white ring-1 ring-cyan-400/50'
                    : 'border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-cyan-400">
                      {pkg.perSqm ? 'PER M²' : pkg.id.split('-')[0]}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div className="font-bold text-sm text-white mb-2 leading-tight">
                    {pkg.label}
                  </div>
                  <div className="text-lg font-black font-mono text-white mb-3">
                    {formatNaira(pkg.priceNgn)}{pkg.perSqm ? <span className="text-xs font-semibold text-slate-400">/m²</span> : null}
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3 text-cyan-400" /> ~{pkg.days} Days Delivery
                </div>
              </div>
            );
          })}
        </div>

        {activePackage.perSqm && (
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Area to cover (m²)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={areaSqm}
              onChange={event => setAreaSqm(Math.max(1, Number(event.target.value) || 1))}
              className="w-full px-4 py-3 rounded-lg bg-slate-950/60 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/60"
            />
            <p className="mt-2 text-[11px] text-slate-500">
              Finish price already includes surface preparation and UV topcoat.
            </p>
          </div>
        )}
      </div>

      {activeService.addons.length > 0 && (
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step 3: Optional Add-Ons
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeService.addons.map(addon => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-start justify-between gap-3 transition-all ${
                    isChecked
                      ? 'border-cyan-400 bg-cyan-500/10 text-white'
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/10 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                      isChecked ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-600'
                    }`}>
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-medium block">{addon.label}</span>
                      {addon.note && <span className="text-[10px] text-slate-500 block mt-0.5">{addon.note}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 whitespace-nowrap">
                    +{formatNaira(addon.priceNgn)}{addon.perMonth ? '/mo' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-white" /> ESTIMATED SCOPE SUMMARY
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-black text-white font-mono">
              {formatNaira(oneOffTotal)}
            </span>
            {activePackage.perSqm && (
              <span className="text-xs text-slate-400 font-mono">
                {areaSqm} m² × {formatNaira(activePackage.priceNgn)}/m²
              </span>
            )}
          </div>
          {monthlyTotal > 0 && (
            <p className="text-xs text-cyan-300 font-mono mt-1">
              + {formatNaira(monthlyTotal)}/month recurring
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-300" /> ~{totalDays} business days
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Scope confirmed before payment
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
            <span>Confirm On WhatsApp</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
        {activeService.note}
      </p>

      {!isInline && (
        <div className="mt-4 text-[10px] text-slate-600">
          Indicative price. Final quotation depends on confirmed scope, site conditions and third-party costs.
        </div>
      )}
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

export default HaritechCostEstimator;
