import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowUp, Twitter, Linkedin, Facebook, Instagram, Code2 } from 'lucide-react';
import { getStoredBrandLogo, subscribeToBrandLogo } from '../utils/brand';
import { getStoredSettings } from '../utils/settings';
import type { SiteSettings } from '../utils/settings';
import { getSocialLinks } from '../utils/haritechContent';
import type { SocialLinks } from '../utils/haritechContent';
import { submitNewsletterEmail } from '../utils/contactMessages';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/portfolio' },
    { label: 'Haritech Services', href: '/haritech' },
    { label: 'Testimonials', href: '/portfolio/testimonials' },
    { label: 'Contact', href: '/portfolio/contact' }
  ],
  services: [
    { label: 'All Services', href: '/portfolio/services' },
    { label: 'Tech Stack', href: '/portfolio/tech-stack' },
    { label: 'Our Process', href: '/portfolio/process' },
    { label: 'View Portfolio', href: '/portfolio/projects' }
  ],
  industries: [
    { label: 'Industries', href: '/haritech/industries' },
    { label: 'Solar Energy', href: '/haritech/solar-energy' },
    { label: 'CAC Registration', href: '/haritech/cac-registration' },
    { label: 'Request a Quote', href: '/haritech/request-quote' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'Sitemap', href: '#sitemap' }
  ]
};

// Social icons are fully admin-controlled (Admin → Haritech → Contact → Social links).
// Hidden when empty or still the '#' placeholder (set a real link to show the icon).
const socialDefs: { key: keyof SocialLinks; icon: typeof Twitter; label: string }[] = [
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [brandLogo, setBrandLogo] = useState(() => getStoredBrandLogo());
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [socials, setSocials] = useState<SocialLinks>(() => getSocialLinks());
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterFailed, setNewsletterFailed] = useState(false);

  useEffect(() => subscribeToBrandLogo(setBrandLogo), []);
  useEffect(() => {
    const handler = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handler);
    window.addEventListener('haritech-settings-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('haritech-settings-updated', handler);
    };
  }, []);
  useEffect(() => {
    const handler = () => setSocials(getSocialLinks());
    window.addEventListener('storage', handler);
    window.addEventListener('haritech-social-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('haritech-social-updated', handler);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050810] text-white relative overflow-hidden border-t border-white/5">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-bg-overlay pointer-events-none" />
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16"
        >
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {brandLogo ? (
                <img src={brandLogo} alt="HARITECH" className="max-h-10 max-w-48 object-contain" />
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md">
                    <Code2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    HARITECH
                  </span>
                </>
              )}
            </div>
            <p className="text-slate-500 mb-8 max-w-md leading-relaxed text-sm">
              {settings.tagline}
            </p>
            
            <div className="flex gap-3 mb-8">
              {socialDefs
                .filter((def) => {
                  const url = (socials[def.key] || '').trim();
                  return Boolean(url) && url !== '#';
                })
                .map((def, index) => (
                <motion.a
                  key={def.label}
                  href={socials[def.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                  aria-label={def.label}
                >
                  <def.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {settings.contactEmail}
              </a>
              {settings.phoneNumber && (
                <a
                  href={`tel:${settings.phoneNumber.replace(/[^+\d]/g, '')}`}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {settings.phoneNumber}
                </a>
              )}
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">{link.label}</Link>
                  ) : (
                    <a href={link.href} className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">{link.label}</Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-slate-500 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-6">Industries</h4>
            <ul className="space-y-3">
              {footerLinks.industries.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">{link.label}</Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-slate-500 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        
        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card bg-[#0e1326]/80 border-white/5 p-8 md:p-12 mb-16 glow-border"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Stay in the Loop</h3>
            <p className="text-slate-400 mb-8 text-sm">
              Subscribe for architecture breakdowns, case studies, and premium web dev insights.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              action="#"
              method="POST"
              onSubmit={(e) => {
                e.preventDefault();
                const email = newsletterEmail.trim();
                if (!email) return;
                submitNewsletterEmail(email).then((res) => {
                  setNewsletterDone(res.ok);
                  setNewsletterFailed(!res.ok);
                });
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-8 py-3.5 rounded-xl text-sm"
              >
                {newsletterDone ? 'Subscribed ✓' : 'Subscribe'}
              </motion.button>
            </form>
            <p className="text-slate-600 text-xs mt-4 font-mono">
              {newsletterDone
                ? 'Thanks for subscribing!'
                : newsletterFailed
                  ? 'Could not subscribe — please try again later.'
                  : 'No spam. Unsubscribe anytime.'}
            </p>
          </div>
        </motion.div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-slate-600 text-xs font-mono">
            <p>&copy; {currentYear} {settings.companyName}. All rights reserved.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-cyan-400 text-xs transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-xl bg-[#0e1326] border border-white/10 text-cyan-400 shadow-xl flex items-center justify-center z-50 hover:border-cyan-500/30 transition-all"
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
};

export default Footer;