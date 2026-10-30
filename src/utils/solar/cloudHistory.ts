/* Server copy of solar customer history.

   Backed by supabase/migrations/20261028_solar_customer_history.sql.

   Design, given that customers do not sign in:
   - Each browser generates one 256-bit random token, stored in localStorage.
   - The token is sent only as an argument to SECURITY DEFINER functions.
   - The database stores the SHA-256 hash, never the token.
   - The table has RLS enabled with no policies and no anon privileges, so a
     direct select returns nothing; the functions are the only door.
   - Delete is permanent, per record or for the whole device.
   - A recovery code (the token in readable groups) lets the customer open the
     same cloud copy on another device. Without it, the rows are unreachable.

   Every function fails soft: local storage stays the source of truth and a
   cloud outage never blocks the Designer or the Monitor. */

import { getSupabase, isCloudConfigured } from '../supabaseClient';
import {
  MAX_RECORDS_PER_KIND,
  RECORD_RETENTION_MONTHS,
  bytesToHex,
  formatRecoveryCode,
  isOwnerToken,
  normaliseRecoveryCode,
  payloadTooLarge,
} from './ownerToken';

export const SOLAR_CLOUD_HISTORY_ENABLED = true;

const TOKEN_KEY = 'haritech-solar-owner-token';

export type CloudRecordKind = 'assessment' | 'reading';

export interface CloudRecord {
  id: number;
  kind: CloudRecordKind;
  label: string;
  payload: unknown;
  createdAt: string;
  expiresAt: string;
}

export interface CloudFetch {
  /** False means the call failed or the migration has not been applied. */
  ok: boolean;
  records: CloudRecord[];
}

interface RawRecord {
  id: number | string;
  kind: CloudRecordKind;
  label: string;
  payload: unknown;
  created_at: string;
  expires_at: string;
}

export const isCloudHistoryEnabled = (): boolean =>
  SOLAR_CLOUD_HISTORY_ENABLED && isCloudConfigured();

/** Read the device token, without ever creating one as a side effect. */
const readOwnerToken = (): string | null => {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw && isOwnerToken(raw) ? raw : null;
  } catch {
    return null;
  }
};

/** Create the device token on first save. Returns null when storage is blocked. */
const ensureOwnerToken = (): string | null => {
  const existing = readOwnerToken();
  if (existing) return existing;
  try {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const token = bytesToHex(bytes);
    window.localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
};

export const hasOwnerToken = (): boolean => readOwnerToken() !== null;

/** Forget the token on this device. Saved rows become unreachable, not deleted. */
export const forgetOwnerToken = (): void => {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

/** The readable recovery code, or null when no token exists yet. */
export const getRecoveryCode = (): string | null => {
  const token = readOwnerToken();
  return token ? formatRecoveryCode(token) : null;
};

/** Create the device token if needed and return its recovery code. */
export const createRecoveryCode = (): string | null => {
  const token = ensureOwnerToken();
  return token ? formatRecoveryCode(token) : null;
};

/** Adopt a recovery code from another device or a written note. */
export const adoptRecoveryCode = (code: string): boolean => {
  const token = normaliseRecoveryCode(code);
  if (!token) return false;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
};

/** Cheap capability check: the hash helper exists only after the migration
    has been applied. Touches no customer rows and creates no token. */
export const probeCloudHistory = async (): Promise<boolean> => {
  if (!isCloudHistoryEnabled()) return false;
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data, error } = await sb.rpc('solar_owner_hash', {
      p_token: '0'.repeat(64),
    });
    return !error && typeof data === 'string' && data.length === 64;
  } catch {
    return false;
  }
};

const toRecord = (row: RawRecord): CloudRecord => ({
  id: Number(row.id),
  kind: row.kind,
  label: typeof row.label === 'string' ? row.label : '',
  payload: row.payload,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
});

/** Save one record. Returns the new id, or null when the cloud is off or the
    call fails — callers must keep the local copy as the source of truth. */
export const saveCloudRecord = async (
  kind: CloudRecordKind,
  label: string,
  payload: unknown,
): Promise<number | null> => {
  if (!isCloudHistoryEnabled()) return null;
  if (payloadTooLarge(payload)) {
    console.warn('[solar-cloud] record too large to save remotely');
    return null;
  }
  const token = ensureOwnerToken();
  if (!token) return null;
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.rpc('solar_records_save', {
      p_token: token,
      p_kind: kind,
      p_label: label.slice(0, 120),
      p_payload: payload,
    });
    if (error) {
      console.warn('[solar-cloud] save failed:', error.message);
      return null;
    }
    return typeof data === 'number' ? data : null;
  } catch (e) {
    console.warn('[solar-cloud] save error:', e);
    return null;
  }
};

/** List this device's unexpired records, newest first. `ok` is false when the
    call failed, so callers can tell "no records" from "could not ask". */
export const fetchCloudRecords = async (
  kind?: CloudRecordKind,
): Promise<CloudFetch> => {
  if (!isCloudHistoryEnabled()) return { ok: false, records: [] };
  const token = readOwnerToken();
  // No token means this device has never saved anything: nothing to fetch,
  // and that is not an error.
  if (!token) return { ok: true, records: [] };
  const sb = getSupabase();
  if (!sb) return { ok: false, records: [] };
  try {
    const { data, error } = await sb.rpc('solar_records_list', {
      p_token: token,
      p_kind: kind ?? null,
    });
    if (error) {
      console.warn('[solar-cloud] list failed:', error.message);
      return { ok: false, records: [] };
    }
    const rows = Array.isArray(data) ? (data as RawRecord[]) : [];
    return {
      ok: true,
      records: rows
        .filter((row) => row && typeof row.kind === 'string')
        .map(toRecord)
        .slice(0, MAX_RECORDS_PER_KIND),
    };
  } catch (e) {
    console.warn('[solar-cloud] list error:', e);
    return { ok: false, records: [] };
  }
};

/** Permanently delete one record. Returns false if it was not this device's. */
export const deleteCloudRecord = async (id: number): Promise<boolean> => {
  if (!isCloudHistoryEnabled()) return false;
  const token = readOwnerToken();
  if (!token) return false;
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data, error } = await sb.rpc('solar_records_delete', {
      p_token: token,
      p_id: id,
    });
    if (error) {
      console.warn('[solar-cloud] delete failed:', error.message);
      return false;
    }
    return data === true;
  } catch (e) {
    console.warn('[solar-cloud] delete error:', e);
    return false;
  }
};

/** Permanently delete every record for this device, or one kind only.
    Returns -1 when the call failed. */
export const deleteAllCloudRecords = async (
  kind?: CloudRecordKind,
): Promise<number> => {
  if (!isCloudHistoryEnabled()) return -1;
  const token = readOwnerToken();
  if (!token) return 0;
  const sb = getSupabase();
  if (!sb) return -1;
  try {
    const { data, error } = await sb.rpc('solar_records_delete_all', {
      p_token: token,
      p_kind: kind ?? null,
    });
    if (error) {
      console.warn('[solar-cloud] delete-all failed:', error.message);
      return -1;
    }
    return typeof data === 'number' ? data : 0;
  } catch (e) {
    console.warn('[solar-cloud] delete-all error:', e);
    return -1;
  }
};

export const cloudRetentionMonths = RECORD_RETENTION_MONTHS;
