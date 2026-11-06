/* NIN / BVN Application Desk — services, stages and draft vocabulary.

   Kept free of Supabase/browser imports so it can be bundled into the
   dependency-free test harness (scripts/identity-desk-tests.mjs).

   Honesty rules baked in here:
     * Haritech does not issue NIN (NIMC does) or BVN (banks via NIBSS).
       Everything the desk sells is assistance: booking, preparing and
       following a registration, a record modification or a retrieval.
     * No fee is quoted anywhere in this desk. Fees for NIN and BVN services
       are confirmed by the desk before any booking.
     * The applicant's NIN or BVN itself is never collected on this desk. */

export type IdentityKind = 'nin' | 'bvn';

export type IdentityServiceId =
  | 'nin_registration'
  | 'nin_modification'
  | 'nin_retrieval'
  | 'bvn_correction'
  | 'bvn_retrieval';

export type ExistingNumberStatus = 'none' | 'verified_here' | 'have_unverified';

export interface IdentityServiceOption {
  id: IdentityServiceId;
  kind: IdentityKind;
  label: string;
  shortLabel: string;
  description: string;
  /** True when the person must already hold the NIN or BVN record. */
  existingNumberRequired: boolean;
  /** True when the desk needs to know exactly what to change or retrieve. */
  requestDetailsRequired: boolean;
  /** True when the desk needs the current residential address. */
  addressRequired: boolean;
  /** What the applicant must bring or have ready, printed with the form. */
  requirements: string[];
  /** How Haritech's involvement is framed, shown on the service card. */
  involvement: string;
}

export const IDENTITY_SERVICES: IdentityServiceOption[] = [
  {
    id: 'nin_registration',
    kind: 'nin',
    label: 'First-time NIN registration',
    shortLabel: 'Register',
    description:
      'You do not have a NIN yet. The desk prepares your enrolment, books a NIMC centre appointment and follows the file.',
    existingNumberRequired: false,
    requestDetailsRequired: false,
    addressRequired: true,
    requirements: [
      'Birth certificate or age declaration',
      'Local government of origin certificate (where available)',
      'Any existing form of identification, if you have one',
      'One clear passport photograph',
      'Details of your next of kin',
      'Your full residential address in Nigeria',
    ],
    involvement:
      'Haritech prepares the paperwork and books the appointment. The enrolment itself happens at a NIMC centre; NIMC issues the NIN.',
  },
  {
    id: 'nin_modification',
    kind: 'nin',
    label: 'NIN record modification',
    shortLabel: 'NIN modification',
    description:
      'The name, date of birth or other data on your NIMC record is wrong. The desk prepares the correction request.',
    existingNumberRequired: true,
    requestDetailsRequired: true,
    addressRequired: false,
    requirements: [
      'Your NIN slip, or that number verified at the checks panel on this page',
      'An official document showing the correct data (birth certificate, affidavit or court declaration)',
      'One clear passport photograph',
      'The mobile number registered on the NIMC record',
    ],
    involvement:
      'Haritech prepares and submits the modification request to NIMC. NIMC decides the correction.',
  },
  {
    id: 'nin_retrieval',
    kind: 'nin',
    label: 'NIN slip retrieval or reprint',
    shortLabel: 'NIN retrieval',
    description:
      'You have a NIN but lost the slip. The desk helps you retrieve the number and obtain a reprint.',
    existingNumberRequired: true,
    requestDetailsRequired: true,
    addressRequired: false,
    requirements: [
      'The full name used at enrolment',
      'Your date of birth',
      'The mobile number that was used at enrolment',
      'The state and local government where you enrolled — this makes a search much quicker',
    ],
    involvement:
      'Haritech guides the retrieval and reprint request. The record belongs to NIMC; the desk cannot read NIMC directly.',
  },
  {
    id: 'bvn_correction',
    kind: 'bvn',
    label: 'BVN record correction',
    shortLabel: 'BVN correction',
    description:
      'The name or other data on your BVN record does not match your bank record. The desk prepares the correction.',
    existingNumberRequired: true,
    requestDetailsRequired: true,
    addressRequired: false,
    requirements: [
      'Your BVN, or that number verified at the checks panel on this page',
      'The document your bank accepts for the change (bank statement, marriage certificate or affidavit)',
      'The mobile number registered with your bank',
    ],
    involvement:
      'Haritech prepares the correction request for your bank. Banks and NIBSS decide the correction.',
  },
  {
    id: 'bvn_retrieval',
    kind: 'bvn',
    label: 'BVN retrieval assistance',
    shortLabel: 'BVN retrieval',
    description:
      'You have a BVN but do not remember it. The desk explains the retrieval routes and follows the request.',
    existingNumberRequired: false,
    requestDetailsRequired: false,
    addressRequired: false,
    requirements: [
      'The mobile number registered with your bank',
      'The full name on the bank account',
      'The name of your bank',
      'A recent bank statement, if available',
    ],
    involvement:
      'Haritech guides the retrieval. Dial *565*0# from the registered line for the quickest route.',
  },
];

