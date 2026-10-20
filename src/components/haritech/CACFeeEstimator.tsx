import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark, Calculator, Scale, BadgeCheck, Clock,
  ArrowRight, MessageCircle, CheckCircle
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';

/* ── CAC Registration Fee Estimator ─────────────────────────────────────
   Interactive tool for estimating Nigerian CAC registration costs and
   turnaround time across all major entity types.                       */

type EntityType = 'bn' | 'llc' | 'llc_foreign' | 'cbn_mfb' | 'ngo' | 'trustee';
type Urgency = 'standard' | 'express';

interface EntitySpec {
  label: string;
  description: string;
  govFeeNgn: number;        // Official CAC government filing fee
  serviceFeeNgn: number;    // Haritech professional service fee
  standardDays: number;
  expressDays: number;
  includes: string[];
  extraDocs?: string[];
}

const ENTITIES: Record<EntityType, EntitySpec> = {
  bn: {
    label: 'Business Name (BN)',
    description: 'Sole traders, partnerships, small businesses',
    govFeeNgn: 10_000,
    serviceFeeNgn: 25_000,
    standardDays: 5,
    expressDays: 2,
    includes: [
      'Name availability search', 'CAC-BN1 form preparation', 'Proprietor(s) data capture',
      'Certificate of Registration', 'Certified True Copy', 'Business name stamp advisory'
    ],
  },
  llc: {
    label: 'Limited Liability Company (LLC)',
    description: 'Private companies limited by shares (RC number)',
    govFeeNgn: 30_000,
    serviceFeeNgn: 65_000,
    standardDays: 10,
    expressDays: 5,
    includes: [
      'Name search & reservation', 'MEMART drafting', 'CAC 1.1 / CAC 2 / CAC 7 preparation',
      'Director & shareholder data capture', 'Certificate of Incorporation',
      'Certified True Copy of MEMART', 'Company seal advisory'
    ],
  },
  llc_foreign: {
    label: 'Foreign Company Registration',
    description: 'Foreign company establishing Nigerian presence',
    govFeeNgn: 90_000,
    serviceFeeNgn: 150_000,
    standardDays: 20,
    expressDays: 10,
    includes: [
      'Name availability check', 'Form CAC / A1 — A4 preparation', 'Notarization coordination',
      'Registered office establishment', 'Certificate of Registration',
      'Regulatory filing assistance (NIPC, NESREA if applicable)'
    ],
    extraDocs: ['Certified copy of parent company constitution', 'Board resolution (notarized)', 'Proof of registered office abroad']
  },
  cbn_mfb: {
    label: 'Microfinance Bank (MFB)',
    description: 'CAC + CBN licence path for MFBs',
    govFeeNgn: 50_000,
    serviceFeeNgn: 250_000,
    standardDays: 45,
    expressDays: 30,
    includes: [
      'Corporate name reservation', 'CAC incorporation (LLC)', 'CBN Approval-in-Principle filing',
      'Business plan & policy document templates', 'Final licence application compilation',
      'Compliance advisory & board resolution drafting'
    ],
    extraDocs: ['₦200M minimum paid-up capital (Unity Bank) or ₦1B (State)']
  },
  ngo: {
    label: 'Non-Governmental Organisation (NGO)',
    description: 'Incorporated Trustees / NGO without share capital',
    govFeeNgn: 20_000,
    serviceFeeNgn: 55_000,
    standardDays: 14,
    expressDays: 7,
    includes: [
      'Name availability search', 'CAC IT 1 form preparation', 'Trustee data capture',
      'Constitution / rulebook drafting', 'Newspaper publication (mandatory)',
      'Certificate of Registration of Trustees'
    ],
    extraDocs: ['Newspaper publication (we arrange)']
  },
  trustee: {
    label: 'Incorporated Trustees / Foundation',
    description: 'Religious bodies, clubs, foundations, associations',
    govFeeNgn: 20_000,
    serviceFeeNgn: 50_000,
    standardDays: 14,
    expressDays: 7,
    includes: [
      'Name search & approval', 'Constitution drafting', 'Trustee data verification',
      'CAC filing & lodgement', 'Certificate of Registration', 'Certified MEMART'
    ],
  },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)},000`;
  return `₦${n.toFixed(0)}`;
}

const CACFeeEstimator: React.FC = () => {
  const [entity, setEntity] = useState<EntityType>('llc');
  const [urgency, setUrgency] = useState<Urgency>('standard');
  const [addStamp, setAddStamp] = useState(false);
  const [addPostal, setAddPostal] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const spec = ENTITIES[entity];

  const result = useMemo(() => {
    const govFee      = spec.govFeeNgn;
    const serviceFee  = spec.serviceFeeNgn;
    const urgencyFee  = urgency === 'express' ? Math.round(serviceFee * 0.4) : 0;
    const stampFee    = addStamp  ? 5_000  : 0;
    const postalFee   = addPostal ? 8_000  : 0;
    const total       = govFee + serviceFee + urgencyFee + stampFee + postalFee;
    const days        = urgency === 'express' ? spec.expressDays : spec.standardDays;
    return { govFee, serviceFee, urgencyFee, stampFee, postalFee, total, days };
  }, [spec, urgency, addStamp, addPostal]);

  const waMsg = `Hello Haritech Registry Desk! I used the CAC Fee Estimator.\n\n` +
    `Entity Type: ${spec.label}\nProcessing: ${urgency === 'express' ? 'Express' : 'Standard'}\n` +
    `Estimated Total: ${fmt(result.total)}\nTimeline: ~${result.days} working days\n\n` +
    `Please guide me through the next steps.`;

  return (
    <section className="py-20 relative bg-[#0A2615]">
      {/* Parchment texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'60\' height=\'60\' filter=\'url(%23n)\'/%3E%3C/svg%3E')]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#C9A227] text-sm font-semibold mb-4 font-['Playfair_Display',serif] tracking-wider">
            <Calculator className="h-4 w-4" /> Registration Fee Estimator
          </div>
          <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl md:text-4xl text-[#F7F2E6] mb-3">
            What Will It <span className="text-[#C9A227]">Cost</span> to Register?
          </h2>
          <p className="text-[#C8D5C6] max-w-xl mx-auto">
            Select your entity type and service preferences for an instant, transparent cost estimate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="border border-[#C9A227]/30 bg-[#0D3018]/80 backdrop-blur-xl overflow-hidden">
            {/* Ledger header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-[#074D2A] border-b border-[#C9A227]/30">
              <Landmark className="h-5 w-5 text-[#C9A227]" />
              <span className="font-['Playfair_Display',serif] text-[#F7F2E6] font-bold">Haritech Corporate Registry — Fee Schedule</span>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                {/* Entity Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#C8D5C6] mb-3">Entity / Registration Type</label>
                  <div className="space-y-2">
                    {(Object.entries(ENTITIES) as [EntityType, EntitySpec][]).map(([key, s]) => (
                      <button
                        key={key}
                        onClick={() => { setEntity(key); setShowResult(false); }}
                        className={`w-full flex items-start gap-3 p-3 border text-left transition-all ${
                          entity === key
                            ? 'border-[#C9A227]/70 bg-[#C9A227]/10'
                            : 'border-[#C9A227]/15 hover:border-[#C9A227]/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${entity === key ? 'border-[#C9A227] bg-[#C9A227]' : 'border-[#C8D5C6]/30'}`} />
                        <div>
                          <div className="text-[#F7F2E6] font-semibold text-sm">{s.label}</div>
                          <div className="text-[#C8D5C6] text-xs">{s.description}</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-[#C9A227] font-bold text-sm">{fmt(s.govFeeNgn + s.serviceFeeNgn)}</div>
                          <div className="text-[#C8D5C6] text-xs">{s.standardDays}d</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Processing Speed */}
                <div>
                  <label className="block text-sm font-semibold text-[#C8D5C6] mb-3">Processing Speed</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['standard', 'express'] as Urgency[]).map(u => (
                      <button
                        key={u}
                        onClick={() => setUrgency(u)}
                        className={`flex items-center gap-2 px-4 py-3 border text-sm font-semibold transition-all ${
                          urgency === u
                            ? 'border-[#C9A227] bg-[#C9A227]/15 text-[#C9A227]'
                            : 'border-[#C9A227]/20 text-[#C8D5C6] hover:border-[#C9A227]/50'
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {u === 'standard' ? `Standard (${spec.standardDays}d)` : `Express (${spec.expressDays}d)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <label className="block text-sm font-semibold text-[#C8D5C6] mb-3">Optional Add-ons</label>
                  <div className="space-y-2">
                    {[
                      { key: 'stamp', label: 'Company Rubber Stamp', fee: 5_000, value: addStamp, setter: setAddStamp },
                      { key: 'postal', label: 'Nationwide Courier Delivery', fee: 8_000, value: addPostal, setter: setAddPostal },
                    ].map(a => (
                      <button
                        key={a.key}
                        onClick={() => { a.setter(!a.value); setShowResult(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border text-sm transition-all ${
                          a.value
                            ? 'border-[#C9A227]/60 bg-[#C9A227]/10 text-[#C9A227]'
                            : 'border-[#C9A227]/15 text-[#C8D5C6] hover:border-[#C9A227]/40'
                        }`}
                      >
                        <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${a.value ? 'border-[#C9A227] bg-[#C9A227]' : 'border-[#C8D5C6]/30'}`}>
                          {a.value && <CheckCircle className="h-3 w-3 text-[#0D3018]" />}
                        </div>
                        <span className="flex-1 text-left">{a.label}</span>
                        <span className="font-bold">{fmt(a.fee)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowResult(true)}
                  className="w-full py-4 bg-[#C9A227] hover:bg-[#B08D2E] text-[#1E2B20] font-bold text-base flex items-center justify-center gap-2 transition-colors"
                >
                  <Scale className="h-5 w-5" /> Calculate Registration Cost
                </motion.button>
              </div>

              {/* Results */}
              <div>
                <AnimatePresence mode="wait">
                  {showResult ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col gap-4"
                    >
                      {/* Cost breakdown */}
                      <div className="border border-[#C9A227]/30 bg-[#074D2A]/40 p-5">
                        <div className="font-['Playfair_Display',serif] text-[#C9A227] font-bold mb-4 text-sm tracking-wider uppercase">Cost Breakdown</div>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: 'CAC Government Filing Fee', value: result.govFee },
                            { label: 'Haritech Professional Service', value: result.serviceFee },
                            urgency === 'express' && { label: 'Express Processing Surcharge', value: result.urgencyFee },
                            addStamp && { label: 'Company Rubber Stamp', value: result.stampFee },
                            addPostal && { label: 'Courier Delivery', value: result.postalFee },
                          ].filter(Boolean).map((item: any, i) => (
                            <div key={i} className="flex justify-between text-[#C8D5C6]">
                              <span>{item.label}</span>
                              <span className="font-semibold text-[#F7F2E6]">{fmt(item.value)}</span>
                            </div>
                          ))}
                          <div className="border-t border-[#C9A227]/30 pt-3 mt-3 flex justify-between">
                            <span className="font-bold text-[#F7F2E6] font-['Playfair_Display',serif]">Total Estimate</span>
                            <span className="text-xl font-black text-[#C9A227]">{fmt(result.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="border border-[#C9A227]/20 bg-[#074D2A]/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-[#C9A227]" />
                          <span className="text-sm font-semibold text-[#C8D5C6]">Estimated Timeline</span>
                        </div>
                        <div className="text-2xl font-black text-[#F7F2E6]">~{result.days} Working Days</div>
                        <div className="text-xs text-[#C8D5C6] mt-1">from receipt of complete documents</div>
                      </div>

                      {/* What's included */}
                      <div className="border border-[#C9A227]/20 bg-[#074D2A]/20 p-4">
                        <div className="text-xs font-bold text-[#C9A227] uppercase tracking-wider mb-3">What's Included</div>
                        <div className="space-y-1">
                          {spec.includes.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[#C8D5C6]">
                              <BadgeCheck className="h-3.5 w-3.5 text-[#C9A227] flex-shrink-0 mt-0.5" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Extra docs if applicable */}
                      {spec.extraDocs && (
                        <div className="border border-amber-700/30 bg-amber-950/20 p-4 text-xs text-[#C8D5C6]">
                          <div className="font-bold text-amber-400 mb-2">Documents You'll Need to Provide:</div>
                          {spec.extraDocs.map((d, i) => <div key={i} className="flex gap-2"><span>→</span>{d}</div>)}
                        </div>
                      )}

                      {/* CTA */}
                      <motion.a
                        href={getWhatsAppUrl(waMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#C9A227] hover:bg-[#B08D2E] text-[#1E2B20] font-bold transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Start Registration on WhatsApp
                        <ArrowRight className="h-4 w-4" />
                      </motion.a>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center gap-6 py-8"
                    >
                      <div className="w-24 h-24 border-2 border-[#C9A227]/40 flex items-center justify-center">
                        <Landmark className="h-10 w-10 text-[#C9A227]/60" />
                      </div>
                      <div className="text-center">
                        <p className="font-['Playfair_Display',serif] text-[#F7F2E6] font-bold text-lg mb-2">Transparent Pricing</p>
                        <p className="text-[#C8D5C6] text-sm max-w-xs">
                          Select your entity type and click <strong className="text-[#C9A227]">Calculate</strong> for a detailed, itemized cost estimate.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-[#C8D5C6]/60 text-center">
                        <span>✓ No hidden charges</span>
                        <span>✓ Official CAC fees included</span>
                        <span>✓ All-inclusive professional service</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CACFeeEstimator;
