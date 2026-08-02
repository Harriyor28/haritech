import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Code2 } from 'lucide-react';
import { getHaritechBrandLogo, setHaritechBrandLogo } from '../../utils/haritechBrand';
const HaritechLogoManager = () => {
    const [logoUrl, setLogoUrl] = useState(() => getHaritechBrandLogo());
    const [logoPreview, setLogoPreview] = useState(null);
    const [saved, setSaved] = useState(false);
    useEffect(() => { setLogoUrl(getHaritechBrandLogo()); }, []);
    const handleSave = () => {
        const logo = logoPreview || logoUrl;
        if (!logo)
            return;
        setHaritechBrandLogo(logo);
        setLogoUrl(logo);
        setLogoPreview(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    return (_jsxs("div", { className: "card p-8 bg-[#0e1326]/80 border-white/5 glow-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-white", children: "Haritech Logo & Brand" }), _jsx("p", { className: "text-slate-400 text-xs mt-1", children: "Separate logo for the Haritech Services section" })] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleSave, className: "flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm", children: [_jsx(Save, { className: "h-4 w-4" }), " Save Logo"] })] }), saved && _jsx("div", { className: "text-emerald-400 text-sm font-bold mb-4", children: "Logo saved successfully!" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "p-6 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-4", children: "Active Haritech Logo" }), _jsx("div", { className: "w-full h-32 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center p-4", children: logoUrl ? (_jsx("img", { src: logoUrl, alt: "Haritech Logo", className: "max-h-full max-w-full object-contain" })) : (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md", children: _jsx(Code2, { className: "h-7 w-7 text-white" }) }), _jsx("span", { className: "text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent", children: "HARITECH" })] })) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Upload Logo File" }), _jsxs("div", { className: "relative border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-6 text-center transition-all bg-slate-950/30 cursor-pointer group", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => { const file = e.target.files?.[0]; if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setLogoPreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                } }, className: "absolute inset-0 opacity-0 cursor-pointer w-full h-full" }), _jsx(Upload, { className: "h-8 w-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" }), _jsx("p", { className: "text-xs text-slate-300 font-medium", children: "Click or drag & drop" }), _jsx("p", { className: "text-[10px] text-slate-500 mt-1", children: "PNG, SVG, WebP up to 5MB" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: "Or enter Logo URL" }), _jsx("input", { type: "url", placeholder: "https://example.com/haritech-logo.png", value: logoUrl, onChange: (e) => { setLogoUrl(e.target.value); setLogoPreview(null); }, className: "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" })] }), (logoPreview || logoUrl) && (_jsx("button", { onClick: () => { setLogoPreview(null); setLogoUrl(''); setHaritechBrandLogo(''); }, className: "px-4 py-2.5 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all", children: "Reset Logo" }))] })] })] }));
};
export default HaritechLogoManager;
