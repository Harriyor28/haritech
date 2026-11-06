import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import { priceOf } from '../../config/pricing';
import { formatNaira } from '../../utils/money';
import {
  CAC_DOCUMENT_CHECKLIST,
  CAC_ENTITY_TYPES,
  emptyCacDraft,
  getCacEntityOption,
  type CacApplicationDraft,
  type CacEntityType,
} from '../../utils/cac/cacTypes';
import {
  CAC_MAX_PROPOSED_NAMES,
  clearCacDraft,
  draftToPayload,
  loadCacDraft,
  saveCacDraft,
  validateCacDraft,
  type CacDraftErrors,
} from '../../utils/cac/cacValidation';
import { submitCacApplication, type CacSubmitResult } from '../../utils/cac/cacApplications';

const SERIF = "font-['Playfair_Display',serif]";
const inputClass =
  'w-full bg-[#FDFBF4] border border-[#DED3AC] px-4 py-3 text-sm text-[#1E2B20] placeholder:text-[#9AA394] outline-none focus:border-[#0B6B3B] focus:ring-1 focus:ring-[#0B6B3B]/20 transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A6A33] mb-2';
const errorClass = 'mt-1.5 text-xs text-[#A33A2B]';

const STEPS = [
  { title: 'Type', hint: 'What are you registering?' },
  { title: 'Names', hint: 'Proposed names and activity' },
  { title: 'Applicant', hint: 'Your contact details' },
  { title: 'People', hint: 'Directors, partners or trustees' },
  { title: 'Documents', hint: 'What you already have' },
  { title: 'Review', hint: 'Check and submit' },
];

const stepFields = (step: number): string[] => {
  switch (step) {
    case 0:
      return ['entityType'];
    case 1:
      return ['proposedNames', 'natureOfBusiness'];
    case 2:
      return ['applicantName', 'applicantEmail', 'applicantPhone', 'applicantAddress', 'businessAddress'];
    case 3:
      return ['members'];
    case 5:
      return ['notes', 'consent'];
    default:
      return [];
  }
};

interface CacApplicationWizardProps {
  onTrack?: () => void;
}

