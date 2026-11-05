/* Test surface for scripts/cac-tests.mjs — pure helpers only, no network. */

export {
  CAC_DRAFT_KEY,
  CAC_MAX_PROPOSED_NAMES,
  draftToPayload,
  hasCacErrors,
  isValidCacEmail,
  normaliseCacPhone,
  normaliseCacReference,
  safeCacDocumentUrl,
  validateCacDraft,
} from './cacValidation';

export {
  CAC_DOCUMENT_CHECKLIST,
  CAC_ENTITY_TYPES,
  CAC_STAGES,
  cacStageIndex,
  emptyCacDraft,
  getCacEntityOption,
  getCacStageOption,
  isCacEntityType,
  isCacStage,
} from './cacTypes';
