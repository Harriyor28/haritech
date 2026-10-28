# Haritech Pricing Governance — Phase 2 Issue Report

**Date:** 2026-10-28
**Scope:** read-only pricing governance review and proposed master catalogue.
**Companion files:** `pricing/PRICING_INVENTORY.md`, `pricing/PROPOSED_MASTER_CATALOGUE.csv`, and the Phase 1 `pricing-audit.csv`.
**Change status:** no application code, website price, database record or deployment was changed.

---

## 1. Method and evidence limits

- All prices were read from source. No cloud database was queried, so admin values are reviewed as fields and defaults, not as live rows.
- **No supplier quote, invoice, bill of materials, labour rate or time study exists in the repository.** Cost inputs are therefore named categories, not amounts.
- **No external benchmark was captured.** Web search was unavailable in this session (attempted 2026-10-28); the catalogue records `None collected` rather than an unverified figure. No competitor price is treated as evidence of Haritech's cost.
- Every proposed price is blank. 87 catalogue rows: 12 `OFFICIAL FEE VERIFICATION NEEDED`, 66 `COST EVIDENCE NEEDED`, 9 `DRAFT`. Nothing is `APPROVED`.

---

## 2. CAC reconciliation

Two live tools quote the same entity types independently.

| Entity | Govt fee | Service fee | Fee-tool total | Estimator | Gap | Express at 40% |
|---|---:|---:|---:|---:|---:|---:|
| Business Name | 10,000 | 25,000 | 35,000 | 35,000 | 0 | 10,000 |
| LLC | 30,000 | 65,000 | 95,000 | 85,000 | **+10,000** | 26,000 |
| Foreign company | 90,000 | 150,000 | 240,000 | not offered | n/a | 60,000 |
| Microfinance bank | 50,000 | 250,000 | 300,000 | not offered | n/a | 100,000 |
| NGO | 20,000 | 55,000 | 75,000 | 195,000 | **−120,000** | 22,000 |
| Incorporated trustees | 20,000 | 50,000 | 70,000 | 195,000 | **−125,000** | 20,000 |

**Findings**

1. LLC is quoted at two totals (85k vs 95k) with no stated reason.
2. The estimator's single 195,000 "Corporate Conglomerate / NGO / Incorporated Trustees" tier conflates three different products and overprices NGO/trustee work by 120,000–125,000.
3. Express is a flat 25,000 in one tool and 40% of the service fee in the other, producing 10,000–100,000 depending on entity.
4. **Duplicated inclusions.** The LLC tier lists TIN and SCUML documentation as included, while the same estimator sells TIN at 20,000 and SCUML at 35,000 as add-ons. A customer can be charged twice for the same deliverable.
5. **Newspaper publication** is described as included in the 55,000 NGO fee, but no newspaper rate exists. It is a third-party cost inside a fixed professional fee.
6. **"Free legal consultation"**, **"corporate attorney filing"** and **"trademark & IP consultation"** are sold inside tiers with no named provider, qualification or scope.
7. The MFB ₦200m/₦1bn figure is a **regulatory capital requirement**, not a Haritech fee, but it is displayed inside a fee estimator.
8. Government fees carry no CAC source URL, schedule date or effective date.

**Recommended structure (pending owner approval, no prices set here):** one entity table with `government_fee`, `service_fee`, `express_rule`, `pass_throughs` and `inclusions`; totals derived, never hard-typed; add-ons either inside the inclusion list or sold separately, never both.

---

## 3. Solar reconciliation

| Size | Detailed system price | ₦ per kVA | Estimator band | Band ₦/kVA at band edges | Gap |
|---|---:|---:|---|---:|---:|
| 1.5 kVA | 480,000 | 320,000 | 1.5–2.5 kVA = 480,000 | 320,000 → 192,000 | 2.5 kVA unpriced |
| 3.5 kVA | 950,000 | 271,429 | 3.5–5 kVA = 1,100,000 | 314,286 | **+150,000** |
| 5 kVA | 1,400,000 | 280,000 | 3.5–5 kVA = 1,100,000 | 220,000 | **−300,000** |
| 10 kVA | 2,200,000 | 220,000 | 10–20 kVA = 2,900,000 | 290,000 | **+700,000** |
| 20 kVA | 3,800,000 | 190,000 | 10–20 kVA = 2,900,000 | 145,000 | **−900,000** |

