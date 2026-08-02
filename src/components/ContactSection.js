import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle, Send, Sparkles } from 'lucide-react';
import { getStoredSettings } from '../utils/settings';
const ContactSection = () => {
    const [settings, setSettings] = useState(() => getStoredSettings());
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
    const [formStatus, setFormStatus] = useState('idle');
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim())
            newErrors.name = 'Name is required';
        if (!formData.email.trim())
            newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = 'Invalid email format';
        if (!formData.message.trim())
            newErrors.message = 'Message is required';
        if (!formData.projectType)
            newErrors.projectType = 'Please select a project type';
        if (!formData.budget)
            newErrors.budget = 'Please select a budget range';
        if (!formData.timeline)
            newErrors.timeline = 'Please select a timeline';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name])
            setErrors(prev => ({ ...prev, [name]: '' }));
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
    return (_jsxs("section", { id: "contact", className: "section-padding bg-[#070a13] relative overflow-hidden", children: [_jsx("div", { className: "absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" }), _jsxs("div", { className: "container mx-auto relative z-10", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8 }, className: "text-center mb-20", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-black mb-6", children: ["Let's Build Something ", _jsx("span", { className: "gradient-text-pink", children: "Amazing" })] }), _jsx("p", { className: "text-lg text-slate-400 max-w-3xl mx-auto", children: "Ready to scale your business profile? Get in touch and let's discuss how we can engineer your custom platform." })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch", children: [_jsx(motion.div, { initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8 }, className: "lg:col-span-1", children: _jsxs("div", { className: "card p-8 h-full bg-[#0e1326]/80 border-white/5 flex flex-col justify-between glow-border", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-2xl font-bold text-white mb-8 flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-5 w-5 text-cyan-400" }), " Get In Touch"] }), _jsx("div", { className: "space-y-4 mb-8", children: contactInfo.map((item, index) => (_jsxs(motion.a, { href: item.href, target: "_blank", rel: "noopener noreferrer", initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay: index * 0.08 }, whileHover: { scale: 1.02 }, className: "flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/25 transition-all group cursor-pointer", children: [_jsx("div", { className: `w-11 h-11 rounded-lg flex items-center justify-center ${item.color} border flex-shrink-0`, children: _jsx(item.icon, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-white text-sm leading-tight", children: item.label }), _jsx("p", { className: "text-slate-400 text-xs mt-1", children: item.value })] })] }, item.label))) })] }), _jsxs("div", { className: "border-t border-white/5 pt-6", children: [_jsx("h4", { className: "font-bold text-white text-sm mb-4", children: "Diagnostics Hours" }), _jsxs("div", { className: "space-y-2 text-slate-400 text-xs leading-relaxed font-mono", children: [_jsx("p", { children: "Monday - Friday: 9:00 AM - 6:00 PM" }), _jsx("p", { children: "Saturday: 10:00 AM - 4:00 PM" }), _jsx("p", { children: "Sunday: Closed" }), _jsx("p", { className: "text-cyan-400 font-bold mt-2", children: "Emergency support active 24/7" })] })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, x: 30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8 }, className: "lg:col-span-2", children: _jsxs("div", { className: "card p-8 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-8", children: "Send Us a Message" }), formStatus === 'success' && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4 text-emerald-400", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white", children: _jsx(Send, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold", children: "Transmission Successful!" }), _jsx("p", { className: "text-xs text-slate-300 mt-1", children: "Thank you. Our lead architect will follow up within 12-24 hours." })] })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Full Name *" }), _jsx("input", { type: "text", id: "name", name: "name", value: formData.name, onChange: handleChange, className: `w-full px-4 py-3 bg-slate-950/40 rounded-xl border text-sm text-white transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'} focus:outline-none`, placeholder: "John Doe" }), errors.name && _jsx("p", { className: "mt-1.5 text-xs text-red-400 font-mono", children: errors.name })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "company", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Company Name" }), _jsx("input", { type: "text", id: "company", name: "company", value: formData.company, onChange: handleChange, className: "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-sm text-white focus:outline-none transition-all", placeholder: "Acme Inc." })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Phone Number" }), _jsx("input", { type: "tel", id: "phone", name: "phone", value: formData.phone, onChange: handleChange, className: "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-sm text-white focus:outline-none transition-all", placeholder: "+1 (555) 123-4567" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Email Address *" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleChange, className: `w-full px-4 py-3 bg-slate-950/40 rounded-xl border text-sm text-white transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'} focus:outline-none`, placeholder: "john@example.com" }), errors.email && _jsx("p", { className: "mt-1.5 text-xs text-red-400 font-mono", children: errors.email })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "projectType", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Project Type *" }), _jsxs("select", { id: "projectType", name: "projectType", value: formData.projectType, onChange: handleChange, className: `w-full px-4 py-3 bg-slate-950/60 rounded-xl border text-sm text-white transition-all ${errors.projectType ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'} focus:outline-none`, children: [_jsx("option", { value: "", className: "bg-[#0e1326]", children: "Select type" }), projectTypes.map(type => (_jsx("option", { value: type, className: "bg-[#0e1326] text-white", children: type }, type)))] }), errors.projectType && _jsx("p", { className: "mt-1.5 text-xs text-red-400 font-mono", children: errors.projectType })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "budget", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Budget Range *" }), _jsxs("select", { id: "budget", name: "budget", value: formData.budget, onChange: handleChange, className: `w-full px-4 py-3 bg-slate-950/60 rounded-xl border text-sm text-white transition-all ${errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'} focus:outline-none`, children: [_jsx("option", { value: "", className: "bg-[#0e1326]", children: "Select budget" }), budgetRanges.map(range => (_jsx("option", { value: range, className: "bg-[#0e1326] text-white", children: range }, range)))] }), errors.budget && _jsx("p", { className: "mt-1.5 text-xs text-red-400 font-mono", children: errors.budget })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "timeline", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Timeline *" }), _jsxs("select", { id: "timeline", name: "timeline", value: formData.timeline, onChange: handleChange, className: `w-full px-4 py-3 bg-slate-950/60 rounded-xl border text-sm text-white transition-all ${errors.timeline ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'} focus:outline-none`, children: [_jsx("option", { value: "", className: "bg-[#0e1326]", children: "Select timeline" }), timelines.map(t => (_jsx("option", { value: t, className: "bg-[#0e1326] text-white", children: t }, t)))] }), errors.timeline && _jsx("p", { className: "mt-1.5 text-xs text-red-400 font-mono", children: errors.timeline })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "message", className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Project Details *" }), _jsx("textarea", { id: "message", name: "message", value: formData.message, onChange: handleChange, rows: 5, className: `w-full px-4 py-3 bg-slate-950/40 rounded-xl border text-sm text-white transition-all resize-none ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'} focus:outline-none`, placeholder: "Tell us about your project, goals, and any specific requirements..." }), errors.message && _jsx("p", { className: "mt-1.5 text-xs text-red-400 font-mono", children: errors.message })] }), _jsx(motion.button, { type: "submit", disabled: formStatus === 'submitting', whileHover: { scale: 1.02, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }, whileTap: { scale: 0.98 }, className: "w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-bold", children: formStatus === 'submitting' ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-5 w-5 text-white", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Transmitting Data..."] })) : ('Transmit Message') })] })] }) })] })] })] }));
};
export default ContactSection;
