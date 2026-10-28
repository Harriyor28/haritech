import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Clock, Ship, Plane, MapPin, Wallet, ArrowRight, MessageCircle,
  CheckCircle, Package, Sparkles, CalendarDays, Lock, Truck, AlertCircle,
} from 'lucide-react';
import { getImportationContent, getWhatsAppUrl } from '../../utils/haritechContent';
import type { PreOrderGroup } from '../../utils/haritechContent';

/* ── Pre-order pools ────────────────────────────────────────────────────
   Buyers who cannot fill a container alone join a shared pool: freight,
   clearing and duty are split across the group, and every member is
   added to the group chat for that shipment.                            */

const DAY = 86_400_000;

const daysLeft = (date: string): number => {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return 999;
  return Math.ceil((t - Date.now()) / DAY);
};

const prettyDate = (date: string): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'date to be confirmed';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fee = (n: number) => n.toLocaleString('en-NG');

const STEPS = [
  { icon: Lock, title: 'Lock your slot', desc: 'Pay the slot deposit and you are added to that shipment’s group chat — no full payment upfront.' },
  { icon: Ship, title: 'We consolidate & ship', desc: 'The pool is packed into one container or air consignment and tracked from the origin factory.' },
  { icon: Truck, title: 'Split, clear & deliver', desc: 'Freight, clearing and duty are shared by weight, then your units are released or delivered to you.' },
];

