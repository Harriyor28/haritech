import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  Send,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import {
  EXISTING_NUMBER_OPTIONS,
  IDENTITY_DOCUMENT_CHECKLIST,
  IDENTITY_SERVICES,
  emptyIdentityDraft,
  getIdentityService,
  type IdentityApplicationDraft,
  type IdentityServiceId,
} from '../../utils/identity/identityDeskTypes';
import {
  clearIdentityDraft,
  loadIdentityDraft,
  saveIdentityDraft,
  validateIdentityDraft,
  type IdentityDraftErrors,
} from '../../utils/identity/identityDeskValidation';
import {
  submitIdentityApplication,
  type IdentitySubmitResult,
} from '../../utils/identity/identityDeskClient';

const SERIF = "font-['Playfair_Display',serif]";
const inputClass =
  'w-full bg-[#FDFBF4] border border-[#DED3AC] px-4 py-3 text-sm text-[#1E2B20] placeholder:text-[#9AA394] outline-none focus:border-[#0B6B3B] focus:ring-1 focus:ring-[#0B6B3B]/20 transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A6A33] mb-2';
const errorClass = 'mt-1.5 text-xs text-[#A33A2B]';

const STEPS = [
  { title: 'Service', hint: 'What do you need help with?' },
  { title: 'Applicant', hint: 'Who is this request for?' },
  { title: 'Your number', hint: 'Your NIN or BVN today' },
  { title: 'Details', hint: 'What the desk must know' },
  { title: 'Documents', hint: 'What you already have' },
  { title: 'Review', hint: 'Check and submit' },
];

const stepFields = (step: number): string[] => {
  switch (step) {
    case 0:
      return ['service'];
    case 1:
      return ['holderName', 'holderEmail', 'holderPhone', 'holderDob', 'stateOfResidence'];
    case 2:
      return ['existingNumber', 'checkReference'];
    case 3:
      return ['requestDetails', 'holderAddress'];
    case 4:
      return ['notes'];
    case 5:
      return ['consent'];
    default:
      return [];
  }
};

interface IdentityApplicationWizardProps {
  onTrack?: () => void;
}