export const getIdentityService = (id: IdentityServiceId): IdentityServiceOption =>
  IDENTITY_SERVICES.find((item) => item.id === id) ?? IDENTITY_SERVICES[0];

export const isIdentityServiceId = (value: unknown): value is IdentityServiceId =>
  typeof value === 'string' && IDENTITY_SERVICES.some((item) => item.id === value);

export const isExistingNumberStatus = (value: unknown): value is ExistingNumberStatus =>
  value === 'none' || value === 'verified_here' || value === 'have_unverified';

export type IdentityDeskStage =
  | 'submitted'
  | 'review'
  | 'appointment'
  | 'query'
  | 'completed'
  | 'closed';

export interface IdentityStageOption {
  id: IdentityDeskStage;
  label: string;
  description: string;
  attention?: boolean;
}

/* Haritech's handling stages. They are NOT a feed from NIMC, NIBSS or any
   bank, and every wording shown to the customer stays honest about that. */
export const IDENTITY_STAGES: IdentityStageOption[] = [
  {
    id: 'submitted',
    label: 'Request received',
    description:
      'Haritech has the request and is checking that the details and documents are complete.',
  },
  {
    id: 'review',
    label: 'Under review',
    description:
      'The request is being prepared for the authority that owns the record (NIMC, your bank or NIBSS).',
  },
  {
    id: 'appointment',
    label: 'Appointment booked',
    description:
      'An appointment has been arranged. Read the note for the place, date and what to bring.',
  },
  {
    id: 'query',
    label: 'Query raised',
    description:
      'More information or a better document is needed. Read the note and contact the desk.',
    attention: true,
  },
  {
    id: 'completed',
    label: 'Completed',
    description:
      'The request has been answered by the authority that owns the record. Documents, if any, are in the list below.',
  },
  {
    id: 'closed',
    label: 'Closed',
    description: 'The file is closed. Contact the desk if you need anything else.',
  },
];

export const getIdentityStageOption = (id: IdentityDeskStage): IdentityStageOption =>
  IDENTITY_STAGES.find((stage) => stage.id === id) ?? IDENTITY_STAGES[0];

export const isIdentityDeskStage = (value: unknown): value is IdentityDeskStage =>
  typeof value === 'string' && IDENTITY_STAGES.some((stage) => stage.id === value);

export const identityStageIndex = (stage: IdentityDeskStage): number =>
  Math.max(0, IDENTITY_STAGES.findIndex((stageOption) => stageOption.id === stage));

/** Documents a visitor confirms they already have. Checked, never auto-trusted. */
export const IDENTITY_DOCUMENT_CHECKLIST = [
  'NIN slip',
  'BVN slip or SMS',
  'Birth certificate or age declaration',
  'LGA of origin certificate',
  'Affidavit or court declaration',
  'Passport photograph',
  'Bank statement',
  'Utility bill',
  'Details of next of kin',
];

export type ExistingNumberOption = { id: ExistingNumberStatus; label: string; hint: string };

export const EXISTING_NUMBER_OPTIONS: ExistingNumberOption[] = [
  {
    id: 'verified_here',
    label: 'I verified it at the checks panel above',
    hint: 'The check is done on this page and the full number is never stored.',
  },
  {
    id: 'have_unverified',
    label: 'I have it, but have not verified it here',
    hint: 'Run the check first if you can — it saves the desk a round of questions.',
  },
  {
    id: 'none',
    label: 'I do not have it',
    hint: 'Available for retrieval and registration services.',
  },
];

export interface IdentityApplicationDraft {
  service: IdentityServiceId;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  holderDob: string;
  holderGender: string;
  stateOfResidence: string;
  holderAddress: string;
  requestDetails: string;
  existingNumber: ExistingNumberStatus;
  checkReference: string;
  documentsHave: string[];
  notes: string;
  consent: boolean;
}

export interface IdentityApplicationStatus {
  reference: string;
  service: IdentityServiceId;
  stage: IdentityDeskStage;
  stageNote: string;
  documents: { name: string; url: string }[];
  createdAt: string | null;
  updatedAt: string | null;
}

export const emptyIdentityDraft = (): IdentityApplicationDraft => ({
  service: 'nin_registration',
  holderName: '',
  holderEmail: '',
  holderPhone: '',
  holderDob: '',
  holderGender: '',
  stateOfResidence: '',
  holderAddress: '',
  requestDetails: '',
  existingNumber: 'none',
  checkReference: '',
  documentsHave: [],
  notes: '',
  consent: false,
});
