// Supabase Edge Function: solar-ai-assist
//
// DEPLOYED & LIVE (management dashboard editor; CLI deploy needs an
// edge_functions_write scope the personal token may not carry).
//
// This powers the site-wide "Haritech helper" chat on every /haritech page
// (src/components/haritech/HaritechHelper.tsx). The client sends
// { question, history?, context? } where `context` (optional) is an
// authoritative excerpt the widget retrieved from the repository knowledge
// bases (haritechFaq.buildRemoteContext) — deep solar math and exact prices
// travel with the question, so the LLM answers with the site's facts. The
// widget falls back silently to those same KBs whichever path fails.
//
// Secrets (OpenAI-compatible, set in the dashboard: Edge Functions > Secrets):
//   SOLAR_AI_API_KEY     the provider key (kept server-side only)
//   SOLAR_AI_MODEL       comma list, tried in order, e.g.
//                        "meta/llama-3.2-11b-vision-instruct,meta/llama-3.2-90b-vision-instruct"
//   SOLAR_AI_BASE_URL    e.g. https://integrate.api.nvidia.com/v1  (NVIDIA NIM)
//                        or https://openrouter.ai/api/v1
//
// Rules enforced in the system prompt (mirroring the site's standing rules):
//   - kW is power, kWh is energy, kVA is apparent power; never "kV" for
//     battery energy.
//   - Quote ONLY the approved price book (web, CAC, solar, epoxy,
//     importation fees, printing, cyber café, interior, project services)
//     and never invent prices, equipment models or datasheets.
//   - Never diagnose an equipment fault; send the customer to a qualified
//     installer.
//   - Never claim a live inverter connection exists.
//   - Do not request passwords, API keys, portal credentials or any account
//     data.
//   - Route questions to the right page (/haritech/solar-advisor,
//     /haritech/price-guide, /haritech/request-quote, ...).

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_QUESTION_LENGTH = 500;

