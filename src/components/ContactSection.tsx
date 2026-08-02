import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle, Send, Sparkles } from 'lucide-react';
import { getStoredSettings } from '../utils/settings';
import type { SiteSettings } from '../utils/settings';

const ContactSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());

  useEffect(() => {
    const handler = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handler);
    window.addEventListener('haritech-settings-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('haritech-settings-updated', handler);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.projectType) newErrors.projectType = 'Please select a project type';
    if (!formData.budget) newErrors.budget = 'Please select a budget range';
    if (!formData.timeline) newErrors.timeline = 'Please select a timeline';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setFormStatus('submitting');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFormStatus('success');
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      projectType: '',
      budget: '',
      timeline: '',
      message: ''
    });
    
    setTimeout(() => setFormStatus('idle'), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const contactInfo = [
    { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsappNumber, href: `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    { icon: Mail, label: 'Email', value: settings.contactEmail, href: `mailto:${settings.contactEmail}`, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { icon: Phone, label: 'Phone', value: settings.phoneNumber, href: `tel:${settings.phoneNumber.replace(/[^0-9+]/g, '')}`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { icon: MapPin, label: 'Address', value: settings.address, href: 'https://maps.google.com', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' }
  ];

  const projectTypes = [
    'Business Website',
    'Corporate Website',
    'E-commerce Store',
    'School Management System',
    'Hospital System',
    'Hotel Booking Platform',
    'Church Website',
    'Portfolio Website',
    'Landing Page',
    'Custom Web Application',
    'Website Redesign',
    'Other'
  ];

  const budgetRanges = [
    'Under $5,000',
    '$5,000 - $15,000',
    '$15,000 - $30,000',
    '$30,000 - $50,000',
    '$50,000+',
    'Let\'s discuss'
  ];

  const timelines = [
    'ASAP (1-2 weeks)',
    '1 month',
    '2-3 months',
    '3-6 months',
    '6+ months',
    'Flexible'
  ];

  return (
    <section id="contact" className="section-padding bg-[#070a13] relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Let's Build Something <span className="gradient-text-pink">Amazing</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Ready to scale your business profile? Get in touch and let's discuss how we can engineer your custom platform.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Contact Info Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1"
          >
            <div className="card p-8 h-full bg-[#0e1326]/80 border-white/5 flex flex-col justify-between glow-border">
              <div>
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" /> Get In Touch
                </h3>
                
                <div className="space-y-4 mb-8">
                  {contactInfo.map((item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/25 transition-all group cursor-pointer"
                    >
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.color} border flex-shrink-0`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{item.label}</h4>
                        <p className="text-slate-400 text-xs mt-1">{item.value}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-6">
                <h4 className="font-bold text-white text-sm mb-4">Diagnostics Hours</h4>
                <div className="space-y-2 text-slate-400 text-xs leading-relaxed font-mono">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                  <p className="text-cyan-400 font-bold mt-2">Emergency support active 24/7</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
              <h3 className="text-2xl font-bold text-white mb-8">Send Us a Message</h3>
              
              {formStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4 text-emerald-400"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Transmission Successful!</h4>
                    <p className="text-xs text-slate-300 mt-1">Thank you. Our lead architect will follow up within 12-24 hours.</p>
                  </div>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-slate-950/40 rounded-xl border text-sm text-white transition-all ${
                        errors.name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                      } focus:outline-none`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-sm text-white focus:outline-none transition-all"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-sm text-white focus:outline-none transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-slate-950/40 rounded-xl border text-sm text-white transition-all ${
                        errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                      } focus:outline-none`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.email}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="projectType" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Project Type *
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-slate-950/60 rounded-xl border text-sm text-white transition-all ${
                        errors.projectType ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                      } focus:outline-none`}
                    >
                      <option value="" className="bg-[#0e1326]">Select type</option>
                      {projectTypes.map(type => (
                        <option key={type} value={type} className="bg-[#0e1326] text-white">{type}</option>
                      ))}
                    </select>
                    {errors.projectType && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.projectType}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Budget Range *
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-slate-950/60 rounded-xl border text-sm text-white transition-all ${
                        errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                      } focus:outline-none`}
                    >
                      <option value="" className="bg-[#0e1326]">Select budget</option>
                      {budgetRanges.map(range => (
                        <option key={range} value={range} className="bg-[#0e1326] text-white">{range}</option>
                      ))}
                    </select>
                    {errors.budget && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.budget}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="timeline" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Timeline *
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-slate-950/60 rounded-xl border text-sm text-white transition-all ${
                        errors.timeline ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                      } focus:outline-none`}
                    >
                      <option value="" className="bg-[#0e1326]">Select timeline</option>
                      {timelines.map(t => (
                        <option key={t} value={t} className="bg-[#0e1326] text-white">{t}</option>
                      ))}
                    </select>
                    {errors.timeline && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.timeline}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 bg-slate-950/40 rounded-xl border text-sm text-white transition-all resize-none ${
                      errors.message ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
                    } focus:outline-none`}
                    placeholder="Tell us about your project, goals, and any specific requirements..."
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.message}</p>}
                </div>
                
                <motion.button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-bold"
                >
                  {formStatus === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Transmitting Data...
                    </span>
                  ) : (
                    'Transmit Message'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;