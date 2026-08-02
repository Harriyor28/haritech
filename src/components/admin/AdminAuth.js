import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader2, Database } from 'lucide-react';
import { getSupabase, isCloudConfigured, ADMIN_EMAIL } from '../../utils/supabaseClient';
import AdminDashboard from '../../pages/AdminDashboard';
const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const LoginForm = () => {
    const [email, setEmail] = useState(ADMIN_EMAIL);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const sb = getSupabase();
        if (!sb) {
            setError('Supabase is not configured.');
            setLoading(false);
            return;
        }
        const { error: signInError } = await sb.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (signInError) {
            setError(signInError.message || 'Sign in failed. Check your credentials.');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full max-w-md", children: _jsxs("div", { className: "card p-8 md:p-10 glow-border", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-6 mx-auto shadow-lg", children: _jsx(Lock, { className: "h-6 w-6 text-white" }) }), _jsx("h1", { className: "text-2xl font-black text-white text-center mb-2", children: "Admin Sign In" }), _jsx("p", { className: "text-sm text-slate-500 text-center mb-8", children: "Sign in to manage your site content." }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: [_jsx(Mail, { className: "h-3 w-3 inline mr-1 text-cyan-400" }), " Email"] }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: inputClass, placeholder: "admin@haritech.com" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide", children: [_jsx(Lock, { className: "h-3 w-3 inline mr-1 text-cyan-400" }), " Password"] }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: inputClass, placeholder: "Your password" })] }), error && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3", children: [_jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60", children: [loading ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Lock, { className: "h-4 w-4" }), loading ? 'Signing in...' : 'Sign In'] })] }), _jsxs("div", { className: "mt-6 flex items-center gap-2 text-xs text-slate-600 bg-slate-950/40 rounded-xl px-4 py-3 border border-white/5", children: [_jsx(Database, { className: "h-4 w-4 text-cyan-500/50 shrink-0" }), _jsx("span", { children: "Content is stored in your Supabase database and synced to every visitor automatically." })] })] }) }) }));
};
const LoadingScreen = () => (_jsx("div", { className: "min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 text-cyan-400 animate-spin" }) }));
const AdminAuth = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!isCloudConfigured()) {
            setLoading(false);
            return;
        }
        const sb = getSupabase();
        if (!sb) {
            setLoading(false);
            return;
        }
        sb.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            setLoading(false);
        });
        return () => sub.subscription.unsubscribe();
    }, []);
    if (!isCloudConfigured())
        return _jsx(AdminDashboard, {});
    if (loading)
        return _jsx(LoadingScreen, {});
    if (!session)
        return _jsx(LoginForm, {});
    return _jsx(AdminDashboard, {});
};
export default AdminAuth;
