import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Zap, Send, CheckCircle, AlertCircle, Loader2, MessageCircle, Mail, Phone, ClipboardList, FileText } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent } from '../../utils/haritechContent';
import { submitContactMessage, buildWhatsAppFallbackUrl, ContactMessage } from '../../utils/contactMessages';
import { trackEvent } from '../../utils/analytics';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const serviceOptions = [
  // Project & Property Management — the core reason the Hub exists
  'Project Management',
  'Construction Project Management',
  'Property Management',
  'Rental & Tenant Management',
  'Property Inspection & Condition Report',
  'Land & Property Development',
  'Renovation & Building Maintenance',
  'Remote Construction Monitoring',
  // Division services
  'Website Design & Development',
  'E-commerce Solutions',
  'School Management System',
  'Restaurant Website',
  'Hotel Booking System',
  'Real Estate Website',
  'Mobile Application',
  'Branding & Graphic Design',
  'Digital Marketing / SEO',
  'Business Automation',
  'Solar Energy Installation',
  '3D Epoxy Flooring & Interior Décor',
  'CAC Registration',
  'Importation & Freight Clearing',
  'Website Maintenance',
  'Other',
];

const budgetOptions = [
  '₦100,000 - ₦250,000',
  '₦250,000 - ₦500,000',
  '₦500,000 - ₦1,000,000',
  '₦1,000,000 - ₦2,500,000',
  '₦2,500,000+',
  'Not Sure',
];

