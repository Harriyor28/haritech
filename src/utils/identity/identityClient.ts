/* NIN / BVN identity checks — browser client for the identity-verify Edge
   Function.

   The full number is sent once, in the request body, over HTTPS. It is never
   written to localStorage/sessionStorage and never returned by the function;
   only the masked form comes back. */

import { getSupabaseConfig } from '../supabaseClient';
import {
  isIdentityKind,
  isValidIdentityNumber,
  maskIdentityNumber,
  normaliseIdentityNumber,
  type IdentityKind,
} from './identityCore';

export type IdentityCheckStatus =
  | 'verified'
  | 'not_found'
  | 'not_configured'
  | 'rate_limited'
  | 'error';

export interface IdentityCheckResult {
  status: IdentityCheckStatus;
  kind: IdentityKind;
  masked: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  reference: string;
  checkedAt: string | null;
  message: string;
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

const emptyResult = (
  kind: IdentityKind,
  status: IdentityCheckStatus,
  message: string,
  number = '',
): IdentityCheckResult => ({
  status,
  kind,
  masked: maskIdentityNumber(number),
  fullName: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  reference: '',
  checkedAt: null,
  message,
});

const KNOWN_STATUSES: IdentityCheckStatus[] = [
  'verified',
  'not_found',
  'not_configured',
  'rate_limited',
  'error',
];

const isKnownStatus = (value: string): value is IdentityCheckStatus =>
  (KNOWN_STATUSES as string[]).includes(value);

export const checkIdentity = async (
  kind: IdentityKind,
  number: string,
  consent: boolean,
): Promise<IdentityCheckResult> => {
  const digits = normaliseIdentityNumber(number);

  if (!isIdentityKind(kind)) {
    return emptyResult('nin', 'error', 'Choose NIN or BVN.', digits);
  }
  if (!consent) {
    return emptyResult(kind, 'error', 'Consent is required before a check can run.', digits);
  }
  if (!isValidIdentityNumber(kind, digits)) {
    return emptyResult(kind, 'error', `Enter the 11-digit ${kind.toUpperCase()}.`, digits);
  }

  const config = getSupabaseConfig();
  if (!config) {
    return emptyResult(
      kind,
      'not_configured',
      'Identity checks need a connection to Haritech’s secure server. Check your connection and try again.',
      digits,
    );
  }

  let response: Response;
  try {
    response = await fetch(`${config.url}/functions/v1/identity-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.anonKey}`,
        apikey: config.anonKey,
      },
      body: JSON.stringify({ kind, number: digits, consent: true }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return emptyResult(
      kind,
      'error',
      'Could not reach the identity service. Check your connection and try again.',
      digits,
    );
  }

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const status = text(payload?.status);

  if (isKnownStatus(status)) {
    return {
      status,
      kind: isIdentityKind(payload?.kind) ? payload.kind : kind,
      masked: text(payload?.masked) || maskIdentityNumber(digits),
      fullName: text(payload?.fullName),
      firstName: text(payload?.firstName),
      middleName: text(payload?.middleName),
      lastName: text(payload?.lastName),
      dateOfBirth: text(payload?.dateOfBirth),
      gender: text(payload?.gender),
      reference: text(payload?.reference),
      checkedAt: text(payload?.checkedAt) || null,
      message: text(payload?.message),
    };
  }

  if (response.status === 429) {
    return emptyResult(
      kind,
      'rate_limited',
      text(payload?.message) || 'Too many checks from this connection. Please wait a few minutes.',
      digits,
    );
  }
  // 404 from the functions gateway means identity-verify is not deployed yet;
  // 503 means it is deployed but the provider secrets are missing.
  if (response.status === 503 || response.status === 404) {
    return emptyResult(
      kind,
      'not_configured',
      'Identity checks are being activated. Contact the desk for help.',
      digits,
    );
  }

  return emptyResult(
    kind,
    'error',
    text(payload?.message) || 'The identity service could not complete that check. Please try again.',
    digits,
  );
};
