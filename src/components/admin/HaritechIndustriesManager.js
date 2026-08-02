import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { getIndustries, setIndustries } from '../../utils/haritechContent';
const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";
const iconOptions = ['Building2', 'Rocket', 'Briefcase', 'Utensils', 'Hotel', 'BookOpen', 'Church', 'Heart', 'Shirt', 'Sprout', 'Factory', 'Users', 'Landmark', 'Home', 'Building', 'Globe', 'Monitor', 'Zap', 'Shield', 'Award'];
const HaritechIndustriesManager = () => {
    const [industries, setIndustriesState] = useState(() => getIndustries());
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({ id: 0, name: '', desc: '', icon: 'Building2' });
    useEffect(() => { setIndustriesState(getIndustries()); }, []);
    const handleSave = () => {
        setIndustries(industries);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    const saveItem = (item) => {
        if (editing) {
            setIndustriesState(industries.map(ii => ii.id === item.id ? item : ii));
        }
        else {
            setIndustriesState([...industries, { ...item, id: Date.now() }]);
        }
        setEditing(null);
        setShowForm(false);
    };
    const deleteItem = (id) => setIndustriesState(industries.filter(i => i.id !== id));
    const openAdd = () => { setFormData({ id: 0, name: '', desc: '', icon: 'Building2' }); setEditing(null); setShowForm(true); };
    const openEdit = (item) => { setFormData(item); setEditing(item); setShowForm(true); };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Manage the industries you serve on the Industries page." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleSave, className: "flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: openAdd, className: "flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-4 w-4" }), " Add Industry"] })] })] }), saved && _jsx("div", { className: "text-emerald-400 text-sm font-bold", children: "Saved successfully!" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: industries.map(ind => (_jsxs("div", { className: "card p-5 bg-[#0e1326]/80 border-white/5 glow-border group", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2", children: _jsx("span", { className: "text-white text-xs font-bold", children: ind.icon.replace(/[a-z]/g, '') }) }), _jsxs("div", { className: "flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => openEdit(ind), className: "p-1.5 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => deleteItem(ind.id), className: "p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Trash2, { className: "h-3 w-3" }) })] })] }), _jsx("h4", { className: "font-bold text-white text-sm mb-1", children: ind.name }), _jsx("p", { className: "text-xs text-slate-400 line-clamp-2", children: ind.desc })] }, ind.id))) }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4", onClick: () => setShowForm(false), children: _jsxs(motion.div, { initial: { scale: 0.95 }, animate: { scale: 1 }, exit: { scale: 0.95 }, className: "bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-white", children: [editing ? 'Edit' : 'Add', " Industry"] }), _jsx("button", { onClick: () => setShowForm(false), className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("form", { onSubmit: e => { e.preventDefault(); saveItem(formData); }, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Industry Name *" }), _jsx("input", { type: "text", required: true, value: formData.name, onChange: e => setFormData({ ...formData, name: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Description *" }), _jsx("textarea", { rows: 3, required: true, value: formData.desc, onChange: e => setFormData({ ...formData, desc: e.target.value }), className: `${inputClass} resize-none` })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Icon" }), _jsx("select", { value: formData.icon, onChange: e => setFormData({ ...formData, icon: e.target.value }), className: `${inputClass} bg-slate-950/60`, children: iconOptions.map(ic => _jsx("option", { className: "bg-[#0e1326]", children: ic }, ic)) })] }), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " ", editing ? 'Update' : 'Add', " Industry"] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400", children: "Cancel" })] })] })] }) })) })] }));
};
export default HaritechIndustriesManager;
