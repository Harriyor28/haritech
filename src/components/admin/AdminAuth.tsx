import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { getSupabase, isCloudConfigured, ADMIN_EMAIL } from '../../utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import AdminDashboard from '../../pages/AdminDashboard';

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-[#060a14] px-3.5 py-3 pl-10 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10';

const BrandMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <span
      className={`flex items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/25 to-violet-500/25 font-black text-cyan-200 ${
        compact ? 'h-9 w-9 text-[12px]' : 'h-11 w-11 text-sm'
      }`}
    >
      H
    </span>
    <div>
      <p className={`font-black tracking-[0.2em] text-white ${compact ? 'text-[12px]' : 'text-sm'}`}>
        HARITECH
      </p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
        Control console
      </p>
    </div>
  </div>
);

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    const { error: signInError } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message || 'Sign in failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/[0.06] p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(700px 400px at 20% 10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(600px 360px at 85% 80%, rgba(139,92,246,0.10), transparent 60%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative">
          <BrandMark />
        </div>

        <div className="relative max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400/70">
            Owner workspace
          </p>
          <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-tight text-white">
            One console for the whole Haritech operation.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Publish projects, answer enquiries, run the CAC and identity desks, and keep every page
            in sync from a single signed-in workspace.
          </p>

          <div className="mt-8 space-y-3">
            {[
              {
                icon: <BarChart3 className="h-3.5 w-3.5" />,
                text: 'Real, measured metrics — no invented traffic numbers',
              },
              {
                icon: <ShieldCheck className="h-3.5 w-3.5" />,
                text: 'Owner-only writes, enforced by row-level security',
              },
              {
                icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                text: 'Keyboard-first navigation with ⌘K search',
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300">
                  {item.icon}
                </span>
                <p className="text-[11.5px] text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[10px] text-slate-600">
          <Database className="h-3.5 w-3.5" />
          Content is stored in your Supabase database and served to every visitor.
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <BrandMark compact />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Admin sign in
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Welcome back</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Sign in with the owner account. Other accounts can authenticate but cannot publish.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  placeholder="you@haritech.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2.5 text-[11px] text-red-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 py-3 text-[12px] font-bold text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? 'Signing in…' : 'Sign in to console'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[10px] leading-relaxed text-slate-500">
            <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/60" />
            <span>
              Saves made without this session stay in the browser. Signing in publishes your work to
              every visitor.
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050810] text-slate-200">
    <BrandMark compact />
    <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Unlocking console</p>
  </div>
);

const SetupLocked: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#050810] p-4 text-slate-200">
    <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#080d18] p-8 text-center">
      <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
        <Database className="h-5 w-5" />
      </div>
      <BrandMark compact />
      <h1 className="mt-5 text-xl font-black text-white">Admin not configured</h1>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        The console is locked until the site owner connects a Supabase project and signs in with the
        owner account. Add the keys to the
        <code className="mx-1 rounded bg-white/[0.04] px-1 py-0.5 text-cyan-400">.env</code>
        file and redeploy.
      </p>
    </div>
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
    void sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, current) => {
      setSession(current);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isCloudConfigured()) return <SetupLocked />;
  if (loading) return <LoadingScreen />;
  if (!session) return <LoginForm />;
  return <AdminDashboard />;
};

export default AdminAuth;