**Findings**

1. The two surfaces disagree at four of five sizes; only 1.5 kVA matches.
2. ₦/kVA is **not monotonic**: the 5 kVA system costs 280,000/kVA while the 3.5 kVA costs 271,429/kVA. Larger systems should normally show a lower unit cost.
3. Bands collapse two sizes into one price, so the top of each band is systematically under-priced.
4. **No itemised equipment costs exist.** Panel count and battery kWh are shown, but there is no panel, inverter, battery, mounting, cable, labour, transport or commissioning cost.
5. The lithium add-on (250,000) duplicates the lithium battery already described as included in tiers 2 and 3.
6. The IoT add-on hides a possible data/subscription cost.
7. Roof rails are priced per system, not per metre.
8. There is **no installation labour line** anywhere, so it is unclear whether labour is inside or outside the system price.
9. The savings calculator hard-codes a **₦100/kWh** grid tariff. Projected savings, payback and 25-year ROI all inherit that assumption.

**Decision needed:** retain bands as marketing "from" prices tied to a named size, or retire them and show the five discrete systems. Recommendation: retire bands, keep the system list, and build a bill of materials per size.

---

## 4. Epoxy reconciliation

All-in calculator rate = finish rate + 2,500 prep + 1,500 topcoat, before the location multiplier.

| Finish | Rate/m² | All-in home/m² |
|---|---:|---:|
| Solid colour | 9,000 | 13,000 |
| Decorative flake | 12,000 | 16,000 |
| Metallic | 18,000 | 22,000 |
| Marble | 22,000 | 26,000 |
| Glow | 28,000 | 32,000 |
| 3D art | 45,000 | 49,000 |

| Package | Price | Area | Implied ₦/m² | vs cheapest all-in | vs metallic all-in |
|---|---:|---:|---:|---:|---:|
| Single room | 220,000 | 25 m² | 8,800 | **−32%** | −60% |
| Full apartment | 650,000 | 80 m² | 8,125 | **−37%** | −63% |
| Commercial | 1,450,000 | 150 m² | 9,667 | **−26%** | −56% |

**Findings**

1. Every package is priced below the calculator's cheapest possible all-in rate. One of the two models must be wrong, or the packages are loss-leaders, which is not stated.
2. The 80 m² package is **cheaper per m²** than the 25 m² package, inverting the expected volume curve.
3. "150+ m²" has no upper bound; at 300 m² the implied rate falls to about 4,833/m².
4. The calculator's `space` selector (floor, wall, countertop, furniture) **does not affect price**; every surface is charged at floor rates including grinding and topcoat.
5. Location multipliers (1.0/1.1/1.2/1.35) apply to prep and topcoat as well as the finish, and have no documented cost basis.
6. The metallic pigment add-on (60,000) duplicates artwork/metallic inclusions in two tiers.
7. Anti-slip (35,000) and vapour barrier (55,000) are flat fees with no area basis; a vapour barrier should follow a moisture test.
8. No design/artwork fee exists, although 3D art is priced per m² as if effort scaled with area.
9. "12,500 PSI" and "5-year structural warranty" are unsupported (see §8).

**Decision needed:** choose one pricing model. Option A: per-m² only, with packages shown as "from" examples. Option B: flat packages, but then the calculator rates must be re-based, areas capped and location zones defined.

---

## 5. Importation assumptions

| Assumption | Value | Evidence | Issue |
|---|---|---|---|
| Sea fixed charges | 450,000 | Code comment | Flat per consignment regardless of volume; includes "clearing", which overlaps the 1% clearing fee |
| Air fixed charges | 260,000 | Code comment | Flat regardless of chargeable weight; same overlap |
| VAT | 7.5% | None | No tax-authority citation or effective date |
| ECOWAS levy | 1% | None | Origin exemptions not modelled |
| Insurance | 0.75% | None | No underwriter rate card |
| Clearing agency fee | 1% of CIF | None | Double count with the flat clearing component |
| Duty bands | 5 / 10 / 20 / 35% | None | No HS mapping; ranges are snapped to the top band without disclosure |
| FX rate | 1,500 (import) / 1,450 (cost estimator) | None | Two rates; 3.4% divergence; no date |
| Freight | not modelled | None | Landed estimate may be read as complete |
| Warehousing, demurrage, haulage | not modelled | None | Material costs left invisible |

