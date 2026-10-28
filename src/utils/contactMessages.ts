import { getSupabase, isCloudConfigured } from './supabaseClient';
import { getWhatsAppUrl, getHaritechContent } from './haritechContent';
import { trackEvent } from './analytics';

export interface ContactMessage {
  form: 'contact' | 'quote' | 'newsletter';
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject?: string;
  message: string;
  budget?: string;
  timeline?: string;
  contactMethod?: string;
  consentMarketing?: boolean;
  sourcePage?: string;
}

export type SubmitResult =
  | { ok: true; via: 'cloud' }
  | { ok: true; via: 'whatsapp' }
  | { ok: false; error: string; canRetryLater: true };

const OUTBOX_KEY = 'haritech-contact-outbox';
const LAST_SUBMIT_KEY = 'haritech-last-enquiry-at';
const MIN_SUBMIT_GAP_MS = 30_000;

const saveToOutbox = (msg: ContactMessage): boolean => {
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    list.push({ ...msg, savedAt: new Date().toISOString() });
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(list.slice(-50)));
    return true;
  } catch {
    return false;
  }
};

/** All stored entries — lets the owner recover enquiries never emailed. */
export const readOutbox = (): (ContactMessage & { savedAt: string })[] => {
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Throttle too-rapid submissions before hitting the server. */
export const isThrottled = (): boolean => {
  try {
    const last = Number(window.localStorage.getItem(LAST_SUBMIT_KEY) ?? '0');
    return Date.now() - last < MIN_SUBMIT_GAP_MS;
  } catch {
    return false;
  }
};

export const submitContactMessage = async (msg: ContactMessage): Promise<SubmitResult> => {
  if (isThrottled()) {
    return { ok: false, error: 'rate-limited', canRetryLater: true };
  }
  try {
    window.localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — continue, server throttle still applies */
  }

  const sb = getSupabase();
  if (sb) {
    const payload = {
      form: msg.form,
      name: msg.name || '',
      email: msg.email || '',
      phone: msg.phone || '',
      category: msg.category || '',
      subject: msg.subject || '',
      message: msg.message || '',
      budget: msg.budget || '',
      timeline: msg.timeline || '',
      contact_method: msg.contactMethod || '',
      consent_marketing: Boolean(msg.consentMarketing),
      source_page: msg.sourcePage || window.location.pathname,
      user_agent: window.navigator.userAgent,
    };
    try {
      const { error } = await sb.from('contact_messages').insert(payload);
      if (!error) {
        trackEvent('enquiry_submitted', msg.form);
        return { ok: true, via: 'cloud' };
      }
      // Older live tables may not have the newer columns yet (42703).
      // Retry with only the columns that table is known to have, so the
      // enquiry still lands in the admin Messages tab.
      if (/does not exist/i.test(error.message)) {
        const core: Record<string, unknown> = {};
        for (const key of ['form', 'name', 'email', 'phone', 'subject', 'message', 'budget', 'timeline', 'contact_method']) {
          core[key] = (payload as Record<string, unknown>)[key];
        }
        const retry = await sb.from('contact_messages').insert(core);
        if (!retry.error) {
          trackEvent('enquiry_submitted', msg.form);
          return { ok: true, via: 'cloud' };
        }
      }
      // RLS/missing table/offline — fall through to WhatsApp delivery
    } catch {
      // Network failure — fall through to WhatsApp delivery
    }
  } else {
    trackEvent('enquiry_no_cloud', msg.form);
  }

  saveToOutbox(msg);
  trackEvent('enquiry_fallback', msg.form);
  return { ok: false, error: 'cloud-unavailable', canRetryLater: true };
};

export const cloudConfigured = (): boolean => isCloudConfigured();

/** Newsletter signup — delivered to the same contact_messages table (form='newsletter'). */
export const submitNewsletterEmail = (email: string): Promise<SubmitResult> =>
  submitContactMessage({
    form: 'newsletter',
    name: 'Newsletter subscriber',
    email,
    message: 'Newsletter signup',
    subject: 'Newsletter',
    category: 'Newsletter',
  });

/** Pre-filled WhatsApp link so a visitor can always deliver the message by hand. */
export const buildWhatsAppFallbackUrl = (msg: ContactMessage): string => {
  const lines = [
    msg.form === 'quote' ? 'QUOTE REQUEST' : 'NEW MESSAGE',
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    msg.phone ? `Phone: ${msg.phone}` : '',
    msg.category ? `Enquiry type: ${msg.category}` : '',
    msg.subject ? `Subject: ${msg.subject}` : '',
    msg.budget ? `Budget: ${msg.budget}` : '',
    msg.timeline ? `Timeline: ${msg.timeline}` : '',
    msg.contactMethod ? `Preferred contact: ${msg.contactMethod}` : '',
    '',
    msg.message,
  ].filter(Boolean);
  return getWhatsAppUrl(lines.join('\n'));
};

export const getContactEmail = (): string => getHaritechContent().email;
