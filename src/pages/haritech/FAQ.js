import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { getWhatsAppUrl, getHaritechContent, getFAQCategories } from '../../utils/haritechContent';
const FadeInView = ({ children, delay = 0 }) => (_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay }, children: children }));
const FAQ = () => {
    const [faqs, setFaqs] = useState(() => getFAQCategories());
    const [activeCategory, setActiveCategory] = useState(faqs[0].category);
    const [openItems, setOpenItems] = useState([]);
    const [content, setContent] = useState(() => getHaritechContent());
    useEffect(() => {
        const contentHandler = () => setContent(getHaritechContent());
        const faqHandler = () => {
            const data = getFAQCategories();
            setFaqs(data);
            setActiveCategory(prev => data.some(f => f.category === prev) ? prev : data[0].category);
        };
        window.addEventListener('haritech-content-updated', contentHandler);
        window.addEventListener('haritech-faq-updated', faqHandler);
        return () => {
            window.removeEventListener('haritech-content-updated', contentHandler);
            window.removeEventListener('haritech-faq-updated', faqHandler);
        };
    }, []);
    const toggleItem = (index) => {
        setOpenItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    };
    const activeFaqs = faqs.find(f => f.category === activeCategory);
    return (_jsxs("div", { className: "relative overflow-x-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" }), _jsx("section", { className: "relative pt-24 pb-16", children: _jsx("div", { className: "container mx-auto px-6", children: _jsx("div", { className: "max-w-4xl mx-auto text-center", children: _jsxs(FadeInView, { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6", children: [_jsx(HelpCircle, { className: "h-4 w-4" }), " FAQ"] }), _jsxs("h1", { className: "text-4xl md:text-6xl font-black text-white mb-6 font-poppins", children: ["Frequently Asked ", _jsx("span", { className: "gradient-text", children: "Questions" })] }), _jsx("p", { className: "text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed", children: "Find answers to common questions about our services, pricing, processes, and more." })] }) }) }) }), _jsx("section", { className: "section-padding pt-0", children: _jsxs("div", { className: "container mx-auto", children: [_jsx("div", { className: "flex flex-wrap gap-3 justify-center mb-12", children: faqs.map(f => (_jsx("button", { onClick: () => setActiveCategory(f.category), className: `px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${activeCategory === f.category ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent shadow-lg' : 'bg-[#0e1326]/50 text-slate-400 border-white/5 hover:border-slate-500/35 hover:text-white'}`, children: f.category }, f.category))) }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "max-w-3xl mx-auto space-y-4", children: activeFaqs.items.map((faq, i) => (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 }, className: "card overflow-hidden", children: [_jsxs("button", { onClick: () => toggleItem(i), className: "w-full p-5 flex items-center justify-between text-left hover:bg-[#141b35] transition-colors", children: [_jsx("span", { className: "text-sm font-bold text-white pr-4", children: faq.q }), _jsx(ChevronDown, { className: `h-4 w-4 text-purple-400 shrink-0 transition-transform ${openItems.includes(i) ? 'rotate-180' : ''}` })] }), _jsx(AnimatePresence, { children: openItems.includes(i) && (_jsx(motion.div, { initial: { height: 0 }, animate: { height: 'auto' }, exit: { height: 0 }, className: "overflow-hidden", children: _jsxs("div", { className: "px-5 pb-5 pt-0", children: [_jsx("div", { className: "h-px bg-white/5 mb-4" }), _jsx("p", { className: "text-sm text-slate-400 leading-relaxed", children: faq.a })] }) })) })] }, i))) }, activeCategory) })] }) }), _jsxs("section", { className: "py-20 relative overflow-hidden bg-slate-950/30", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-cyan-600/20" }), _jsx("div", { className: "container mx-auto px-6 relative z-10 text-center", children: _jsxs(FadeInView, { children: [_jsx("h2", { className: "text-3xl md:text-5xl font-black text-white mb-4", children: "Still Have Questions?" }), _jsx("p", { className: "text-lg text-slate-300 mb-10 max-w-2xl mx-auto", children: "We're here to help. Reach out to us directly and we'll get back to you promptly." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs("a", { href: getWhatsAppUrl(), target: "_blank", rel: "noopener noreferrer", className: "btn-primary text-base px-10 py-4", children: [_jsx(MessageCircle, { className: "h-5 w-5" }), " WhatsApp Us"] }), _jsxs(Link, { to: "/haritech/contact", className: "btn-secondary text-base px-10 py-4", children: ["Contact Page ", _jsx(ArrowRight, { className: "h-4 w-4 text-cyan-400" })] }), _jsxs("a", { href: `mailto:${content.email}`, className: "btn-secondary text-base px-10 py-4", children: [_jsx(Mail, { className: "h-5 w-5 text-cyan-400" }), " Email Us"] })] })] }) })] })] }));
};
export default FAQ;