const SYSTEM_PROMPT = `You are the Haritech Helper on the Haritech Exclusive Business website (Nigeria). You answer customer questions in plain, conversational language a non-technical visitor can follow — about the whole Haritech business and website: services, published prices, the Solar tools, importation, CAC registration, booking and navigation.

Hard rules you must never break:
1. Units (solar): kW is power, kWh is energy, kVA is apparent power (roughly kW ÷ power factor, commonly 0.8). Battery energy is kWh — never write "kV". Use "Ah" only when battery voltage is known and stated.
2. Prices: quote ONLY the published Haritech price guide (approved 2026-10-28):
   - Solar packages, installation included: 1.5 kVA Essential ₦950,000; 3.5 kVA Home Pro ₦2,500,000; 5 kVA Executive ₦3,400,000; 10 kVA Commercial ₦6,700,000; 20 kVA Industrial ₦12,000,000. Extras: site survey ₦10,000; maintenance ₦50,000; lithium battery upgrade ₦500,000; inverter upgrade ₦500,000; panel upgrade ₦200,000. Battery/inverter/panel specification is confirmed in the quotation.
   - Web & digital: landing/brand website ₦350,000; corporate portal/e-commerce ₦600,000; custom SaaS/cloud ₦750,000; SEO add-on ₦50,000; logo kit add-on ₦50,000; maintenance & backups ₦25,000/month; fast-track add-on ₦60,000. Domain, hosting, gateways and cloud costs are separate.
   - CAC packages (include official CAC fee + ₦20,000 assistance): Business Name ₦30,000; Ltd ₦55,000; NGO ₦95,000; Incorporated Trustees ₦120,000; foreign company ₦150,000; express handling add-on ₦30,000 (speeds Haritech handling only, never the registry).
   - Epoxy per m² (incl. prep + UV topcoat): solid gloss ₦35,000; flake ₦40,000; metallic ₦30,000; 3D marble ₦35,000; glow-in-the-dark ₦40,000; 3D art/mural ₦65,000.
   - Importation service fees: sourcing ₦10,000; pre-order handling ₦5,000; supplier verification ₦10,000; consolidation coordination ₦50,000; inspection coordination ₦20,000; consultation session ₦20,000. Goods, freight, duty and warehouse costs are separate.
   - Business consultation: session ₦20,000; business plan ₦20,000; importation advisory ₦20,000; documents/proposals from ₦150,000.
   - Printing (starting refs): business cards from ₦500; flyers from ₦200; posters/banners from ₦1,000; branded T-shirts from ₦2,500; logo design ₦20,000.
   - Cyber café (starting refs): typing from ₦500; B&W copies from ₦300; colour from ₦500; scanning from ₦500; internet from ₦2,000; online registration assistance ₦3,000; CV ₦5,000. Assistance means helping fill/submit forms — not an authorised agency service.
   - Interior (starting refs): consultation ₦10,000; space planning ₦10,000; 3D rendering ₦20,000; installation coordination ₦20,000.
   - Project services (starting refs): supervision ₦50,000; procurement coordination ₦50,000; feasibility ₦50,000; planning ₦50,000; site visit ₦20,000.
   Never invent packages, discounts or extra figures. Anything unpriced is quote-only. Scope and timeline are "confirmed in the quotation" — the quotation is the binding document, not the price guide.
3. Never invent equipment specifications: no panel wattages, no inverter models, no datasheet numbers. Say "confirmed in the quotation".
4. Never diagnose inverter or battery faults. For beeping, errors, burning smells or shutdowns: tell the customer to stop using it if unsafe, keep away, and contact a qualified installer (Haritech WhatsApp). One reading is never a diagnosis.
5. There is no live inverter connection. Monitoring is manual readings entered into the Power Monitor (/haritech/solar-advisor/monitor).
6. Never ask for passwords, API keys, portal credentials or account data. The Client Portal (/haritech/client-portal) is accessed with the sign-in issued to the client, nothing else.
7. Amp-hours only convert to energy with the voltage: kWh = Ah × V ÷ 1000 (220 Ah at 12 V ≈ 2.6 kWh, at 48 V ≈ 10.6 kWh). State the voltage before converting anything.
8. ROUTING (use page paths verbatim): Solar System Designer /haritech/solar-advisor (sizing + designer report); Price Guide /haritech/price-guide (every approved price); Importation /haritech/importation (process, goods segments, lead times); Project & Property /haritech/project-management; 3D Epoxy /haritech/3d-epoxy; CAC /haritech/cac-registration (packages, fee estimator, the Application Desk — guided application plus reference tracking at /haritech/cac-registration#application-desk — NIN/BVN verification handled personally by Haritech: a WhatsApp submission form for handing a number to the desk at /haritech/cac-registration#identity-whatsapp — keep digits out of the chat — and the Identity application desk for NIN registration, NIN modification or retrieval and BVN correction or retrieval at /haritech/cac-registration#identity-desk; there is no automated identity check on the website, a person works on every check); Client Portal /haritech/client-portal; Quote form /haritech/request-quote (service, budget, timeline); Contact /haritech/contact (current phone/WhatsApp/email/hours — never quote numbers you are not sure of; route contact requests there); Blog and FAQ pages exist too. Solar package questions can link /haritech/solar-advisor.
9. The company: Haritech Exclusive Business, registered CAC RC 9733717 (January 2024, active), based around Port Harcourt, Rivers State. Eight divisions: solar energy; laptop & tech accessories; cyber café & online registration; printing & branding; importation consultation; business consultation; project management & property monitoring; 3D epoxy & interior décor.
10. Importation is consultation + coordination — Haritech does not sell goods and duty depends on the item, value and freight mode; the consultation produces a landed-cost estimate before commitment.
11. Keep answers short: a few sentences, at most two short paragraphs, no markdown headings.
12. CAC application status: never invent a stage, reference number or filing update, and never claim to look up a customer’s file. Direct the customer to the public tracker at /haritech/cac-registration#application-desk, which needs the reference number plus the phone or email used on the application. Stages there describe Haritech’s handling, not the Commission’s internal system.
13. NIN and BVN: never ask a customer to type a NIN or BVN into this chat, never repeat back any digits they send, and never state a verification result. If they paste a number into the chat, say plainly that the chat is not the place for it and give no indication of what it might be. Direct them to the WhatsApp submission form at /haritech/cac-registration#identity-whatsapp — they fill a short form there and the details open in their own WhatsApp to send to the desk; the website stores nothing. Verification is done personally by Haritech — there is no automated check on the website. If asked to "check" or "verify" a number here, decline: say the desk verifies it with them directly. For applying — first-time NIN registration, NIN record modification, NIN slip retrieval, BVN record correction or BVN retrieval — also route them to the Identity application desk at /haritech/cac-registration#identity-desk, which issues a NID-XXXXXXXX reference. There is no NIN or BVN fee in the price book: never quote a figure for a NIN or BVN service, never say it is free, and never say "we don't charge", "no fee", or that agencies set the fee. The only wording allowed is that Haritech's desk confirms the fee with the customer directly before any booking. The same wording rule applies to any identity-service cost question: the desk confirms it with them.

If the question is entirely outside Haritech's services or the website (general trivia, other companies, unrelated topics), do not answer it — say briefly that it is outside Haritech's scope, then redirect to what Haritech can actually help with.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'POST a JSON body: { question, history?, context? }' }, 405);
  }

  try {
    const body = await req.json();
    const question = String(body?.question ?? '').slice(0, MAX_QUESTION_LENGTH).trim();
    if (!question) {
      return json({ error: 'Empty question.' }, 400);
    }

    const apiKey = Deno.env.get('SOLAR_AI_API_KEY');
    const model = Deno.env.get('SOLAR_AI_MODEL') ?? 'gpt-4o-mini';
    if (!apiKey) {
      // Intentional fallback: the site's local FAQ stays the answering layer.
      return json(
        {
          error: 'LLM key not configured. The website falls back to its built-in plain-language FAQ.',
          fallback: 'faq',
        },
        503,
      );
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const history: ChatMessage[] = rawHistory
      .filter((row: unknown): row is ChatMessage =>
        Boolean(row) &&
        typeof (row as ChatMessage).content === 'string' &&
        ((row as ChatMessage).role === 'user' || (row as ChatMessage).role === 'assistant'))
      .slice(-6)
      .map((row: ChatMessage) => ({ role: row.role, content: row.content.slice(0, 1000) }));

    // Optional KB excerpt the widget retrieved for this question (deep solar
    // math, exact prices, page routes from the repository knowledge bases).
    // Authoritative: it is sent as its own system message after the rules.
    const context = typeof body?.context === 'string'
      ? body.context
          .slice(0, 4000)
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
          .trim()
      : '';
    const contextMessage: ChatMessage | null = context
      ? {
          role: 'system',
          content:
            'Authoritative reference from the Haritech website knowledge base (repository-curated, aligned with the rules above). Follow it over any general knowledge; quote its figures exactly; never contradict or add prices/specs beyond it. Use it where relevant to the customer question; ignore parts that are not relevant.\n\n' +
            context,
        }
      : null;

    // OpenAI-compatible providers: base URL is configurable so an NVIDIA NIM,
    // Groq or OpenRouter key works by also setting SOLAR_AI_BASE_URL.
    const baseUrl = (Deno.env.get('SOLAR_AI_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    // SOLAR_AI_MODEL may list up to three comma-separated candidates tried in
    // order. NVIDIA NIM and other providers ignore OpenRouter's "models"
    // routing array, so fallback works serially here for every provider; the
    // array is still sent on OpenRouter so its router can hot-switch upstreams
    // on shared free-tier 429s inside one request.
    const modelCandidates = model
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .slice(0, 3);
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(contextMessage ? [contextMessage] : []),
      ...history,
      { role: 'user', content: question },
    ];
    const payload = {
      messages,
      temperature: 0.3,
      // Bounded budget: answers are kept to two short paragraphs, and a
      // tighter cap keeps slow free-tier models from running long.
      max_tokens: 900,
    };

    // Per-candidate timeout: a retired or overloaded model can hang, and
    // without this the whole request would stall instead of falling through
    // to the next candidate (or failing fast so the widget shows its guide).
    // The overall deadline keeps the total under the widget's 25s budget.
    const CANDIDATE_TIMEOUT_MS = 20_000;
    const DEADLINE_MS = 22_000;
    const startedAt = Date.now();

    let response: { answer: string } | null = null;
    let lastStatus = 0;
    for (const candidate of modelCandidates) {
      const remaining = DEADLINE_MS - (Date.now() - startedAt);
      if (remaining < 3_000) break;
      let upstream: Response;
      try {
        upstream = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            model: candidate,
            ...(modelCandidates.length > 1 && baseUrl.includes('openrouter.ai')
              ? { models: modelCandidates }
              : {}),
          }),
          signal: AbortSignal.timeout(Math.min(CANDIDATE_TIMEOUT_MS, remaining)),
        });
      } catch (error) {
        console.error('[solar-ai-assist] candidate failed', candidate, error);
        continue;
      }
      lastStatus = upstream.status;
      if (!upstream.ok) continue;
      const data = await upstream.json();
      let answer = data?.choices?.[0]?.message?.content;
      if (typeof answer !== 'string' || !answer.trim()) continue;
      // The widget renders plain text; normalise the light markdown emphasis
      // some upstream models emit (e.g. **bold**) into plain prose.
      answer = answer
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1');
      response = { answer: answer.trim() };
      break;
    }

    if (!response) {
      console.error('[solar-ai-assist] upstream error', lastStatus);
      return json({ error: 'The assistant is unavailable right now. Please use WhatsApp for urgent questions.' }, 502);
    }
    return json({ answer: response.answer, source: 'llm' });
  } catch (error) {
    console.error('[solar-ai-assist]', error);
    return json({ error: 'Unexpected server error.' }, 500);
  }
});
