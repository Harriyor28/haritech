/* NIN / BVN Application Desk — pure validation and draft helpers.

   No Supabase or network import lives here, so the test harness can bundle
   this module directly. The browser-only localStorage functions are guarded
   and never run during tests.

   IMPORTANT: nothing in this module, the payload or the wizard collects a
   full NIN or BVN. The desk stores only how the applicant relates to their
   number (none / verified here / has it unverified) and, optionally, the
   masked check reference from the checks panel. */

import {
  getIdentityService,
  IDENTITY_DOCUMENT_CHECKLIST,
  emptyIdentityDraft,
  isExistingNumberStatus,
  isIdentityServiceId,
  type IdentityApplicationDraft,
  type IdentityServiceId,
} from './identityDeskTypes';

export const IDENTITY_DRAFT_KEY = 'haritech-identity-application-draft';
export const IDENTITY_MAX_NOTES = 500;
export const IDENTITY_MAX_REQUEST_DETAILS = 800;

const EMAIL_PATTERN = /^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$/;
const NAME_FORBIDDEN = /\d/;

export const isValidIdentityEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value.trim());

/** Digits only, so +234 803… and 0803… compare sensibly. */
export const normaliseIdentityPhone = (value: string): string =>
  value.replace(/\D/g, '');

const REFERENCE_BODY = /^[A-Z0-9]{4,10}$/;

/** Accepts "NID-1A2B3C4D", "nid1a2b3c4d" or just "1a2b3c4d". */
export const normaliseIdentityReference = (value: string): string => {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (/^NID-[A-Z0-9]{4,10}$/.test(cleaned)) return cleaned;
  if (/^NID[A-Z0-9]{4,10}$/.test(cleaned)) return `NID-${cleaned.slice(3)}`;
  if (REFERENCE_BODY.test(cleaned)) return `NID-${cleaned}`;
  return cleaned;
};

/** A check reference the applicant may paste from the checks panel, if any. */
export const cleanCheckReference = (value: string): string => {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, '');
  return REFERENCE_BODY.test(cleaned) ? cleaned : '';
};

const clean = (value: string): string => value.trim();

export interface IdentityApplicationPayload {
  service: IdentityServiceId;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  holder_dob: string;
  holder_gender: string;
  state_of_residence: string;
  holder_address: string;
  request_details: string;
  /** How the applicant relates to their number — never the number itself. */
  existing_number: 'none' | 'verified_here' | 'have_unverified';
  /** Optional masked reference from a check run on this site, if any. */
  check_reference: string;
  documents_have: string[];
  notes: string;
}

export const draftToPayload = (draft: IdentityApplicationDraft): IdentityApplicationPayload => ({
  service: draft.service,
  holder_name: clean(draft.holderName),
  holder_email: clean(draft.holderEmail).toLowerCase(),
  holder_phone: normaliseIdentityPhone(draft.holderPhone),
  holder_dob: clean(draft.holderDob),
  holder_gender: clean(draft.holderGender),
  state_of_residence: clean(draft.stateOfResidence),
  holder_address: clean(draft.holderAddress),
  request_details: clean(draft.requestDetails).slice(0, IDENTITY_MAX_REQUEST_DETAILS),
  existing_number: draft.existingNumber,
  check_reference: cleanCheckReference(draft.checkReference),
  documents_have: draft.documentsHave.filter((item) =>
    IDENTITY_DOCUMENT_CHECKLIST.includes(item),
  ),
  notes: clean(draft.notes).slice(0, IDENTITY_MAX_NOTES),
});

export type IdentityDraftErrors = Record<string, string>;

export const validateIdentityDraft = (draft: IdentityApplicationDraft): IdentityDraftErrors => {
  const errors: IdentityDraftErrors = {};

  if (!isIdentityServiceId(draft.service)) {
    errors.service = 'Choose a service.';
  }

  const name = clean(draft.holderName);
  if (name.length < 2 || name.length > 120 || NAME_FORBIDDEN.test(name)) {
    errors.holderName = 'Enter the applicant’s full name.';
  }

  if (!isValidIdentityEmail(draft.holderEmail)) {
    errors.holderEmail = 'Enter a valid email address.';
  }

  const digits = normaliseIdentityPhone(draft.holderPhone);
  if (digits.length < 7 || digits.length > 15) {
    errors.holderPhone = 'Enter a valid phone number.';
  }

  const dob = clean(draft.holderDob);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    errors.holderDob = 'Enter the date of birth.';
  } else {
    const parsed = new Date(`${dob}T00:00:00Z`);
    const now = new Date();
    if (Number.isNaN(parsed.getTime()) || parsed > now) {
      errors.holderDob = 'Enter a real date of birth.';
    }
  }

  if (isIdentityServiceId(draft.service)) {
    const service = getIdentityService(draft.service);
    if (service.existingNumberRequired && draft.existingNumber === 'none') {
      errors.existingNumber =
        'This service is for people who already hold the number. Registration is the service for that.';
    }
    if (service.requestDetailsRequired && clean(draft.requestDetails).length < 10) {
      errors.requestDetails =
        'Tell the desk exactly what needs to change or be retrieved.';
    }
    if (service.addressRequired && clean(draft.holderAddress).length < 5) {
      errors.holderAddress = 'Enter the current residential address.';
    }
  }

  const state = clean(draft.stateOfResidence);
  if (state.length < 2 || state.length > 60) {
    errors.stateOfResidence = 'Enter the state of residence.';
  }

  if (draft.checkReference && !cleanCheckReference(draft.checkReference)) {
    errors.checkReference =
      'Paste the reference exactly as shown by the checks panel (e.g. XXXXXXXX), or leave it empty.';
  }

  const notes = clean(draft.notes);
  if (notes.length > IDENTITY_MAX_NOTES) {
    errors.notes = `Keep the note under ${IDENTITY_MAX_NOTES} characters.`;
  }

  if (!draft.consent) {
    errors.consent = 'Confirm that the details are correct and may be used for this request.';
  }

  return errors;
};

export const hasIdentityErrors = (errors: IdentityDraftErrors): boolean =>
  Object.keys(errors).length > 0;

export const loadIdentityDraft = (): IdentityApplicationDraft => {
  const base = emptyIdentityDraft();
  try {
    const raw = window.localStorage.getItem(IDENTITY_DRAFT_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<IdentityApplicationDraft>;
    return {
      ...base,
      ...parsed,
      service: isIdentityServiceId(parsed.service) ? parsed.service : base.service,
      existingNumber: isExistingNumberStatus(parsed.existingNumber)
        ? parsed.existingNumber
        : base.existingNumber,
      documentsHave: Array.isArray(parsed.documentsHave)
        ? parsed.documentsHave.filter(
            (item): item is string =>
              typeof item === 'string' && IDENTITY_DOCUMENT_CHECKLIST.includes(item),
          )
        : [],
      consent: Boolean(parsed.consent),
    };
  } catch {
    return base;
  }
};

export const saveIdentityDraft = (draft: IdentityApplicationDraft): void => {
  try {
    window.localStorage.setItem(IDENTITY_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — the form still works in memory */
  }
};

export const clearIdentityDraft = (): void => {
  try {
    window.localStorage.removeItem(IDENTITY_DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
};
