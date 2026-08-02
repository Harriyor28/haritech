import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader2, Database } from 'lucide-react';
import { getSupabase, isCloudConfigured, ADMIN_EMAIL } from '../../utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import AdminDashboard from '../../pages/AdminDashboard';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 md:p-10 glow-border">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white text-center mb-2">Admin Sign In</h1>
          <p className="text-sm text-slate-500 text-center mb-8">Sign in to manage your site content.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                <Mail className="h-3 w-3 inline mr-1 text-cyan-400" /> Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="admin@haritech.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                <Lock className="h-3 w-3 inline mr-1 text-cyan-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Your password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-600 bg-slate-950/40 rounded-xl px-4 py-3 border border-white/5">
            <Database className="h-4 w-4 text-cyan-500/50 shrink-0" />
            <span>Content is stored in your Supabase database and synced to every visitor automatically.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center">
    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
  </div>
);

const AdminAuth: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
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

  if (!isCloudConfigured()) return <AdminDashboard />;
  if (loading) return <LoadingScreen />;
  if (!session) return <LoginForm />;
  return <AdminDashboard />;
};

export default AdminAuth;