**Findings**

1. The estimator presents "landed cost" while excluding actual freight, storage and demurrage.
2. Fixed charges and a percentage clearing fee describe the same activity.
3. Duty ranges such as "5–20%" are silently rounded up to 20%, which overstates duty but is not explained.
4. No pre-order deposit or landed estimate is published (`preOrders: []`), so the section is empty rather than mispriced.
5. FX is hard-coded in two places with different values.

**Recommended structure:** `freight (carrier quote) + insurance + CIF + duty (HS code) + levy + VAT + terminal + agency + haulage + storage`. Every rate carries a source and an effective date; the FX rate is displayed and overridable.

---

## 6. Web-service scope and recurring costs

| Item | Current | Gap |
|---|---|---|
| Starter site | 150,000 | No hours, day rate, revision cap or page-change policy |
| E-commerce | 350,000 | Integrations and gateway fees unpriced |
| SaaS | 750,000 | Open-ended; SLA undefined |
| SEO | 50,000 | No deliverables or duration |
| Brand kit | 40,000 | No deliverable count |
| Maintenance | 80,000/year | Recurring vs one-off unclear; support hours undefined |
| Rush | 60,000 | "2× speed" contradicts the 3-day timeline reduction |
| Hosting | not priced | Invisible recurring cost |
| Domain | "free setup" | Renewal term and price unstated |
| Third-party | not priced | Gateway %, SMS, email, plugins |
| Content | not priced | Assumed client-supplied, not stated |
| Hourly/day rate | none | No internal rate exists to test viability |

**Findings**

1. Web/digital is priced in the estimator but is **not one of the divisions described on the site**, and has no service page, inclusions section or exclusions.
2. Five recurring/pass-through cost lines are missing entirely; a "free domain" without hosting is an incomplete offer.
3. Without an internal cost rate, no package price can be tested for margin.
4. The starter tier's "free domain setup" may be read as a permanently free domain.

**Decision needed:** either publish a web/digital service page with a scope table, or remove web from the estimator until the offer is defined. Define internal day rates before any package price is approved.

---

## 7. Fictional Project Hub records and unsubstantiated claims

**Demo records.** The Project Hub preview contains named clients (individuals and companies), four project budgets (₦96m, ₦420m, ₦180m, ₦28.5m), five rent rolls, six rent records, eight work orders and three approval amounts. They reconcile internally, which makes them look like real books. After the Phase 1 copy cleanup, the preview no longer carries a sample-data label.

**Internal inconsistencies**

| Item | Figure | Conflict |
|---|---:|---|
| Roofing approval | ₦9,400,000 | Roofing budget line is ₦9,000,000 → exceeds by ₦400,000 |
| Joinery approval | ₦41,200,000 | Project committed total is ₦41,000,000; not traceable to a budget line |
| Lintel variation | ₦420,000 | Appears in a work order, a risk note and an approval queue, hand-duplicated |

**Unsubstantiated claims to remove or substantiate**

- Zero-downtime guarantee (solar tier).
- Five-year structural warranty (epoxy tier).
- 12,500 PSI compressive strength (epoxy tier).
- "Tier-1" panels (solar tier).
- Two-times faster delivery (web add-on).
- Free legal consultation, corporate attorney filing, trademark and IP consultation (CAC tiers).
- "Free domain" (web starter).

None of these has terms, measurement, provider or exclusion. They should not be published until evidenced.

---

## 8. Rounding, currency formatting and source inconsistencies

