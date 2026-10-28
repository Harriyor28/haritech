import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppUrl, getHaritechContent } from '../utils/haritechContent';
import { trackEvent } from '../utils/analytics';

/* Lightweight rule-based welcome chat (no AI): every answer is verified
   site content — pages, WhatsApp links and the enquiry form.            */

interface ChatOption {
  id: string;
  label: string;
  reply: string;
  cta?: { label: string; to: string; internal?: boolean };
  whatsapp?: string;
  more?: { label: string; option: string }[];
}

const buildOptions = (): ChatOption[] => {
  const site = getHaritechContent();
  return [
    {
      id: 'services',
      label: 'Our services',
      reply: `We offer: Web Design & Development, E-commerce, Business Automation, Solar Energy systems, 3D Epoxy & Interior Décor, CAC company registration, and Importation & Freight Forwarding. Which one would you like details on?`,
      cta: { label: 'See all services', to: '/haritech/services', internal: true },
      more: [
        { label: 'Solar Energy', option: 'solar' },
        { label: '3D Epoxy & Décor', option: 'epoxy' },
        { label: 'CAC Registration', option: 'cac' },
        { label: 'Importation', option: 'importation' },
      ],
    },
    {
      id: 'solar',
      label: 'Solar Energy',
      reply: 'We install complete solar systems — panels, inverters, batteries, water pumps and security lights — for homes, businesses and farms, with maintenance plans available.',
      cta: { label: 'Solar services & calculator', to: '/haritech/solar-energy', internal: true },
    },
    {
      id: 'epoxy',
      label: '3D Epoxy & Décor',
      reply: 'Bespoke 3D epoxy floors (ocean, marble, metallic) plus complete interior home decoration — walls, furniture, lighting — styled around your floor.',
      cta: { label: 'Visite the 3D studio', to: '/haritech/3d-epoxy', internal: true },
    },
    {
      id: 'cac',
      label: 'CAC Registration',
      reply: 'Register your company with Nigeria C fast: business name, limited company or NGO — search, filing and certificate handled end-to-end.',
      cta: { label: 'CAC registration & fee estimator', to: '/haritech/cac-registration', internal: true },
    },
    {
      id: 'importation',
      label: 'Importation',
      reply: 'We run complete importations into Nigeria: supplier sourcing and vetting, Form M, SONCAP and NAFDAC permits, sea & air freight, customs clearing with duty paid, terminal release and delivery to your warehouse — with a landed-cost estimate before you order.',
      cta: { label: 'Importation setup & landed-cost estimator', to: '/haritech/importation', internal: true },
    },
    {
      id: 'product',
      label: 'Service / product enquiry',
      reply: 'Happy to help with any service question. The fastest option is the detailed enquiry form — it reaches the owner directly and you get an instant reference for follow-up.',
      cta: { label: 'Open the enquiry form', to: '/haritech/contact', internal: true },
      whatsapp: 'Hello! I have a question about one of your services',
    },
    {
      id: 'quote',
      label: 'Request a quotation',
      reply: 'Great — fill in the quote request form with your project details and budget range, and we will prepare a tailored quotation. You can also pick up the conversation on WhatsApp.',
      cta: { label: 'Request a quote', to: '/haritech/request-quote', internal: true },
      whatsapp: 'Hello! I would like a quotation. My project is:',
    },
    {
      id: 'booking',
      label: 'Book a service',
      reply: 'To book a service (solar install, epoxy pour, interior decoration, CAC filing…), send a detailed enquiry and the team will confirm the schedule with you.',
      cta: { label: 'Book via enquiry form', to: '/haritech/contact', internal: true },
      whatsapp: 'Hello! I would like to book a service:',
    },
    {
      id: 'availability',
      label: 'Delivery & availability',
      reply: 'Most projects are delivered within 1–4 weeks depending on scope (site survey first for solar/epoxy/decor). Availability is confirmed when you enquire — we will reply to you directly with a timeline.',
      cta: { label: 'Ask about your project', to: '/haritech/request-quote', internal: true },
    },
    {
      id: 'team',
      label: 'Speak to our team',
      reply: `You can talk to us right now on WhatsApp (${site.whatsapp.replace(/[^0-9]/g, '').replace(/^(\d{3})(\d+)$/, '+$1 $2')}), call ${site.phone} or email ${site.email}.`,
      whatsapp: 'Hello Haritech, I would like to speak with your team.',
    },
    {
      id: 'form',
      label: 'Submit a detailed enquiry',
      reply: 'We have a short enquiry form (name, email, category, message) — submissions are tracked with a reference number so nothing gets lost, and the owner is notified immediately.',
      cta: { label: 'Open enquiry form', to: '/haritech/contact', internal: true },
    },
  ];
};

