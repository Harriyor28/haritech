/* NIN / BVN Application Desk — secure RPC calls.

   The database owns the reference number and enforces the contact check in
   identity_application_status(), so the browser never reads the table directly.
   Nothing here sends a full NIN or BVN — the payload only carries how the
   applicant relates to their number and, optionally, a masked check reference. */

import { getSupabase, isCloudConfigured } from '../supabaseClient';
import {
  draftToPayload,
  normaliseIdentityReference,
} from './identityDeskValidation';
import {
  isIdentityDeskStage,
  isIdentityServiceId,
  type IdentityApplicationDraft,
  type IdentityApplicationStatus,
  type IdentityDeskStage,
} from './identityDeskTypes';

export interface IdentitySubmitResult {
  reference: string;
  stage: IdentityDeskStage;
  createdAt: string | null;
}

export const isIdentityDeskAvailable = (): boolean => isCloudConfigured();

const friendlyError = (message: string): string => {
  if (/failed to fetch|networkerror|network request failed/i.test(message)) {
    return 'Could not reach the application desk. Check your connection and try again.';
  }
  return message || 'The application desk could not complete that request. Please try again.';
};

const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

const parseDocuments = (
  value: unknown,
): { name: string; url: string }[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = item as { name?: unknown; url?: unknown } | null;
      return { name: asText(row?.name), url: asText(row?.url) };
    })
    .filter((item) => item.name.length > 0 && item.url.length > 0);
};

export const submitIdentityApplication = async (
  draft: IdentityApplicationDraft,
): Promise<IdentitySubmitResult> => {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      'The application desk needs a connection to Haritech’s secure server. Check your connection and try again.',
    );
  }

  const { data, error } = await sb.rpc('submit_identity_application', {
    payload: draftToPayload(draft),
  });
  if (error) throw new Error(friendlyError(error.message));

  const row = (data ?? {}) as { reference?: unknown; stage?: unknown; created_at?: unknown };
  const reference = asText(row.reference);
  if (!reference) {
    throw new Error('The application desk did not return a reference number. Please try again.');
  }

  return {
    reference,
    stage: isIdentityDeskStage(row.stage) ? row.stage : 'submitted',
    createdAt: asText(row.created_at) || null,
  };
};

export const lookupIdentityApplication = async (
  reference: string,
  contact: string,
): Promise<IdentityApplicationStatus | null> => {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      'Tracking needs a connection to Haritech’s secure server. Check your connection and try again.',
    );
  }

  const cleanReference = normaliseIdentityReference(reference);
  const cleanContact = contact.trim();
  if (!cleanReference || !cleanContact) return null;

  const { data, error } = await sb.rpc('identity_application_status', {
    p_reference: cleanReference,
    p_contact: cleanContact,
  });
  if (error) throw new Error(friendlyError(error.message));

  const row = (data ?? {}) as Record<string, unknown>;
  if (row.found !== true) return null;

  return {
    reference: asText(row.reference),
    service: isIdentityServiceId(row.service) ? row.service : 'nin_registration',
    stage: isIdentityDeskStage(row.stage) ? row.stage : 'submitted',
    stageNote: asText(row.stage_note),
    documents: parseDocuments(row.documents),
    createdAt: asText(row.created_at) || null,
    updatedAt: asText(row.updated_at) || null,
  };
};