| Location | Behaviour | Consequence |
|---|---|---|
| CAC `fmt()` | `(n/1000).toFixed(0) + ",000"` | ₦27,500 renders as ₦28,000; ₦42,500 as ₦43,000; ₦999,999 renders as the malformed `₦1000,000` |
| Epoxy `fmt()` | `(n/1000).toFixed(0) + "k"` | ₦13,500 renders as ₦14k; ₦999,999 as the malformed `₦1000k` |
| Solar `fmt()` | same k-pattern | ₦12,500 renders as ₦13k; same malformed boundary |
| `nairaShort()` | `Math.round(value/1000) + "k"` | ₦1,500 renders as ₦2k; millions/billions round to one decimal |
| `naira()` | `Math.round` to whole naira | Kobo never shown; acceptable for NGN |
| Cost estimator | `toLocaleString()` with no locale | Grouping follows the visitor's browser locale, so a non-NG locale can render 1,50,000 |
| Cost estimator | `totalPriceNgn / 1450` | USD figure uses a fixed, undated divisor |
| Import estimator | custom `naira()` with `en-NG` | Different implementation from the rest of the site |
| All surfaces | 5+ independent price tables and 4+ formatters | No single source of truth; a change must be made in several files |

**Recommendation:** one `money.ts` with a single formatter (en-NG, whole naira, no boundary bug), one `pricing.ts` config keyed by service ID with `effective_from`, and derived totals instead of hard-typed totals.

---

## 9. Unresolved decisions (owner input required)

**Blocking — must be decided before any price is approved**

1. Which CAC total is canonical for LLC: 85,000 or 95,000?
2. Are TIN and SCUML included in the LLC service fee or sold separately?
3. Is express a flat 25,000 or 40% of the service fee?
4. Is newspaper publication included in NGO/trustee fees or passed through at cost?
5. Are "legal consultation", "corporate attorney" and "trademark consultation" real services with a named provider? If not, they must be removed.
6. Should solar keep the three bands or the five discrete systems?
7. Should epoxy keep flat packages or per-m² pricing? If packages stay, what are the area caps and location zones?
8. Are the epoxy and solar prices inclusive of installation labour, transport and commissioning?
9. Is the import clearing charge flat, percentage, or both?
10. What is the single FX policy — source, update frequency, display?
11. Does "free domain" include renewal, and for how long?
12. Is web/digital a Haritech division? If yes, it needs a service page; if no, remove it from the estimator.

**Evidence to obtain**

13. CAC official fee schedule with date (all six entity types).
14. NCS tariff/HS references and current VAT/levy treatment.
15. Supplier quotes: solar panels, inverters, batteries, epoxy resin and pigment.
16. Labour rates: installer day rate, epoxy crew rate, developer/designer day rate.
17. Freight, terminal, agency, haulage and insurance rate cards.
18. Courier and stamp supplier quotes.
19. Grid tariff band and date for the solar savings calculator.
20. Competitor benchmarks with URL and date (none collected in this phase).

**Product and presentation**

21. Should the Project Hub demo be labelled as sample data or replaced with anonymised aggregates?
22. Should named fictional clients be removed?
23. Should claims (zero-downtime, 5-year warranty, 12,500 PSI, Tier-1, 2× speed) be removed until substantiated?
24. Should the quote form add a below-₦100,000 band and a "prefer not to say" option?
25. Should admin price fields become numeric with null-for-unknown and an audit trail?

---

## 10. Files created and non-change confirmation

Created in this phase:

```
pricing/PRICING_INVENTORY.md
pricing/PROPOSED_MASTER_CATALOGUE.csv
pricing/PRICING_GOVERNANCE_ISSUE_REPORT.md
```

Referenced from Phase 1 (unchanged):

```
pricing-audit.csv
```

Confirmed:

- No application code was edited.
- No displayed or published price was changed.
- The estimator's calculation behaviour is unchanged.
- No database record was inserted, updated or deleted.
- No Supabase query was executed.
- Nothing was built, deployed or published.
- `git status` adds only `pricing/` and the Phase 1 `pricing-audit.csv`. It also still lists the 14 uncommitted disclaimer-copy edits and earlier untracked artefacts from before this task; none of those were opened for writing in this phase.

**The review materials are complete. No price will be implemented until the owner gives explicit approval.**
