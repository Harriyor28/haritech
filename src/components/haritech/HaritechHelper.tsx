import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Info, Send, Sparkles } from 'lucide-react';
import {
  HARI_STARTER_QUESTIONS,
  answerAnyQuestion,
  buildRemoteContext,
  displayAnyQuestion,
} from '../../utils/haritech/haritechFaq';
import {
  askRemoteSolarAi,
  type SolarAnswerSource,
} from '../../utils/solar/aiAssist';

interface Exchange {
  question: string;
  answer: string;
  entryId: string | null;
  /** 'ai' = live LLM answered; 'guide' = built-in grounded knowledge base. */
  source: SolarAnswerSource;
  link?: { to: string; label: string };
  related: string[];
  fromSolar: boolean;
  /** Question chips suggested under this answer. */
  suggestions: string[];
}

/** Floating plain-language helper for the whole Haritech website: services,
    published prices, solar, importation, CAC, booking and site navigation.
    Grounded built-in answers are always available; when the solar-ai-assist
    function's LLM answers, that takes precedence and failures fall back
    silently. Neither path invents prices, specifications or promises. */
export const HaritechHelper: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const answered = exchanges.length > 0;

  useEffect(() => {
    if (!open) return;
    if (exchanges.length === 0) return;
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [exchanges, open, pending]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || pending) return;

      const prior = exchanges;
      // Follow-up history for the LLM; the local KBs need no history.
      const history: { role: 'user' | 'assistant'; content: string }[] = [];
      for (const item of prior.slice(-4)) {
        history.push({ role: 'user', content: item.question.slice(0, 400) });
        history.push({ role: 'assistant', content: item.answer.slice(0, 400) });
      }

      setPending(true);
      try {
        // Best-matching KB excerpt (site-wide + deep solar) travels with the
        // question so the live AI answers with the site's grounded facts.
        const kbContext = buildRemoteContext(text) ?? undefined;
        const remote = await askRemoteSolarAi(text, history, kbContext);
        let source: SolarAnswerSource = 'guide';
        let answer = '';
        let entryId: string | null = null;
        let link: Exchange['link'];
        let related: string[] = [];
        let fromSolar = false;

        if (remote) {
          answer = remote.answer;
          source = 'ai';
        } else {
          const result = answerAnyQuestion(text);
          answer = result.answer;
          entryId = result.entryId;
          link = result.link;
          related = result.related;
          fromSolar = result.fromSolar;
        }

        const suggestions = related.map((id) => displayAnyQuestion(id, fromSolar));

        setExchanges((rows) => {
          const exchange: Exchange = {
            question: text,
            answer,
            entryId,
            source,
            related,
            fromSolar,
            suggestions,
          };
          if (link) exchange.link = link;
          return [...rows, exchange];
        });
      } finally {
        setPending(false);
      }
      setDraft('');
    },
    [exchanges, pending],
  );

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    void ask(draft);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 lg:bottom-6">
      {open && (
        <div
          className="mb-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0b101c]/97 shadow-2xl shadow-cyan-500/10 backdrop-blur"
          role="dialog"
          aria-label="Haritech helper"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-cyan-400/5 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-cyan-300" />
              <span className="text-xs font-bold text-white">Haritech helper</span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide text-cyan-200">
                plain answers
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Haritech helper"
              className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div ref={bodyRef} className="max-h-[46vh] min-h-[180px] space-y-3 overflow-y-auto px-3.5 py-3">
            {!answered && (
              <div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ask anything about Haritech in everyday language — services, published prices, solar, importation, CAC
                  registration, booking or finding the right page. A live AI answers when available; otherwise the
                  built-in Haritech guide takes over. Either way: honest answers, no invented figures.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {HARI_STARTER_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={pending}
                      onClick={() => void ask(question)}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200 disabled:opacity-40 transition-colors text-left"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {exchanges.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-cyan-400/15 px-2.5 py-1.5 text-[11px] text-cyan-50">
                  {item.question}
                </p>
                <div className="rounded-xl rounded-bl-sm border border-white/10 bg-slate-950/50 px-3 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8.5px] font-mono uppercase tracking-wider mb-1.5 ${
                      item.source === 'ai'
                        ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                        : 'border border-cyan-400/25 bg-cyan-400/5 text-cyan-300/80'
                    }`}
                  >
                    {item.source === 'ai' ? '● AI answer' : 'Built-in guide'}
                  </span>
                  {item.answer.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-[11px] text-slate-200 leading-relaxed [&:not(:first-child)]:mt-2 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                  {item.link && (
                    <Link
                      to={item.link.to}
                      onClick={() => setOpen(false)}
                      className="mt-2.5 inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10.5px] font-bold text-cyan-200 hover:bg-cyan-400/20 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" /> {item.link.label}
                    </Link>
                  )}
                  {item.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/5 pt-2">
                      {item.suggestions.map((question, chipIndex) => (
                        <button
                          key={`${index}-${chipIndex}`}
                          type="button"
                          disabled={pending}
                          onClick={() => void ask(question)}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 hover:text-cyan-200 hover:border-cyan-400/40 disabled:opacity-40 transition-colors text-left"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {pending && (
              <div className="flex items-center gap-2 px-1 py-1" aria-live="polite">
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/50 animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/30 animate-pulse [animation-delay:300ms]" />
                </span>
                <span className="text-[10px] text-slate-500">Thinking…</span>
              </div>
            )}
          </div>

          <p className="flex items-start gap-1.5 border-t border-white/5 px-3.5 py-2 text-[9.5px] text-slate-500 leading-snug">
            <Info className="h-3 w-3 shrink-0 mt-0.5" />
            Answers are estimates from the published Haritech guide. Final scope and price are confirmed in a quotation.
          </p>

          <form onSubmit={handleSubmit} className="flex items-center gap-1.5 border-t border-white/10 px-2.5 py-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              maxLength={280}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a question…"
              aria-label="Ask a question"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              aria-label="Send question"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open the Haritech helper"
        className="ml-auto flex items-center gap-2 rounded-full border border-cyan-400/30 bg-[#0b101c]/90 px-3.5 py-2 text-[11px] font-bold text-cyan-200 shadow-lg shadow-cyan-500/15 hover:bg-[#101728]/90 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Haritech</span>
        <span className="sm:hidden">Ask</span>
      </button>
    </div>
  );
};
