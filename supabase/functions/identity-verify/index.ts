// NIN / BVN identity verification — Haritech licensed-provider bridge.
//
// The browser sends only { kind, number, consent }. This function:
//   1. validates the 11-digit number and the consent flag;
//   2. rate-limits per connection (in-memory, best effort);
//   3. calls the licensed provider configured in Edge Function secrets;
//   4. returns the verified name plus a MASKED number — never the full number.
//
// It never writes the number to a table, log or error message. When the
// provider secrets are absent it returns `not_configured` instead of faking a
// result, so the website can say so honestly.
//
// Provider secrets (Supabase Dashboard -> Edge Functions -> Secrets):
//   IDENTITY_PROVIDER          prembly | dojah | generic   (default: generic)
//   IDENTITY_API_KEY           provider secret key
//   IDENTITY_API_APP_ID        app id, where the provider needs one
//   IDENTITY_API_BASE_URL      override base URL (required for generic)
//   IDENTITY_NIN_PATH          override NIN path
//   IDENTITY_BVN_PATH          override BVN path
//   IDENTITY_NUMBER_FIELD      body/query field name (default: number)
//   IDENTITY_HTTP_METHOD       GET | POST (generic only; default POST)
//   IDENTITY_API_AUTH_HEADER   header name (generic only; default Authorization)
//   IDENTITY_API_AUTH_SCHEME   prefix, e.g. Bearer (generic only)
//   IDENTITY_RATE_SALT         salt for hashing the caller IP
//
// Prembly defaults: POST /verification/vnin and /verification/bvn,
//   headers x-api-key + app-id.
// Dojah defaults: GET /api/v1/kyc/nin?nin= and /api/v1/kyc/bvn/basic?bvn=,
//   headers Authorization + AppId.

import {
  classifyUpstreamStatus,
  extractIdentityRecord,
  isIdentityKind,
  isProviderSuccess,
  isValidIdentityNumber,
  maskIdentityNumber,
  normaliseIdentityNumber,
  redactIdentityNumber,
  type IdentityKind,
} from '../../../src/utils/identity/identityCore.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_BODY_BYTES = 4096;
const UPSTREAM_TIMEOUT_MS = 15_000;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_CHECKS = 5;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

export type EnvReader = (key: string) => string | undefined;

export interface ProviderRequest {
  provider: string;
  url: string;
  init: RequestInit;
}

/* Build the provider call. Exported so the dependency-free test harness can
   assert the request shape without any network access. */
export const resolveProviderRequest = (
  kind: IdentityKind,
  number: string,
  env: EnvReader,
): ProviderRequest | null => {
  const provider = (env('IDENTITY_PROVIDER') ?? 'generic').toLowerCase();
  const apiKey = env('IDENTITY_API_KEY') ?? '';
  const appId = env('IDENTITY_API_APP_ID') ?? '';

  const defaultBase =
    provider === 'prembly'
      ? 'https://api.prembly.com'
      : provider === 'dojah'
        ? 'https://api.dojah.io'
        : '';
  const base = (env('IDENTITY_API_BASE_URL') ?? defaultBase).replace(/\/$/, '');
  if (!apiKey || !base) return null;

  const defaultPath =
    kind === 'nin'
      ? provider === 'prembly'
        ? '/verification/vnin'
        : provider === 'dojah'
          ? '/api/v1/kyc/nin'
          : ''
      : provider === 'prembly'
        ? '/verification/bvn'
        : provider === 'dojah'
          ? '/api/v1/kyc/bvn/basic'
          : '';
  const path = env(kind === 'nin' ? 'IDENTITY_NIN_PATH' : 'IDENTITY_BVN_PATH') ?? defaultPath;
  if (!path) return null;

  const numberField = env('IDENTITY_NUMBER_FIELD') ?? 'number';

  if (provider === 'dojah') {
    const url = `${base}${path}${path.includes('?') ? '&' : '?'}${encodeURIComponent(numberField)}=${encodeURIComponent(number)}`;
    return {
      provider,
      url,
      init: {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: apiKey,
          ...(appId ? { AppId: appId } : {}),
        },
      },
    };
  }

  if (provider === 'prembly') {
    return {
      provider,
      url: `${base}${path}`,
      init: {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          ...(appId ? { 'app-id': appId } : {}),
        },
        body: JSON.stringify({ [numberField]: number }),
      },
    };
  }

  const method = (env('IDENTITY_HTTP_METHOD') ?? 'POST').toUpperCase();
  const authHeader = env('IDENTITY_API_AUTH_HEADER') ?? 'Authorization';
  const scheme = env('IDENTITY_API_AUTH_SCHEME') ?? 'Bearer';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    [authHeader]: scheme ? `${scheme} ${apiKey}` : apiKey,
    ...(appId ? { 'x-app-id': appId } : {}),
  };

  if (method === 'GET') {
    const url = `${base}${path}${path.includes('?') ? '&' : '?'}${encodeURIComponent(numberField)}=${encodeURIComponent(number)}`;
    return { provider, url, init: { method: 'GET', headers } };
  }

  headers['Content-Type'] = 'application/json';
  return {
    provider,
    url: `${base}${path}`,
    init: { method: 'POST', headers, body: JSON.stringify({ [numberField]: number }) },
  };
};

