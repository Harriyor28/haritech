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

/* Stored lists written before the content correction carried claimed turnaround
   times ('1-2 weeks'). They are ignored so the corrected copy is what shows. */
const LEGACY_MARKERS = ['1-2 weeks', 'Register your business name with the CAC'];

const getArr = (key: string, fallback: any[]) => {
  try {
    const d = localStorage.getItem(key);
    if (!d) return fallback;
    if (LEGACY_MARKERS.some(marker => d.includes(marker))) return fallback;
    const parsed = JSON.parse(d);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch { return fallback; }
};

/* Default copy for the registration page. These are the matters an enquiry may
   cover; the Commission itself decides and issues the certificate, so nothing
   here promises approval or an accredited-agent status.                     */
const defaultServices = [
  { title: 'Business Name Registration', desc: 'A business name for a sole trader or partnership, prepared from the details you supply and followed up with the Commission.', timeline: 'Timeline set by the Commission' },
  { title: 'Limited Company Incorporation', desc: 'Incorporation of a private limited company, including the particulars and supporting documents the Commission asks for.', timeline: 'Timeline set by the Commission' },
  { title: 'Incorporated Trustees Applications', desc: 'Applications for associations, clubs and non-profit bodies, with the required newspaper notices explained up front.', timeline: 'Timeline set by the Commission' },
  { title: 'Post-Registration Changes', desc: 'Change of name, address, directors or share particulars, prepared and filed as the Commission requires.', timeline: 'Varies by change' },
  { title: 'Status & Document Assistance', desc: 'Help checking a registration status or obtaining a certified extract where the Commission provides one.', timeline: '1–5 working days' },
];

const defaultWhys = [
  { title: 'A verifiable legal identity', desc: 'A registered name can be checked by customers, banks and partners instead of being taken on trust.' },
  { title: 'Access to business banking', desc: 'Banks generally ask for registration documents before opening a corporate account.' },
  { title: 'Contracts and tenders', desc: 'Many organisations will only contract with a registered entity, and some bids require the certificate.' },
  { title: 'Clear ownership', desc: 'Registration records who owns the business and in what proportion, which matters if partners separate.' },
  { title: 'A foundation for compliance', desc: 'Registration is a starting point. Regulated activities still need their own licences and approvals.' },
];

const defaultDocuments = [
  'Proposed business or company names (two or three options)',
  'Valid means of identification for each proprietor, director or trustee',
  'Passport photographs where the Commission requires them',
  'Proof of address for the registered office',
  'Details of shareholding or membership, where applicable',
  'Any consent or pre-approval the activity requires',
];

const defaultFaqs = [
  { q: 'Does Haritech register businesses on behalf of CAC?', a: 'Haritech helps you prepare and follow up on a registration enquiry. The Commission receives the application and issues the certificate. We do not claim to be an accredited CAC agent or a law firm, and we will tell you when a matter needs a licensed professional.' },
  { q: 'How long does registration take?', a: 'The Commission controls the timeline, and it varies with the application type and any queries raised. We will give you the current expected range when you enquire rather than a guaranteed date.' },
  { q: 'What does it cost?', a: 'Fees depend on the application type and any professional or filing charges. Use the estimator on this page for an indicative figure, then confirm it in a written quotation.' },
  { q: 'Does registration let me do any business I like?', a: 'No. Registration establishes the entity. Regulated activities — financial services, health, education, importation of restricted goods — need separate approvals.' },
  { q: 'Can you help if my application was rejected or queried?', a: 'Often yes. Send the query notice and the documents already filed, and we will explain what the Commission is asking for before anything else is submitted.' },
];

const processSteps = [
  { step: 'I', title: 'Briefing', desc: 'Send your proposed names and business details through WhatsApp or the enquiry form.' },
  { step: 'II', title: 'Name Search', desc: 'Available name options are checked with the Commission before the application is prepared.' },
  { step: 'III', title: 'Compiling Particulars', desc: 'Forms, identification and business details are assembled into a complete pack.' },
  { step: 'IV', title: 'Submitting the Application', desc: 'The pack is submitted through the Commission channel that applies to your application type.' },
  { step: 'V', title: 'Queries', desc: 'If the Commission raises a query, it is explained to you and answered where we can.' },
  { step: 'VI', title: 'Approval & Certificate', desc: 'The Commission decides the application and issues the certificate when approved.' },
  { step: 'VII', title: 'Handover of Documents', desc: 'You receive the issued documents and a note of what has and has not been completed.' },
];

const CACRegistration: React.FC = () => {
  const [cacInfo, setCacInfo] = useState<CACInfo>(() => getCACInfo());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [services, setServices] = useState<any[]>(() => getArr(CAC_SERVICES_KEY, defaultServices));
  const [whys, setWhys] = useState<any[]>(() => getArr(WHY_REGISTER_KEY, defaultWhys));
  const [documents, setDocuments] = useState<string[]>(() => getArr(DOCUMENTS_KEY, defaultDocuments));
  const [faqs, setFaqs] = useState<any[]>(() => getArr(CAC_FAQ_KEY, defaultFaqs));

  /* Registration details are only public once the owner supplies them; until
     then the flag value is replaced with neutral wording instead of showing
     "NEEDS_OWNER_CONFIRMATION" to a visitor.                              */
  const shown = (value: string, fallback: string) =>
    !value || value === 'NEEDS_OWNER_CONFIRMATION' ? fallback : value;

  useEffect(() => {
    const handler = () => {
      setCacInfo(getCACInfo());
      setServices(getArr(CAC_SERVICES_KEY, defaultServices));
      setWhys(getArr(WHY_REGISTER_KEY, defaultWhys));
      setDocuments(getArr(DOCUMENTS_KEY, defaultDocuments));
      setFaqs(getArr(CAC_FAQ_KEY, defaultFaqs));
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
          <span className="hidden sm:inline">Registration assistance</span>
          <span className="truncate">Corporate Affairs Commission · Federal Republic of Nigeria</span>
          <span className="hidden sm:inline">Enquiries desk</span>
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
                <span className="text-[11px] tracking-[0.18em] uppercase text-[#7A6A33] font-medium">Registration Assistance</span>
              </div>
              <h1 className={`${SERIF} text-2xl sm:text-3xl md:text-4xl leading-[1.15] text-[#1E2B20] mb-4`}>
                Getting Your Business <br className="hidden sm:block" />
                <em className="text-[#0B6B3B]">Registered.</em>
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6B5C] max-w-2xl mx-auto leading-relaxed mb-8">
                Haritech helps you prepare a Corporate Affairs Commission application — the name options, the
                particulars, the supporting documents and the follow-up when the Commission raises a query.
                The Commission receives the application and issues the certificate; we do not claim to be an
                accredited agent or a law firm, and we say so when a matter needs a licensed professional.
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
                <span>Registered name: <span className="text-[#2A352C] font-medium">Haritech Exclusive Business</span></span>
                <span className="hidden sm:inline text-[#C6B98F]">·</span>
                <span>RC number: <span className="text-[#2A352C] font-medium font-mono">{cacInfo.rcNumber}</span></span>
                <span className="hidden sm:inline text-[#C6B98F]">·</span>
                <span>Location: Port Harcourt area</span>
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
              <p className="text-sm text-[#5F6B5C] max-w-md">Matters we can help you prepare and follow up. Costs and timelines are confirmed in writing before anything is filed.</p>
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
            <h2 className={`${SERIF} text-3xl md:text-4xl text-[#1E2B20] mb-3`}>Why Register</h2>
            <p className="text-sm text-[#5F6B5C] max-w-2xl mb-12">Practical reasons customers and business owners give for registering — and the limits of what registration alone provides.</p>
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
                <p className="text-sm text-[#5F6B5C] mb-6">Useful to have ready before an application is prepared:</p>
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
                  Details on record
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
                    <dd className={`${SERIF} text-[#1E2B20] font-semibold text-right`}>{shown(cacInfo.registeredName, 'Your registered name')}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">RC / BN Number</dt>
                    <dd className={`${SERIF} text-[#0B6B3B] font-semibold`}>{shown(cacInfo.rcNumber, 'Issued by the Commission')}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">Date of Registration</dt>
                    <dd className="text-[#1E2B20]">{shown(cacInfo.registrationDate, 'Date of registration')}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#EDE4CA] py-2">
                    <dt className="text-[#7A6A33]">Status</dt>
                    <dd className="inline-flex items-center gap-1 text-[#0B6B3B] font-medium"><BadgeCheck className="h-3.5 w-3.5" /> {shown(cacInfo.status, 'As issued')}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-[#7A6A33]">Registered Address</dt>
                    <dd className="text-[#1E2B20] text-right">{shown(cacInfo.address, 'Registered address')}</dd>
                  </div>
                </dl>

                <p className="mt-6 text-[11px] text-[#8B9284] text-center leading-relaxed">
                  Details supplied by the business. Ask for a copy of the certificate and check it
                  against the Commission's record before you contract.
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
            <h2 className={`${SERIF} text-2xl sm:text-3xl md:text-4xl text-[#F7F2E6] mb-3`}>Start an Application Enquiry</h2>
            <p className="text-xs sm:text-sm text-[#C8D5C6] max-w-2xl mx-auto leading-relaxed mb-8">
              Tell us the type of application and the names you are considering. We will explain the documents
              needed, the current fee range and the steps involved. The Commission decides the application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a href={getWhatsAppUrl('Hello Haritech, I would like to ask about CAC business registration.')} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B08D2E] text-[#1E2B20] text-xs sm:text-sm font-semibold px-7 py-3.5 transition-colors">
                <Scale className="h-4 w-4" /> Ask About Registration
              </motion.a>
              <Link to="/haritech/request-quote" className="inline-flex items-center justify-center gap-2 border border-[#C9A227]/50 hover:border-[#C9A227] text-[#F7F2E6] text-xs sm:text-sm font-semibold px-7 py-3.5 transition-colors">
                Request a Written Quotation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CACRegistration;
