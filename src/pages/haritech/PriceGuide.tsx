import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calculator, Search, ArrowRight, MessageCircle, Info,
  Sun, Landmark, Paintbrush, Ship, Globe, ShieldCheck,
} from 'lucide-react';
import {
  PRICE_BOOK, CATEGORIES, CATEGORY_ORDER,
  type CategoryKey, type PriceEntry,
} from '../../config/pricing';
import { formatNaira } from '../../utils/money';
import { getWhatsAppUrl } from '../../utils/haritechContent';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const priceLabel = (item: PriceEntry): string => {
  if (item.priceNgn === null) return 'Price on request';
  const prefix = item.startingAt ? 'From ' : '';
  const suffix = item.unit ? ` / ${item.unit}` : '';
  return `${prefix}${formatNaira(item.priceNgn)}${suffix}`;
};

const PriceGuide: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PRICE_BOOK.filter(item => {
      const inCategory = activeCategory === 'all' || item.category === CATEGORIES[activeCategory];
      if (!inCategory) return false;
      if (!term) return true;
      return `${item.id} ${item.service} ${item.category} ${item.note}`.toLowerCase().includes(term);
    });
  }, [query, activeCategory]);

  const groups = CATEGORY_ORDER
    .map(key => ({
      key,
      label: CATEGORIES[key],
      items: filtered.filter(item => item.category === CATEGORIES[key]),
    }))
    .filter(group => group.items.length > 0);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    PRICE_BOOK.forEach(item => map.set(item.category, (map.get(item.category) ?? 0) + 1));
    return map;
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-24 pb-14">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-6">
                <Calculator className="h-4 w-4" /> Price Guide
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                Clear Prices. <span className="gradient-text">No Guesswork.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Every service Haritech publishes, with its starting price, unit and what is included.
                Official fees, third-party costs and disbursements are shown separately and confirmed
                in your quotation.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="section-padding pt-0">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Sun, title: 'Solar', text: 'Installation is included in every package. Upgrades are separate.' },
              { icon: Landmark, title: 'CAC', text: 'Official CAC fee and the assistance fee are included. SCUML is separate.' },
              { icon: Paintbrush, title: 'Epoxy', text: 'Surface preparation and UV topcoat are included in every finish.' },
              { icon: Ship, title: 'Import', text: 'Freight is chargeable kg × USD/kg × FX. Nothing is hardcoded.' },
            ].map((rule, index) => (
              <FadeInView key={rule.title} delay={index * 0.05}>
                <div className="card p-5 h-full">
                  <rule.icon className="h-5 w-5 text-cyan-400 mb-3" />
                  <h3 className="text-sm font-bold text-white mb-1">{rule.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{rule.text}</p>
                </div>
              </FadeInView>
            ))}
          </div>

          {/* Controls */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search a service, category or code…"
                  aria-label="Search the price guide"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900/70 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                    activeCategory === 'all'
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
                  }`}
                >
                  All ({PRICE_BOOK.length})
                </button>
                {CATEGORY_ORDER.map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                      activeCategory === key
                        ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                        : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
                    }`}
                  >
                    {CATEGORIES[key]} ({counts.get(CATEGORIES[key]) ?? 0})
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {filtered.length} of {PRICE_BOOK.length} services shown. Prices in Nigerian naira, effective 28 October 2026.
            </p>
          </div>

          {/* Price groups */}
          <div className="max-w-5xl mx-auto space-y-10">
            {groups.length === 0 && (
              <div className="card p-8 text-center">
                <p className="text-slate-400 text-sm">No service matches “{query}”. Try a shorter search.</p>
              </div>
            )}

            {groups.map(group => (
              <FadeInView key={group.key}>
                <section id={group.key}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-white font-syne">{group.label}</h2>
                    <span className="text-xs text-slate-500">{group.items.length} service{group.items.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="card overflow-hidden divide-y divide-white/5">
                    {group.items.map(item => (
                      <div key={item.id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{item.id}</span>
                              {item.pricingType === 'conditional' && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-full px-2 py-0.5">
                                  Conditional
                                </span>
                              )}
                              {item.startingAt && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-2 py-0.5">
                                  Starting price
                                </span>
                              )}
                              {item.priceNgn === null && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/5 border border-white/15 rounded-full px-2 py-0.5">
                                  Quote required
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-white">{item.service}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-2xl">{item.note}</p>
                          </div>
                          <div className="sm:text-right shrink-0">
                            <div className="text-base sm:text-lg font-black text-cyan-300 font-mono">
                              {priceLabel(item)}
                            </div>
                            {item.priceNgn !== null && item.unit && (
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                per {item.unit}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeInView>
            ))}
          </div>

          {/* Disclaimers */}
          <div className="max-w-5xl mx-auto mt-12">
            <div className="card p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  <p>
                    <span className="text-white font-semibold">These are indicative prices, not invoices.</span>{' '}
                    Final pricing depends on confirmed scope, quantities, site conditions and third-party quotes.
                    A quotation is binding only when Haritech issues it in writing.
                  </p>
                  <p>
                    <span className="text-white font-semibold">What is separate:</span> government and regulatory
                    fees not stated as included, domain and hosting, software licences, payment-gateway fees,
                    advertising spend, notarisation, registered office rent, newspaper publication, SCUML,
                    structural or switchgear work, repairs, moisture mitigation, travel outside the service area,
                    and any goods or supplier payments.
                  </p>
                  <p>
                    <span className="text-white font-semibold">No unapproved discounts.</span> Any discount,
                    waiver or special rate must be confirmed in writing before work starts. Prices may change
                    when official fees, exchange rates or supplier costs change; the price on your issued
                    quotation is the one that applies.
                  </p>
                  <p>
                    <span className="text-white font-semibold">Import freight is variable.</span> The import
                    estimator uses the chargeable weight, USD/kg rate and FX rate you enter, and timestamps the
                    calculation. The ₦500,000 clearing coordination fee applies only to qualifying large or
                    complex shipments and only with written authorisation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-5xl mx-auto mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 card p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Need a price for your exact scope?</h2>
              <p className="text-sm text-slate-400">
                Use the estimators or send us the details. We confirm inclusions before you pay.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/haritech/request-quote"
                className="btn-primary text-sm py-3 px-5 inline-flex items-center gap-2"
              >
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={getWhatsAppUrl('Hello Haritech! I have a question about the published price guide.')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm py-3 px-5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:border-white/30 inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="max-w-5xl mx-auto mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { to: '/haritech/cac-registration', label: 'CAC estimator', icon: Landmark },
              { to: '/haritech/solar-energy', label: 'Solar calculator', icon: Sun },
              { to: '/haritech/3d-epoxy', label: 'Epoxy calculator', icon: Paintbrush },
              { to: '/haritech/importation', label: 'Import estimator', icon: Ship },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/25 transition-colors"
              >
                <link.icon className="h-4 w-4 text-cyan-400" />
                {link.label}
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Link>
            ))}
          </div>

          <div className="max-w-5xl mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Scope confirmed before payment</span>
            <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-cyan-400" /> Prices in Nigerian naira</span>
            <span>Effective 28 October 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PriceGuide;