const buckets = new Map<string, number[]>();

const callerKey = async (req: Request, env: EnvReader): Promise<string> => {
  const forwarded = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const ip = forwarded || req.headers.get('x-real-ip') || 'unknown';
  const salt = env('IDENTITY_RATE_SALT') ?? 'haritech-identity';
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((stamp) => now - stamp < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX_CHECKS) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);

  // Keep the map from growing without bound on a long-lived instance.
  if (buckets.size > 5000) {
    for (const [storedKey, stamps] of buckets) {
      if (!stamps.some((stamp) => now - stamp < RATE_WINDOW_MS)) buckets.delete(storedKey);
    }
  }
  return false;
};

const handle = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ status: 'error', message: 'POST a JSON body: { kind, number, consent }.' }, 405);
  }

  const declaredLength = Number(req.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ status: 'error', message: 'Request too large.' }, 413);
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ status: 'error', message: 'Invalid JSON body.' }, 400);
  }

  const rawKind = body?.kind;
  const number = normaliseIdentityNumber(String(body?.number ?? ''));
  const consent = body?.consent === true;

  if (!isIdentityKind(rawKind)) {
    return json(
      { status: 'error', kind: 'nin', masked: '', message: 'Choose NIN or BVN.' },
      400,
    );
  }

  const kind: IdentityKind = rawKind;
  const masked = maskIdentityNumber(number);

  if (!consent) {
    return json(
      {
        status: 'error',
        kind,
        masked,
        message: 'Confirm that you are the holder, or have permission, before a check can run.',
      },
      400,
    );
  }

  if (!isValidIdentityNumber(kind, number)) {
    return json(
      { status: 'error', kind, masked, message: `Enter the 11-digit ${kind.toUpperCase()}.` },
      400,
    );
  }

  const env: EnvReader = (key) => Deno.env.get(key);

  const key = await callerKey(req, env);
  if (isRateLimited(key)) {
    return json(
      {
        status: 'rate_limited',
        kind,
        masked,
        message: 'Too many identity checks from this connection. Please wait a few minutes.',
      },
      429,
    );
  }

  const request = resolveProviderRequest(kind, number, env);
  if (!request) {
    return json(
      {
        status: 'not_configured',
        kind,
        masked,
        message:
          'Identity checks are not enabled yet. The desk can still help — send a message on WhatsApp.',
      },
      503,
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(request.url, {
      ...request.init,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    // Never log the number: only the provider name and a redacted message.
    const message = redactIdentityNumber(
      error instanceof Error ? error.message : String(error),
      number,
    );
    console.error('[identity-verify] request failed', request.provider, message);
    return json(
      {
        status: 'error',
        kind,
        masked,
        message: 'The identity service did not respond. Please try again in a moment.',
      },
      502,
    );
  }

  if (!upstream.ok) {
    const failurePayload = await upstream.json().catch(() => null);
    const outcome = classifyUpstreamStatus(upstream.status, failurePayload);

    if (outcome === 'rate_limited') {
      return json(
        {
          status: 'rate_limited',
          kind,
          masked,
          message: 'The identity provider is busy. Please wait a moment and try again.',
        },
        429,
      );
    }

    // 401/403 means the provider rejected Haritech's credentials — a setup
    // problem, not something the customer can fix by retrying.
    if (outcome === 'not_configured') {
      console.error('[identity-verify] provider rejected credentials', request.provider, upstream.status);
      return json(
        {
          status: 'not_configured',
          kind,
          masked,
          message:
            'Identity checks are being activated. The desk can still help — send a message on WhatsApp.',
        },
        503,
      );
    }

    if (outcome === 'not_found') {
      return json({
        status: 'not_found',
        kind,
        masked,
        message: 'No record matched that number. Check the digits and the name on the record.',
      });
    }

    console.error('[identity-verify] upstream status', request.provider, upstream.status);
    return json(
      {
        status: 'error',
        kind,
        masked,
        message: 'The identity service could not complete that check. Please try again.',
      },
      502,
    );
  }

  const payload = await upstream.json().catch(() => null);
  if (!isProviderSuccess(payload)) {
    return json({
      status: 'not_found',
      kind,
      masked,
      message: 'No record matched that number. Check the digits and the name on the record.',
    });
  }

  const record = extractIdentityRecord(payload);
  if (!record) {
    return json({
      status: 'not_found',
      kind,
      masked,
      message: 'No record matched that number. Check the digits and the name on the record.',
    });
  }

  return json({
    status: 'verified',
    kind,
    masked,
    fullName: record.fullName,
    firstName: record.firstName,
    middleName: record.middleName,
    lastName: record.lastName,
    dateOfBirth: record.dateOfBirth,
    gender: record.gender,
    reference: record.reference,
    checkedAt: new Date().toISOString(),
    message: 'Verified.',
  });
};

// Guarded so the pure helpers above can be imported by Node tests.
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handle);
}