const findOption = (label: string, list: ChatOption[]): ChatOption | undefined => {
  const token = label.toLowerCase().trim();
  if (!token) return undefined;
  return (
    list.find((o) => token.includes(o.id)) ??
    list.find((o) => o.label.toLowerCase().replace('our ', '').split(' ')[0] && token.includes(o.label.toLowerCase().split(' ')[0]!)) ??
    undefined
  );
};

interface Bubble {
  from: 'bot' | 'user';
  text: string;
  cta?: ChatOption['cta'];
  whatsapp?: string;
  more?: ChatOption['more'];
}

const WELCOME: Bubble = {
  from: 'bot',
  text: 'Hi there! Welcome to Haritech Exclusive Business. How can we help you today?',
};

const HaritechWelcomeChatWidget: React.FC = () => {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('haritech-chat-open') === '1';
    } catch {
      return false;
    }
  });
  const [messages, setMessages] = useState<Bubble[]>([WELCOME]);
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<ChatOption[]>([]);

  const resetRoot = useCallback(() => {
    const root = buildOptions();
    optionsRef.current = root;
    setOptions(root.map((o) => o.label));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('haritech-chat-open', open ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    if (open) trackEvent('chat_opened');
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, options]);

  useEffect(() => {
    resetRoot();
  }, [resetRoot]);

  const answer = (userText: string, opt?: ChatOption) => {
    const chosen = opt ?? findOption(userText, optionsRef.current);
    setMessages((prev) => [...prev, { from: 'user', text: userText }]);
    if (!chosen) {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: "I didn't quite catch that — pick one of the options below, or send a detailed enquiry and the team will get back to you.",
          cta: { label: 'Open enquiry form', to: '/haritech/contact', internal: true },
          whatsapp: 'Hello! I have a question:',
        },
      ]);
      resetRoot();
      return;
    }
    trackEvent('chat_option', chosen.id);
    setMessages((prev) => [
      ...prev,
      {
        from: 'bot',
        text: chosen.reply,
        ...(chosen.cta && { cta: chosen.cta }),
        ...(chosen.whatsapp && { whatsapp: chosen.whatsapp }),
        ...(chosen.more && { more: chosen.more }),
      },
    ]);
    if (chosen.id === 'services') {
      setOptions(['Solar Energy', '3D Epoxy & Décor', 'CAC Registration', 'Importation', 'Service / product enquiry', 'Request a quotation']);
    } else {
      resetRoot();
    }
  };

  const submitInput = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    answer(text);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitInput();
    }
  };

  const closeChat = () => setOpen(false);

  return (
    <>
      {/* Floating launcher — bottom-right, above the dock & clear of nav */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        aria-label="Open the Haritech help chat"
        className={`fixed right-4 sm:right-6 bottom-24 sm:bottom-28 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          open
            ? 'bg-slate-800 border border-white/20 text-white'
            : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-teal-500/30'
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" aria-hidden="true" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-label="Haritech help chat"
            className="fixed right-2 sm:right-6 bottom-40 sm:bottom-44 z-40 w-[min(92vw,360px)] max-h-[70vh] flex flex-col rounded-3xl border border-teal-500/25 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-teal-950/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-b border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Haritech Help</p>
                <p className="text-[10px] text-emerald-400 font-mono">● Online — replies to enquiries every working day</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={m.from === 'bot' ? 'text-left' : 'text-right'}>
                  <div
                    className={`inline-block max-w-[92%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.from === 'bot'
                        ? 'bg-white/10 text-slate-200 rounded-bl-sm'
                        : 'bg-teal-500 text-slate-950 rounded-br-sm font-medium'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.cta && (
                    <div className="mt-1.5">
                      {m.cta.internal ? (
                        <Link
                          to={m.cta.to}
                          onClick={closeChat}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 hover:text-cyan-300 underline underline-offset-2"
                        >
                          {m.cta.label} <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : null}
                    </div>
                  )}
                  {m.whatsapp && (
                    <div className="mt-1.5">
                      <a
                        href={getWhatsAppUrl(m.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('whatsapp_click', 'chat')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                      >
                        Chat on WhatsApp <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {m.more && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.more.map((mo) => (
                        <button
                          key={mo.option}
                          type="button"
                          onClick={() => answer(mo.label)}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-bold hover:bg-teal-500 hover:text-white transition-colors"
                        >
                          {mo.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick options */}
            {options.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                {options.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => answer(label)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold hover:bg-teal-500/20 hover:border-teal-400/40 hover:text-teal-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 bg-slate-950">
              <label htmlFor="haritech-chat-input" className="sr-only">Type your question</label>
              <input
                id="haritech-chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your question…"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/20 text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={submitInput}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors disabled:opacity-40"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-3 text-[9px] text-slate-600">
              Guided help — not automated sending. You choose when to send on WhatsApp.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HaritechWelcomeChatWidget;
