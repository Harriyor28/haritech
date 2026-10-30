import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Send, X } from 'lucide-react';
import type { CustomerDetails } from '../../utils/solar/types';
import {
  buildWhatsAppFallbackUrl,
  submitContactMessage,
  type ContactMessage,
} from '../../utils/contactMessages';
import { inputClass, labelClass } from './SolarField';

interface QuoteModalProps {
  open: boolean;
  mode: 'quote' | 'assessment';
  customer: CustomerDetails;
  summary: string;
  onClose: () => void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'fallback';

export const QuoteModal: React.FC<QuoteModalProps> = ({
  open,
  mode,
  customer,
  summary,
  onClose,
}) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [form, setForm] = useState({
    name: customer.name,
    email: customer.contact.includes('@') ? customer.contact : '',
    phone: customer.contact.includes('@') ? '' : customer.contact,
    message: '',
    website: '',
  });

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setError('');
    setFallbackUrl('');
    setForm({
      name: customer.name,
      email: customer.contact.includes('@') ? customer.contact : '',
      phone: customer.contact.includes('@') ? '' : customer.contact,
      message: '',
      website: '',
    });
    // Reset only when the dialog opens; editing the assessment behind it must
    // not wipe what the visitor has typed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const subject =
    mode === 'quote' ? 'Solar system quotation request' : 'Solar site assessment request';
  const heading = mode === 'quote' ? 'Request this quotation' : 'Book a site assessment';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.website.trim()) {
      setStatus('success');
      return;
    }
    const errors: string[] = [];
    if (form.name.trim().length < 2 || form.name.trim().length > 120) {
      errors.push('Enter your full name (2–120 characters).');
    }
    if (!/^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$/.test(form.email.trim())) {
      errors.push('Enter a valid email address.');
    }
    if (!/^[+0-9()\-\s]{6,20}$/.test(form.phone.trim())) {
      errors.push('Enter a valid phone number (6–20 digits or symbols).');
    }
    if (form.message.trim().length > 4000) {
      errors.push('Keep the additional note under 4,000 characters.');
    }
    if (errors.length > 0) {
      setStatus('error');
      setError(errors.join(' '));
      return;
    }

    const messageBody = [form.message.trim(), '', '— Assessment summary —', summary]
      .filter((part) => part !== '')
      .join('\n');

    const msg: ContactMessage = {
      form: 'quote',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      category: 'Solar Energy Installation',
      subject,
      message: messageBody,
      sourcePage: '/haritech/solar-advisor',
      contactMethod: 'email',
      consentMarketing: false,
    };

    setStatus('submitting');
    const result = await submitContactMessage(msg);
    if (result.ok) {
      setStatus('success');
      return;
    }
    if (result.error === 'rate-limited') {
      setStatus('error');
      setError('You just sent an enquiry — please wait about half a minute and try again.');
      return;
    }
    setFallbackUrl(buildWhatsAppFallbackUrl(msg));
    setStatus('fallback');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#0b101c] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">{heading}</h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Your details are sent to Haritech to answer this enquiry. The assessment itself stays in this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="h-9 w-9 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Enquiry received</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Haritech will review the assessment and respond using the contact details supplied. No equipment has been
              ordered and no price is confirmed until a written quotation is issued.
            </p>
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5 px-5 mt-5">
              Close
            </button>
          </div>
        ) : status === 'fallback' ? (
          <div className="p-6">
            <AlertCircle className="h-8 w-8 text-amber-400 mb-3" />
            <p className="text-sm font-bold text-white">The enquiry could not be sent automatically</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              It has been saved in this browser’s outbox. Send it now on WhatsApp so Haritech receives it.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-5">
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4 flex-1"
              >
                <MessageCircle className="h-4 w-4" /> Send on WhatsApp
              </a>
              <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5 px-4 flex-1">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  className={inputClass}
                  value={form.name}
                  maxLength={120}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  maxLength={160}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  maxLength={20}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Preferred contact</label>
                <input className={`${inputClass} opacity-70`} value="Email" readOnly />
              </div>
            </div>

            <div>
              <label className={labelClass}>Additional note (optional)</label>
              <textarea
                className={`${inputClass} min-h-[90px] resize-y`}
                value={form.message}
                maxLength={4000}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Anything the assessment does not capture, such as roof type or preferred installation date."
              />
            </div>

            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm({ ...form, website: event.target.value })}
                />
              </label>
            </div>

            <details className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              <summary className="text-[11px] font-bold text-slate-400 cursor-pointer">Assessment summary attached</summary>
              <pre className="mt-2 whitespace-pre-wrap text-[10px] text-slate-500 leading-relaxed font-mono max-h-40 overflow-y-auto">
                {summary}
              </pre>
            </details>

            {status === 'error' && (
              <p className="text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full text-xs py-3 disabled:opacity-60"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send enquiry
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              This is an enquiry, not an order. Haritech confirms equipment, price and installation in writing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
