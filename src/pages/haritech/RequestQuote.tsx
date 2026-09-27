import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Send, CheckCircle, MessageCircle, Mail, Phone, ClipboardList, AlertCircle } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent } from '../../utils/haritechContent';
import { submitContactMessage, buildWhatsAppFallbackUrl } from '../../utils/contactMessages';
import type { ContactMessage } from '../../utils/contactMessages';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const serviceOptions = [
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
  'CAC Registration',
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

const RequestQuote: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [contactInfo, setContactInfo] = useState(() => getHaritechContent());
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    description: '',
    budget: '',
    timeline: '',
    contactMethod: 'email',
  });

  useEffect(() => {
    const handler = () => setContactInfo(getHaritechContent());
    window.addEventListener('haritech-content-updated', handler);
    return () => window.removeEventListener('haritech-content-updated', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const msg: ContactMessage = {
      form: 'quote',
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.service + (form.company ? ` (${form.company})` : ''),
      message: form.description,
      budget: form.budget,
      timeline: form.timeline,
      contactMethod: form.contactMethod,
    };
    const result = await submitContactMessage(msg);
    if (result.ok) {
      setStatus('sent');
    } else {
      setFallbackUrl(buildWhatsAppFallbackUrl(msg));
      setStatus('failed');
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Tell Us About <span className="gradient-text">Your Project</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Fill out the form below with as much detail as possible, and we'll get back to you within 24 hours with a personalized quote.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto max-w-3xl">
          {status === 'sent' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 text-center glow-border">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Quote Request Received!</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Thank you for reaching out! We've received your project details and our team will review them. You can expect a personalized quote within 24 hours. We'll contact you via email or phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech" className="btn-primary text-base px-8 py-4"><Zap className="h-5 w-5" /> Back to Home</Link>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-8 py-4"><MessageCircle className="h-5 w-5 text-green-400" /> Chat on WhatsApp</a>
              </div>
            </motion.div>
          ) : (
            <FadeInView>
              <div className="card p-8 md:p-12 glow-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="q-name" className="block text-sm font-medium text-slate-400 mb-2">Full Name *</label>
                      <input id="q-name" name="name" type="text" required value={form.name} onChange={set('name')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="q-email" className="block text-sm font-medium text-slate-400 mb-2">Email Address *</label>
                      <input id="q-email" name="email" type="email" required value={form.email} onChange={set('email')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="q-phone" className="block text-sm font-medium text-slate-400 mb-2">Phone Number *</label>
                      <input id="q-phone" name="phone" type="tel" required value={form.phone} onChange={set('phone')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="+234 XXX XXX XXXX" />
                    </div>
                    <div>
                      <label htmlFor="q-company" className="block text-sm font-medium text-slate-400 mb-2">Company / Business Name</label>
                      <input id="q-company" name="company" type="text" value={form.company} onChange={set('company')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="Your business name" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="q-service" className="block text-sm font-medium text-slate-400 mb-2">Service Needed *</label>
                    <select id="q-service" name="service" required value={form.service} onChange={set('service')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm">
                      <option value="">Select a service</option>
                      {serviceOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="q-description" className="block text-sm font-medium text-slate-400 mb-2">Project Description *</label>
                    <textarea id="q-description" name="description" rows={6} required value={form.description} onChange={set('description')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm resize-none" placeholder="Tell us about your project in detail — goals, features, target audience, design preferences, etc." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="q-budget" className="block text-sm font-medium text-slate-400 mb-2">Budget Range</label>
                      <select id="q-budget" name="budget" value={form.budget} onChange={set('budget')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm">
                        <option value="">Select budget range</option>
                        {budgetOptions.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="q-timeline" className="block text-sm font-medium text-slate-400 mb-2">Desired Timeline</label>
                      <select id="q-timeline" name="timeline" value={form.timeline} onChange={set('timeline')} className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm">
                        <option value="">Select timeline</option>
                        {timelineOptions.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-slate-400 mb-3">Preferred Contact Method</span>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { value: 'email', label: 'Email', icon: Mail },
                        { value: 'phone', label: 'Phone', icon: Phone },
                        { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      ].map(m => (
                        <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="contactMethod" checked={form.contactMethod === m.value} onChange={() => setForm(f => ({ ...f, contactMethod: m.value }))} className="text-cyan-400 focus:ring-cyan-500/20 bg-slate-900 border-white/10" />
                          <m.icon className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {status === 'failed' && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-amber-300 font-medium mb-2">Automatic send is unavailable right now.</p>
                        <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 underline">
                          <MessageCircle className="h-3.5 w-3.5" /> Send this quote request on WhatsApp instead
                        </a>
                      </div>
                    </div>
                  )}

                  <motion.button type="submit" disabled={status === 'sending'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full py-4 text-base mt-4 disabled:opacity-60">
                    <Send className="h-5 w-5" /> {status === 'sending' ? 'Sending…' : 'Submit Quote Request'}
                  </motion.button>
                </form>
              </div>

              <div className="text-center mt-8">
                <p className="text-slate-500 text-sm">
                  Prefer to reach out directly?{' '}
                  <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">WhatsApp us</a>{' '}
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
