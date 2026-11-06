import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Fingerprint,
  HelpCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import {
  IDENTITY_KINDS,
  getIdentityKind,
  isValidIdentityNumber,
  normaliseIdentityNumber,
  type IdentityKind,
} from '../../utils/identity/identityCore';
import { checkIdentity, type IdentityCheckResult } from '../../utils/identity/identityClient';

const SERIF = "font-['Playfair_Display',serif]";
const inputClass =
  'w-full bg-[#FDFBF4] border border-[#DED3AC] px-4 py-3 text-sm text-[#1E2B20] placeholder:text-[#9AA394] outline-none focus:border-[#0B6B3B] focus:ring-1 focus:ring-[#0B6B3B]/20 transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A6A33] mb-2';

const formatCheckedAt = (value: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
};

const statusTone = (status: IdentityCheckResult['status']): string => {
  if (status === 'not_found' || status === 'not_configured' || status === 'rate_limited') {
    return 'border-[#B08D2E]/40 bg-[#F7F2E6] text-[#5F6B5C]';
  }
  return 'border-[#A33A2B]/40 bg-[#FBEDE9] text-[#8A2E22]';
};

const statusTitle = (status: IdentityCheckResult['status']): string => {
  switch (status) {
    case 'not_found':
      return 'No record matched that number';
    case 'not_configured':
      return 'Identity checks are being activated';
    case 'rate_limited':
      return 'Too many checks';
    default:
      return 'The check could not be completed';
  }
};

