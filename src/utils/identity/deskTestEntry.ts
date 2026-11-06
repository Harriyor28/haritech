/* Test surface for scripts/identity-desk-tests.mjs — pure helpers only, no network. */

export {
  IDENTITY_MAX_NOTES,
  IDENTITY_MAX_REQUEST_DETAILS,
  cleanCheckReference,
  draftToPayload,
  hasIdentityErrors,
  isValidIdentityEmail,
  loadIdentityDraft,
  normaliseIdentityPhone,
  normaliseIdentityReference,
  validateIdentityDraft,
} from './identityDeskValidation';

export {
  EXISTING_NUMBER_OPTIONS,
  getIdentityService,
  getIdentityStageOption,
  IDENTITY_DOCUMENT_CHECKLIST,
  IDENTITY_SERVICES,
  IDENTITY_STAGES,
  identityStageIndex,
  emptyIdentityDraft,
  isExistingNumberStatus,
  isIdentityDeskStage,
  isIdentityServiceId,
  type ExistingNumberStatus,
  type IdentityApplicationDraft,
  type IdentityServiceId,
  type IdentityKind,
} from './identityDeskTypes';
