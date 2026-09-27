import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, ArrowRight, Zap, CheckCircle, Twitter, Linkedin, Facebook, Instagram, AlertCircle } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent, getSocialLinks } from '../../utils/haritechContent';
import { submitContactMessage, buildWhatsAppFallbackUrl } from '../../utils/contactMessages';
import type { ContactMessage } from '../../utils/contactMessages';

const socialIcons = [
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
];

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const Contact: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [contact, setContact] = useState(() => getHaritechContent());
  const [social, setSocial] = useState(() => getSocialLinks());
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const msg: ContactMessage = {
      form: 'contact',
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    };
    const result = await submitContactMessage(msg);
    if (result.ok) {
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 5000);
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
                <Mail className="h-4 w-4" /> Contact Us
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Have a project in mind? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
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
                <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
                {status === 'sent' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                        <input id="contact-name" name="name" type="text" required value={form.name} onChange={set('name')} className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="John Doe" />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                        <input id="contact-email" name="email" type="email" required value={form.email} onChange={set('email')} className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                      <input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" placeholder="+234 XXX XXX XXXX" />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                      <select id="contact-subject" name="subject" value={form.subject} onChange={set('subject')} className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm">
                        <option value="">Select a service</option>
                        <option>Website Design & Development</option>
                        <option>E-commerce Solutions</option>
                        <option>Branding & Creative</option>
                        <option>Digital Marketing</option>
                        <option>CAC Registration</option>
                        <option>Business Automation</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                      <textarea id="contact-message" name="message" rows={5} required value={form.message} onChange={set('message')} className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm resize-none" placeholder="Tell us about your project..." />
                    </div>

                    {status === 'failed' && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-amber-300 font-medium mb-2">Automatic send is unavailable right now.</p>
                          <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 underline">
                            <MessageCircle className="h-3.5 w-3.5" /> Send this message on WhatsApp instead
                          </a>
                        </div>
                      </div>
                    )}

                    <motion.button type="submit" disabled={status === 'sending'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full py-4 text-base disabled:opacity-60">
                      <Send className="h-5 w-5" /> {status === 'sending' ? 'Sending…' : 'Send Message'}
                    </motion.button>
                  </form>
                )}
              </div>
            </FadeInView>

            {/* Contact Info */}
            <FadeInView delay={0.2}>
              <div className="space-y-6">
                <div className="card p-6 flex items-start gap-4 glow-border">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0"><MessageCircle className="h-5 w-5 text-cyan-400" /></div>
                  <div><h3 className="text-sm font-bold text-white mb-1">WhatsApp</h3><p className="text-sm text-slate-400">+{getWhatsAppUrl().replace('https://wa.me/', '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 XXX XXX XXXX')}</p><a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mt-1 inline-block">Chat with us</a></div>
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
                    {(social.businessHours ?? '').split('\n').filter(Boolean).map((line, i) => (
                      <p key={i} className="text-sm text-slate-400">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Social */}
                <div className="card p-6 glow-border">
                  <h3 className="text-sm font-bold text-white mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {socialIcons.map(s => {
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
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Prefer to Get a Quote First?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Submit a detailed request and we'll prepare a custom quote for your project.</p>
            <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2"><Zap className="h-5 w-5" /> Request a Quote <ArrowRight className="h-4 w-4" /></Link>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default Contact;
