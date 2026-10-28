import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, ArrowRight, Zap, CheckCircle, AlertCircle, Loader2, Twitter, Linkedin, Facebook, Instagram, FileText } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent, getSocialLinks } from '../../utils/haritechContent';
import { submitContactMessage, buildWhatsAppFallbackUrl, ContactMessage } from '../../utils/contactMessages';
import { trackEvent } from '../../utils/analytics';

const socialIcons = [
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
];

const enquiryCategories = [
  'Website Design & Development',
  'E-commerce Solutions',
  'Branding & Creative',
  'Digital Marketing',
  'CAC Registration',
  'Business Automation',
  'Solar Energy',
  '3D Epoxy & Interior Décor',
  'Importation & Freight Forwarding',
  'Other',
];

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const Contact: React.FC = () => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState<ContactMessage | null>(null);
  const [contact, setContact] = useState(() => getHaritechContent());
  const [social, setSocial] = useState(() => getSocialLinks());
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
    contactMethod: 'email', consentMarketing: false, website: '',
  });

  useEffect(() => {
    const contentHandler = () => setContact(getHaritechContent());
    const socialHandler = () => setSocial(getSocialLinks());
    window.addEventListener('haritech-content-updated', contentHandler);
    window.addEventListener('haritech-social-updated', socialHandler);
    return () => {
      window.removeEventListener('haritech-content-updated', contentHandler);
      window.removeEventListener('haritech-social-updated', socialHandler);
    };
  }, []);

  const validate = useCallback((): string[] => {
    const errors: string[] = [];
    if (form.name.trim().length < 2 || form.name.trim().length > 120) errors.push('Please enter your full name (2–120 characters).');
    if (!/^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$/.test(form.email.trim())) errors.push('Please enter a valid email address.');
    if (form.phone.trim() && !/^[+0-9()\-\s]{6,20}$/.test(form.phone.trim())) errors.push('Phone number looks invalid — use 6–20 digits/symbols.');
    if (form.message.trim().length < 10 || form.message.trim().length > 5000) errors.push('Message must be 10–5000 characters.');
    return errors;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // honeypot: silently accept, never deliver or notify
    if (form.website.trim()) {
      trackEvent('enquiry_spam_blocked', 'contact');
      setStatus('success');
      return;
    }
    const errors = validate();
    if (errors.length) {
      trackEvent('enquiry_validation_failed', 'contact');
      setStatus('error');
      setErrorMsg(errors.join(' '));
      return;
    }
    setStatus('submitting');
    const msg: ContactMessage = {
      form: 'contact',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      category: form.subject,
      message: form.message.trim(),
      contactMethod: form.contactMethod,
      consentMarketing: form.consentMarketing,
      sourcePage: '/haritech/contact',
    };
    const result = await submitContactMessage(msg);
    if (result.ok) {
      setStatus('success');
      setSubmittedMsg(msg);
      setForm((f) => ({ ...f, message: '', subject: '', phone: '' }));
      return;
    }
    if (result.error === 'rate-limited') {
      setStatus('error');
      setErrorMsg('You just sent an enquiry — please wait about half a minute and try again.');
      trackEvent('enquiry_validation_failed', 'rate-limited');
      return;
    }
    // Cloud unreachable — keep all entered data so nothing is lost
    setStatus('error');
    setSubmittedMsg(msg);
    setErrorMsg('We could not reach our servers just now — your message is safely saved in this browser. You can retry in a moment, or deliver it instantly via WhatsApp.');
    trackEvent('enquiry_validation_failed', result.error);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm";
  const labelClass = "block text-sm font-medium text-slate-400 mb-2";

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <Mail className="h-4 w-4" /> Contact Us
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Have a project in mind? Send us a message — our enquiry system gives you a reference number instantly and our team reads every message.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <FadeInView>
              <div className="card p-8 md:p-10 glow-border">
                <h2 className="text-xl font-bold text-white mb-4">Send Us a Message</h2>
                {status === 'success' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Enquiry Received!</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Thank you{submittedMsg?.name ? `, ${submittedMsg.name.split(' ')[0]}` : ''}. Your enquiry has been recorded and the owner has been notified. We will reply using your {submittedMsg?.contactMethod ?? 'email'}.
                    </p>
                    <p className="text-xs text-slate-600 mt-3 flex items-center justify-center gap-1.5"><FileText className="h-3 w-3" /> Keep this page — it confirms your submission was accepted.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                      <a href={getWhatsAppUrl('Hello! I just submitted an enquiry on your website.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-5 py-2.5"><MessageCircle className="h-4 w-4 text-emerald-400" /> Follow up on WhatsApp</a>
                      <Link to="/haritech" className="btn-primary text-xs px-5 py-2.5 flex items-center justify-center">Back to Home</Link>
                    </div>
                  </motion.div>
                ) : status === 'error' ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                    <AlertCircle className="h-14 w-14 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Almost there</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto mb-3">{errorMsg}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                      <button onClick={() => setStatus('idle')} className="btn-primary text-xs px-5 py-2.5">Edit my message</button>
                      {submittedMsg && (
                        <a href={buildWhatsAppFallbackUrl(submittedMsg)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', 'contact_fallback')} className="btn-secondary text-xs px-5 py-2.5"><MessageCircle className="h-4 w-4 text-emerald-400" /> Deliver via WhatsApp</a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Honeypot — hidden from real visitors */}
                    <div className="absolute -left-[9999px]" aria-hidden="true">
                      <label htmlFor="haritech-c-website">Website</label>
                      <input id="haritech-c-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">                      <div>
                        <label className={labelClass}>Full Name *</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="John Doe" maxLength={120} />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address *</label>
                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Phone / WhatsApp Number (optional)</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+234 XXX XXX XXXX" />
                      </div>
                      <div>
                        <label className={labelClass}>Enquiry Category *</label>
                        <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass}>
                          <option value="">Select a category</option>
                          {enquiryCategories.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Message *</label>
                      <textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} placeholder="Tell us what you need…" maxLength={5000} />
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
                            <input type="radio" name="contact-method-c" checked={form.contactMethod === m.value} onChange={() => setForm({ ...form, contactMethod: m.value })} className="accent-cyan-400" />
                            <m.icon className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-400">{m.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={form.consentMarketing} onChange={(e) => setForm({ ...form, consentMarketing: e.target.checked })} className="mt-0.5 accent-cyan-400" />
                      <span className="text-xs text-slate-400">Send me occasional offers and updates (optional — your enquiry is processed whether or not you tick this).</span>
                    </label>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={status === 'submitting'} className="btn-primary w-full py-3 text-xs sm:text-sm disabled:opacity-50">
                      {status === 'submitting' ? (<><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>) : (<><Send className="h-5 w-5" /> Send Message</>)}
                    </motion.button>
                    <p className="text-[10px] text-slate-600 text-center">We store your enquiry details to respond to you. No marketing messages without your consent above.</p>
                  </form>
                )}
              </div>
            </FadeInView>

            {/* Contact Info */}
            <FadeInView delay={0.2}>
              <div className="space-y-6">
                <div className="card p-6 flex items-start gap-4 glow-border">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0"><MessageCircle className="h-5 w-5 text-cyan-400" /></div>
                  <div><h3 className="text-sm font-bold text-white mb-1">WhatsApp</h3><p className="text-sm text-slate-400">+{getWhatsAppUrl().replace('https://wa.me/', '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 XXX XXX XXXX')}</p><a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', 'contact_info')} className="text-xs text-cyan-400 hover:underline mt-1 inline-block">Chat with us</a></div>
                </div>
                <div className="card p-6 flex items-start gap-4 glow-border">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0"><Mail className="h-5 w-5 text-purple-400" /></div>
                  <div><h3 className="text-sm font-bold text-white mb-1">Email</h3><p className="text-sm text-slate-400">{contact.email}</p></div>
                </div>
                <div className="card p-6 flex items-start gap-4 glow-border">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0"><Phone className="h-5 w-5 text-green-400" /></div>
                  <div><h3 className="text-sm font-bold text-white mb-1">Phone</h3><p className="text-sm text-slate-400">{contact.phone}</p></div>
                </div>
                <div className="card p-6 flex items-start gap-4 glow-border">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><MapPin className="h-5 w-5 text-amber-400" /></div>
                  <div><h3 className="text-sm font-bold text-white mb-1">Office Address</h3><p className="text-sm text-slate-400">{contact.address}</p></div>
                </div>
                <div className="card p-6 flex items-start gap-4 glow-border">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><Clock className="h-5 w-5 text-blue-400" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Business Hours</h3>
                    {social.businessHours.split('\n').map((line, i) => (
                      <p key={i} className="text-sm text-slate-400">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Social */}
                <div className="card p-6 glow-border">
                  <h3 className="text-sm font-bold text-white mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {socialIcons.map((s) => {
                      const href = (social as unknown as Record<string, string>)[s.key];
                      if (!href || href === '#') return null;
                      return (
                        <a key={s.label} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                          <s.icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Map */}
                <div className="card overflow-hidden h-48 glow-border">
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-cyan-400/30 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Google Maps Integration</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

  <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">Prefer to Get a Quote First?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Submit a detailed request with budget and timeline and we'll prepare a custom quote for your project.</p>
            <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2"><Zap className="h-5 w-5" /> Request a Quote <ArrowRight className="h-4 w-4" /></Link>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default Contact;