const IdentityCheckPanel: React.FC = () => {
  const [kind, setKind] = useState<IdentityKind>('nin');
  const [number, setNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentityCheckResult | null>(null);
  const [error, setError] = useState('');

  const option = getIdentityKind(kind);

  const switchKind = (next: IdentityKind) => {
    setKind(next);
    setNumber('');
    setResult(null);
    setError('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);

    const digits = normaliseIdentityNumber(number);
    if (!isValidIdentityNumber(kind, digits)) {
      setError(`Enter the 11-digit ${option.shortLabel}.`);
      return;
    }
    if (!consent) {
      setError('Tick the consent box before running a check.');
      return;
    }

    setLoading(true);
    try {
      const checked = await checkIdentity(kind, digits, true);
      setResult(checked);
      // Drop the raw number from the form as soon as the answer comes back,
      // whatever the outcome — the masked form is all the UI ever shows.
      setNumber('');
    } catch {
      setError('The check could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verified = result?.status === 'verified';

  return (
    <div className="bg-[#FDFBF4] border border-[#DED3AC]">
      <div className="border-b border-[#DED3AC] px-5 md:px-8 py-5">
        <div className="flex items-start gap-3">
          <Fingerprint className="h-5 w-5 text-[#0B6B3B] mt-0.5 shrink-0" />
          <div>
            <h3 className={`${SERIF} text-xl text-[#1E2B20]`}>Check a NIN or BVN</h3>
            <p className="text-xs text-[#5F6B5C] leading-relaxed mt-1">
              A live check against Haritech’s licensed identity-verification provider. Only the
              last four digits are shown back, and the full number is not stored here.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 pt-5">
        <div role="tablist" aria-label="Identity document" className="flex gap-2">
          {IDENTITY_KINDS.map((item) => {
            const selected = kind === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => switchKind(item.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  selected
                    ? 'bg-[#0B6B3B] text-[#F7F2E6]'
                    : 'border border-[#DED3AC] text-[#5F6B5C] hover:border-[#B08D2E] hover:text-[#1E2B20]'
                }`}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[#5F6B5C] leading-relaxed">{option.description}</p>
      </div>

      <form onSubmit={submit} className="px-5 md:px-8 py-5">
        <label className={labelClass} htmlFor="identity-number">
          {option.shortLabel} number
        </label>
        <input
          id="identity-number"
          className={`${inputClass} font-mono tracking-[0.18em]`}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={11}
          placeholder="00000000000"
          value={number}
          onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, 11))}
          aria-describedby="identity-help"
        />
        <p id="identity-help" className="mt-2 text-[11px] text-[#8B9284] leading-relaxed">
          {option.help}
        </p>

        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#0B6B3B]"
          />
          <span className="text-xs text-[#5F6B5C] leading-relaxed">
            I am the holder of this {option.shortLabel}, or I have their permission to check it. I
            understand the number will be sent to Haritech’s licensed verification provider for
            this check.
          </span>
        </label>

        {error && (
          <div className="mt-4 border border-[#A33A2B]/40 bg-[#FBEDE9] px-4 py-3 text-sm text-[#8A2E22] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] disabled:opacity-60 disabled:cursor-not-allowed text-[#F7F2E6] text-sm font-semibold px-6 py-3 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? 'Checking…' : `Verify ${option.shortLabel}`}
          </button>
          <span className="text-[11px] text-[#9AA394]">No sign-in needed.</span>
        </div>
      </form>

      {result && verified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[#DED3AC] px-5 md:px-8 py-5"
        >
          <div className="border border-[#0B6B3B]/30 bg-[#EEF5EC] p-5">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 shrink-0 rounded-full bg-[#0B6B3B] flex items-center justify-center">
                <BadgeCheck className="h-5 w-5 text-[#F7F2E6]" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#0B6B3B] mb-1">
                  Verified with the licensed provider
                </p>
                <h4 className={`${SERIF} text-lg text-[#1E2B20] break-words`}>{result.fullName}</h4>
                <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <dt className="uppercase tracking-wide text-[#7A6A33] text-[10px]">Number</dt>
                    <dd className="font-mono text-[#1E2B20]">{result.masked}</dd>
                  </div>
                  {result.dateOfBirth && (
                    <div>
                      <dt className="uppercase tracking-wide text-[#7A6A33] text-[10px]">Date of birth</dt>
                      <dd className="text-[#1E2B20]">{result.dateOfBirth}</dd>
                    </div>
                  )}
                  {result.gender && (
                    <div>
                      <dt className="uppercase tracking-wide text-[#7A6A33] text-[10px]">Gender</dt>
                      <dd className="text-[#1E2B20]">{result.gender}</dd>
                    </div>
                  )}
                  {result.reference && (
                    <div>
                      <dt className="uppercase tracking-wide text-[#7A6A33] text-[10px]">Provider reference</dt>
                      <dd className="font-mono text-[#1E2B20] break-all">{result.reference}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-3 text-[11px] text-[#5F6B5C] leading-relaxed">
                  Checked {formatCheckedAt(result.checkedAt) || 'just now'}. The full number was not
                  saved; keep the provider reference for your records.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {result && !verified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[#DED3AC] px-5 md:px-8 py-5"
        >
          <div className={`border p-5 ${statusTone(result.status)}`}>
            <h4 className={`${SERIF} text-lg mb-1`}>{statusTitle(result.status)}</h4>
            <p className="text-sm leading-relaxed">{result.message}</p>
            <p className="mt-2 text-[11px] opacity-80">
              The check covered {result.masked || 'the number supplied'}. No result was stored.
            </p>
            <a
              href={getWhatsAppUrl(
                `Hello Haritech, I need help with my ${getIdentityKind(result.kind).shortLabel} identity check.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0B6B3B] hover:text-[#074D2A] underline underline-offset-4 decoration-[#B08D2E]/60"
            >
              Ask the desk on WhatsApp
            </a>
          </div>
        </motion.div>
      )}

      <div className="border-t border-[#DED3AC] px-5 md:px-8 py-5">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-4 w-4 text-[#B08D2E] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1E2B20] mb-1">What if the check fails?</p>
            <p className="text-xs text-[#5F6B5C] leading-relaxed">
              A failed check usually means the name, date of birth or number does not match the
              registry record. Haritech can guide you through enrolment, retrieval or a correction
              with NIMC or your bank. Haritech does not issue NIN or BVN.
            </p>
            <ul className="mt-2 space-y-1">
              {[
                'Wrong digits: re-check the number and try again.',
                'Name mismatch: the registry record may need a correction.',
                'No NIN yet: the desk can explain the enrolment steps.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] text-[#5F6B5C]">
                  <Check className="h-3 w-3 mt-0.5 shrink-0 text-[#0B6B3B]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCheckPanel;
