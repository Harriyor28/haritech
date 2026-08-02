import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowUp, Twitter, Linkedin, Facebook, Instagram, Github, Dribbble, Code2 } from 'lucide-react';
import { getStoredBrandLogo, subscribeToBrandLogo } from '../utils/brand';
import { getStoredSettings } from '../utils/settings';
const footerLinks = {
    company: [
        { label: 'About Us', href: '#about' },
        { label: 'Haritech Services', href: '/haritech' },
        { label: 'Our Team', href: '#team' },
        { label: 'Blog', href: '#blog' }
    ],
    services: [
        { label: 'Web Development', href: '#services' },
        { label: 'Mobile Apps', href: '#mobile' },
        { label: 'UI/UX Design', href: '#design' },
        { label: 'SEO Services', href: '#seo' }
    ],
    industries: [
        { label: 'Healthcare', href: '#healthcare' },
        { label: 'Education', href: '#education' },
        { label: 'Hospitality', href: '#hospitality' },
        { label: 'E-commerce', href: '#ecommerce' }
    ],
    legal: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'Sitemap', href: '#sitemap' }
    ]
};
const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/haritech', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/haritech', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com/haritech', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/haritech', label: 'Instagram' },
    { icon: Github, href: 'https://github.com/haritech', label: 'GitHub' },
    { icon: Dribbble, href: 'https://dribbble.com/haritech', label: 'Dribbble' }
];
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [brandLogo, setBrandLogo] = useState(() => getStoredBrandLogo());
    const [settings, setSettings] = useState(() => getStoredSettings());
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
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (_jsxs("footer", { className: "bg-[#050810] text-white relative overflow-hidden border-t border-white/5", children: [_jsx("div", { className: "absolute inset-0 grid-bg-overlay pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none" }), _jsxs("div", { className: "container mx-auto px-6 py-20 relative z-10", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8 }, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsx("div", { className: "flex items-center gap-3 mb-6", children: brandLogo ? (_jsx("img", { src: brandLogo, alt: "HARITECH", className: "max-h-10 max-w-48 object-contain" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md", children: _jsx(Code2, { className: "h-5 w-5 text-white" }) }), _jsx("span", { className: "text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent", children: "HARITECH" })] })) }), _jsx("p", { className: "text-slate-500 mb-8 max-w-md leading-relaxed text-sm", children: settings.tagline }), _jsx("div", { className: "flex gap-3 mb-8", children: socialLinks.map((social, index) => (_jsx(motion.a, { href: social.href, target: "_blank", rel: "noopener noreferrer", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4, delay: index * 0.05 }, whileHover: { scale: 1.1, y: -2 }, className: "w-10 h-10 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all", "aria-label": social.label, children: _jsx(social.icon, { className: "h-4 w-4" }) }, social.label))) }), _jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-slate-500 font-mono", children: [_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-3.5 w-3.5" }), settings.contactEmail] }), _jsx("p", { children: settings.phoneNumber })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-sm uppercase tracking-widest text-slate-300 mb-6", children: "Company" }), _jsx("ul", { className: "space-y-3", children: footerLinks.company.map((link) => (_jsx("li", { children: link.href.startsWith('/') ? (_jsx(Link, { to: link.href, className: "text-slate-500 hover:text-cyan-400 transition-colors text-sm", children: link.label })) : (_jsx("a", { href: link.href, className: "text-slate-500 hover:text-cyan-400 transition-colors text-sm", children: link.label })) }, link.label))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-sm uppercase tracking-widest text-slate-300 mb-6", children: "Services" }), _jsx("ul", { className: "space-y-3", children: footerLinks.services.map((link) => (_jsx("li", { children: _jsx("a", { href: link.href, className: "text-slate-500 hover:text-cyan-400 transition-colors text-sm", children: link.label }) }, link.label))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-sm uppercase tracking-widest text-slate-300 mb-6", children: "Industries" }), _jsx("ul", { className: "space-y-3", children: footerLinks.industries.map((link) => (_jsx("li", { children: _jsx("a", { href: link.href, className: "text-slate-500 hover:text-cyan-400 transition-colors text-sm", children: link.label }) }, link.label))) })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, delay: 0.2 }, className: "card bg-[#0e1326]/80 border-white/5 p-8 md:p-12 mb-16 glow-border", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [_jsx("h3", { className: "text-2xl md:text-3xl font-bold mb-4 text-white", children: "Stay in the Loop" }), _jsx("p", { className: "text-slate-400 mb-8 text-sm", children: "Subscribe for architecture breakdowns, case studies, and premium web dev insights." }), _jsxs("form", { className: "flex flex-col sm:flex-row gap-4 max-w-md mx-auto", action: "#", method: "POST", children: [_jsx("input", { type: "email", placeholder: "Enter your email", className: "flex-1 px-5 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm", required: true }), _jsx(motion.button, { type: "submit", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: "btn-primary px-8 py-3.5 rounded-xl text-sm", children: "Subscribe" })] }), _jsx("p", { className: "text-slate-600 text-xs mt-4 font-mono", children: "No spam. Unsubscribe anytime." })] }) }), _jsxs("div", { className: "border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6", children: [_jsx("div", { className: "flex flex-col md:flex-row items-center gap-4 text-slate-600 text-xs font-mono", children: _jsxs("p", { children: ["\u00A9 ", currentYear, " ", settings.companyName, ". All rights reserved."] }) }), _jsx("div", { className: "flex flex-wrap justify-center gap-6", children: footerLinks.legal.map((link) => (_jsx("a", { href: link.href, className: "text-slate-600 hover:text-cyan-400 text-xs transition-colors", children: link.label }, link.label))) })] })] }), _jsx(motion.button, { onClick: scrollToTop, className: "fixed bottom-8 right-8 w-12 h-12 rounded-xl bg-[#0e1326] border border-white/10 text-cyan-400 shadow-xl flex items-center justify-center z-50 hover:border-cyan-500/30 transition-all", whileHover: { scale: 1.1, y: -2 }, whileTap: { scale: 0.95 }, "aria-label": "Scroll to top", children: _jsx(ArrowUp, { className: "h-5 w-5" }) })] }));
};
export default Footer;
