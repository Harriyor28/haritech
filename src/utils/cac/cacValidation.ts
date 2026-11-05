/* CAC Application Desk — pure validation and draft helpers.

   No Supabase or network import lives here, so the test harness can bundle
   this module directly. The browser-only draft functions are guarded and
   never run during tests. */

import {
  CAC_DOCUMENT_CHECKLIST,
  emptyCacDraft,
  isCacEntityType,
  type CacApplicationDraft,
  type CacApplicationPayload,
  type CacMember,
} from './cacTypes';

export const CAC_DRAFT_KEY = 'haritech-cac-application-draft';
export const CAC_MAX_PROPOSED_NAMES = 5;

const EMAIL_PATTERN = /^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$/;

export const isValidCacEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value.trim());

/** Digits only, so +234 803… and 0803… compare sensibly. */
export const normaliseCacPhone = (value: string): string =>
  value.replace(/\D/g, '');

/** Accepts "CAC-1A2B3C4D", "cac1a2b3c4d" or just "1a2b3c4d". */
export const normaliseCacReference = (value: string): string => {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (/^CAC-[A-Z0-9]{8}$/.test(cleaned)) return cleaned;
  if (/^CAC[A-Z0-9]{8}$/.test(cleaned)) return `CAC-${cleaned.slice(3)}`;
  if (/^[A-Z0-9]{8}$/.test(cleaned)) return `CAC-${cleaned}`;
  return cleaned;
};

/** Only http(s) and site-relative links may become download buttons. */
export const safeCacDocumentUrl = (value: string): string | null => {
  const url = value.trim();
  if (!url) return null;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

const clean = (value: string): string => value.trim();
const cleanNames = (names: string[]): string[] =>
  names.map(clean).filter((name) => name.length > 0);
const cleanMembers = (members: CacMember[]): CacMember[] =>
  members
    .map((member) => ({ name: clean(member.name), role: clean(member.role) }))
    .filter((member) => member.name.length > 0);

export const draftToPayload = (draft: CacApplicationDraft): CacApplicationPayload => ({
  entity_type: draft.entityType,
  proposed_names: cleanNames(draft.proposedNames),
  nature_of_business: clean(draft.natureOfBusiness),
  applicant_name: clean(draft.applicantName),
  applicant_email: clean(draft.applicantEmail).toLowerCase(),
  applicant_phone: clean(draft.applicantPhone),
  applicant_address: clean(draft.applicantAddress),
  business_address: clean(draft.businessAddress),
  members: cleanMembers(draft.members),
  documents_have: draft.documentsHave.filter((item) =>
    CAC_DOCUMENT_CHECKLIST.includes(item),
  ),
  notes: clean(draft.notes),
});

export type CacDraftErrors = Record<string, string>;

export const validateCacDraft = (draft: CacApplicationDraft): CacDraftErrors => {
  const errors: CacDraftErrors = {};

  if (!isCacEntityType(draft.entityType)) {
    errors.entityType = 'Choose a registration type.';
  }

  const names = cleanNames(draft.proposedNames);
  if (names.length === 0) {
    errors.proposedNames = 'Add at least one proposed name.';
  } else if (names.some((name) => name.length < 2 || name.length > 120)) {
    errors.proposedNames = 'Each proposed name must be 2–120 characters.';
  } else if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
    errors.proposedNames = 'The proposed names must be different from each other.';
  } else if (names.length > CAC_MAX_PROPOSED_NAMES) {
    errors.proposedNames = `Add no more than ${CAC_MAX_PROPOSED_NAMES} proposed names.`;
  }

  const nature = clean(draft.natureOfBusiness);
  if (nature.length < 2) {
    errors.natureOfBusiness = 'Describe what the business will do.';
  } else if (nature.length > 500) {
    errors.natureOfBusiness = 'Keep the description under 500 characters.';
  }

  const name = clean(draft.applicantName);
  if (name.length < 2 || name.length > 120) {
    errors.applicantName = 'Enter the applicant’s full name.';
  }

  if (!isValidCacEmail(draft.applicantEmail)) {
    errors.applicantEmail = 'Enter a valid email address.';
  }

  const digits = normaliseCacPhone(draft.applicantPhone);
  if (digits.length < 7 || digits.length > 15) {
    errors.applicantPhone = 'Enter a valid phone number.';
  }

  const address = clean(draft.applicantAddress);
  if (address.length < 5 || address.length > 500) {
    errors.applicantAddress = 'Enter the applicant’s residential address.';
  }

  const businessAddress = clean(draft.businessAddress);
  if (businessAddress.length < 5 || businessAddress.length > 500) {
    errors.businessAddress = 'Enter the business address.';
  }

  if (draft.entityType !== 'business_name' && cleanMembers(draft.members).length === 0) {
    errors.members = 'Add at least one director, shareholder or trustee.';
  }
  if (cleanMembers(draft.members).some((member) => member.name.length > 120)) {
    errors.members = 'Each member name must be 120 characters or fewer.';
  }

  if (clean(draft.notes).length > 2000) {
    errors.notes = 'Keep additional notes under 2,000 characters.';
  }

  if (!draft.consent) {
    errors.consent = 'Confirm that the details are correct and may be used for this filing.';
  }

  return errors;
};

export const hasCacErrors = (errors: CacDraftErrors): boolean =>
  Object.keys(errors).length > 0;

export const loadCacDraft = (): CacApplicationDraft => {
  const base = emptyCacDraft();
  try {
    const raw = window.localStorage.getItem(CAC_DRAFT_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<CacApplicationDraft>;
    const names = Array.isArray(parsed.proposedNames)
      ? parsed.proposedNames.map((value) => String(value ?? '')).slice(0, CAC_MAX_PROPOSED_NAMES)
      : [];
    while (names.length < 3) names.push('');
    const members = Array.isArray(parsed.members)
      ? parsed.members
          .map((member) => ({
            name: String(member?.name ?? ''),
            role: String(member?.role ?? ''),
          }))
          .slice(0, 20)
      : [];
    return {
      ...base,
      ...parsed,
      entityType: isCacEntityType(parsed.entityType) ? parsed.entityType : base.entityType,
      proposedNames: names,
      members: members.length > 0 ? members : base.members,
      documentsHave: Array.isArray(parsed.documentsHave)
        ? parsed.documentsHave.filter(
            (item): item is string =>
              typeof item === 'string' && CAC_DOCUMENT_CHECKLIST.includes(item),
          )
        : [],
      consent: Boolean(parsed.consent),
    };
  } catch {
    return base;
  }
};

export const saveCacDraft = (draft: CacApplicationDraft): void => {
  try {
    window.localStorage.setItem(CAC_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — the form still works in memory */
  }
};

export const clearCacDraft = (): void => {
  try {
    window.localStorage.removeItem(CAC_DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
};
