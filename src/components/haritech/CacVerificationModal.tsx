import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, X, Building2, FileCheck, Info
} from 'lucide-react';
import { getCACInfo, getWhatsAppUrl } from '../../utils/haritechContent';

interface CacModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* Business details panel. Carries the registration details the owner confirmed.
   It still makes no accreditation claim and does not present registration as
   authorising regulated activities. */
export const CacVerificationModal: React.FC<CacModalProps> = ({ isOpen, onClose }) => {
  const cac = getCACInfo();
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
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative z-10 w-full max-w-2xl bg-[#090d19] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    BUSINESS DETAILS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Haritech Exclusive Business
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nigeria • Smart Tech, Smart Living.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close business details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 relative space-y-4 text-xs mb-6">
              <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-400">Business name</span>
                <span className="text-white font-semibold">Haritech Exclusive Business</span>
              </div>
              <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-400">Service divisions</span>
                <span className="text-slate-200 text-right">
                  Tech accessories, cyber café &amp; online registration, printing &amp; branding,
                  importation consultation, 3D epoxy &amp; décor, solar energy, project management,
                  business consultation
                </span>
              </div>
              <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-400">Registered name (CAC)</span>
                <span className="text-slate-200 text-right">{cac.registeredName}</span>
              </div>
              <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-400">RC number</span>
                <span className="font-mono text-white font-semibold text-right">{cac.rcNumber}</span>
              </div>
              <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-400">Registered</span>
                <span className="text-slate-200 text-right">
                  {cac.registrationDate} · {cac.status}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-400">Registered address</span>
                <span className="text-slate-200 text-right">{cac.address}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400">Operating location</span>
                <span className="text-slate-200 text-right">Nigeria — enquiries handled remotely and by appointment</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 mb-6">
              <Info className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-amber-100/80">
                A CAC certificate confirms a business is registered. It does not by itself authorise
                regulated activities — those need separate approvals. Haritech will tell you plainly
                which services it can handle directly and which need a licensed professional.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Written quotations</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Figures are quoted before work starts, with the assumptions listed.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <FileCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Documents on request</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Ask for a copy of the certificate before you commit, and check the details
                    against the Commission's record yourself.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <span className="text-[11px] text-slate-400">
                Details are supplied only when a customer asks.
              </span>
              <a
                href={getWhatsAppUrl('Hello Haritech, please send your business profile and current registration details.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-5 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <FileCheck className="h-4 w-4" /> Request documents
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
