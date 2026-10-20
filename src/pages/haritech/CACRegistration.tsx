import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Landmark, Scale, BadgeCheck, FileCheck, ClipboardList, ShieldCheck, ChevronDown, ArrowRight, Check, Clock } from 'lucide-react';
import { getCACInfo, CACInfo, getWhatsAppUrl } from '../../utils/haritechContent';
import CACFeeEstimator from '../../components/haritech/CACFeeEstimator';

/* ── CAC Registry identity ───────────────────────────────────────────────
   Deliberately distinct from the rest of the Haritech site:
   parchment paper, deep emerald + antique gold, serif display headings,
   ruled ledger rows instead of glassy dark cards.                      */

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay }}>
    {children}
  </motion.div>
);

const SERIF = "font-['Playfair_Display',serif]";

const CAC_SERVICES_KEY = 'haritech-cac-services';
const WHY_REGISTER_KEY = 'haritech-cac-why';
const DOCUMENTS_KEY = 'haritech-cac-docs';
const CAC_FAQ_KEY = 'haritech-cac-faq';

const getArr = (key: string, fallback: any[]) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
};

const processSteps = [
  { step: 'I', title: 'Briefing', desc: 'Send your proposed names and business details through WhatsApp or our enquiry desk.' },
  { step: 'II', title: 'Name Search & Reservation', desc: 'We run a CAC name search and reserve the strongest available option on your behalf.' },
  { step: 'III', title: 'Compilation of Particulars', desc: 'Your forms, identities and business details are compiled into a complete filing pack.' },
  { step: 'IV', title: 'Filing at the Commission', desc: 'The pack is lodged with the Corporate Affairs Commission under your assigned file.' },
  { step: 'V', title: 'Verification & Queries', desc: 'CAC reviews the filing; should any query arise, we respond and resolve it for you.' },
  { step: 'VI', title: 'Approval & Issuance', desc: 'Registration is approved and your certificate is issued electronically by the Commission.' },
  { step: 'VII', title: 'Delivery of Certificates', desc: 'Certified copies are delivered to you — ready for banking, contracts and tenders.' },
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
    return () => window.removeEventListener('haritech-cac-data-updated', handler);
  }, []);

  const Rule = ({ label }: { label: string }) => (
    <FadeInView>
      <div className="flex items-center gap-4 mb-10">
        <span className={`${SERIF} italic text-[#B08D2E] text-sm tracking-wide`}>{label}</span>
        <span className="h-px flex-1 bg-[#DED3AC]" />
      </div>
    </FadeInView>
  );

  return (
    <div className="relative overflow-x-hidden bg-[#F7F2E6] text-[#2A352C]">
      {/* Registry strip */}
      <div className="bg-[#0B6B3B] text-[#EFE7CF] text-[10px] sm:text-[11px] tracking-[0.22em] uppercase">
        <div className="container mx-auto px-6 h-8 flex items-center justify-between gap-4">
          <span className="hidden sm:inline">File No. HAR/CAC/2024</span>
          <span className="truncate">Corporate Affairs Commission · Federal Republic of Nigeria</span>
          <span className="hidden sm:inline">Registry Desk · Port Harcourt</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-20 border-b border-[#DED3AC]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:repeating-linear-gradient(0deg,transparent,transparent_31px,#e6dcc2_31px,#e6dcc2_32px)]" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 border border-[#B08D2E]/50 bg-[#FDFBF4] px-4 py-1.5 mb-8">
                <Scale className="h-3.5 w-3.5 text-[#B08D2E]" />
                <span className="text-[11px] tracking-[0.18em] uppercase text-[#7A6A33] font-medium">Business Registration Practice</span>
              </div>
              <h1 className={`${SERIF} text-2xl sm:text-3xl md:text-4xl leading-[1.15] text-[#1E2B20] mb-4`}>
                Your business, entered <br className="hidden sm:block" />
                <em className="text-[#0B6B3B]">into the Register.</em>
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6B5C] max-w-2xl mx-auto leading-relaxed mb-8">
                Haritech Exclusive Services acts as your filing agent before the Corporate Affairs Commission —
                name search, documentation, follow-up and certificate delivery, handled end to end for business
                names, limited companies and NGOs across Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] text-[#F7F2E6] text-xs sm:text-sm font-semibold px-6 py-3 transition-colors">
                  <FileCheck className="h-4 w-4" /> Begin Name Search
                </motion.a>
                <Link to="/haritech/request-quote" className="inline-flex items-center justify-center gap-2 border border-[#2A352C]/30 hover:border-[#2A352C] text-[#2A352C] text-xs sm:text-sm font-semibold px-6 py-3 transition-colors">
                  Request a Quote <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-y border-[#DED3AC] px-6 py-3 text-xs text-[#5F6B5C]">
                <span><span className={`${SERIF} text-[#0B6B3B] font-semibold`}>{cacInfo.rcNumber}</span> — our own CAC file no.</span>
                <span className="hidden sm:inline text-[#C6B98F]">·</span>
                <span>Registered <span className="text-[#2A352C] font-medium">{cacInfo.registrationDate}</span></span>
                <span className="hidden sm:inline text-[#C6B98F]">·</span>
                <span>Status: <span className="text-[#0B6B3B] font-medium">{cacInfo.status}</span></span>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Schedule of Services — ledger */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Rule label="Schedule I" />
          <FadeInView>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <h2 className={`${SERIF} text-3xl md:text-4xl text-[#1E2B20]`}>Registration Services</h2>
              <p className="text-sm text-[#5F6B5C] max-w-md">Every filing below is prepared, submitted and followed up by our registry desk.</p>
            </div>
          </FadeInView>
          <div className="border-t border-[#DED3AC]">
            {services.map((svc, i) => (
              <FadeInView key={svc.title} delay={i * 0.04}>
                <div className="group grid grid-cols-1 md:grid-cols-[4rem_1fr_auto] items-baseline gap-x-6 gap-y-2 border-b border-[#DED3AC] px-2 md:px-4 py-6 hover:bg-[#F1E9D6] transition-colors">
                  <span className={`${SERIF} text-2xl text-[#C6B98F] group-hover:text-[#B08D2E] transition-colors`}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className={`${SERIF} text-lg text-[#1E2B20] mb-1`}>{svc.title}</h3>
                    <p className="text-sm text-[#5F6B5C] leading-relaxed max-w-2xl">{svc.desc}</p>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] tracking-wide uppercase text-[#7A6A33]">
                      <Clock className="h-3 w-3" /> {svc.timeline || 'Varies'}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 text-sm font-medium">
                    <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-[#0B6B3B] hover:text-[#074D2A] underline underline-offset-4 decoration-[#B08D2E]/60">Register</a>
                    <Link to="/haritech/request-quote" className="text-[#5F6B5C] hover:text-[#1E2B20] underline underline-offset-4 decoration-transparent hover:decoration-[#C6B98F]">Enquire</Link>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Grounds for registration — clauses */}
      <section className="py-20 bg-[#F1E9D6] border-y border-[#DED3AC]">
        <div className="container mx-auto px-6">
          <Rule label="Schedule II" />
          <FadeInView>
            <h2 className={`${SERIF} text-3xl md:text-4xl text-[#1E2B20] mb-3`}>Grounds for Registration</h2>
            <p className="text-sm text-[#5F6B5C] max-w-2xl mb-12">Why incorporated businesses outperform informal ones — the case for entering your enterprise into the register.</p>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {whys.map((item, i) => (
              <FadeInView key={item.title} delay={i * 0.05}>
                <div className="flex gap-5 py-5 border-b border-[#DED3AC]">
                  <span className={`${SERIF} italic text-[#B08D2E] text-sm shrink-0 pt-0.5`}>§{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-[#1E2B20] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#5F6B5C] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Filing process — docket */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Rule label="Schedule III" />
          <FadeInView>
            <h2 className={`${SERIF} text-3xl md:text-4xl text-[#1E2B20] mb-12`}>The Filing Process</h2>
          </FadeInView>
          <div className="max-w-3xl">
            {processSteps.map((step, i) => (
              <FadeInView key={step.step} delay={i * 0.06}>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 shrink-0 flex items-center justify-center ${SERIF} text-sm font-semibold bg-[#0B6B3B] text-[#F7F2E6]`}>{step.step}</div>
                    {i < processSteps.length - 1 && <div className="w-px flex-1 bg-[#C6B98F]/60 min-h-[1.5rem]" />}
                  </div>
                  <div className="pb-10">
                    <h3 className={`${SERIF} text-lg text-[#1E2B20] mb-1`}>{step.title}</h3>
                    <p className="text-sm text-[#5F6B5C] leading-relaxed max-w-xl">{step.desc}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Documents + specimen certificate */}
      <section className="py-20 bg-[#F1E9D6] border-y border-[#DED3AC]">
        <div className="container mx-auto px-6">
          <Rule label="Schedule IV" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeInView>
              <div className="bg-[#FDFBF4] border border-[#DED3AC] p-8">
                <ClipboardList className="h-8 w-8 text-[#0B6B3B] mb-4" />
                <h2 className={`${SERIF} text-2xl text-[#1E2B20] mb-2`}>Checklist of Documents</h2>
                <p className="text-sm text-[#5F6B5C] mb-6">Have the following ready before we commence filing:</p>
                <ul className="space-y-0">
                  {documents.map((doc, i) => (
                    <li key={i} className="flex items-start gap-3 border-t border-[#EDE4CA] py-3 last:border-b">
                      <span className="mt-0.5 w-4 h-4 shrink-0 bg-[#0B6B3B] flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-[#F7F2E6]" />
                      </span>
                      <span className="text-sm text-[#2A352C]">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="relative bg-[#FDFBF4] border-[3px] border-double border-[#B08D2E]/60 p-8 pt-10">
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#B08D2E]/60" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#B08D2E]/60" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#B08D2E]/60" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#B08D2E]/60" />

                <div className="absolute -top-3 right-6 rotate-[-8deg] border-2 border-[#0B6B3B]/40 px-3 py-1 text-[10px] tracking-[0.25em] uppercase text-[#0B6B3B]/60 font-semibold bg-[#FDFBF4]">
                  Specimen
                </div>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#0B6B3B] flex items-center justify-center mb-3 ring-2 ring-[#B08D2E]/50 ring-offset-2 ring-offset-[#FDFBF4]">
                    <Landmark className="h-6 w-6 text-[#F7F2E6]" />
                  </div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#7A6A33] mb-1">Corporate Affairs Commission</p>
                  <h3 className={`${SERIF} text-xl text-[#1E2B20]`}>Certificate of Registration</h3>
                </div>

                <dl className="text-sm border-t border-[#EDE4CA] pt-4">
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">Registered Name</dt>
                    <dd className={`${SERIF} text-[#1E2B20] font-semibold text-right`}>{cacInfo.registeredName}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">RC / BN Number</dt>
                    <dd className={`${SERIF} text-[#0B6B3B] font-semibold`}>{cacInfo.rcNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">Date of Registration</dt>
                    <dd className="text-[#1E2B20]">{cacInfo.registrationDate}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">Status</dt>
                    <dd className="inline-flex items-center gap-1 text-[#0B6B3B] font-medium"><BadgeCheck className="h-3.5 w-3.5" /> {cacInfo.status}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[#7A6A33]">Registered Address</dt>
                    <dd className="text-[#1E2B20] text-right">{cacInfo.address}</dd>
                  </div>
                </dl>

                <p className="mt-6 text-[11px] text-[#8B9284] text-center leading-relaxed">
                  Specimen only — your issued certificate carries the Commission's digital seal and your unique RC/BN number.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Enquiries */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Rule label="Schedule V" />
          <FadeInView>
            <h2 className={`${SERIF} text-3xl md:text-4xl text-[#1E2B20] mb-12`}>Enquiries</h2>
          </FadeInView>
          <div className="max-w-3xl border-t border-[#DED3AC]">
            {faqs.map((faq, i) => (
              <FadeInView key={i} delay={i * 0.04}>
                <div className="border-b border-[#DED3AC]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full py-5 flex items-center justify-between text-left gap-6 hover:text-[#0B6B3B] transition-colors"
                  >
                    <span className={`${SERIF} text-base text-[#1E2B20]`}>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-[#B08D2E] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="pb-5 pr-8">
                          <p className="text-sm text-[#5F6B5C] leading-relaxed border-l-2 border-[#C6B98F] pl-4">{faq.a}</p>
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

      {/* CAC Fee Estimator */}
      <CACFeeEstimator />

      {/* Closing — engage the registry desk */}
      <section className="bg-[#074D2A] py-20">
        <div className="container mx-auto px-6">
          <div className="border border-[#C9A227]/40 p-8 md:p-12 text-center">
            <ShieldCheck className="h-8 w-8 text-[#C9A227] mx-auto mb-4" />
            <h2 className={`${SERIF} text-2xl sm:text-3xl md:text-4xl text-[#F7F2E6] mb-3`}>Engage the Registry Desk</h2>
            <p className="text-xs sm:text-sm text-[#C8D5C6] max-w-2xl mx-auto leading-relaxed mb-8">
              Whether you are incorporating a new venture or regularising an existing one, our filing agents
              will see your application through — from the first name search to the delivery of your certificate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B08D2E] text-[#1E2B20] text-xs sm:text-sm font-semibold px-7 py-3.5 transition-colors">
                <Scale className="h-4 w-4" /> Start Your Registration
              </motion.a>
              <Link to="/haritech/request-quote" className="inline-flex items-center justify-center gap-2 border border-[#C9A227]/50 hover:border-[#C9A227] text-[#F7F2E6] text-xs sm:text-sm font-semibold px-7 py-3.5 transition-colors">
                Speak to an Agent <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CACRegistration;
