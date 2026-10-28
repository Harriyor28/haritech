// ============================================================
// Haritech — Enquiry notifications (Resend email via Webhooks)
// Deploy (from the supabase/ dir):
//   npx supabase functions deploy enquiries-notify
// Secrets (server-side only, never in the browser):
//   npx supabase secrets set \
//     RESEND_API_KEY=re_xxxxxxxx \
//     OWNER_EMAIL=owner@yourbusiness.com \
//     EMAIL_FROM="Haritech Website <enquiries@yourdomain.com>" \
//     BUSINESS_NAME="Haritech Exclusive Business" \
//     FUNCTION_SECRET=random-long-string
// Wire-up (one-time, Supabase Dashboard -> Database -> Webhooks):
//   Table: contact_messages | Event: Insert | HTTP POST to this function URL
//   with header: Authorization: Bearer <FUNCTION_SECRET>
// ============================================================

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAX_SUBJECT = 120;
const MAX_MESSAGE = 2000; // truncate in the email body only; full text stays in the DB

interface EnquiryRow {
  id: number | string;
  form: string;
  name: string;
  email: string;
  phone: string | null;
  category: string | null;
  subject: string | null;
  message: string;
  budget: string | null;
  timeline: string | null;
  contact_method: string | null;
  source_page: string | null;
  created_at: string;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const clip = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n)}…` : s);

const EMAIL_RE = /^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$/;

type SendResult = { ok: boolean; error?: string };

async function sendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<SendResult> {
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo && EMAIL_RE.test(replyTo) ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `resend_${res.status}: ${clip(text, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `network: ${(e as Error).message}` };
  }
}

// Escape visually rendered HTML rows using pre-escaped text
const rowHtml = (label: string, value: string): string =>
  value
    ? `<tr><td style="padding:6px 12px;color:#64748b;font-size:12px">${esc(label)}</td><td style="padding:6px 12px;color:#0f172a;font-size:13px">${esc(value)}</td></tr>`
    : '';

async function notifyEnquiry(row: EnquiryRow): Promise<{ owner?: SendResult; customer?: SendResult }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const ownerEmail = Deno.env.get('OWNER_EMAIL');
  const from = Deno.env.get('EMAIL_FROM') ?? 'Haritech Website <onboarding@resend.dev>';
  const business = Deno.env.get('BUSINESS_NAME') ?? 'Haritech';

  if (!apiKey || !ownerEmail) {
    return { owner: { ok: false, error: 'not_configured' } };
  }

  const category = row.category || row.subject || row.form || 'General';
  const when = new Date(row.created_at).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

  // 1) Owner notification — customer address as reply-to (validated)
  const ownerHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#0f172a;font-size:18px">New Website Enquiry: ${esc(clip(category, 80))} (#${esc(String(row.id))})</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rowHtml('Received', when)}
        ${rowHtml('Type', row.form)}
        ${rowHtml('Name', row.name)}
        ${rowHtml('Email', row.email)}
        ${rowHtml('Phone', row.phone ?? '')}
        ${rowHtml('Category', category)}
        ${rowHtml('Subject', row.subject ?? '')}
        ${rowHtml('Budget', row.budget ?? '')}
        ${rowHtml('Timeline', row.timeline ?? '')}
        ${rowHtml('Preferred contact', row.contact_method ?? '')}
        ${rowHtml('Source page', row.source_page ?? '')}
      </table>
      <p style="color:#0f172a;font-size:13px;white-space:pre-wrap;border-top:1px solid #e2e8f0;padding-top:12px;margin-top:12px">${esc(clip(row.message, MAX_MESSAGE))}</p>
      <p style="color:#64748b;font-size:11px">Reply directly to this email to answer the customer.</p>
    </div>`;
  const owner = await sendEmail(
    apiKey, from, ownerEmail,
    `New Website Enquiry: ${clip(category, MAX_SUBJECT)}`,
    ownerHtml,
    row.email,
  );

  // 2) Customer acknowledgement — plain confirmation, no marketing
  const ackHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#0f172a;font-size:18px">We've received your enquiry</h2>
      <p style="color:#0f172a;font-size:13px">Hello ${esc(row.name)},</p>
      <p style="color:#0f172a;font-size:13px">Thank you for contacting ${esc(business)}. This is an automated confirmation — your message has been recorded and the right person will be in touch with you personally.</p>
      <table style="border-collapse:collapse;width:100%">
        ${rowHtml('Reference', `HT-${esc(String(row.id)).replace(/[^0-9]/g, '') || row.id}`)}
        ${rowHtml('Received', when)}
        ${rowHtml('Enquiry type', category)}
        ${rowHtml('Your message', esc(clip(row.message, 500)))}
      </table>
      <p style="color:#64748b;font-size:11px">This email confirms receipt only — it does not mean your request has been fulfilled yet. Please do not reply to this address.</p>
    </div>`;
  const customer = await sendEmail(
    apiKey, from, row.email,
    `We've received your enquiry (${clip(category, 60)})`,
    ackHtml,
  );

  return { owner, customer };
}

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get('FUNCTION_SECRET');
  const auth = req.headers.get('authorization') ?? '';
  if (req.method === 'OPTIONS') return new Response('ok');
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  let payload: { record?: EnquiryRow };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad_json' }), { status: 400 });
  }
  const row = payload.record;
  if (!row || !row.email || !row.name || !row.message) {
    return new Response(JSON.stringify({ error: 'incomplete_record' }), { status: 400 });
  }
  if (!EMAIL_RE.test(row.email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }

  const results = await notifyEnquiry(row);
  const ownerOk = results.owner?.ok === true;
  const customerOk = results.customer?.ok === true;

  // Mark delivery status on the row (service role is injected by function env)
  const sbUrl = Deno.env.get('SUPABASE_URL');
  const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (sbUrl && sbKey) {
    const status = ownerOk ? 'sent' : 'failed';
    const err = !ownerOk ? (results.owner?.error ?? 'unknown') : !customerOk ? `ack_failed: ${results.customer?.error}` : null;
    await fetch(`${sbUrl}/rest/v1/contact_messages?id=eq.${encodeURIComponent(String(row.id))}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${sbKey}`,
        apikey: sbKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        notification_status: status,
        notified_at: new Date().toISOString(),
        ...(err ? { notification_error: clip(err, 300) } : {}),
      }),
    });
  }

  return new Response(JSON.stringify({ owner: ownerOk, customer: customerOk }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
