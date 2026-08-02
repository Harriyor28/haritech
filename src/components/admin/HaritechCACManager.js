import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, GripVertical, Clock } from 'lucide-react';
import { getCACInfo, setCACInfo } from '../../utils/haritechContent';
import { pushToCloud } from '../../utils/cloudSync';
const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";
const CAC_SERVICES_KEY = 'haritech-cac-services';
const WHY_REGISTER_KEY = 'haritech-cac-why';
const DOCUMENTS_KEY = 'haritech-cac-docs';
const CAC_FAQ_KEY = 'haritech-cac-faq';
const getStored = (key, fallback) => {
    try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : fallback;
    }
    catch {
        return fallback;
    }
};
const setStored = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    void pushToCloud(key, data);
    window.dispatchEvent(new Event('haritech-cac-data-updated'));
};
const HaritechCACManager = () => {
    const [info, setInfo] = useState(() => getCACInfo());
    const [saved, setSaved] = useState(false);
    // CAC Services
    const [services, setServices] = useState(() => getStored(CAC_SERVICES_KEY, [
        { title: 'Business Name Registration', desc: 'Register your business name with the CAC.', timeline: '1-2 weeks' },
        { title: 'Limited Liability Company', desc: 'Register a limited liability company.', timeline: '2-4 weeks' },
        { title: 'NGO Registration', desc: 'Register your non-governmental organization.', timeline: '2-4 weeks' },
        { title: 'Incorporated Trustee', desc: 'Register for organizations.', timeline: '3-6 weeks' },
        { title: 'Business Name Renewal', desc: 'Renew your business name registration.', timeline: '1 week' },
        { title: 'Post-Incorporation Services', desc: 'Filing annual returns and updates.', timeline: '1-2 weeks' },
    ]));
    const [editingSvc, setEditingSvc] = useState(null);
    const [showSvcForm, setShowSvcForm] = useState(false);
    const [svcForm, setSvcForm] = useState({ title: '', desc: '', timeline: '' });
    // Why Register
    const [whys, setWhys] = useState(() => getStored(WHY_REGISTER_KEY, [
        { title: 'Legal Recognition', desc: 'Your business becomes a legally recognized entity.' },
        { title: 'Professional Identity', desc: 'Establish a professional business identity.' },
        { title: 'Increased Trust', desc: 'Enjoy higher customer and partner confidence.' },
        { title: 'Government Contracts', desc: 'Eligibility to bid for government tenders.' },
        { title: 'Corporate Bank Account', desc: 'Open a dedicated corporate bank account.' },
        { title: 'Access to Loans', desc: 'Qualify for business loans and grants.' },
        { title: 'Brand Protection', desc: 'Protect your business name from unauthorized use.' },
        { title: 'Growth Opportunities', desc: 'Unlock expansion and partnership opportunities.' },
    ]));
    const [editingWhy, setEditingWhy] = useState(null);
    const [showWhyForm, setShowWhyForm] = useState(false);
    const [whyForm, setWhyForm] = useState({ title: '', desc: '' });
    // Documents
    const [documents, setDocuments] = useState(() => getStored(DOCUMENTS_KEY, [
        'Proposed Business Name(s) (2-3 options)',
        'Full Name of Proprietor/Directors',
        'Phone Number',
        'Email Address',
        'Residential Address',
        'Business Address',
        'Nature of Business',
        'Valid Identification',
    ]));
    const [docInput, setDocInput] = useState('');
    // FAQ
    const [faqs, setFaqs] = useState(() => getStored(CAC_FAQ_KEY, [
        { q: 'How long does CAC registration take?', a: 'Business name registration typically takes 1-2 weeks.' },
        { q: 'What documents are required?', a: 'You need proposed business names, valid ID, etc.' },
        { q: 'How much does CAC registration cost?', a: 'Costs vary depending on registration type.' },
        { q: 'Can foreigners register a business?', a: 'Yes, additional requirements may apply.' },
        { q: 'What is the difference between Business Name and Limited Company?', a: 'A Business Name registers the name only, while a Limited Liability Company is a separate legal entity.' },
        { q: 'Can Haritech handle the entire process?', a: 'Yes, we manage everything from name search to certificate delivery.' },
    ]));
    const [editingFaq, setEditingFaq] = useState(null);
    const [showFaqForm, setShowFaqForm] = useState(false);
    const [faqForm, setFaqForm] = useState({ q: '', a: '' });
    useEffect(() => { setInfo(getCACInfo()); }, []);
    const saveAll = () => {
        setCACInfo(info);
        setStored(CAC_SERVICES_KEY, services);
        setStored(WHY_REGISTER_KEY, whys);
        setStored(DOCUMENTS_KEY, documents);
        setStored(CAC_FAQ_KEY, faqs);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    const saveSvc = (e) => {
        e.preventDefault();
        if (editingSvc) {
            setServices(services.map((s) => s === editingSvc ? { ...s, ...svcForm } : s));
        }
        else {
            setServices([...services, { ...svcForm }]);
        }
        setShowSvcForm(false);
        setEditingSvc(null);
    };
    const saveWhy = (e) => {
        e.preventDefault();
        if (editingWhy) {
            setWhys(whys.map((w) => w === editingWhy ? { ...w, ...whyForm } : w));
        }
        else {
            setWhys([...whys, { ...whyForm }]);
        }
        setShowWhyForm(false);
        setEditingWhy(null);
    };
    const saveFaq = (e) => {
        e.preventDefault();
        if (editingFaq) {
            setFaqs(faqs.map((f) => f === editingFaq ? { ...f, ...faqForm } : f));
        }
        else {
            setFaqs([...faqs, { ...faqForm }]);
        }
        setShowFaqForm(false);
        setEditingFaq(null);
    };
    const addDoc = () => {
        if (docInput.trim()) {
            setDocuments([...documents, docInput.trim()]);
            setDocInput('');
        }
    };
    const Modal = ({ show, onClose, title, children }) => (_jsx(AnimatePresence, { children: show && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.95 }, animate: { scale: 1 }, exit: { scale: 0.95 }, className: "bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: title }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5", children: _jsx(X, { className: "h-5 w-5" }) })] }), children] }) })) }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Manage all CAC Registration page content." }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: saveAll, className: "flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save All Changes"] })] }), saved && _jsx("div", { className: "text-emerald-400 text-sm font-bold", children: "All CAC content saved!" }), _jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsx("h3", { className: "text-lg font-bold text-white mb-4", children: "Haritech CAC Registration Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Registered Business Name" }), _jsx("input", { type: "text", value: info.registeredName, onChange: e => setInfo({ ...info, registeredName: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "RC / BN Number" }), _jsx("input", { type: "text", value: info.rcNumber, onChange: e => setInfo({ ...info, rcNumber: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Registration Date" }), _jsx("input", { type: "text", value: info.registrationDate, onChange: e => setInfo({ ...info, registrationDate: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Business Status" }), _jsx("input", { type: "text", value: info.status, onChange: e => setInfo({ ...info, status: e.target.value }), className: inputClass })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: labelClass, children: "Address" }), _jsx("textarea", { rows: 2, value: info.address, onChange: e => setInfo({ ...info, address: e.target.value }), className: `${inputClass} resize-none` })] })] })] }), _jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-white", children: "Registration Services" }), _jsxs("button", { onClick: () => { setSvcForm({ title: '', desc: '', timeline: '' }); setEditingSvc(null); setShowSvcForm(true); }, className: "flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-3 w-3" }), " Add"] })] }), _jsx("div", { className: "space-y-2", children: services.map((svc, i) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-white/5 group", children: [_jsx(GripVertical, { className: "h-4 w-4 text-slate-600 shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-bold text-white", children: svc.title }), _jsxs("div", { className: "text-xs text-slate-500 truncate", children: [svc.desc, " ", _jsx(Clock, { className: "h-3 w-3 inline ml-2" }), " ", svc.timeline] })] }), _jsx("button", { onClick: () => { setSvcForm(svc); setEditingSvc(svc); setShowSvcForm(true); }, className: "p-1.5 text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => setServices(services.filter((_, j) => j !== i)), className: "p-1.5 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, i))) })] }), _jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-white", children: "Why Register Cards" }), _jsxs("button", { onClick: () => { setWhyForm({ title: '', desc: '' }); setEditingWhy(null); setShowWhyForm(true); }, className: "flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-3 w-3" }), " Add"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: whys.map((w, i) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-white/5 group", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-bold text-white", children: w.title }), _jsx("div", { className: "text-xs text-slate-500 truncate", children: w.desc })] }), _jsx("button", { onClick: () => { setWhyForm(w); setEditingWhy(w); setShowWhyForm(true); }, className: "p-1.5 text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => setWhys(whys.filter((_, j) => j !== i)), className: "p-1.5 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, i))) })] }), _jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsx("h3", { className: "text-lg font-bold text-white mb-4", children: "Required Documents" }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx("input", { type: "text", value: docInput, onChange: e => setDocInput(e.target.value), onKeyDown: e => e.key === 'Enter' && addDoc(), className: `${inputClass} flex-1`, placeholder: "Add a required document..." }), _jsx("button", { onClick: addDoc, className: "px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all", children: "Add" })] }), _jsx("div", { className: "space-y-2", children: documents.map((doc, i) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 group", children: [_jsx("span", { className: "text-sm text-slate-300", children: doc }), _jsx("button", { onClick: () => setDocuments(documents.filter((_, j) => j !== i)), className: "p-1.5 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, i))) })] }), _jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-white", children: "FAQ Questions" }), _jsxs("button", { onClick: () => { setFaqForm({ q: '', a: '' }); setEditingFaq(null); setShowFaqForm(true); }, className: "flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-3 w-3" }), " Add"] })] }), _jsx("div", { className: "space-y-2", children: faqs.map((faq, i) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-white/5 group", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-bold text-white", children: faq.q }), _jsx("div", { className: "text-xs text-slate-500 line-clamp-1", children: faq.a })] }), _jsx("button", { onClick: () => { setFaqForm(faq); setEditingFaq(faq); setShowFaqForm(true); }, className: "p-1.5 text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => setFaqs(faqs.filter((_, j) => j !== i)), className: "p-1.5 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, i))) })] }), _jsx(Modal, { show: showSvcForm, onClose: () => setShowSvcForm(false), title: editingSvc ? 'Edit Service' : 'Add Service', children: _jsxs("form", { onSubmit: saveSvc, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Title *" }), _jsx("input", { type: "text", required: true, value: svcForm.title, onChange: e => setSvcForm({ ...svcForm, title: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Description *" }), _jsx("textarea", { rows: 2, required: true, value: svcForm.desc, onChange: e => setSvcForm({ ...svcForm, desc: e.target.value }), className: `${inputClass} resize-none` })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Timeline" }), _jsx("input", { type: "text", value: svcForm.timeline, onChange: e => setSvcForm({ ...svcForm, timeline: e.target.value }), className: inputClass, placeholder: "1-2 weeks" })] }), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }), _jsx("button", { type: "button", onClick: () => setShowSvcForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 text-sm text-slate-400", children: "Cancel" })] })] }) }), _jsx(Modal, { show: showWhyForm, onClose: () => setShowWhyForm(false), title: editingWhy ? 'Edit Card' : 'Add Card', children: _jsxs("form", { onSubmit: saveWhy, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Title *" }), _jsx("input", { type: "text", required: true, value: whyForm.title, onChange: e => setWhyForm({ ...whyForm, title: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Description *" }), _jsx("textarea", { rows: 3, required: true, value: whyForm.desc, onChange: e => setWhyForm({ ...whyForm, desc: e.target.value }), className: `${inputClass} resize-none` })] }), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }), _jsx("button", { type: "button", onClick: () => setShowWhyForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 text-sm text-slate-400", children: "Cancel" })] })] }) }), _jsx(Modal, { show: showFaqForm, onClose: () => setShowFaqForm(false), title: editingFaq ? 'Edit FAQ' : 'Add FAQ', children: _jsxs("form", { onSubmit: saveFaq, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Question *" }), _jsx("textarea", { rows: 2, required: true, value: faqForm.q, onChange: e => setFaqForm({ ...faqForm, q: e.target.value }), className: `${inputClass} resize-none` })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Answer *" }), _jsx("textarea", { rows: 4, required: true, value: faqForm.a, onChange: e => setFaqForm({ ...faqForm, a: e.target.value }), className: `${inputClass} resize-none` })] }), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }), _jsx("button", { type: "button", onClick: () => setShowFaqForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 text-sm text-slate-400", children: "Cancel" })] })] }) })] }));
};
export default HaritechCACManager;
