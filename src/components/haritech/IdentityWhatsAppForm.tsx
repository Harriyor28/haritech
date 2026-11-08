import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  MessageCircle,
  Send,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import {
  IDENTITY_SERVICES,
  getIdentityService,
  type IdentityKind,
  type IdentityServiceId,
} from '../../utils/identity/identityDeskTypes';
import { isValidIdentityNumber, normaliseIdentityNumber } from '../../utils/identity/identityCore';

const SERIF = "font-['Playfair_Display',serif]";
const inputClass =
  'w-full bg-[#FDFBF4] border border-[#DED3AC] px-4 py-3 text-sm text-[#1E2B20] placeholder:text-[#9AA394] outline-none focus:border-[#0B6B3B] focus:ring-1 focus:ring-[#0B6B3B]/20 transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A6A33] mb-2';

/** Extra request options that are not desk services. */
type NeedId = IdentityServiceId | 'just_a_check' | 'something_else';

const NEED_OPTIONS: { id: NeedId; label: string }[] = [
  { id: 'just_a_check', label: 'Help with a failed or pending check' },
  ...IDENTITY_SERVICES.map((service) => ({ id: service.id as NeedId, label: service.label })),
  { id: 'something_else', label: 'Something else about my record' },
];

const describesNeed = (id: NeedId): string => {
  if (id === 'just_a_check') return 'Help with a failed or pending identity check';
  if (id === 'something_else') return 'Something else about my identity record';
  return getIdentityService(id as IdentityServiceId).label;
};

export interface IdentityWhatsAppFormProps {
  /** Pre-fill the number the visitor already typed into the checks field. */
  initialNumber?: string;
  initialKind?: IdentityKind;
}

const IdentityWhatsAppForm: React.FC<IdentityWhatsAppFormProps> = ({
  initialNumber = '',
  initialKind,
}) => {
  const [kind, setKind] = useState<IdentityKind>(initialKind ?? 'nin');
  const [holderName, setHolderName] = useState('');
  const [number, setNumber] = useState(initialNumber.replace(/\D/g, '').slice(0, 11));
  const [need, setNeed] = useState<NeedId>('just_a_check');
  const [state, setState] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);

  const shortLabel = kind === 'nin' ? 'NIN' : 'BVN';

  const switchKind = (next: IdentityKind) => {
    setKind(next);
    setError('');
  };

  const buildMessage = (): string => [
    `Hello Haritech, my ${shortLabel} details for the desk:`,
    `Name: ${holderName.trim()}`,
    `${shortLabel}: ${normaliseIdentityNumber(number)}`,
    `What I need: ${describesNeed(need)}`,
    state.trim() ? `State of residence: ${state.trim()}` : '',
    note.trim() ? `Note: ${note.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const digits = normaliseIdentityNumber(number);
    if (!isValidIdentityNumber(kind, digits)) {
      setError(`Enter the 11-digit ${shortLabel}.`);
      return;
    }
    if (holderName.trim().length < 2) {
      setError('Enter the name on the record.');
      return;
    }
    if (!consent) {
      setError('Tick the consent box — it explains where the details go.');
      return;
    }

    // The message leaves straight to Haritech's WhatsApp from the visitor's
    // own phone. Nothing below stores a copy on this website or in a table.
    const url = getWhatsAppUrl(buildMessage());
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  return (
    <motion.div
      id="identity-whatsapp-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#FDFBF4] border border-[#DED3AC]"
    >
      <div className="border-b border-[#DED3AC] px-5 md:px-8 py-5">
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-[#0B6B3B] mt-0.5 shrink-0" />
          <div>
            <h3 className={`${SERIF} text-xl text-[#1E2B20]`}>Send to the desk on WhatsApp</h3>
            <p className="text-xs text-[#5F6B5C] leading-relaxed mt-1">
              Type your {shortLabel} here once. The details open inside your own WhatsApp, ready to
              send to Haritech. This form is not connected to any database and the website does not
              store what you type.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={send} className="px-5 md:px-8 py-5">
        <div className="flex gap-2 mb-4">
          {(['nin', 'bvn'] as IdentityKind[]).map((item) => {
            const selected = kind === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => switchKind(item)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  selected
                    ? 'bg-[#0B6B3B] text-[#F7F2E6]'
                    : 'border border-[#DED3AC] text-[#5F6B5C] hover:border-[#B08D2E] hover:text-[#1E2B20]'
                }`}
              >
                {item === 'nin' ? 'NIN' : 'BVN'}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="id-wa-name">Name on the record</label>
            <input
              id="id-wa-name"
              className={inputClass}
              placeholder="As registered"
              value={holderName}
              onChange={(event) => setHolderName(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="id-wa-number">{shortLabel} number</label>
            <input
              id="id-wa-number"
              className={`${inputClass} font-mono tracking-[0.18em]`}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              maxLength={11}
              placeholder="00000000000"
              value={number}
              onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, 11))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="id-wa-need">What do you need?</label>
            <select
              id="id-wa-need"
              className={inputClass}
              value={need}
              onChange={(event) => setNeed(event.target.value as NeedId)}
            >
              {NEED_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="id-wa-state">State of residence (optional)</label>
            <input
              id="id-wa-state"
              className={inputClass}
              placeholder="e.g. Rivers"
              value={state}
              onChange={(event) => setState(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="id-wa-note">Note (optional)</label>
            <input
              id="id-wa-note"
              className={inputClass}
              placeholder="Anything to add"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#0B6B3B]"
          />
          <span className="text-xs text-[#5F6B5C] leading-relaxed">
            I am the holder of this {shortLabel}, or I have their permission. I understand the
            details will open in my WhatsApp to send to Haritech. The website does not store them.
          </span>
        </label>

        {error && (
          <div className="mt-4 border border-[#A33A2B]/40 bg-[#FBEDE9] px-4 py-3 text-sm text-[#8A2E22] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {opened && (
          <div className="mt-4 border border-[#0B6B3B]/30 bg-[#EEF5EC] px-4 py-3 text-sm text-[#1E2B20] flex items-start gap-2">
            <Send className="h-4 w-4 mt-0.5 shrink-0 text-[#0B6B3B]" />
            <span>
              WhatsApp should be open with your details filled in — press send there. For privacy,
              this form was cleared of any connection: nothing was kept.
            </span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] text-[#F7F2E6] text-sm font-semibold px-6 py-3 transition-colors"
          >
            <Send className="h-4 w-4" /> Open WhatsApp with my details
          </button>
          <span className="text-[11px] text-[#9AA394]">Goes to Haritech’s WhatsApp directly.</span>
        </div>
      </form>

      <div className="border-t border-[#DED3AC] px-5 md:px-8 py-4">
        <p className="text-[11px] text-[#8B9284] leading-relaxed">
          The desk replies with the next steps and confirms the fee before any booking. Prefer the
          automated route? The check panel above verifies a number live through the licensed
          provider.
        </p>
      </div>
    </motion.div>
  );
};

export default IdentityWhatsAppForm;
