import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, MessageCircle, ShieldCheck, 
  ArrowUp, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import { scrollToTop as smoothScrollToTop } from '../../utils/smoothScroll';

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
    smoothScrollToTop();
  };

  return (
    <div className="fixed ht-dock-bottom left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-0.75rem)] px-2 sm:px-3 py-2 rounded-full bg-slate-950/90 border border-white/20 backdrop-blur-2xl flex items-center justify-center gap-1.5 sm:gap-3 text-xs shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
      {/* Estimator Button */}
      <button
        onClick={onOpenEstimator}
        className="ht-tap flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all duration-200 shadow-md"
        title="Open Instant Cost Estimator"
        aria-label="Open Instant Cost Estimator"
      >
        <Calculator className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Smart Estimator</span>
      </button>

      {/* WhatsApp Button */}
      <a
        href={getWhatsAppUrl('Hello Haritech, I would like to ask about one of your services.')}
        target="_blank"
        rel="noopener noreferrer"
        className="ht-tap flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-200 border border-white/15"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Business details */}
      <button
        onClick={onOpenCacModal}
        className="ht-tap flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-medium transition-all duration-200 border border-white/10"
        title="Business details"
        aria-label="Business details"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
        <span className="hidden md:inline text-[11px]">Details</span>
      </button>

      {/* Portfolio Link */}
      <Link
        to="/haritech/portfolio"
        className="ht-tap hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-medium transition-all duration-200 border border-white/10"
        title="View Case Studies"
        aria-label="View case studies"
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
            className="ht-tap p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
