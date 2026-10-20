import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle2, X, 
  Building2, FileCheck, Lock
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';

interface CacModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CacVerificationModal: React.FC<CacModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative z-10 w-full max-w-2xl bg-[#090d19] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
          >
            {/* Top Security Watermark Background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 via-cyan-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-green-400 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      OFFICIAL ACCREDITATION
                    </span>
                    <span className="text-xs text-slate-400 font-mono">CAMA 2020</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Corporate Affairs Commission (CAC)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Federal Republic of Nigeria • Statutory Verification
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Certificate Style Box */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 relative space-y-4 font-mono text-xs mb-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Entity Title:</span>
                <span className="text-white font-bold text-sm tracking-wide">
                  HARITECH EXCLUSIVE SERVICES
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Registration (RC / BN):</span>
                <span className="text-cyan-400 font-black text-sm">
                  BN 3829104
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Jurisdiction & Seal:</span>
                <span className="text-slate-200">
                  Federal Republic of Nigeria
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Authorized Sectors:</span>
                <span className="text-slate-200 text-right">
                  ICT, Energy & Clean Power, Engineering Finishes
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Live Legal Standing:</span>
                <span className="inline-flex items-center gap-1.5 text-green-400 font-bold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active & Registered
                </span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Verified Corporate Banking</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Authorized to issue statutory invoices & execute corporate contracts.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Client Protection Escrow</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Transparent milestone-based delivery with legal indemnity clauses.
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <span className="text-[11px] text-slate-400 font-mono">
                Verification Hash: <code className="text-cyan-400">HT-CAC-3829104-SEC</code>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={getWhatsAppUrl('Hello Haritech, I am requesting your official corporate profile and CAC registration documentation.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2.5 px-5 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FileCheck className="h-4 w-4" /> Request Official Docket PDF
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