const CacApplicationWizard: React.FC<CacApplicationWizardProps> = ({ onTrack }) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CacApplicationDraft>(() => loadCacDraft());
  const [errors, setErrors] = useState<CacDraftErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<CacSubmitResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) saveCacDraft(draft);
  }, [draft, result]);

  const entity = getCacEntityOption(draft.entityType);
  const packagePrice = priceOf(entity.packageId);
  const peopleRequired = draft.entityType !== 'business_name';

  const update = <K extends keyof CacApplicationDraft>(key: K, value: CacApplicationDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key as string]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  };

  const updateName = (index: number, value: string) => {
    const names = [...draft.proposedNames];
    names[index] = value;
    update('proposedNames', names);
  };

  const updateMember = (index: number, patch: Partial<CacApplicationDraft['members'][number]>) => {
    const members = draft.members.map((member, memberIndex) =>
      memberIndex === index ? { ...member, ...patch } : member,
    );
    update('members', members);
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
    const nextErrors = validateCacDraft(draft);
    const relevant = stepFields(step);
    const blocking = Object.fromEntries(
      Object.entries(nextErrors).filter(([key]) => relevant.includes(key)),
    ) as CacDraftErrors;
    setErrors(nextErrors);
    if (Object.keys(blocking).length > 0) return;
    setStep((previous) => Math.min(STEPS.length - 1, previous + 1));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCacDraft(draft);
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
      const submitted = await submitCacApplication(draft);
      clearCacDraft();
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
    const payload = draftToPayload(draft);
    return {
      names: payload.proposed_names,
      people: payload.members,
      documents: payload.documents_have,
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
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6A33] mb-1">Application received</p>
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
          Keep this reference. To check progress, open the tracker and enter the reference with the
          same phone number or email you used here. The tracker shows Haritech’s handling stages —
          it is not a live feed from the Corporate Affairs Commission’s internal system.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          {onTrack && (
            <button
              type="button"
              onClick={onTrack}
              className="inline-flex items-center justify-center gap-2 bg-[#0B6B3B] hover:bg-[#074D2A] text-[#F7F2E6] text-sm font-semibold px-6 py-3 transition-colors"
            >
              Track this application <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <a
            href={getWhatsAppUrl(`Hello Haritech, I submitted CAC application ${result.reference}.`)}
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
              setDraft(emptyCacDraft());
              setStep(0);
              setErrors({});
            }}
            className="inline-flex items-center justify-center gap-2 text-[#5F6B5C] hover:text-[#1E2B20] text-sm font-semibold px-2 py-3 transition-colors"
          >
            Start another application
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
        <p className="text-xs text-[#8B9284] mb-6">Saved in this browser as you type. Nothing is filed until you submit.</p>

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
                  {CAC_ENTITY_TYPES.map((option) => {
                    const selected = draft.entityType === option.id;
                    const price = priceOf(option.packageId);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => update('entityType', option.id as CacEntityType)}
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
                        <span className="mt-2 block text-xs text-[#5F6B5C] leading-relaxed">{option.description}</span>
                        <span className="mt-3 block text-xs font-semibold text-[#0B6B3B]">
                          {price !== null ? `${formatNaira(price)} package` : 'Quoted after review'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-[11px] text-[#8B9284] leading-relaxed">
                  Package prices include the official Commission fee and Haritech assistance. The
                  quotation confirms the final scope; the Commission decides the application.
                </p>
                {errors.entityType && <p className={errorClass}>{errors.entityType}</p>}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass} htmlFor="cac-name-0">Proposed names</label>
                  <p className="text-xs text-[#5F6B5C] mb-3">Give the desk two or three options in your preferred order.</p>
                  <div className="space-y-2">
                    {draft.proposedNames.map((name, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-[#9AA394] shrink-0">{index + 1}.</span>
                        <input
                          id={`cac-name-${index}`}
                          className={inputClass}
                          value={name}
                          maxLength={120}
                          placeholder={index === 0 ? 'First choice name' : 'Alternative name'}
                          onChange={(event) => updateName(index, event.target.value)}
                        />
                        {draft.proposedNames.length > 1 && (
                          <button
                            type="button"
                            aria-label={`Remove name ${index + 1}`}
                            onClick={() =>
                              update('proposedNames', draft.proposedNames.filter((_, i) => i !== index))
                            }
                            className="p-2 text-[#9AA394] hover:text-[#A33A2B] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {draft.proposedNames.length < CAC_MAX_PROPOSED_NAMES && (
                    <button
                      type="button"
                      onClick={() => update('proposedNames', [...draft.proposedNames, ''])}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B6B3B] hover:text-[#074D2A]"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add another name
                    </button>
                  )}
                  {errors.proposedNames && <p className={errorClass}>{errors.proposedNames}</p>}
                </div>

                <div>
                  <label className={labelClass} htmlFor="cac-nature">Nature of business</label>
                  <textarea
                    id="cac-nature"
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-none`}
                    placeholder="For example: sale of solar equipment and installation services."
                    value={draft.natureOfBusiness}
                    onChange={(event) => update('natureOfBusiness', event.target.value)}
                  />
                  {errors.natureOfBusiness && <p className={errorClass}>{errors.natureOfBusiness}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="cac-applicant">Applicant full name</label>
                  <input
                    id="cac-applicant"
                    className={inputClass}
                    maxLength={120}
                    value={draft.applicantName}
                    onChange={(event) => update('applicantName', event.target.value)}
                  />
                  {errors.applicantName && <p className={errorClass}>{errors.applicantName}</p>}
                </div>
                <div>
                  <label className={labelClass} htmlFor="cac-email">Email address</label>
                  <input
                    id="cac-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    value={draft.applicantEmail}
                    onChange={(event) => update('applicantEmail', event.target.value)}
                  />
                  {errors.applicantEmail && <p className={errorClass}>{errors.applicantEmail}</p>}
                </div>
                <div>
                  <label className={labelClass} htmlFor="cac-phone">Phone number</label>
                  <input
                    id="cac-phone"
                    type="tel"
                    autoComplete="tel"
                    className={inputClass}
                    value={draft.applicantPhone}
                    onChange={(event) => update('applicantPhone', event.target.value)}
                  />
                  {errors.applicantPhone && <p className={errorClass}>{errors.applicantPhone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="cac-address">Residential address</label>
                  <textarea
                    id="cac-address"
                    rows={2}
                    maxLength={500}
                    className={`${inputClass} resize-none`}
                    value={draft.applicantAddress}
                    onChange={(event) => update('applicantAddress', event.target.value)}
                  />
                  {errors.applicantAddress && <p className={errorClass}>{errors.applicantAddress}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="cac-business-address">Business address</label>
                  <textarea
                    id="cac-business-address"
                    rows={2}
                    maxLength={500}
                    className={`${inputClass} resize-none`}
                    value={draft.businessAddress}
                    onChange={(event) => update('businessAddress', event.target.value)}
                  />
                  {errors.businessAddress && <p className={errorClass}>{errors.businessAddress}</p>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-xs text-[#5F6B5C] mb-2">
                  {peopleRequired
                    ? `List the ${entity.memberLabel.toLowerCase()}s on this application. At least one is required.`
                    : 'Optional for a Business Name: add partners or other signatories if there are any.'}
                </p>
                <p className="text-[11px] text-[#8B9284] mb-4 leading-relaxed">
                  Need to confirm a NIN or BVN first?{' '}
                  <a
                    href="#identity-checks"
                    className="text-[#0B6B3B] font-semibold underline underline-offset-4 decoration-[#B08D2E]/60"
                  >
                    Use the identity checks
                  </a>{' '}
                  below. Numbers are never stored with this application.
                </p>
                <div className="space-y-3">
                  {draft.members.map((member, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start border border-[#DED3AC] p-3">
                      <div>
                        <label className={labelClass} htmlFor={`cac-member-${index}`}>Full name</label>
                        <input
                          id={`cac-member-${index}`}
                          className={inputClass}
                          maxLength={120}
                          value={member.name}
                          onChange={(event) => updateMember(index, { name: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`cac-role-${index}`}>Role</label>
                        <input
                          id={`cac-role-${index}`}
                          className={inputClass}
                          maxLength={120}
                          placeholder={entity.memberRoleHint}
                          value={member.role}
                          onChange={(event) => updateMember(index, { role: event.target.value })}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove person ${index + 1}`}
                        onClick={() => update('members', draft.members.filter((_, i) => i !== index))}
                        className="sm:mt-7 p-2 text-[#9AA394] hover:text-[#A33A2B] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {draft.members.length < 20 && (
                  <button
                    type="button"
                    onClick={() => update('members', [...draft.members, { name: '', role: '' }])}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B6B3B] hover:text-[#074D2A]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add a person
                  </button>
                )}
                {errors.members && <p className={errorClass}>{errors.members}</p>}
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-xs text-[#5F6B5C] mb-4">
                  Tick what you already have. You can submit now and send the rest on WhatsApp —
                  the desk will tell you exactly what is missing.
                </p>
                <ul className="border-t border-[#DED3AC]">
                  {CAC_DOCUMENT_CHECKLIST.map((document) => {
                    const checked = draft.documentsHave.includes(document);
                    return (
                      <li key={document} className="border-b border-[#DED3AC]">
                        <label className="flex items-start gap-3 py-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDocument(document)}
                            className="mt-0.5 h-4 w-4 accent-[#0B6B3B]"
                          />
                          <span className="text-sm text-[#2A352C]">{document}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="border border-[#DED3AC]">
                  <div className="px-4 py-3 bg-[#F1E9D6] border-b border-[#DED3AC] flex flex-wrap items-center justify-between gap-2">
                    <span className={`${SERIF} text-base text-[#1E2B20]`}>{entity.label}</span>
                    <span className="text-xs font-semibold text-[#0B6B3B]">
                      {packagePrice !== null ? formatNaira(packagePrice) : 'Quoted after review'}
                    </span>
                  </div>
                  <dl className="divide-y divide-[#EDE4CA] text-sm">
                    <div className="px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-wide text-[#7A6A33] mb-1">Proposed names</dt>
                      <dd className="text-[#1E2B20]">{summary.names.join(' · ')}</dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-wide text-[#7A6A33] mb-1">Nature of business</dt>
                      <dd className="text-[#1E2B20]">{draft.natureOfBusiness.trim()}</dd>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[#7A6A33] mb-1">Applicant</dt>
                        <dd className="text-[#1E2B20]">{draft.applicantName.trim()}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-[#7A6A33] mb-1">Contact</dt>
                        <dd className="text-[#1E2B20]">{draft.applicantPhone.trim()} · {draft.applicantEmail.trim()}</dd>
                      </div>
                    </div>
                    {summary.people.length > 0 && (
                      <div className="px-4 py-3">
                        <dt className="text-[11px] uppercase tracking-wide text-[#7A6A33] mb-1">{entity.memberLabel}s</dt>
                        <dd className="text-[#1E2B20]">
                          {summary.people.map((person) => `${person.name}${person.role ? ` (${person.role})` : ''}`).join(' · ')}
                        </dd>
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-wide text-[#7A6A33] mb-1">Documents ticked</dt>
                      <dd className="text-[#1E2B20]">{summary.documents.length > 0 ? `${summary.documents.length} of ${CAC_DOCUMENT_CHECKLIST.length}` : 'None yet — the desk will follow up'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <label className={labelClass} htmlFor="cac-notes">Anything else the desk should know?</label>
                  <textarea
                    id="cac-notes"
                    rows={3}
                    maxLength={2000}
                    className={`${inputClass} resize-none`}
                    placeholder="Optional. For example: preferred name order, or a document you will send later."
                    value={draft.notes}
                    onChange={(event) => update('notes', event.target.value)}
                  />
                  {errors.notes && <p className={errorClass}>{errors.notes}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.consent}
                    onChange={(event) => update('consent', event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#0B6B3B]"
                  />
                  <span className="text-xs text-[#5F6B5C] leading-relaxed">
                    I confirm these details are correct and may be used to prepare and follow up this
                    registration file. I understand Haritech is an assistance service and the
                    Corporate Affairs Commission decides the application.
                  </span>
                </label>
                {errors.consent && <p className={errorClass}>{errors.consent}</p>}

                {submitError && (
                  <div className="border border-[#A33A2B]/40 bg-[#FBEDE9] px-4 py-3 text-sm text-[#8A2E22]">
                    {submitError}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="border-t border-[#DED3AC] px-5 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((previous) => Math.max(0, previous - 1))}
          disabled={step === 0 || submitting}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5F6B5C] hover:text-[#1E2B20] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-[11px] text-[#9AA394]">
            {step === 5 ? 'Submitting creates your reference number' : 'Your draft stays on this device'}
          </span>
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
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CacApplicationWizard;
