import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, ArrowRight, Zap, Clock, Award, ChevronDown, Download } from 'lucide-react';
import { getCACInfo, CACInfo, getWhatsAppUrl } from '../../utils/haritechContent';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const CAC_SERVICES_KEY = 'haritech-cac-services';
const WHY_REGISTER_KEY = 'haritech-cac-why';
const DOCUMENTS_KEY = 'haritech-cac-docs';
const CAC_FAQ_KEY = 'haritech-cac-faq';

const getArr = (key: string, fallback: any[]) => {
  try {
    const d = localStorage.getItem(key);
    const parsed = d ? JSON.parse(d) : null;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const processSteps = [
  { step: '1', title: 'Contact Haritech', desc: 'Reach out to us via phone, WhatsApp, email, or our website.' },
  { step: '2', title: 'Business Name Search', desc: 'We search and confirm the availability of your preferred business name(s).' },
  { step: '3', title: 'Submit Information', desc: 'Provide the required documents and information for registration.' },
  { step: '4', title: 'Documentation', desc: 'We prepare and file all necessary documents with the CAC.' },
  { step: '5', title: 'CAC Processing', desc: 'The CAC processes your application and conducts verification.' },
  { step: '6', title: 'Certificate Issued', desc: 'Your registration certificate is issued and delivered to you.' },
  { step: '7', title: 'Business Ready', desc: 'Your business is legally registered and ready to operate.' },
];

const CACRegistration: React.FC = () => {
  const [cacInfo, setCacInfo] = useState<CACInfo>(() => getCACInfo());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [services, setServices] = useState<any[]>(() => getArr(CAC_SERVICES_KEY, []));
  const [whys, setWhys] = useState<any[]>(() => getArr(WHY_REGISTER_KEY, []));
  const [documents, setDocuments] = useState<string[]>(() => getArr(DOCUMENTS_KEY, []));
  const [faqs, setFaqs] = useState<any[]>(() => getArr(CAC_FAQ_KEY, []));

  useEffect(() => {
    const handler = () => {
      setCacInfo(getCACInfo());
      setServices(getArr(CAC_SERVICES_KEY, []));
      setWhys(getArr(WHY_REGISTER_KEY, []));
      setDocuments(getArr(DOCUMENTS_KEY, []));
      setFaqs(getArr(CAC_FAQ_KEY, []));
    };
    window.addEventListener('haritech-cac-data-updated', handler);
    window.addEventListener('haritech-cac-updated', handler);
    window.addEventListener('haritech-content-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('haritech-cac-data-updated', handler);
      window.removeEventListener('haritech-cac-updated', handler);
      window.removeEventListener('haritech-content-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <FileText className="h-4 w-4" /> CAC Registration Services
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Register Your Business with <span className="gradient-text">Confidence</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                Start your business the right way with fast, reliable, and professional Corporate Affairs Commission (CAC) registration services. Haritech Exclusive Services simplifies the registration process for entrepreneurs, startups, and established businesses across Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary text-base px-8 py-4"><Zap className="h-5 w-5" /> Register Your Business</motion.a>
                <Link to="/haritech/request-quote" className="btn-secondary text-base px-8 py-4">Get Started <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Why Register */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Why Register Your <span className="gradient-text">Business?</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Registering your business with the CAC unlocks numerous benefits and opportunities.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whys.map((item, i) => (
              <FadeInView key={item.title} delay={i * 0.06}>
                <div className="card p-5 h-full hover:bg-[#141b35] transition-all group glow-border">
                  <Award className="h-8 w-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Services */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="gradient-text-pink">Registration Services</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Comprehensive CAC registration solutions tailored to your business needs.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <FadeInView key={svc.title} delay={i * 0.06}>
                <div className="card p-6 h-full hover:bg-[#141b35] transition-all group glow-border">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-full w-full text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">{svc.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mb-4">
                    <Clock className="h-3 w-3" /> Estimated timeline: {svc.timeline || 'Varies'}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white py-2 rounded-xl text-xs font-bold border border-cyan-500/20 hover:border-transparent transition-all">Register Now</a>
                    <Link to="/haritech/request-quote" className="flex-1 text-center bg-slate-900 border border-white/5 text-slate-300 hover:text-white py-2 rounded-xl hover:bg-slate-800 text-xs font-bold transition-all">Get Started</Link>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Registration <span className="gradient-text">Process</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Simple, transparent, and hassle-free — we handle everything for you.</p>
            </div>
          </FadeInView>
          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, i) => (
              <FadeInView key={step.step} delay={i * 0.1}>
                <div className="flex gap-6 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{step.step}</div>
                    {i < processSteps.length - 1 && <div className="w-0.5 h-full bg-gradient-to-b from-cyan-500/50 to-transparent" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInView>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Documents <span className="gradient-text-pink">Required</span></h2>
              <p className="text-slate-400 mb-8">To ensure a smooth registration process, please have the following information ready:</p>
              <div className="space-y-3">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300 text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </FadeInView>
            <FadeInView delay={0.2}>
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-purple-500/20 border border-white/10 p-8 flex flex-col items-center justify-center text-center">
                <FileText className="h-16 w-16 text-cyan-400/30 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">CAC Certificate Preview</h3>
                <p className="text-sm text-slate-500 mb-6">Your certificate will be displayed here once issued.</p>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2 px-4 rounded-lg inline-flex items-center gap-1.5"
                >
                  <Download className="h-3 w-3" /> Ask About Your Certificate
                </a>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Haritech CAC Info */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 glow-border text-center">
                <Award className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-6">Haritech CAC Information</h3>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 text-sm">Registered Name</span><span className="text-white text-sm font-medium">{cacInfo.registeredName}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 text-sm">RC/BN Number</span><span className="text-cyan-400 text-sm font-medium">{cacInfo.rcNumber}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 text-sm">Registration Date</span><span className="text-white text-sm">{cacInfo.registrationDate}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 text-sm">Status</span><span className="text-green-400 text-sm font-medium">{cacInfo.status}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 text-sm">Address</span><span className="text-white text-sm">{cacInfo.address}</span></div>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Common questions about CAC registration answered by our experts.</p>
            </div>
          </FadeInView>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <FadeInView key={i} delay={i * 0.05}>
                <div className="card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-[#141b35] transition-colors"
                  >
                    <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-cyan-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5">
                          <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/10 to-purple-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">Ready to Register Your Business?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Whether you're launching a startup or formalizing an existing business, Haritech Exclusive Services is here to guide you through every step of the CAC registration process. Let us help you build a legally recognized business with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <motion.a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary text-lg px-12 py-5"><Zap className="h-6 w-6" /> Register Your Business</motion.a>
              <Link to="/haritech/request-quote" className="btn-secondary text-lg px-12 py-5">Get Started <ArrowRight className="h-5 w-5 text-cyan-400" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default CACRegistration;
