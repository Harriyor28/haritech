/* Test surface for scripts/identity-tests.mjs — pure helpers only, no network. */

export {
  IDENTITY_KINDS,
  extractIdentityRecord,
  getIdentityKind,
  isIdentityKind,
  isProviderSuccess,
  isValidIdentityNumber,
  maskIdentityNumber,
  normaliseIdentityNumber,
  redactIdentityNumber,
} from './identityCore';

export type { IdentityKind, IdentityRecord } from './identityCore';
