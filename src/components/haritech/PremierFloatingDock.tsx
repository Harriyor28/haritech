import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, MessageCircle, ShieldCheck, 
  ArrowUp, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppUrl } from '../../utils/haritechContent';

interface PremierFloatingDockProps {
  onOpenEstimator: () => void;
  onOpenCacModal: () => void;
}

export const PremierFloatingDock: React.FC<PremierFloatingDockProps> = ({
  onOpenEstimator,
  onOpenCacModal
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-fit px-3 py-2 rounded-full bg-slate-950/90 border border-white/20 backdrop-blur-2xl flex items-center gap-2 sm:gap-3 text-xs shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
      {/* Estimator Button */}
      <button
        onClick={onOpenEstimator}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all duration-200 shadow-md"
        title="Open Instant Cost Estimator"
      >
        <Calculator className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Smart Estimator</span>
      </button>

      {/* WhatsApp Button */}
      <a
        href={getWhatsAppUrl('Hello Haritech Exclusive Services, I am visiting your premier portal and would like to consult on an upcoming project.')}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-200 border border-white/15"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* CAC Verification Badge */}
      <button
        onClick={onOpenCacModal}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-medium transition-all duration-200 border border-white/10"
        title="Verify CAC Accreditation"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
        <span className="hidden md:inline font-mono text-[11px]">BN 3829104</span>
      </button>

      {/* Portfolio Link */}
      <Link
        to="/haritech/portfolio"
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-medium transition-all duration-200 border border-white/10"
        title="View Case Studies"
      >
        <Briefcase className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Works</span>
      </Link>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Scroll to Top"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
