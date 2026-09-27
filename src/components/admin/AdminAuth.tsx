import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader2, Database } from 'lucide-react';
import { getSupabase, isCloudConfigured, ADMIN_EMAIL, SUPABASE_URL } from '../../utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import AdminDashboard from '../../pages/AdminDashboard';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false);
  const [testing, setTesting] = useState(false);

  const friendlyError = (raw: string): string => {
    const msg = raw.toLowerCase();
    if (msg.includes('invalid login credentials')) {
      return `No admin account matches that email + password. Either the Supabase Auth user was never created, or the password is wrong. Create it under Supabase Dashboard → Authentication → Users (email must be ${ADMIN_EMAIL}).`;
    }
    if (msg.includes('email not confirmed')) {
      return 'This account exists but the email was never confirmed. Confirm it, turn off email confirmations, or resend the link below.';
    }
    if (msg.includes('failed to fetch') || msg.includes('fetch failed') || msg.includes('network')) {
      return 'Cannot reach Supabase. Check your internet connection and that VITE_SUPABASE_URL is correct.';
    }
    return raw || 'Sign in failed. Check your credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setEmailUnconfirmed(false);
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
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setEmailUnconfirmed(true);
      }
      setError(friendlyError(signInError.message));
    }
  };

  const handleResendConfirmation = async () => {
    setError('');
    setInfo('');
    const sb = getSupabase();
    if (!sb) return;
    const { error: resendError } = await sb.auth.resend({ type: 'signup', email });
    if (resendError) {
      setError(friendlyError(resendError.message));
    } else {
      setInfo(`Confirmation email re-sent to ${email}. Check inbox and spam, then sign in.`);
    }
  };

  const handleTestConnection = async () => {
    setError('');
    setInfo('');
    if (!SUPABASE_URL) {
      setError('VITE_SUPABASE_URL is missing from the .env file.');
      return;
    }
    setTesting(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        setInfo('Supabase is reachable. The problem is the account, not the connection — create/confirm the Auth user, then sign in or use Forgot password.');
      } else if (res.status === 404) {
        setError(`Project responded but the Auth service was not found (HTTP 404). The VITE_SUPABASE_URL is likely wrong — copy the Project URL again from Supabase Dashboard → Project Settings → API.`);
      } else {
        setError(`Supabase responded with HTTP ${res.status}. The project may be paused — open the Supabase Dashboard and Resume the project, then retry.`);
      }
    } catch {
      setError('Still cannot reach Supabase. Check: 1) your internet/VPN, 2) ad-blocker or firewall blocking supabase.co, 3) the project is not paused in the Supabase Dashboard, 4) VITE_SUPABASE_URL is exactly your Project URL.');
    } finally {
      setTesting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your admin email first, then click Forgot password.');
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const { error: resetError } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    setLoading(false);
    if (resetError) {
      setError(friendlyError(resetError.message));
    } else {
      setInfo(`Password reset email sent to ${email} (if that account exists). Open the link, you will land back here signed in — then set a new password under Settings.`);
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
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{info}</span>
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
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading || testing}
                className="text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-60"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={loading || testing}
                className="text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-60"
              >
                {testing ? 'Testing...' : 'Test connection'}
              </button>
              {emailUnconfirmed && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-60"
                >
                  Resend confirmation email
                </button>
              )}
            </div>
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

const SetupLocked: React.FC = () => (
  <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4">
    <div className="card p-8 md:p-10 glow-border max-w-md w-full text-center">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-6 mx-auto shadow-lg">
        <Database className="h-6 w-6 text-white" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Admin Not Configured</h1>
      <p className="text-sm text-slate-500 mb-8">
        The admin panel is locked until the site owner connects a Supabase project and
        signs in with their admin account. If you are the owner, add your keys to the
        <code className="text-cyan-400"> .env </code>
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

  if (!isCloudConfigured()) return <SetupLocked />;
  if (loading) return <LoadingScreen />;
  if (!session) return <LoginForm />;
  return <AdminDashboard />;
};

export default AdminAuth;