import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CrossPromoProps {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  to: string;
}

/**
 * Reminder banner shown on one side of the site pointing visitors
 * to the other side (Portfolio <-> Haritech Services).
 */
const CrossPromo: React.FC<CrossPromoProps> = ({ eyebrow, title, text, cta, to }) => {
  return (
    <section className="relative py-16">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="card bg-gradient-to-r from-[#0e1326] via-[#101736] to-[#0e1326] border-white/10 p-8 md:p-12 glow-border overflow-hidden relative"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-cyan-500/15 to-purple-500/15 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 blur-[80px] pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {eyebrow}
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
                {title}
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
                {text}
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link to={to} className="btn-primary text-base px-8 py-4 inline-flex items-center">
                {cta} <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CrossPromo;