const timelineOptions = [
  'ASAP (1-2 weeks)',
  'Standard (2-4 weeks)',
  'Relaxed (1-2 months)',
  'Flexible / Not Sure',
];

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const RequestQuote: React.FC = () => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState<ContactMessage | null>(null);
  const [contactInfo, setContactInfo] = useState(() => getHaritechContent());
  // Hub CTAs arrive as /request-quote?service=… — preselect that service so
  // property/project enquiries don't have to hunt for their option.
  const [searchParams] = useSearchParams();
  const presetService = searchParams.get('service') ?? '';
  const [form, setForm] = useState(() => ({
    name: '', email: '', phone: '', company: '',
    service: serviceOptions.includes(presetService) ? presetService : '',
    message: '', budget: '', timeline: '', contactMethod: 'email', consentMarketing: false, website: '',
  }));

  // If the URL param changes while mounted (navigating between CTAs), follow it.
  useEffect(() => {
    if (serviceOptions.includes(presetService)) {
      setForm(prev => (prev.service === presetService ? prev : { ...prev, service: presetService }));
    }
  }, [presetService]);

  useEffect(() => {
    const handler = () => setContactInfo(getHaritechContent());
    window.addEventListener('haritech-content-updated', handler);
    return () => window.removeEventListener('haritech-content-updated', handler);
  }, []);

  const validate = (): string[] => {
    const errors: string[] = [];
    if (form.name.trim().length < 2 || form.name.trim().length > 120) errors.push('Please enter your full name (2–120 characters).');
    if (!/^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$/.test(form.email.trim())) errors.push('Please enter a valid email address.');
    if (!/^[+0-9()\-\s]{6,20}$/.test(form.phone.trim())) errors.push('Please enter a valid phone number (6–20 digits/symbols).');
    if (!form.service) errors.push('Please choose the service you need.');
    if (form.message.trim().length < 10 || form.message.trim().length > 5000) errors.push('Project description must be 10–5000 characters.');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website.trim()) {
      trackEvent('enquiry_spam_blocked', 'quote');
      setStatus('success');
      return;
    }
    const errors = validate();
    if (errors.length) {
      trackEvent('enquiry_validation_failed', 'quote');
      setStatus('error');
      setErrorMsg(errors.join(' '));
      return;
    }
    setStatus('submitting');
    const msg: ContactMessage = {
      form: 'quote',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      category: form.service,
      subject: form.company ? `${form.service} — ${form.company.trim()}` : form.service,
      message: form.message.trim(),
      budget: form.budget,
      timeline: form.timeline,
      contactMethod: form.contactMethod,
      consentMarketing: form.consentMarketing,
      sourcePage: '/haritech/request-quote',
    };
    const result = await submitContactMessage(msg);
    if (result.ok) {
      setStatus('success');
      setSubmittedMsg(msg);
      return;
    }
    if (result.error === 'rate-limited') {
      setStatus('error');
      setErrorMsg('You just sent an enquiry — please wait about half a minute and try again.');
      trackEvent('enquiry_validation_failed', 'rate-limited');
      return;
    }
    setStatus('error');
    setSubmittedMsg(msg);
    setErrorMsg('We could not reach our servers just now — your request is safely saved in this browser. Retry in a moment, or deliver it instantly via WhatsApp.');
    trackEvent('enquiry_validation_failed', result.error);
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm";
  const labelClass = "block text-sm font-medium text-slate-400 mb-2";

  const resetToForm = () => {
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <ClipboardList className="h-4 w-4" /> Request a Quote
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                Tell Us About <span className="gradient-text">Your Project</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Fill out the form below with as much detail as possible — your request is recorded with a reference number the moment you submit, and the owner is notified right away.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto max-w-3xl">
          {status === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 text-center glow-border">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Quote Request Received!</h2>
              <p className="text-slate-400 mb-2 max-w-lg mx-auto leading-relaxed">
                Thank you{submittedMsg?.name ? `, ${submittedMsg.name.split(' ')[0]}` : ''}! We've received your project details and the owner has been notified.
              </p>
              <p className="text-xs text-slate-500 mb-8 max-w-lg mx-auto">
                We will respond using your preferred method: <span className="text-cyan-400 font-bold">{submittedMsg?.contactMethod ?? 'email'}</span>. This page confirms your request was accepted and is being tracked.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech" className="btn-primary text-base px-8 py-4"><Zap className="h-5 w-5" /> Back to Home</Link>
                <a href={getWhatsAppUrl('Hello! I just submitted a quote request on your website.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-8 py-4"><MessageCircle className="h-5 w-5 text-green-400" /> Chat on WhatsApp</a>
              </div>
            </motion.div>
          ) : (
            <FadeInView>
              <div className="card p-8 md:p-12 glow-border">
                {status === 'error' && (
                  <div className="mb-6 p-5 rounded-xl border border-amber-500/25 bg-amber-500/5 text-left">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-200">{errorMsg}</div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button onClick={resetToForm} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs">Edit my details</button>
                      {submittedMsg && (
                        <a href={buildWhatsAppFallbackUrl(submittedMsg)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', 'quote_fallback')} className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold"><MessageCircle className="h-3.5 w-3.5 inline mr-1" /> Deliver via WhatsApp</a>
                      )}
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Honeypot — hidden from real visitors */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label htmlFor="haritech-q-website">Website</label>
                    <input id="haritech-q-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" maxLength={120} />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Phone Number *</label>
                      <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+234 XXX XXX XXXX" />
                    </div>
                    <div>
                      <label className={labelClass}>Company / Business Name</label>
                      <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} placeholder="Your business name" maxLength={120} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Service Needed *</label>
                    <select required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputClass}>
                      <option value="">Select a service</option>
                      {serviceOptions.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Project Description *</label>
                    <textarea rows={6} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} placeholder="Tell us about your project in detail — goals, features, target audience, design preferences, etc." maxLength={5000} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Budget Range</label>
                      <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputClass}>
                        <option value="">Select budget range</option>
                        {budgetOptions.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Desired Timeline</label>
                      <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={inputClass}>
                        <option value="">Select timeline</option>
                        {timelineOptions.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Preferred Contact Method</label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { value: 'email', label: 'Email', icon: Mail },
                        { value: 'phone', label: 'Phone', icon: Phone },
                        { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      ].map((m) => (
                        <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="contactMethod" checked={form.contactMethod === m.value} onChange={() => setForm({ ...form, contactMethod: m.value })} className="accent-cyan-400" />
                          <m.icon className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.consentMarketing} onChange={(e) => setForm({ ...form, consentMarketing: e.target.checked })} className="mt-0.5 accent-cyan-400" />
                    <span className="text-xs text-slate-400">Send me occasional offers and updates (optional — your quote request is processed whether or not you tick this).</span>
                  </label>

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={status === 'submitting'} className="btn-primary w-full py-4 text-base mt-4 disabled:opacity-50">
                    {status === 'submitting' ? (<><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</>) : (<><Send className="h-5 w-5" /> Submit Quote Request</>)}
                  </motion.button>
                  <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1.5">
                    <FileText className="h-3 w-3" /> We store your enquiry details to prepare your quote. No marketing without your consent above.
                  </p>
                </form>
              </div>

              <div className="text-center mt-8">
                <p className="text-slate-500 text-sm">
                  Prefer to reach out directly?{' '}
                  <a href={getWhatsAppUrl('Hello! I have a project I would like a quote for.')} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', 'quote_page')} className="text-green-400 hover:underline">WhatsApp us</a>{' '}
                  or call{' '}<span className="text-cyan-400">{contactInfo.phone}</span>
                </p>
              </div>
            </FadeInView>
          )}
        </div>
      </section>
    </div>
  );
};

export default RequestQuote;
