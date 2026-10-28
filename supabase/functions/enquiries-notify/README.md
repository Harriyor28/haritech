# Enquiries → Email notifications (Resend)

Server-side Edge Function. Sends two emails for every saved enquiry:

1. **Owner notification** — full enquiry details, customer email set as reply-to.
2. **Customer acknowledgement** — automated receipt with a reference number.
   It explicitly states the enquiry is confirmed, not fulfilled.

Delivery status is written back onto the enquiry row
(`notification_status`: `sent` / `failed`, plus the error text), so failed
emails never silently lose an enquiry and duplicates are avoided (the DB
webhook fires once per insert; retries are manual and idempotent via
`notified_at`).

## One-time setup

```bash
npm install -g supabase          # or use npx
cd supabase

# Login + link your project (from https://supabase.com/dashboard)
npx supabase login
npx supabase link --project-ref <your-project-ref>

# Deploy the function
npx supabase functions deploy enquiries-notify

# Set secrets (server-side only — NEVER in the browser bundle or git)
npx supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxxxxxx \
  OWNER_EMAIL=owner@yourbusiness.com \
  EMAIL_FROM="Haritech Website <enquiries@yourdomain.com>" \
  BUSINESS_NAME="Haritech Exclusive Business" \
  FUNCTION_SECRET=$(openssl rand -hex 24)
```

Digits the function needs from Supabase itself (`SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`) are injected automatically.

## Wire the trigger (Database → Webhooks)

- Table: `public.contact_messages`
- Event: **Insert**
- Method: POST → your function URL
  `https://<ref>.supabase.co/functions/v1/enquiries-notify`
- Header: `Authorization: Bearer <FUNCTION_SECRET>` (same value as above)

## Resend domain verification (production)

- Free tier of Resend includes 3,000 emails/month (100/day limit applies).
- Until you verify a custom domain, emails go out from
  `onboarding@resend.dev` and can only be sent to **your own account
  email** — set `EMAIL_FROM` accordingly for testing.
- To send to any customer address: Resend dashboard → Domains → add your
  domain → add the listed DNS records → set `EMAIL_FROM` to that domain.

Re-run `git diff` on row `notification_status` in the admin Messages tab to
see live delivery health.
