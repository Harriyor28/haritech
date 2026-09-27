import { getSupabase } from './supabaseClient';
import { getWhatsAppUrl, getHaritechContent } from './haritechContent';

export interface ContactMessage {
  form: 'contact' | 'quote' | 'newsletter';
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  budget?: string;
  timeline?: string;
  contactMethod?: string;
}

export type SubmitResult =
  | { ok: true; via: 'cloud' }
  | { ok: true; via: 'whatsapp' }
  | { ok: false; error: string };

const OUTBOX_KEY = 'haritech-contact-outbox';

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

export const submitContactMessage = async (msg: ContactMessage): Promise<SubmitResult> => {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('contact_messages').insert({
        form: msg.form,
        name: msg.name || '',
        email: msg.email || '',
        phone: msg.phone || '',
        subject: msg.subject || '',
        message: msg.message || '',
        budget: msg.budget || '',
        timeline: msg.timeline || '',
        contact_method: msg.contactMethod || '',
      });
      if (!error) return { ok: true, via: 'cloud' };
      // Table missing / RLS / offline — fall through to WhatsApp delivery
    } catch {
      // Network failure — fall through to WhatsApp delivery
    }
  }
  // Keep a local backup (admin may ask the visitor to resend if lost)
  saveToOutbox(msg);
  return { ok: false, error: 'cloud-unavailable' };
};

/** Newsletter signup — delivered to the same contact_messages table (form='newsletter'). */
export const submitNewsletterEmail = (email: string): Promise<SubmitResult> =>
  submitContactMessage({
    form: 'newsletter',
    name: '',
    email,
    message: 'Newsletter signup',
  });

/** Pre-filled WhatsApp link so a visitor can always deliver the message by hand. */
export const buildWhatsAppFallbackUrl = (msg: ContactMessage): string => {
  const lines = [
    msg.form === 'quote' ? 'QUOTE REQUEST' : 'NEW MESSAGE',
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    msg.phone ? `Phone: ${msg.phone}` : '',
    msg.subject ? `Subject: ${msg.subject}` : '',
    msg.budget ? `Budget: ${msg.budget}` : '',
    msg.timeline ? `Timeline: ${msg.timeline}` : '',
    '',
    msg.message,
  ].filter(Boolean);
  return `${getWhatsAppUrl()}?text=${encodeURIComponent(lines.join('\n'))}`;
};

export const getContactEmail = (): string => getHaritechContent().email;