const IdentityApplicationWizard: React.FC<IdentityApplicationWizardProps> = ({ onTrack }) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<IdentityApplicationDraft>(() => loadIdentityDraft());
  const [errors, setErrors] = useState<IdentityDraftErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<IdentitySubmitResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) saveIdentityDraft(draft);
  }, [draft, result]);

  const service = getIdentityService(draft.service);

  const update = <K extends keyof IdentityApplicationDraft>(
    key: K,
    value: IdentityApplicationDraft[K],
  ) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key as string]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  };

  const toggleDocument = (document: string) => {
    const has = draft.documentsHave.includes(document);
    update(
      'documentsHave',
      has
        ? draft.documentsHave.filter((item) => item !== document)
        : [...draft.documentsHave, document],
    );
  };

  const goNext = () => {
    const nextErrors = validateIdentityDraft(draft);
    const relevant = stepFields(step);
    const blocking = Object.fromEntries(
      Object.entries(nextErrors).filter(([key]) => relevant.includes(key)),
    ) as IdentityDraftErrors;
    setErrors(nextErrors);
    if (Object.keys(blocking).length > 0) return;
    setStep((previous) => Math.min(STEPS.length - 1, previous + 1));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateIdentityDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstStep = [0, 1, 2, 3, 5].find((index) =>
        stepFields(index).some((key) => nextErrors[key]),
      );
      if (firstStep !== undefined) setStep(firstStep);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const submitted = await submitIdentityApplication(draft);
      clearIdentityDraft();
      setResult(submitted);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyReference = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const summary = useMemo(() => {
    return {
      service: getIdentityService(draft.service).label,
      documents: draft.documentsHave,
      existing: EXISTING_NUMBER_OPTIONS.find((option) => option.id === draft.existingNumber)?.label,
      reference: draft.checkReference || null,
    };
  }, [draft]);

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FDFBF4] border border-[#DED3AC] p-8 md:p-10"
      >
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 shrink-0 rounded-full bg-[#0B6B3B] flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-[#F7F2E6]" />
          </span>
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6A33] mb-1">Request received</p>
            <h3 className={`${SERIF} text-2xl text-[#1E2B20] mb-2`}>Your reference number</h3>
            <div className="flex flex-wrap items-center gap-3">
              <code className="font-mono text-xl md:text-2xl tracking-[0.14em] text-[#0B6B3B] bg-[#F1E9D6] border border-[#DED3AC] px-4 py-2">
                {result.reference}
              </code>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-2 border border-[#2A352C]/25 hover:border-[#2A352C] px-3 py-2 text-xs font-semibold text-[#2A352C] transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-[#5F6B5C] leading-relaxed max-w-2xl">
          Keep this reference. To check progress, open the tracker beside this form and enter the
          reference with the same phone number or email you used here. The tracker shows
          Haritech’s handling of your file — it is not a feed from NIMC, NIBSS or your bank. The
          desk confirms the fee with you before any booking.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          {onTrack && (
            <button
              type="button"
              onClick={onTrack}
              className="inline-flex items-center justify-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] text-[#F7F2E6] text-sm font-semibold px-6 py-3 transition-colors"
            >
              Track this request <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <a
            href={getWhatsAppUrl(`Hello Haritech, I submitted identity request ${result.reference}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-[#2A352C]/25 hover:border-[#2A352C] text-[#2A352C] text-sm font-semibold px-6 py-3 transition-colors"
          >
            Send the reference on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setDraft(emptyIdentityDraft());
              setStep(0);
              setErrors({});
            }}
            className="inline-flex items-center justify-center gap-2 text-[#5F6B5C] hover:text-[#1E2B20] text-sm font-semibold px-2 py-3 transition-colors"
          >
            Start another request
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-[#FDFBF4] border border-[#DED3AC]">
      {/* Step rail */}
      <div className="border-b border-[#DED3AC] px-5 md:px-8 py-5">
        <ol className="flex flex-wrap gap-x-5 gap-y-2">
          {STEPS.map((item, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <li key={item.title} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 flex items-center justify-center text-[11px] font-semibold ${
                    done
                      ? 'bg-[#0B6B3B] text-[#F7F2E6]'
                      : active
                        ? 'border border-[#0B6B3B] text-[#0B6B3B]'
                        : 'border border-[#DED3AC] text-[#9AA394]'
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={`text-[11px] uppercase tracking-[0.12em] ${
                    active ? 'text-[#1E2B20] font-semibold' : done ? 'text-[#0B6B3B]' : 'text-[#9AA394]'
                  }`}
                >
                  {item.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="p-5 md:p-8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6A33] mb-1">
          Step {step + 1} of {STEPS.length}
        </p>
        <h3 className={`${SERIF} text-xl md:text-2xl text-[#1E2B20] mb-1`}>{STEPS[step].hint}</h3>
        <p className="text-xs text-[#8B9284] mb-6">Saved in this browser as you type. Nothing is sent until you submit.</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {IDENTITY_SERVICES.map((option) => {
                    const selected = draft.service === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => update('service', option.id as IdentityServiceId)}
                        aria-pressed={selected}
                        className={`text-left border p-4 transition-colors ${
                          selected
                            ? 'border-[#0B6B3B] bg-[#F1E9D6]'
                            : 'border-[#DED3AC] bg-[#FDFBF4] hover:border-[#B08D2E]'
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className={`${SERIF} text-base text-[#1E2B20]`}>{option.label}</span>
                          <span
                            className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center ${
                              selected ? 'bg-[#0B6B3B] border-[#0B6B3B]' : 'border-[#C6B98F]'
                            }`}
                          >
                            {selected && <Check className="h-2.5 w-2.5 text-[#F7F2E6]" />}
                          </span>
                        </span>
                        <span className="mt-2 block text-xs text-[#5F6B5C] leading-relaxed">
                          {option.description}
                        </span>
                        <span className="mt-3 block text-[11px] text-[#8B9284] leading-relaxed">
                          {option.involvement}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-[11px] text-[#8B9284] leading-relaxed">
                  The desk confirms the service fee with you before any booking — it is not quoted
                  here. NIMC issues the NIN, and banks working with NIBSS issue the BVN; Haritech
                  prepares, books and follows the file.
                </p>
                {errors.service && <p className={errorClass}>{errors.service}</p>}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="identity-hold-name">Full name of the applicant</label>
                    <input
                      id="identity-hold-name"
                      className={inputClass}
                      placeholder="As written on your documents"
                      value={draft.holderName}
                      onChange={(event) => update('holderName', event.target.value)}
                    />
                    {errors.holderName && <p className={errorClass}>{errors.holderName}</p>}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="identity-hold-email">Email address</label>
                    <input
                      id="identity-hold-email"
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                      value={draft.holderEmail}
                      onChange={(event) => update('holderEmail', event.target.value)}
                      autoComplete="email"
                    />
                    {errors.holderEmail && <p className={errorClass}>{errors.holderEmail}</p>}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="identity-hold-phone">Phone number</label>
                    <input
                      id="identity-hold-phone"
                      type="tel"
                      className={inputClass}
                      placeholder="0803 123 4567"
                      value={draft.holderPhone}
                      onChange={(event) => update('holderPhone', event.target.value)}
                      autoComplete="tel"
                    />
                    {errors.holderPhone && <p className={errorClass}>{errors.holderPhone}</p>}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="identity-hold-dob">Date of birth</label>
                    <input
                      id="identity-hold-dob"
                      type="date"
                      className={inputClass}
                      value={draft.holderDob}
                      onChange={(event) => update('holderDob', event.target.value)}
                    />
                    {errors.holderDob && <p className={errorClass}>{errors.holderDob}</p>}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="identity-hold-gender">Gender (optional)</label>
                    <select
                      id="identity-hold-gender"
                      className={inputClass}
                      value={draft.holderGender}
                      onChange={(event) => update('holderGender', event.target.value)}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="identity-state">State of residence</label>
                    <input
                      id="identity-state"
                      className={inputClass}
                      placeholder="e.g. Lagos"
                      value={draft.stateOfResidence}
                      onChange={(event) => update('stateOfResidence', event.target.value)}
                    />
                    {errors.stateOfResidence && <p className={errorClass}>{errors.stateOfResidence}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <span className={labelClass}>Do you already hold your{service.kind === 'nin' ? ' NIN' : ' BVN'}?</span>
                  <div className="space-y-2">
                    {EXISTING_NUMBER_OPTIONS.map((option) => {
                      const selected = draft.existingNumber === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => update('existingNumber', option.id)}
                          aria-pressed={selected}
                          className={`w-full text-left border px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
                            selected
                              ? 'border-[#0B6B3B] bg-[#F1E9D6]'
                              : 'border-[#DED3AC] bg-[#FDFBF4] hover:border-[#B08D2E]'
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-semibold text-[#1E2B20]">{option.label}</span>
                            <span className="mt-0.5 block text-xs text-[#5F6B5C]">{option.hint}</span>
                          </span>
                          <span
                            className={`mt-1 w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
                              selected ? 'bg-[#0B6B3B] border-[#0B6B3B]' : 'border-[#C6B98F]'
                            }`}
                          >
                            {selected && <Check className="h-2.5 w-2.5 text-[#F7F2E6]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.existingNumber && <p className={errorClass}>{errors.existingNumber}</p>}
                </div>
                <div>
                  <label className={labelClass} htmlFor="identity-check-ref">
                    Check reference (optional)
                  </label>
                  <p className="text-xs text-[#5F6B5C] mb-2">
                    If you used the checks panel above, paste its reference so the desk can see the
                    check was done. The form never asks for the number itself.
                  </p>
                  <input
                    id="identity-check-ref"
                    className={`${inputClass} font-mono tracking-[0.08em]`}
                    placeholder="XXXXXXXX (from the checks panel)"
                    value={draft.checkReference}
                    onChange={(event) => update('checkReference', event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={10}
                  />
                  {errors.checkReference && <p className={errorClass}>{errors.checkReference}</p>}
                </div>
                <div className="border border-[#DED3AC] bg-[#F7F2E6] px-4 py-3 text-xs text-[#5F6B5C] leading-relaxed flex gap-2">
                  <Lock className="h-4 w-4 mt-0.5 shrink-0 text-[#0B6B3B]" />
                  <span>
                    Please do not type your NIN or BVN anywhere in this form. The desk verifies with
                    you directly during the review call or on WhatsApp.
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {service.requestDetailsRequired && (
                  <div>
                    <label className={labelClass} htmlFor="identity-request-details">
                      What should change or be retrieved?
                    </label>
                    <textarea
                      id="identity-request-details"
                      rows={4}
                      className={inputClass}
                      placeholder={
                        service.kind === 'bvn'
                          ? 'e.g. Surname on the BVN record shows a different spelling from my bank record.'
                          : 'e.g. Date of birth on the NIMC record is wrong; the correct date is on my birth certificate.'
                      }
                      value={draft.requestDetails}
                      onChange={(event) => update('requestDetails', event.target.value)}
                      maxLength={800}
                    />
                    {errors.requestDetails && <p className={errorClass}>{errors.requestDetails}</p>}
                  </div>
                )}
                {service.addressRequired && (
                  <div>
                    <label className={labelClass} htmlFor="identity-address">
                      Current residential address
                    </label>
                    <textarea
                      id="identity-address"
                      rows={3}
                      className={inputClass}
                      placeholder="Street, area, town/city, state"
                      value={draft.holderAddress}
                      onChange={(event) => update('holderAddress', event.target.value)}
                      maxLength={500}
                    />
                    {errors.holderAddress && <p className={errorClass}>{errors.holderAddress}</p>}
                  </div>
                )}
                {!service.requestDetailsRequired && !service.addressRequired && (
                  <div className="border border-[#DED3AC] bg-[#F7F2E6] px-4 py-4 text-xs text-[#5F6B5C] leading-relaxed">
                    <p className="text-sm font-semibold text-[#1E2B20] mb-1">{service.label}</p>
                    {service.requirements.includes('The name of your bank') ? (
                      <p>
                        Bring the name of your bank, the registered mobile number and the full name
                        on the account — you will add them in the request note on the next step.
                      </p>
                    ) : (
                      <p>
                        This service needs your enrolment details — the name, date of birth and
                        mobile number you used at enrolment. Add them in the note on the next step.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <span className={labelClass}>What documents do you already have?</span>
                  <p className="text-xs text-[#5F6B5C] mb-3">Tick what exists today — the desk checks them during review.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {IDENTITY_DOCUMENT_CHECKLIST.map((item) => {
                      const checked = draft.documentsHave.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleDocument(item)}
                          aria-pressed={checked}
                          className={`text-left border px-3 py-2.5 flex items-center gap-2.5 text-sm transition-colors ${
                            checked
                              ? 'border-[#0B6B3B] bg-[#F1E9D6] text-[#1E2B20]'
                              : 'border-[#DED3AC] bg-[#FDFBF4] text-[#5F6B5C] hover:border-[#B08D2E]'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 shrink-0 border flex items-center justify-center ${
                              checked ? 'bg-[#0B6B3B] border-[#0B6B3B]' : 'border-[#C6B98F]'
                            }`}
                          >
                            {checked && <Check className="h-2.5 w-2.5 text-[#F7F2E6]" />}
                          </span>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="identity-notes">Anything else the desk should know (optional)</label>
                  <textarea
                    id="identity-notes"
                    rows={3}
                    className={inputClass}
                    placeholder={
                      draft.service === 'bvn_retrieval'
                        ? 'e.g. Bank: Zenith Bank. Registered line: 0803…'
                        : 'Preferred days/places, or extra context — do not include your NIN or BVN here.'
                    }
                    value={draft.notes}
                    onChange={(event) => update('notes', event.target.value)}
                    maxLength={500}
                  />
                </div>
                <div className="border border-[#DED3AC] bg-[#F1E9D6] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A6A33] mb-2 font-semibold">What you will bring</p>
                  <ul className="text-xs text-[#1E2B20] leading-relaxed space-y-1">
                    {service.requirements.map((requirement) => (
                      <li key={requirement} className="flex gap-2">
                        <Check className="h-3.5 w-3.5 text-[#0B6B3B] mt-0.5 shrink-0" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-[#5F6B5C] leading-relaxed">{service.involvement}</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <dl className="border border-[#DED3AC] divide-y divide-[#EDE4CA] text-sm">
                  {[
                    ['Service', summary.service],
                    ['Applicant', draft.holderName],
                    ['Contact', `${draft.holderPhone} · ${draft.holderEmail}`],
                    ['Date of birth', draft.holderDob],
                    ['Your number', summary.existing ?? '—'],
                    ['Check reference', summary.reference ?? 'Not used'],
                    [
                      summary.documents.length > 0 ? 'Documents' : 'Documents',
                      summary.documents.length > 0 ? summary.documents.join(', ') : 'None ticked yet',
                    ],
                    ['Request details', draft.requestDetails || '—'],
                    ['Note for the desk', draft.notes || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-3 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-[#7A6A33] pt-0.5">{label}</dt>
                      <dd className="text-[#1E2B20] break-words">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs text-[#5F6B5C] leading-relaxed">
                  Your NIN or BVN is not part of this form. The desk confirms the service fee with
                  you before any booking. Stages shown later are Haritech’s handling of the file —
                  not a feed from NIMC, NIBSS or your bank.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[#0B6B3B]"
                    checked={draft.consent}
                    onChange={(event) => update('consent', event.target.checked)}
                  />
                  <span className="text-xs text-[#5F6B5C] leading-relaxed">
                    The details above are correct and may be used for this request. I understand
                    Haritech assists with the request; the authority that owns the record makes the
                    final decision.
                  </span>
                </label>
                {errors.consent && <p className={errorClass}>{errors.consent}</p>}
                {submitError && (
                  <div className="border border-[#A33A2B]/40 bg-[#FBEDE9] px-4 py-3 text-sm text-[#8A2E22] flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 shrink-0" /> {submitError}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((previous) => Math.max(0, previous - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 text-[#5F6B5C] hover:text-[#1E2B20] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold px-2 py-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] text-[#F7F2E6] text-sm font-semibold px-6 py-3 transition-colors"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] disabled:opacity-60 disabled:cursor-not-allowed text-[#F7F2E6] text-sm font-semibold px-6 py-3 transition-colors"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default IdentityApplicationWizard;
