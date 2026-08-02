import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, X, Sparkles } from 'lucide-react';
import Tilt3D from './Tilt3D';
const ServicesSection = () => {
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const services = [
        {
            id: 1,
            icon: "🌐",
            title: "Website Design",
            description: "Premium, pixel-perfect website designs that captivate visitors and drive conversions with modern aesthetics and user-friendly interfaces.",
            features: [
                "Custom design tailored to your brand",
                "Mobile-first responsive design",
                "Modern UI/UX design",
                "Prototyping & wireframing",
                "Design system implementation"
            ]
        },
        {
            id: 2,
            icon: "🏢",
            title: "Business Websites",
            description: "Complete business website solutions that establish credibility, showcase services, and generate leads for growth.",
            features: [
                "Business website development",
                "CMS integration",
                "Contact & inquiry forms",
                "Analytics integration",
                "SEO optimization"
            ]
        },
        {
            id: 3,
            icon: "👔",
            title: "Corporate Websites",
            description: "Professional corporate websites that reflect your company's values and establish authority in your industry.",
            features: [
                "Corporate identity design",
                "Executive profiles",
                "Investment section",
                "Multi-location support",
                "Global accessibility"
            ]
        },
        {
            id: 4,
            icon: "🏥",
            title: "Hospital Systems",
            description: "Secure, compliant healthcare systems that improve patient experience and streamline medical operations.",
            features: [
                "HIPAA-compliant solutions",
                "Patient portal integration",
                "Appointment scheduling",
                "Medical records management",
                "Telemedicine support"
            ]
        },
        {
            id: 5,
            icon: "🏨",
            title: "Hotel Booking Platforms",
            description: "Luxury booking platforms with CRM integration, revenue management, and seamless guest experience.",
            features: [
                "OTA integration",
                "Revenue management system",
                "Guest database",
                "Package & promotion management",
                "Mobile app support"
            ]
        },
        {
            id: 6,
            icon: "⛪",
            title: "Church Websites",
            description: "Spiritually uplifting websites that connect with congregants and enhance community engagement.",
            features: [
                "Live streaming integration",
                "Sermon archives",
                "Giving portals",
                "Event calendar",
                "Member directory"
            ]
        },
        {
            id: 7,
            icon: "🛍️",
            title: "E-commerce Stores",
            description: "Complete e-commerce solutions with payment integration, inventory management, and conversion optimization.",
            features: [
                "Payment gateway integration",
                "Inventory management",
                "Customer account system",
                "Order management",
                "Tax & shipping calculations"
            ]
        },
        {
            id: 8,
            icon: "💼",
            title: "Portfolio Websites",
            description: "Stunning portfolio websites that showcase your work, achievements, and professional credentials.",
            features: [
                "Project galleries",
                "Case studies",
                "Client testimonials",
                "Downloadable resume",
                "International languages"
            ]
        },
        {
            id: 9,
            icon: "⚡",
            title: "Custom Web Applications",
            description: "Tailor-made web applications that solve unique business challenges and streamline operations.",
            features: [
                "Custom development",
                "API integration",
                "Database solutions",
                "User authentication",
                "Real-time features"
            ]
        }
    ];
    const selectedService = services.find(s => s.id === selectedServiceId);
    return (_jsxs("section", { id: "services", className: "section-padding bg-[#070a13] relative overflow-hidden", children: [_jsx("div", { className: "absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none z-0" }), _jsx("div", { className: "absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none z-0" }), _jsxs("div", { className: "container mx-auto relative z-10", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8 }, className: "text-center mb-20", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-black mb-6 tracking-tight", children: ["Our Elite ", _jsx("span", { className: "gradient-text", children: "Architectures" })] }), _jsx("p", { className: "text-lg text-slate-400 max-w-3xl mx-auto", children: "Comprehensive web development solutions designed with premium standards and optimized for high business conversions." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: services.map((service, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: index * 0.08 }, className: "h-full", children: _jsx(Tilt3D, { maxTilt: 10, className: "h-full", children: _jsxs("div", { onClick: () => setSelectedServiceId(service.id), className: "card group cursor-pointer h-full bg-[#0e1326]/80 hover:bg-[#141b35]/90 border-white/5 hover:border-cyan-500/35 transition-all duration-300 relative glow-border p-8 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 w-14 h-14 rounded-2xl bg-slate-950/80 flex items-center justify-center border border-white/5", children: service.icon }), _jsx("h3", { className: "text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors", children: service.title }), _jsx("p", { className: "text-slate-400 text-sm leading-relaxed mb-6", children: service.description })] }), _jsxs("div", { className: "pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300", children: [_jsx("span", { children: "Explore Features" }), _jsx(ArrowRight, { className: "h-4 w-4 transform group-hover:translate-x-1 transition-transform" })] })] }) }) }, service.id))) })] }), _jsx(AnimatePresence, { children: selectedServiceId && selectedService && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4", onClick: () => setSelectedServiceId(null), children: _jsxs(motion.div, { initial: { scale: 0.95, y: 20 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.95, y: 20 }, className: "bg-[#0e1326] border border-white/10 w-full max-w-xl rounded-2xl p-8 relative overflow-hidden shadow-2xl", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl" }), _jsx("button", { onClick: () => setSelectedServiceId(null), className: "absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("span", { className: "text-4xl w-14 h-14 rounded-2xl bg-slate-950/80 flex items-center justify-center border border-white/5", children: selectedService.icon }), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-white", children: selectedService.title }), _jsx("span", { className: "text-xs text-cyan-400 font-bold tracking-widest uppercase", children: "HARITECH EXCLUSIVE" })] })] }), _jsx("p", { className: "text-slate-300 text-sm leading-relaxed mb-6", children: selectedService.description }), _jsxs("div", { className: "border-t border-white/5 pt-6", children: [_jsxs("h4", { className: "text-sm font-bold text-slate-200 mb-4 flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4 text-cyan-400" }), "Key Specifications"] }), _jsx("ul", { className: "space-y-3.5", children: selectedService.features.map((feature, idx) => (_jsxs(motion.li, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.05 }, className: "flex items-start gap-3", children: [_jsx("span", { className: "w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(Check, { className: "h-3 w-3 text-cyan-400" }) }), _jsx("span", { className: "text-sm text-slate-400", children: feature })] }, idx))) })] })] }) })) })] }));
};
export default ServicesSection;
