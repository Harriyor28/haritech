/* NIN / BVN identity checks — pure helpers shared by the browser and the
   identity-verify Edge Function.

   Deliberately free of browser and Deno APIs so the same code can be:
     - imported by the React panel,
     - bundled into scripts/identity-tests.mjs,
     - bundled into the Edge Function at deploy time.

   Privacy rules enforced here:
     - A NIN or BVN is exactly 11 digits.
     - Only the last four digits are ever displayed back (maskIdentityNumber).
     - extractIdentityRecord never copies the number into a result field.
     - redactIdentityNumber scrubs a number from provider error text. */

export type IdentityKind = 'nin' | 'bvn';

export interface IdentityKindOption {
  id: IdentityKind;
  label: string;
  shortLabel: string;
  description: string;
  digits: number;
  help: string;
}

export const IDENTITY_KINDS: IdentityKindOption[] = [
  {
    id: 'nin',
    label: 'National Identification Number (NIN)',
    shortLabel: 'NIN',
    description: 'The 11-digit number issued by NIMC and printed on your NIN slip.',
    digits: 11,
    help: 'Find it on your NIN slip, your NIMC record or the NIMC mobile app. The name must match the NIMC record.',
  },
  {
    id: 'bvn',
    label: 'Bank Verification Number (BVN)',
    shortLabel: 'BVN',
    description: 'The 11-digit number linked to your bank accounts in Nigeria.',
    digits: 11,
    help: 'Dial *565*0# from the phone number registered with your bank to retrieve it. The name must match the bank record.',
  },
];

export const getIdentityKind = (id: IdentityKind): IdentityKindOption =>
  IDENTITY_KINDS.find((item) => item.id === id) ?? IDENTITY_KINDS[0];

export const isIdentityKind = (value: unknown): value is IdentityKind =>
  value === 'nin' || value === 'bvn';

/** Digits only, so spaces and dashes do not break a valid number. */
export const normaliseIdentityNumber = (value: string): string =>
  value.replace(/\D/g, '');

export const isValidIdentityNumber = (kind: IdentityKind, value: string): boolean =>
  normaliseIdentityNumber(value).length === getIdentityKind(kind).digits;

/** 12345678901 -> •••••••8901. Short values are fully masked. */
export const maskIdentityNumber = (value: string): string => {
  const digits = normaliseIdentityNumber(value);
  if (digits.length <= 4) return '••••';
  return `${'•'.repeat(digits.length - 4)}${digits.slice(-4)}`;
};

/** Removes a full number from provider error text before it is logged or returned. */
export const redactIdentityNumber = (text: string, number: string): string => {
  const digits = normaliseIdentityNumber(number);
  if (!digits) return text;
  return text.split(digits).join('[redacted]');
};

export interface IdentityRecord {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  reference: string;
}

const asText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

const firstText = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const text = asText(source[key]);
    if (text) return text;
  }
  return '';
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const WRAPPER_KEYS = ['detail', 'data', 'entity', 'record', 'result', 'identity', 'kyc'];

/* Providers wrap the person in different envelopes:
     Prembly  { status: true, detail: { firstname, lastname, ... } }
     Dojah    { entity: { first_name, last_name, ... } }
     generic  { data: { record: { ... } } }
   Walk one wrapper deep, then one more if the wrapper itself is a wrapper. */
const findRecord = (payload: unknown): Record<string, unknown> | null => {
  const root = asRecord(payload);
  if (!root) return null;

  const direct = WRAPPER_KEYS
    .map((key) => asRecord(root[key]))
    .find((value): value is Record<string, unknown> => value !== null);

  if (!direct) return root;

  const nested = WRAPPER_KEYS
    .map((key) => asRecord(direct[key]))
    .find((value): value is Record<string, unknown> => value !== null);

  return nested ?? direct;
};

/* Note: reference keys deliberately exclude nin/bvn so a provider that echoes
   the number can never leak it into the result. */
export const extractIdentityRecord = (payload: unknown): IdentityRecord | null => {
  const record = findRecord(payload);
  if (!record) return null;

  const firstName = firstText(record, [
    'firstName', 'firstname', 'first_name', 'givenName', 'given_name', 'fname', 'first',
  ]);
  const middleName = firstText(record, [
    'middleName', 'middlename', 'middle_name', 'mname', 'middle',
  ]);
  const lastName = firstText(record, [
    'lastName', 'lastname', 'last_name', 'surname', 'familyName', 'family_name', 'lname', 'last',
  ]);
  const fullName =
    firstText(record, ['fullName', 'fullname', 'full_name', 'name', 'displayName', 'display_name']) ||
    [firstName, middleName, lastName].filter(Boolean).join(' ');

  if (!fullName) return null;

  return {
    firstName,
    middleName,
    lastName,
    fullName,
    dateOfBirth: firstText(record, [
      'dateOfBirth', 'date_of_birth', 'dob', 'birthDate', 'birthdate', 'birth_date',
    ]),
    gender: firstText(record, ['gender', 'sex']),
    reference: firstText(record, [
      'reference', 'referenceId', 'reference_id', 'transactionId', 'transaction_id',
      'requestId', 'request_id', 'id',
    ]),
  };
};

/** False when a provider explicitly reports failure; true when it is silent. */
export const isProviderSuccess = (payload: unknown): boolean => {
  const root = asRecord(payload);
  if (!root) return false;
  if (root.status === false || root.success === false) return false;
  if (typeof root.status === 'string' && /^(false|failed|failure|error|not.?found)$/i.test(root.status)) {
    return false;
  }
  return true;
};
