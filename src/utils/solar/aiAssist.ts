/* Client for the solar-ai-assist Edge Function (supabase/functions/…).

   The widget always keeps the repository-grounded FAQ as the answering layer.
   When the deployed LLM is reachable (requires SOLAR_AI_API_KEY set server
   side), its answer takes precedence, and failures fall back silently — the
   chat never blocks on the AI or on the network.

   Grounding rules live in both places on purpose: the edge function encodes
   them in its system prompt, and the FAQ encodes them in written answers. */

import { isCloudConfigured } from '../supabaseClient';

export type SolarAnswerSource = 'guide' | 'ai';

export interface SolarRemoteAnswer {
  answer: string;
  source: SolarAnswerSource;
}

// NVIDIA NIM (and other free tiers) can take 15–20s on a cold model, so the
// client waits longer than the function's per-candidate budget (18s) before
// aborting to the built-in guide.
const FUNCTION_TIMEOUT_MS = 25000;
const COOLDOWN_KEY = 'solar-ai-remote-cooldown';

/** Remember cooldowns for this tab session, so navigating between the solar
    pages does not repeat a request that is known to fail (and log CORS noise). */
const readCooldownUntil = (): number => {
  try {
    const raw = window.sessionStorage.getItem(COOLDOWN_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
};

const writeCooldownUntil = (until: number): void => {
  try {
    window.sessionStorage.setItem(COOLDOWN_KEY, String(until));
  } catch {
    /* sessionStorage unavailable — in-memory only */
  }
};

let disabledUntil = 0;

/** Cheap readiness check: the function URL only exists once the function is
    deployed, and repeated failures are briefly not retried. */
const remoteEnabled = (): boolean =>
  isCloudConfigured() && Date.now() > Math.max(disabledUntil, readCooldownUntil());

const setCooldown = (minutes: number): void => {
  disabledUntil = Date.now() + minutes * 60_000;
  writeCooldownUntil(disabledUntil);
};

const functionUrl = (): string | null => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url || !url.startsWith('http')) return null;
  return `${url.replace(/\/$/, '')}/functions/v1/solar-ai-assist`;
};

interface RemoteHistory {
  role: 'user' | 'assistant';
  content: string;
}

/** Maximum characters of KB context the widget may send with a question. */
const MAX_CONTEXT_LENGTH = 3500;

/** Ask the LLM. Returns null whenever it cannot answer — never an error the
    caller has to interpret.
    `context` is an optional authoritative excerpt from the website's own
    knowledge bases (see haritechFaq.buildRemoteContext): the function embeds
    it in the system prompt so the LLM answers with the site's grounded facts
    (deep solar math, exact published prices, page routes). */
export const askRemoteSolarAi = async (
  question: string,
  history: RemoteHistory[] = [],
  context?: string,
): Promise<SolarRemoteAnswer | null> => {
  const url = functionUrl();
  if (!url || !remoteEnabled() || !question.trim()) return null;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FUNCTION_TIMEOUT_MS);
  try {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const payload: Record<string, unknown> = {
      question: question.slice(0, 500),
      // Last few exchanges keep follow-up questions ("how long will *it* last?") sensible.
      history: history.slice(-4),
    };
    const contextText = context?.trim().slice(0, MAX_CONTEXT_LENGTH);
    if (contextText) payload.context = contextText;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { Authorization: `Bearer ${key}`, apikey: key } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      // 503 = key not set / fallback mode; other errors are outages.
      setCooldown(response.status === 503 ? 10 : 2);
      return null;
    }

    const data = (await response.json()) as { answer?: unknown };
    const answer = typeof data?.answer === 'string' ? data.answer.trim() : '';
    if (!answer) return null;
    // Success clears any prior cooldown so recovery is immediate.
    disabledUntil = 0;
    writeCooldownUntil(0);
    return { answer, source: 'ai' };
  } catch {
    setCooldown(1);
    return null;
  } finally {
    window.clearTimeout(timer);
  }
};

/** True once the function exists on the server and answers with an LLM. */
export const probeSolarAi = async (): Promise<boolean> => {
  const result = await askRemoteSolarAi('reply with ok');
  if (result && result.source === 'ai') {
    return true;
  }
  return false;
};
