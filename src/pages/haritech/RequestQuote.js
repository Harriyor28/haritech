import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Send, CheckCircle, MessageCircle, Mail, Phone, ClipboardList } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent } from '../../utils/haritechContent';
const FadeInView = ({ children, delay = 0 }) => (_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay }, children: children }));
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
const RequestQuote = () => {
    const [submitted, setSubmitted] = useState(false);
    const [contactInfo, setContactInfo] = useState(() => getHaritechContent());
    useEffect(() => {
        const handler = () => setContactInfo(getHaritechContent());
        window.addEventListener('haritech-content-updated', handler);
        return () => window.removeEventListener('haritech-content-updated', handler);
    }, []);
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };
    return (_jsxs("div", { className: "relative overflow-x-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" }), _jsx("section", { className: "relative pt-24 pb-16", children: _jsx("div", { className: "container mx-auto px-6", children: _jsx("div", { className: "max-w-4xl mx-auto text-center", children: _jsxs(FadeInView, { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6", children: [_jsx(ClipboardList, { className: "h-4 w-4" }), " Request a Quote"] }), _jsxs("h1", { className: "text-4xl md:text-6xl font-black text-white mb-6 font-poppins", children: ["Tell Us About ", _jsx("span", { className: "gradient-text", children: "Your Project" })] }), _jsx("p", { className: "text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed", children: "Fill out the form below with as much detail as possible, and we'll get back to you within 24 hours with a personalized quote." })] }) }) }) }), _jsx("section", { className: "section-padding pt-0", children: _jsx("div", { className: "container mx-auto max-w-3xl", children: submitted ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "card p-12 text-center glow-border", children: [_jsx(CheckCircle, { className: "h-20 w-20 text-green-400 mx-auto mb-6" }), _jsx("h2", { className: "text-3xl font-bold text-white mb-4", children: "Quote Request Received!" }), _jsx("p", { className: "text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed", children: "Thank you for reaching out! We've received your project details and our team will review them. You can expect a personalized quote within 24 hours. We'll contact you via email or phone." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs(Link, { to: "/haritech", className: "btn-primary text-base px-8 py-4", children: [_jsx(Zap, { className: "h-5 w-5" }), " Back to Home"] }), _jsxs("a", { href: getWhatsAppUrl(), target: "_blank", rel: "noopener noreferrer", className: "btn-secondary text-base px-8 py-4", children: [_jsx(MessageCircle, { className: "h-5 w-5 text-green-400" }), " Chat on WhatsApp"] })] })] })) : (_jsxs(FadeInView, { children: [_jsx("div", { className: "card p-8 md:p-12 glow-border", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Full Name *" }), _jsx("input", { type: "text", required: true, className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm", placeholder: "Your full name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Email Address *" }), _jsx("input", { type: "email", required: true, className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm", placeholder: "your@email.com" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Phone Number *" }), _jsx("input", { type: "tel", required: true, className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm", placeholder: "+234 XXX XXX XXXX" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Company / Business Name" }), _jsx("input", { type: "text", className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm", placeholder: "Your business name" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Service Needed *" }), _jsxs("select", { required: true, className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm", children: [_jsx("option", { value: "", children: "Select a service" }), serviceOptions.map(s => _jsx("option", { children: s }, s))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Project Description *" }), _jsx("textarea", { rows: 6, required: true, className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm resize-none", placeholder: "Tell us about your project in detail \u2014 goals, features, target audience, design preferences, etc." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Budget Range" }), _jsxs("select", { className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm", children: [_jsx("option", { value: "", children: "Select budget range" }), budgetOptions.map(b => _jsx("option", { children: b }, b))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Desired Timeline" }), _jsxs("select", { className: "w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white text-sm", children: [_jsx("option", { value: "", children: "Select timeline" }), timelineOptions.map(t => _jsx("option", { children: t }, t))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Preferred Contact Method" }), _jsx("div", { className: "flex flex-wrap gap-4", children: [
                                                        { value: 'email', label: 'Email', icon: Mail },
                                                        { value: 'phone', label: 'Phone', icon: Phone },
                                                        { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                                                    ].map(m => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "contactMethod", defaultChecked: m.value === 'email', className: "text-cyan-400 focus:ring-cyan-500/20 bg-slate-900 border-white/10" }), _jsx(m.icon, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-400", children: m.label })] }, m.value))) })] }), _jsxs(motion.button, { type: "submit", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: "btn-primary w-full py-4 text-base mt-4", children: [_jsx(Send, { className: "h-5 w-5" }), " Submit Quote Request"] })] }) }), _jsx("div", { className: "text-center mt-8", children: _jsxs("p", { className: "text-slate-500 text-sm", children: ["Prefer to reach out directly?", ' ', _jsx("a", { href: getWhatsAppUrl(), target: "_blank", rel: "noopener noreferrer", className: "text-green-400 hover:underline", children: "WhatsApp us" }), ' ', "or call", ' ', _jsx("span", { className: "text-cyan-400", children: contactInfo.phone })] }) })] })) }) })] }));
};
export default RequestQuote;
