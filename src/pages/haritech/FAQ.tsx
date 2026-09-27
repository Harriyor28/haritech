import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent, getFAQCategories, FAQCategory } from '../../utils/haritechContent';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQCategory[]>(() => getFAQCategories());
  const [activeCategory, setActiveCategory] = useState(faqs[0]?.category ?? '');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [content, setContent] = useState(() => getHaritechContent());

  useEffect(() => {
    const contentHandler = () => setContent(getHaritechContent());
    const faqHandler = () => {
      const data = getFAQCategories();
      setFaqs(data);
      setActiveCategory(prev =>
        data.some(f => f.category === prev) ? prev : (data[0]?.category ?? '')
      );
    };
    window.addEventListener('haritech-content-updated', contentHandler);
    window.addEventListener('haritech-faq-updated', faqHandler);
    return () => {
      window.removeEventListener('haritech-content-updated', contentHandler);
      window.removeEventListener('haritech-faq-updated', faqHandler);
    };
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const activeFaqs = faqs.find(f => f.category === activeCategory) ?? faqs[0];

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                <HelpCircle className="h-4 w-4" /> FAQ
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Find answers to common questions about our services, pricing, processes, and more.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {faqs.map(f => (
              <button key={f.category} onClick={() => setActiveCategory(f.category)} className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${activeCategory === f.category ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent shadow-lg' : 'bg-[#0e1326]/50 text-slate-400 border-white/5 hover:border-slate-500/35 hover:text-white'}`}>
                {f.category}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto space-y-4">
              {activeFaqs?.items?.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                  <button onClick={() => toggleItem(i)} className="w-full p-5 flex items-center justify-between text-left hover:bg-[#141b35] transition-colors">
                    <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-purple-400 shrink-0 transition-transform ${openItems.includes(i) ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openItems.includes(i) && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 pt-0">
                          <div className="h-px bg-white/5 mb-4" />
                          <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-cyan-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Still Have Questions?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">We're here to help. Reach out to us directly and we'll get back to you promptly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-primary text-base px-10 py-4"><MessageCircle className="h-5 w-5" /> WhatsApp Us</a>
              <Link to="/haritech/contact" className="btn-secondary text-base px-10 py-4">Contact Page <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
              <a href={`mailto:${content.email}`} className="btn-secondary text-base px-10 py-4"><Mail className="h-5 w-5 text-cyan-400" /> Email Us</a>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
