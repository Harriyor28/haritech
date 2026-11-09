/* NIN / BVN number helpers — pure validation shared by the WhatsApp
   submission form and the desk components.

   Verification is handled personally by Haritech; there is no automated
   provider check on this website. These helpers exist only to stop a
   malformed number from ever leaving the visitor's browser.

     - A NIN or BVN is exactly 11 digits.
     - normaliseIdentityNumber forgives spaces and dashes.
     - Nothing here makes a network request. */

export type IdentityKind = 'nin' | 'bvn';

/** Digits only, so spaces and dashes do not break a valid number. */
export const normaliseIdentityNumber = (value: string): string =>
  value.replace(/\D/g, '');

export const isValidIdentityNumber = (
  _kind: IdentityKind,
  value: string,
): boolean => normaliseIdentityNumber(value).length === 11;
