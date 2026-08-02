import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { getTeamMembers, setTeamMembers } from '../../utils/haritechContent';
const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";
const HaritechTeamManager = () => {
    const [members, setMembers] = useState(() => getTeamMembers());
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saved, setSaved] = useState(false);
    useEffect(() => { setMembers(getTeamMembers()); }, []);
    const handleSave = () => {
        setTeamMembers(members);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    const saveMember = (m) => {
        if (editing) {
            setMembers(members.map(mm => mm.id === m.id ? m : mm));
        }
        else {
            setMembers([...members, { ...m, id: Date.now() }]);
        }
        setEditing(null);
        setShowForm(false);
    };
    const deleteMember = (id) => setMembers(members.filter(m => m.id !== id));
    const [formData, setFormData] = useState({ id: 0, name: '', role: '', bio: '', image: '' });
    const openAdd = () => { setFormData({ id: 0, name: '', role: '', bio: '', image: '' }); setEditing(null); setShowForm(true); };
    const openEdit = (m) => { setFormData(m); setEditing(m); setShowForm(true); };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Manage your team members displayed on the About page." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleSave, className: "flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: openAdd, className: "flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-4 w-4" }), " Add Member"] })] })] }), saved && _jsx("div", { className: "text-emerald-400 text-sm font-bold", children: "Saved successfully!" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: members.map(m => (_jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border text-center", children: [_jsx("div", { className: "w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4", children: m.name.charAt(0) }), _jsx("h4", { className: "font-bold text-white text-sm", children: m.name }), _jsx("p", { className: "text-xs text-cyan-400 mb-2", children: m.role }), _jsx("p", { className: "text-xs text-slate-500 mb-4 line-clamp-2", children: m.bio }), _jsxs("div", { className: "flex gap-2 justify-center", children: [_jsx("button", { onClick: () => openEdit(m), className: "p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => deleteMember(m.id), className: "p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }, m.id))) }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4", onClick: () => setShowForm(false), children: _jsxs(motion.div, { initial: { scale: 0.95 }, animate: { scale: 1 }, exit: { scale: 0.95 }, className: "bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-white", children: [editing ? 'Edit' : 'Add', " Team Member"] }), _jsx("button", { onClick: () => setShowForm(false), className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("form", { onSubmit: e => { e.preventDefault(); saveMember(formData); }, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Name *" }), _jsx("input", { type: "text", required: true, value: formData.name, onChange: e => setFormData({ ...formData, name: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Role / Title *" }), _jsx("input", { type: "text", required: true, value: formData.role, onChange: e => setFormData({ ...formData, role: e.target.value }), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Bio" }), _jsx("textarea", { rows: 3, value: formData.bio, onChange: e => setFormData({ ...formData, bio: e.target.value }), className: `${inputClass} resize-none` })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Image URL" }), _jsx("input", { type: "url", value: formData.image, onChange: e => setFormData({ ...formData, image: e.target.value }), className: inputClass, placeholder: "https://..." })] }), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " ", editing ? 'Update' : 'Add', " Member"] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400", children: "Cancel" })] })] })] }) })) })] }));
};
export default HaritechTeamManager;
