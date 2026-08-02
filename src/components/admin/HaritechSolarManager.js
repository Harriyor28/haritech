import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Sun, Zap } from 'lucide-react';
import { getSolarContent, setSolarContent } from '../../utils/haritechContent';
const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";
const iconOptions = ['Sun', 'Zap', 'Battery', 'Cpu', 'Shield', 'Star', 'TrendingUp', 'Home', 'Building2', 'Factory', 'Warehouse', 'TreePine', 'Smartphone', 'Headphones', 'Award', 'Settings', 'Wrench', 'Gauge', 'Droplets'];
const colorOptions = [
    'from-yellow-500 to-orange-600', 'from-cyan-500 to-blue-600', 'from-green-500 to-emerald-600',
    'from-purple-500 to-violet-600', 'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-600',
    'from-red-500 to-rose-600', 'from-slate-500 to-gray-600', 'from-teal-500 to-cyan-600',
];
const sections = [
    { key: 'services', title: 'Solar Services', hint: 'Service cards shown in the Our Solar Services section (title, description, icon, color).' },
    { key: 'whySolar', title: 'Why Go Solar?', hint: 'Benefit cards shown in the Why Go Solar section (title, description, icon).' },
    { key: 'applications', title: 'Applications', hint: 'Application cards shown in the Solar Applications We Serve section (title, description, icon).' },
    { key: 'stats', title: 'Stats', hint: 'Stat counters shown near the top of the page (value, label, icon).' },
];
const HaritechSolarManager = () => {
    const [solar, setSolar] = useState(() => getSolarContent());
    const [saved, setSaved] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formSection, setFormSection] = useState('services');
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({});
    useEffect(() => { setSolar(getSolarContent()); }, []);
    const handleSave = () => {
        setSolarContent(solar);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    const saveItem = () => {
        const isStats = formSection === 'stats';
        const item = { ...formData };
        if (isStats) {
            if (!item.value.trim() || !item.label.trim())
                return;
        }
        else {
            if (!item.title.trim())
                return;
        }
        const updated = solar[formSection].slice();
        if (editingIndex !== null) {
            updated[editingIndex] = item;
        }
        else {
            updated.push(item);
        }
        setSolar({ ...solar, [formSection]: updated });
        setShowForm(false);
        setEditingIndex(null);
    };
    const openAdd = (section) => {
        setFormSection(section);
        setEditingIndex(null);
        setFormData(section === 'stats' ? { value: '', label: '', icon: 'Sun' } : { title: '', desc: '', icon: 'Sun', color: 'from-yellow-500 to-orange-600' });
        setShowForm(true);
    };
    const openEdit = (section, index) => {
        const item = solar[section][index];
        setFormSection(section);
        setEditingIndex(index);
        setFormData({ ...item });
        setShowForm(true);
    };
    const deleteItem = (section, index) => {
        const sectionData = solar[section];
        const updated = sectionData.filter((_, i) => i !== index);
        setSolar({ ...solar, [section]: updated });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Manage all content shown on the Solar Energy page." }), _jsx("div", { className: "flex gap-3", children: _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleSave, className: "flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }) })] }), saved && _jsx("div", { className: "text-emerald-400 text-sm font-bold", children: "Saved successfully!" }), sections.map(section => {
                const sectionData = solar[section.key];
                const isStats = section.key === 'stats';
                return (_jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center", children: section.key === 'services' ? _jsx(Zap, { className: "h-4 w-4 text-yellow-400" }) : _jsx(Sun, { className: "h-4 w-4 text-yellow-400" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-white text-sm", children: section.title }), _jsxs("p", { className: "text-xs text-slate-500", children: [sectionData.length, " items"] })] })] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: () => openAdd(section.key), className: "flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-3.5 w-3.5" }), " Add"] })] }), _jsx("p", { className: "text-xs text-slate-500 mb-4 ml-12", children: section.hint }), _jsxs("div", { className: "space-y-2", children: [sectionData.map((item, i) => (_jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-300 bg-slate-950/40 rounded-lg px-3 py-2.5", children: [_jsx("span", { className: "font-bold text-yellow-400 w-6 shrink-0", children: isStats ? item.value : item.title }), _jsx("span", { className: "flex-1 text-slate-500 truncate", children: isStats ? item.label : item.desc }), _jsx("span", { className: "text-[10px] text-slate-600 uppercase shrink-0", children: item.icon }), _jsx("button", { onClick: () => openEdit(section.key, i), className: "p-1.5 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => deleteItem(section.key, i), className: "p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Trash2, { className: "h-3 w-3" }) })] }, i))), sectionData.length === 0 && _jsx("p", { className: "text-xs text-slate-600 px-3 py-2", children: "No items yet \u2014 click Add." })] })] }, section.key));
            }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4", onClick: () => setShowForm(false), children: _jsxs(motion.div, { initial: { scale: 0.95 }, animate: { scale: 1 }, exit: { scale: 0.95 }, className: "bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-white", children: [editingIndex !== null ? 'Edit' : 'Add', " ", formSection === 'stats' ? 'Stat' : formSection === 'whySolar' ? 'Benefit' : formSection === 'applications' ? 'Application' : 'Service'] }), _jsx("button", { onClick: () => setShowForm(false), className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("form", { onSubmit: e => { e.preventDefault(); saveItem(); }, className: "space-y-4", children: [formSection === 'stats' ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Value *" }), _jsx("input", { type: "text", required: true, value: formData.value ?? '', onChange: e => setFormData({ ...formData, value: e.target.value }), className: inputClass, placeholder: "e.g. 500+" })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Label *" }), _jsx("input", { type: "text", required: true, value: formData.label ?? '', onChange: e => setFormData({ ...formData, label: e.target.value }), className: inputClass, placeholder: "e.g. Solar Systems Installed" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Title *" }), _jsx("input", { type: "text", required: true, value: formData.title ?? '', onChange: e => setFormData({ ...formData, title: e.target.value }), className: inputClass, placeholder: "e.g. Solar Panel Installation" })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Description" }), _jsx("textarea", { rows: 3, value: formData.desc ?? '', onChange: e => setFormData({ ...formData, desc: e.target.value }), className: `${inputClass} resize-none` })] })] })), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Icon" }), _jsx("select", { value: formData.icon ?? 'Sun', onChange: e => setFormData({ ...formData, icon: e.target.value }), className: inputClass, children: iconOptions.map(icon => _jsx("option", { value: icon, children: icon }, icon)) })] }), formSection === 'services' && (_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Color" }), _jsx("select", { value: formData.color ?? '', onChange: e => setFormData({ ...formData, color: e.target.value }), className: inputClass, children: colorOptions.map(color => _jsx("option", { value: color, children: color.replace('from-', '').replace(' to-', ' → ') }, color)) })] })), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " ", editingIndex !== null ? 'Update' : 'Add'] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400", children: "Cancel" })] })] })] }) })) })] }));
};
export default HaritechSolarManager;
