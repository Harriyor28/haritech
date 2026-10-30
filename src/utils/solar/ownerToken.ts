/* Pure helpers for the per-device owner token used by the optional solar
   cloud history. No imports, so the dependency-free test harness can load it.

   The token is generated in the browser, kept in localStorage and never sent
   anywhere except to a SECURITY DEFINER function that hashes it server-side.
   Only the SHA-256 hash is stored in the database. */

export const OWNER_TOKEN_BYTES = 32;
export const OWNER_TOKEN_HEX_LENGTH = OWNER_TOKEN_BYTES * 2;
export const MAX_RECORD_BYTES = 65536;
export const RECORD_RETENTION_MONTHS = 24;
export const MAX_RECORDS_PER_KIND = 200;

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

/** A token is exactly 64 lowercase hex characters (32 random bytes). */
export const isOwnerToken = (value: string): boolean =>
  new RegExp(`^[0-9a-f]{${OWNER_TOKEN_HEX_LENGTH}}$`).test(value);

/** Server-side cap is 64 KB; check before sending so the customer gets a
    clear message instead of a rejected RPC. */
export const payloadTooLarge = (payload: unknown): boolean => {
  try {
    const json = JSON.stringify(payload);
    if (json === undefined) return true;
    return new TextEncoder().encode(json).length > MAX_RECORD_BYTES;
  } catch {
    return true;
  }
};

export const retentionLabel = (months: number = RECORD_RETENTION_MONTHS): string => {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${months} months (${years} ${years === 1 ? 'year' : 'years'})`;
  }
  return `${months} months`;
};

/** Human-readable form of the device token, shown once so the customer can
    keep it. Without this code a cloud copy cannot be opened on another device
    or after site data is cleared. */
export const formatRecoveryCode = (token: string): string => {
  const groups = token.match(/.{1,8}/g);
  return groups ? groups.join('-').toUpperCase() : token;
};

/** Accept a pasted recovery code in any case, with or without spaces/dashes. */
export const normaliseRecoveryCode = (value: string): string | null => {
  const cleaned = value.toLowerCase().replace(/[^0-9a-f]/g, '');
  return isOwnerToken(cleaned) ? cleaned : null;
};
