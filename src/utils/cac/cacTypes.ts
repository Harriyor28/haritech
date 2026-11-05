/* CAC Application Desk — shared types, entity options and stage vocabulary.

   Kept free of Supabase/browser imports so the same definitions can be
   bundled into the dependency-free test harness (scripts/cac-tests.mjs). */

export type CacEntityType =
  | 'business_name'
  | 'limited_company'
  | 'ngo'
  | 'incorporated_trustees';

export type CacStage =
  | 'submitted'
  | 'name_search'
  | 'filed'
  | 'query'
  | 'approved'
  | 'certificate_ready'
  | 'closed';

export interface CacEntityOption {
  id: CacEntityType;
  label: string;
  shortLabel: string;
  /** Matching package in src/config/pricing.ts. */
  packageId: string;
  description: string;
  /** What the people listed on the application are called. */
  memberLabel: string;
  memberRoleHint: string;
}

export const CAC_ENTITY_TYPES: CacEntityOption[] = [
  {
    id: 'business_name',
    label: 'Business Name',
    shortLabel: 'Business Name',
    packageId: 'CAC-001',
    description: 'A sole proprietorship or partnership trading under a registered name.',
    memberLabel: 'Proprietor / partner',
    memberRoleHint: 'Proprietor, partner or signatory',
  },
  {
    id: 'limited_company',
    label: 'Limited Liability Company (Ltd)',
    shortLabel: 'Ltd company',
    packageId: 'CAC-002',
    description: 'A separate legal company with directors and shareholders.',
    memberLabel: 'Director / shareholder',
    memberRoleHint: 'Director, shareholder or company secretary',
  },
  {
    id: 'ngo',
    label: 'Non-Governmental Organisation (NGO)',
    shortLabel: 'NGO',
    packageId: 'CAC-003',
    description: 'A not-for-profit organisation registered with trustees.',
    memberLabel: 'Trustee',
    memberRoleHint: 'Trustee or authorised officer',
  },
  {
    id: 'incorporated_trustees',
    label: 'Incorporated Trustees',
    shortLabel: 'Incorporated Trustees',
    packageId: 'CAC-004',
    description: 'A body of trustees incorporated for a religious, educational or charitable purpose.',
    memberLabel: 'Trustee',
    memberRoleHint: 'Trustee or authorised officer',
  },
];

export const getCacEntityOption = (id: CacEntityType): CacEntityOption =>
  CAC_ENTITY_TYPES.find((item) => item.id === id) ?? CAC_ENTITY_TYPES[0];

export const isCacEntityType = (value: unknown): value is CacEntityType =>
  typeof value === 'string' && CAC_ENTITY_TYPES.some((item) => item.id === value);

export interface CacStageOption {
  id: CacStage;
  label: string;
  description: string;
  /** The stage needs the applicant's attention. */
  attention?: boolean;
}

/* These are Haritech's handling stages, not a feed from the Commission's
   internal system. Wording stays honest everywhere it is shown. */
export const CAC_STAGES: CacStageOption[] = [
  {
    id: 'submitted',
    label: 'Application received',
    description: 'Haritech has the application and is checking that the details and documents are complete.',
  },
  {
    id: 'name_search',
    label: 'Name search',
    description: 'The proposed names are being prepared for a search against the Commission’s records.',
  },
  {
    id: 'filed',
    label: 'Filed with the Commission',
    description: 'The application has been filed and Haritech is following it up with the Commission.',
  },
  {
    id: 'query',
    label: 'Query raised',
    description: 'The Commission or Haritech needs something else. Read the note and contact the desk.',
    attention: true,
  },
  {
    id: 'approved',
    label: 'Approved',
    description: 'The application has been approved. Haritech is arranging the issued documents.',
  },
  {
    id: 'certificate_ready',
    label: 'Certificate ready',
    description: 'The certificate is ready. Download it from the documents list, or arrange collection.',
  },
  {
    id: 'closed',
    label: 'Closed',
    description: 'The file is closed. Contact the desk if you need anything else.',
  },
];

export const getCacStageOption = (id: CacStage): CacStageOption =>
  CAC_STAGES.find((item) => item.id === id) ?? CAC_STAGES[0];

export const isCacStage = (value: unknown): value is CacStage =>
  typeof value === 'string' && CAC_STAGES.some((item) => item.id === value);

export const cacStageIndex = (stage: CacStage): number =>
  Math.max(0, CAC_STAGES.findIndex((item) => item.id === stage));

/** Documents visitors commonly need. They can submit before they have them all. */
export const CAC_DOCUMENT_CHECKLIST = [
  'Valid government-issued ID (NIN slip, driver’s licence, passport or voter’s card)',
  'Recent passport photograph',
  'Proof of residential or business address',
  'Proposed business name options (2–3)',
  'A short description of the business activity',
  'Signature specimen',
  'Details of directors, shareholders or trustees',
];

export interface CacMember {
  name: string;
  role: string;
}

export interface CacDocumentLink {
  name: string;
  url: string;
}

export interface CacApplicationDraft {
  entityType: CacEntityType;
  proposedNames: string[];
  natureOfBusiness: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  businessAddress: string;
  members: CacMember[];
  documentsHave: string[];
  notes: string;
  consent: boolean;
}

export interface CacApplicationPayload {
  entity_type: CacEntityType;
  proposed_names: string[];
  nature_of_business: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_address: string;
  business_address: string;
  members: CacMember[];
  documents_have: string[];
  notes: string;
}

export interface CacApplicationStatus {
  reference: string;
  entityType: CacEntityType;
  proposedNames: string[];
  stage: CacStage;
  stageNote: string;
  documents: CacDocumentLink[];
  createdAt: string | null;
  updatedAt: string | null;
}

export const emptyCacDraft = (): CacApplicationDraft => ({
  entityType: 'business_name',
  proposedNames: ['', '', ''],
  natureOfBusiness: '',
  applicantName: '',
  applicantEmail: '',
  applicantPhone: '',
  applicantAddress: '',
  businessAddress: '',
  members: [{ name: '', role: '' }],
  documentsHave: [],
  notes: '',
  consent: false,
});
