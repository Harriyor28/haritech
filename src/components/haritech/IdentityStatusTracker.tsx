import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  Download,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import {
  IDENTITY_STAGES,
  getIdentityService,
  type IdentityApplicationStatus,
} from '../../utils/identity/identityDeskTypes';
import { normaliseIdentityReference } from '../../utils/identity/identityDeskValidation';
import { lookupIdentityApplication } from '../../utils/identity/identityDeskClient';

const SERIF = "font-['Playfair_Display',serif]";
const inputClass =
  'w-full bg-[#FDFBF4] border border-[#DED3AC] px-4 py-3 text-sm text-[#1E2B20] placeholder:text-[#9AA394] outline-none focus:border-[#0B6B3B] focus:ring-1 focus:ring-[#0B6B3B]/20 transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A6A33] mb-2';

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
};

const IdentityStatusTracker: React.FC = () => {
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<IdentityApplicationStatus | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus(null);
    setSearched(false);

    if (!normaliseIdentityReference(reference) || !contact.trim()) {
      setError('Enter the reference number and the phone number or email used on the request.');
      return;
    }

    setLoading(true);
    try {
      const found = await lookupIdentityApplication(reference, contact);
      setStatus(found);
      setSearched(true);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : 'Could not check that request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = status
    ? Math.max(0, IDENTITY_STAGES.findIndex((stage) => stage.id === status.stage))
    : -1;

  return (
    <div className="bg-[#FDFBF4] border border-[#DED3AC]">
      <form onSubmit={search} className="p-5 md:p-8 border-b border-[#DED3AC]">
        <div className="flex items-start gap-3 mb-5">
          <ShieldCheck className="h-5 w-5 text-[#0B6B3B] mt-0.5 shrink-0" />
          <p className="text-xs text-[#5F6B5C] leading-relaxed">
            Tracking is private: the reference number alone is not enough. Enter the same phone
            number or email address you used on the request.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="identity-track-reference">Reference number</label>
            <input
              id="identity-track-reference"
              className={`${inputClass} font-mono tracking-[0.08em]`}
              placeholder="NID-XXXXXXXX"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="identity-track-contact">Phone or email</label>
            <input
              id="identity-track-contact"
              className={inputClass}
              placeholder="The contact used on the request"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Checking…' : 'Check status'}
          </button>
          <span className="text-[11px] text-[#9AA394]">No sign-in needed.</span>
        </div>
      </form>

      {searched && !status && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 md:p-8">
          <div className="border border-[#DED3AC] bg-[#F7F2E6] p-5">
            <h4 className={`${SERIF} text-lg text-[#1E2B20] mb-2`}>No matching request</h4>
            <p className="text-sm text-[#5F6B5C] leading-relaxed">
              Check the reference number and make sure the phone number or email is exactly the one
              used on the request. If it still does not match, contact the desk on WhatsApp.
            </p>
            <a
              href={getWhatsAppUrl('Hello Haritech, I need help tracking an identity request.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0B6B3B] hover:text-[#074D2A] underline underline-offset-4 decoration-[#B08D2E]/60"
            >
              Ask the desk on WhatsApp
            </a>
          </div>
        </motion.div>
      )}

      {status && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#DED3AC] pb-5">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6A33] mb-1">Identity request</p>
              <h4 className={`${SERIF} text-xl text-[#1E2B20]`}>
                {getIdentityService(status.service).label}
              </h4>
            </div>
            <div className="text-right">
              <code className="font-mono text-sm tracking-[0.12em] text-[#0B6B3B] bg-[#F1E9D6] border border-[#DED3AC] px-3 py-1.5 inline-block">
                {status.reference}
              </code>
              <p className="text-[11px] text-[#8B9284] mt-2">Submitted {formatDate(status.createdAt)}</p>
            </div>
          </div>

          {status.stageNote && (
            <div
              className={`mt-5 border px-4 py-3 text-sm leading-relaxed ${
                status.stage === 'query'
                  ? 'border-[#A33A2B]/40 bg-[#FBEDE9] text-[#8A2E22]'
                  : 'border-[#B08D2E]/40 bg-[#F7F2E6] text-[#5F6B5C]'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-[0.18em] mb-1 font-semibold">Note from the desk</span>
              {status.stageNote}
            </div>
          )}

          {/* Timeline */}
          <ol className="mt-6 border-t border-[#DED3AC]">
            {IDENTITY_STAGES.map((stage, index) => {
              const complete = index < currentIndex;
              const current = index === currentIndex;
              return (
                <li key={stage.id} className="flex gap-4 border-b border-[#EDE4CA] py-3">
                  <div className="flex flex-col items-center pt-0.5">
                    <span
                      className={`w-6 h-6 flex items-center justify-center text-[11px] font-semibold ${
                        complete
                          ? 'bg-[#0B6B3B] text-[#F7F2E6]'
                          : current
                            ? stage.attention
                              ? 'bg-[#A33A2B] text-[#F7F2E6]'
                              : 'bg-[#B08D2E] text-[#FDFBF4]'
                            : 'border border-[#DED3AC] text-[#9AA394]'
                      }`}
                    >
                      {complete ? <Check className="h-3 w-3" /> : index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        current ? 'text-[#1E2B20]' : complete ? 'text-[#0B6B3B]' : 'text-[#9AA394]'
                      }`}
                    >
                      {stage.label}
                      {current && (
                        <span
                          className={`ml-2 text-[10px] uppercase tracking-wide font-semibold ${
                            stage.attention ? 'text-[#A33A2B]' : 'text-[#B08D2E]'
                          }`}
                        >
                          current
                        </span>
                      )}
                    </p>
                    <p className={`mt-0.5 text-xs leading-relaxed ${current ? 'text-[#5F6B5C]' : 'text-[#9AA394]'}`}>
                      {stage.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {status.documents.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A6A33] font-semibold mb-3">
                Documents from the desk
              </p>
              <div className="space-y-2">
                {status.documents.map((document) => (
                  <a
                    key={document.url}
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-[#DED3AC] bg-[#FDFBF4] px-4 py-3 text-sm text-[#1E2B20] hover:border-[#0B6B3B] transition-colors"
                  >
                    <Download className="h-4 w-4 text-[#0B6B3B] shrink-0" />
                    {document.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-[11px] text-[#9AA394] leading-relaxed">
            These stages show Haritech’s handling of your file. They are not a live feed from NIMC,
            NIBSS or your bank — the authority that owns the record decides the outcome.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default IdentityStatusTracker;