const ImportPreOrderGroups: React.FC = () => {
  const [groups, setGroups] = useState<PreOrderGroup[]>(() => getImportationContent().preOrders);
  const [product, setProduct] = useState('');
  const [units, setUnits] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const handler = () => setGroups(getImportationContent().preOrders);
    window.addEventListener('haritech-importation-updated', handler);
    return () => window.removeEventListener('haritech-importation-updated', handler);
  }, []);

  const sorted = useMemo(
    () => [...groups].sort((a, b) => daysLeft(a.closingDate) - daysLeft(b.closingDate)),
    [groups]
  );

  const open = sorted.filter(g => daysLeft(g.closingDate) >= 0);
  const closed = sorted.filter(g => daysLeft(g.closingDate) < 0);
  const slotsLeft = open.reduce((sum, g) => sum + Math.max(0, (g.slotsTotal || 0) - (g.slotsTaken || 0)), 0);
  const nextClose = open[0];

  const hasGroupChat = (g: PreOrderGroup) => Boolean(g.groupUrl?.trim());

  const joinHref = (g: PreOrderGroup) => {
    const chatUrl = g.groupUrl?.trim();
    if (chatUrl) return chatUrl;
    return getWhatsAppUrl(
      `Hello Haritech! I want to join the pre-order group "${g.product}" (closing ${prettyDate(g.closingDate)}).\n\n` +
        `Please send the slot deposit details and add me to the group.`
    );
  };

  const detailsHref = (g: PreOrderGroup) =>
    getWhatsAppUrl(
      `Hello Haritech! Please send me details on the pre-order pool "${g.product}" — deposit, landed cost per unit, origin and expected arrival in Lagos.`
    );

  const startHref = getWhatsAppUrl(
    `Hello Haritech! I would like to start a pre-order group.\n\n` +
      `Product: ${product || '[product]'}\n` +
      `Quantity: ${units || '[units]'}\n` +
      `Delivery city: ${city || '[city]'}\n\n` +
      `Please open the group and add me.`
  );

  const card = (g: PreOrderGroup, isClosed: boolean) => {
    const left = daysLeft(g.closingDate);
    const taken = Math.min(g.slotsTaken || 0, g.slotsTotal || 0);
    const total = Math.max(g.slotsTotal || 0, 1);
    const pct = Math.min(100, Math.round((taken / total) * 100));
    const slotsFree = Math.max(0, total - taken);

    return (
      <motion.div
        key={g.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`card p-6 h-full flex flex-col border-white/5 bg-[#0e1326]/80 ${isClosed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
            {g.segment}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
              isClosed
                ? 'bg-slate-700/40 text-slate-400 border-white/10'
                : left <= 7
                  ? 'bg-red-500/10 text-red-300 border-red-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <Clock className="h-3 w-3" />
            {isClosed ? 'Closed' : left === 0 ? 'Closes today' : `Closes in ${left}d`}
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-3 leading-snug">{g.product}</h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 mb-4">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-500" /> {g.origin}</span>
          <span className="inline-flex items-center gap-1.5">
            {g.mode?.toLowerCase().includes('air') ? <Plane className="h-3 w-3 text-slate-500" /> : <Ship className="h-3 w-3 text-slate-500" />} {g.mode}
          </span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3 w-3 text-slate-500" /> {prettyDate(g.closingDate)}</span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-slate-400">{fee(taken)} / {fee(total)} slots taken</span>
            <span className={slotsFree === 0 ? 'text-red-400 font-bold' : 'text-cyan-300 font-bold'}>
              {slotsFree === 0 ? 'Full' : `${slotsFree} left`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-950/70 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${slotsFree === 0 ? 'from-red-500 to-rose-600' : 'from-cyan-500 to-blue-600'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-slate-950/50 border border-white/5 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Slot deposit
            </p>
            <p className="text-xs font-bold text-white leading-snug">{g.deposit}</p>
          </div>
          <div className="rounded-xl bg-slate-950/50 border border-white/5 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 flex items-center gap-1">
              <Package className="h-3 w-3" /> Landed estimate
            </p>
            <p className="text-xs font-bold text-white leading-snug">{g.landed}</p>
          </div>
        </div>

        {g.note && <p className="text-[11px] text-slate-500 leading-relaxed mb-5">{g.note}</p>}

        <div className="mt-auto flex flex-col sm:flex-row gap-2.5">
          <a
            href={isClosed ? detailsHref(g) : joinHref(g)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isClosed ? 'btn-secondary' : 'btn-primary'} text-xs py-2.5 px-4 justify-center flex-1`}
          >
            <Users className="h-3.5 w-3.5" />{' '}
            {isClosed ? 'Join the waitlist' : hasGroupChat(g) ? 'Open the group chat' : 'Join this group'}
          </a>
          {!isClosed && (
            <a
              href={detailsHref(g)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center justify-center gap-1 py-2.5 px-2"
            >
              Ask first <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section id="import-preorder" className="section-padding bg-slate-950/20 border-y border-white/5 scroll-mt-24">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-sm font-semibold mb-4">
            <Users className="h-4 w-4" /> Pre-order groups
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight font-syne">
            Import Together, <span className="text-cyan-400">Pay Less</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Cannot fill a container on your own? Join a pre-order pool for the goods you are bringing in.
            The group shares the container, the clearing fee and the documentary cost — and every member is
            placed in the shipment group chat with the trade officer handling it.
          </p>
        </motion.div>

        {/* Live pool summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          {[
            { label: 'Open pools', value: `${open.length}`, icon: Users },
            { label: 'Slots still available', value: `${fee(slotsLeft)}`, icon: Package },
            { label: 'Next pool closes', value: nextClose ? prettyDate(nextClose.closingDate) : '—', icon: Clock },
          ].map(item => (
            <div key={item.label} className="card p-4 bg-[#0e1326]/60 border-white/5 text-center">
              <item.icon className="h-4 w-4 text-cyan-400 mx-auto mb-1.5" />
              <div className="text-base font-extrabold text-white font-mono leading-tight">{item.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-14">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/5 bg-slate-950/40 p-5"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <step.icon className="h-4 w-4 text-cyan-400" />
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">STEP {i + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Open groups */}
        {open.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {open.map(g => card(g, false))}
          </div>
        ) : (
          <div className="card p-10 text-center bg-[#0e1326]/60 border-white/5 max-w-2xl mx-auto">
            <AlertCircle className="h-6 w-6 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-semibold mb-1">No pool is open right now.</p>
            <p className="text-xs text-slate-500">Start one below and we will open a group for your product.</p>
          </div>
        )}

        {closed.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-12 mb-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recently closed</h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {closed.map(g => card(g, true))}
            </div>
          </>
        )}

        {/* Start your own group */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 max-w-4xl mx-auto card p-6 sm:p-8 bg-gradient-to-r from-teal-600/10 to-cyan-600/10 border-cyan-500/20"
        >
          <div className="flex items-start gap-3 mb-5">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5">
              <Sparkles className="h-full w-full text-white" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Start a pre-order group</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Bring in something that is not listed here and a group will be created for it.
                Send us the product, quantity and delivery city — we open the group chat, confirm the
                deposit and publish the closing date.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Product</label>
              <input
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder="e.g. Industrial freezer"
                className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Units</label>
              <input
                value={units}
                onChange={e => setUnits(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 10"
                className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Delivery city</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Lagos"
                className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={startHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-3 px-6 justify-center w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" /> Create my group
            </a>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              Groups close when the container is full or the date is reached — whichever comes first.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImportPreOrderGroups;
