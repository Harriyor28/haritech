# Draft price register — review package

**Status: DRAFT. Nothing here is active. Nothing here is imported by the website.**

This folder holds the owner's proposed prices in a reviewable form. It sits outside the application's import graph, so it cannot change a page, calculator, total or database record. Activation is a separate, approval-gated step.

## Files

| File | Purpose |
|---|---|
| `proposed-prices.json` | 67 services: 66 priced, 1 deliberately unpriced (online consultation) |
| `review-sheet.html` | Self-contained visual review page: search, filter by category/status, notes and questions |
| `signoff.csv` | One row per service with blank decision and amendment columns for the owner |
| `build-review.mjs` | Regenerates the review sheet and sign-off CSV from the JSON |
| `validate-draft.mjs` | Dependency-free Node check for structure, IDs, statuses and blank prices |
| `README.md` | This file |
| `../PHASE3_IMPLEMENTATION_REPORT.md` | Full audit, current-vs-proposed, conflicts, files to change, tests, rollback, owner questions |

## Open the review sheet

Open `pricing/drafts/review-sheet.html` in a browser (double-click, or drag it into a tab). It is a static file: no server, no build step, no network calls. It is not part of the website bundle.

To rebuild it after any edit to the JSON:

```powershell
node .\pricing\drafts\build-review.mjs
```

## Run the validator

```powershell
node .\pricing\drafts\validate-draft.mjs
```

Expected: `PASS — draft register is internally consistent.` It prints counts by category and evidence status. It writes nothing.

## Status model

`status` is the lifecycle state of the price. All 67 entries are `DRAFT`.

`evidence_status` is the outstanding gate:

| Value | Meaning | Count |
|---|---|---:|
| `OFFICIAL FEE VERIFICATION NEEDED` | The package embeds a government fee that must be verified and dated before publication. | 6 |
| `COST EVIDENCE NEEDED` | The price depends on hardware, freight, materials or effort with no recorded cost evidence. | 30 |
| `READY FOR OWNER REVIEW` | Owner supplied a price and the unit is clear; no external fee is embedded. Still not approved. | 30 |
| `DRAFT` | Owner price missing. Must not default to another rate. | 1 |
| `APPROVED` | Not used. Requires explicit owner approval and an approval record. | 0 |

## How to review

1. Open `review-sheet.html` and filter by category or evidence status.
2. Expand “Notes & questions” on each row; check `unit`, `inclusions`, `exclusions` and the owner-confirmation prompts.
3. Record the decision in `signoff.csv`: `decision_run_1` = `approve` / `reject` / `hold`; use `amended_price_ngn` if the figure changes; add a reason in `owner_note`.
4. Answer the owner questions in §9 of the Phase 3 report. The blocking ones are price/unit decisions, not code decisions.
5. Do not edit the live components from this folder.

`decision_run_2` is reserved for a second reviewer or a later re-review. A blank decision is not approval.

## Activation checklist (only after explicit approval)

- [ ] Owner signs off each `id` individually; `activation.approved_by` and `approved_at` recorded.
- [ ] Every `effective_date` set to an agreed date, not left null.
- [ ] Every `unit_confirmed` resolved; no `unit: null` remains on an activated service.
- [ ] Every CAC official fee verified against a dated CAC schedule.
- [ ] Solar, epoxy and freight costs backed by quotes or BOMs.
- [ ] Included services encoded as `includedAddons` so the UI cannot charge them again.
- [ ] Conditional fees (clearing coordination) gated on shipment category plus authorised staff action.
- [ ] Historical quotations and orders frozen; no retroactive recalculation.
- [ ] Draft config wired through a single `pricing.ts` source, then a single reversible commit.
- [ ] Validator run and all tests in §8 of the report passing.

## Rollback

- **Now (draft only):** delete this folder. No production impact.
- **After activation:** revert the single activation commit; the old constants remain in git history. If a database migration is ever approved, run its down-migration from a verified backup. Historical quotes are never rewritten, so reverting the price table does not alter them.

## Deliberate omissions

The register does not price: SCUML support (declared "separate" but no amount), CAC stamp and courier, postage, solar IoT monitoring, solar roof rails, epoxy anti-slip and vapour barrier, epoxy location multipliers, web hosting, domain renewal, content writing, third-party licences, import duty/VAT/levy/insurance defaults, MFB registration, or online consultation. See §9 of the report.
