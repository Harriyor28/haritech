import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, HelpCircle, ChevronDown } from 'lucide-react';
import { getFAQCategories, setFAQCategories } from '../../utils/haritechContent';
const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";
const emptyCategory = { category: '', items: [{ q: '', a: '' }] };
const HaritechFAQManager = () => {
    const [categories, setCategories] = useState(() => getFAQCategories());
    const [saved, setSaved] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState(emptyCategory);
    useEffect(() => { setCategories(getFAQCategories()); }, []);
    const handleSave = () => {
        setFAQCategories(categories);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    const saveCategory = () => {
        const clean = {
            category: formData.category.trim(),
            items: formData.items.filter(i => i.q.trim() && i.a.trim()),
        };
        if (!clean.category)
            return;
        if (editingIndex !== null) {
            setCategories(categories.map((c, i) => i === editingIndex ? clean : c));
        }
        else {
            setCategories([...categories, clean]);
        }
        setShowForm(false);
        setEditingIndex(null);
    };
    const openAdd = () => { setFormData(emptyCategory); setEditingIndex(null); setShowForm(true); };
    const openEdit = (index) => {
        const c = categories[index];
        setFormData({ category: c.category, items: c.items.map(i => ({ ...i })) });
        setEditingIndex(index);
        setShowForm(true);
    };
    const deleteCategory = (index) => setCategories(categories.filter((_, i) => i !== index));
    const updateItem = (itemIndex, field, value) => {
        setFormData(prev => ({ ...prev, items: prev.items.map((it, i) => i === itemIndex ? { ...it, [field]: value } : it) }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Manage FAQ categories and questions shown on the FAQ page." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleSave, className: "flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: openAdd, className: "flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all", children: [_jsx(Plus, { className: "h-4 w-4" }), " Add Category"] })] })] }), saved && _jsx("div", { className: "text-emerald-400 text-sm font-bold", children: "Saved successfully!" }), _jsx("div", { className: "space-y-4", children: categories.map((cat, ci) => (_jsxs("div", { className: "card p-6 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center", children: _jsx(HelpCircle, { className: "h-4 w-4 text-purple-400" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-white text-sm", children: cat.category }), _jsxs("p", { className: "text-xs text-slate-500", children: [cat.items.length, " questions"] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => openEdit(ci), className: "p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => deleteCategory(ci), className: "p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }), _jsxs("div", { className: "space-y-2", children: [cat.items.slice(0, 4).map((item, i) => (_jsxs("div", { className: "flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 rounded-lg px-3 py-2", children: [_jsx(ChevronDown, { className: "h-3.5 w-3.5 text-slate-600 mt-0.5 shrink-0" }), _jsx("span", { children: item.q })] }, i))), cat.items.length > 4 && _jsxs("p", { className: "text-xs text-slate-600", children: ["+", cat.items.length - 4, " more..."] })] })] }, cat.category))) }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4", onClick: () => setShowForm(false), children: _jsxs(motion.div, { initial: { scale: 0.95 }, animate: { scale: 1 }, exit: { scale: 0.95 }, className: "bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-white", children: [editingIndex !== null ? 'Edit' : 'Add', " FAQ Category"] }), _jsx("button", { onClick: () => setShowForm(false), className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("form", { onSubmit: e => { e.preventDefault(); saveCategory(); }, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Category Name *" }), _jsx("input", { type: "text", required: true, value: formData.category, onChange: e => setFormData({ ...formData, category: e.target.value }), className: inputClass, placeholder: "e.g. General, Services, Pricing" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { className: labelClass, children: "Questions" }), _jsxs("button", { type: "button", onClick: () => setFormData(prev => ({ ...prev, items: [...prev.items, { q: '', a: '' }] })), className: "flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-white transition-colors", children: [_jsx(Plus, { className: "h-3.5 w-3.5" }), " Add Question"] })] }), _jsx("div", { className: "space-y-4", children: formData.items.map((item, i) => (_jsxs("div", { className: "bg-slate-950/40 rounded-xl border border-white/5 p-4 space-y-3 relative", children: [_jsx("button", { type: "button", onClick: () => setFormData(prev => ({ ...prev, items: prev.items.filter((_, j) => j !== i) })), className: "absolute top-3 right-3 p-1 text-slate-600 hover:text-red-400 transition-colors", children: _jsx(X, { className: "h-3.5 w-3.5" }) }), _jsxs("div", { children: [_jsxs("label", { className: labelClass, children: ["Question ", i + 1, " *"] }), _jsx("input", { type: "text", required: true, value: item.q, onChange: e => updateItem(i, 'q', e.target.value), className: inputClass, placeholder: "What is Haritech Exclusive Services?" })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Answer *" }), _jsx("textarea", { rows: 2, required: true, value: item.a, onChange: e => updateItem(i, 'a', e.target.value), className: `${inputClass} resize-none`, placeholder: "Answer text..." })] })] }, i))) })] }), _jsxs("div", { className: "flex gap-4 pt-2", children: [_jsxs("button", { type: "submit", className: "flex-1 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " ", editingIndex !== null ? 'Update' : 'Add', " Category"] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400", children: "Cancel" })] })] })] }) })) })] }));
};
export default HaritechFAQManager;
