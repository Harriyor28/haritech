# Haritech Pricing System — Phase 3 Implementation Review

**Date:** 2026-10-28
**Business:** Haritech Exclusive Business — “Smart Tech, Smart Living.”
**Scope:** full pricing-system review against the owner's Phase 3 master price register.
**Mode:** Phase 3 was a read-only review. The owner approved implementation on 2026-10-28; the resulting code changes are recorded in §11 (Phase 4 implementation). No database record, migration or deployment was touched.
**Companion draft:** `pricing/drafts/proposed-prices.json` (67 services, 66 priced, 1 unpriced), `pricing/drafts/validate-draft.mjs`, `pricing/drafts/README.md`.
**Previous phases:** `pricing-audit.csv` (116 rows), `pricing/PRICING_INVENTORY.md`, `pricing/PROPOSED_MASTER_CATALOGUE.csv`, `pricing/PRICING_GOVERNANCE_ISSUE_REPORT.md`.

---

## 0. Executive summary

- The live site has **five independent price engines** and **no single source of truth**. Every price is a hard-coded constant inside a React component.
- Only **four calculator components** display prices. No service page, product card, quotation PDF or checkout prints a price. Printing, cyber café, interior design, project supervision and business consultation have **no price display at all**.
- The owner's register introduces **five previously unpriced divisions** (printing, cyber café, interior, project services, business consultation) and **replaces** the old web, solar, epoxy and CAC structures. That is a product/UI change, not only a number change.
- **67 services** are recorded in the draft: 66 priced, 1 deliberately blank (online consultation).
- Existing items have **no proposed replacement** and need an explicit retire-or-reprice decision: MFB registration, CAC stamp, CAC courier, SCUML, solar IoT, solar roof rails, three epoxy add-ons, epoxy location multipliers, epoxy flat packages and web hosting/domain.
- The largest commercial jumps are solar **+98% to +314%**, epoxy solid **+289%**, and web starter **+133%**. The largest reductions are CAC LLC **−35% to −42%** and foreign company **−38%**.
- The register contains a deliberate-looking **price inversion in epoxy**: Solid (₦35,000) now costs more than Metallic (₦30,000), and Flake (₦40,000) costs more than Marble (₦35,000). Prices are preserved exactly as supplied and flagged in §3.
- No test framework exists (`package.json` has `dev`, `build`, `preview` only). Testing is therefore a written plan plus a dependency-free validator; no suite was wired in.
- Nothing is approved. `activation.active` is `false` and every `effective_date` is `null`.

---

## 1. Existing price locations found in the codebase

### 1.1 Price-bearing files

| # | File | Lines | What is defined | Reached from |
|---|---:|---|---|---|
| 1 | `src/components/haritech/HaritechCostEstimator.tsx` | 25–143 | 4 services × 3 tiers + 13 add-ons | Inline on `/haritech`; global estimator button on all `/haritech/*` pages |
| 2 | `src/components/haritech/CACFeeEstimator.tsx` | 27–113 | 6 entity types (government + service fee), express rule, stamp, courier, formatter | `/haritech/cac-registration` |
| 3 | `src/components/haritech/SolarSavingsCalculator.tsx` | 26–44 | 5 system prices, ₦100/kWh tariff, formatter | `/haritech/solar-energy` |
| 4 | `src/components/haritech/EpoxyCoverageCalculator.tsx` | 29–50 | 6 finish rates, prep, topcoat, 4 location multipliers, formatter | `/haritech/3d-epoxy` |
| 5 | `src/components/haritech/ImportLandedCostEstimator.tsx` | 21–50, 54–58 | 2 fixed freight charges, 4 duty bands, VAT/levy/insurance/clearing rates, FX default | `/haritech/importation` |
| 6 | `src/pages/haritech/RequestQuote.tsx` | 44–51 | 5 budget bands + “Not Sure” | `/haritech/request-quote` |
| 7 | `src/utils/haritechContent.ts` | 297–310, 934 | Pre-order `deposit` / `landed` free-text fields; `preOrders: []` | `/haritech/importation`, admin |
| 8 | `src/components/admin/HaritechImportationManager.tsx` | 367, 371 | Free-text deposit and landed placeholders | `/admin` |
| 9 | `src/components/admin/HaritechClientProjectsManager.tsx` | 334, 338 | Numeric budget and spent fields | `/admin` |
| 10 | `src/components/admin/HaritechPortalManager.tsx` | 166, 173 | Optional approval amount | `/admin` |
| 11 | `src/components/haritech/ProjectHubModules.tsx` | 1294–1297 | Hard-coded demo quotations ₦9.4m, ₦41.2m, ₦420,000 | `/haritech/project-management` |
| 12 | `src/utils/haritechProperty.ts` | 167–459 | Demo budgets, rents, work orders, approvals | `/haritech/project-management` |
| 13 | `supabase/schema.sql` | 190, 191, 250 | `budget_naira`, `spent_naira`, `amount_naira` | Admin / client portal |

### 1.2 What does **not** exist

- **No `src/config/` directory** and no central pricing module.
- **No price table** in `supabase/schema.sql`. Prices are not stored; only operator-entered project budgets and approval amounts.
- **No test files** (`**/*.{test,spec}.*`) and no Vitest/Jest config.
- **No price display on service pages.** A repository-wide search for `₦` found matches only in the four calculators, the quote form, the demo hub, admin placeholders and formatters. Printing, cyber café, interior, project supervision and business consultation have no price text anywhere.
- **No supplier quote, invoice, BOM, labour rate or time study** in the repository.
- **No effective date, revision history or currency-date** attached to any price.

### 1.3 Calculation paths (as they exist today)

| Surface | Formula | Notes |
|---|---|---|
| Cost estimator | `tier.baseNgn + Σ selectedAddons.priceNgn` | No duplicate/inclusion guard. Every selected add-on is added. |
| Cost estimator USD | `totalPriceNgn / 1450` | Fixed, undated divisor. |
| CAC fee tool | `govFee + serviceFee + (express ? round(serviceFee * 0.4) : 0) + stamp 5,000 + courier 8,000` | Express is 40% of the **service** fee, not the total. |
| Solar savings | `monthlyKwh = bill / 100`; `payback = basePrice / annualSaving` | Tariff hard-coded. |
| Epoxy | `(area × finishRate + area × 2,500 + area × 1,500) × locationMultiplier` | Prep and topcoat always added. `space` never used in price. |
| Import | `CIF = (fob + freight) × fx`; duty on CIF; levy 1% of CIF; VAT 7.5% of (CIF + duty + levy); insurance 0.75% of (FOB + freight); clearing 1% of CIF; plus flat 450,000/260,000 | Flat charge already contains “clearing”; the 1% is a second clearing charge. |

---

## 2. Current prices and proposed replacements

All proposed values are reproduced exactly from the owner register. “Delta” is arithmetic only; it is not an endorsement. Lifecycle status is **DRAFT** for every row; the evidence gate is shown in the last column.

### 2.1 Web & digital services

| ID | Service | Current | Proposed | Delta | Gate |
|---|---|---:|---:|---:|---|
| WEB-001 | Business landing page / brand website | ₦150,000 | ₦350,000 | +₦200,000 (+133%) | COST EVIDENCE NEEDED |
| WEB-002 | Dynamic corporate portal / e-commerce | ₦350,000 | ₦600,000 | +₦250,000 (+71%) | COST EVIDENCE NEEDED |
| WEB-003 | Custom SaaS / cloud architecture | ₦750,000 | ₦750,000 | 0 | COST EVIDENCE NEEDED |
| WEB-004 | Advanced SEO / Google indexing add-on | ₦50,000 | ₦50,000 | 0 | COST EVIDENCE NEEDED |
| WEB-005 | Brand identity / logo kit add-on | ₦40,000 | ₦50,000 | +₦10,000 (+25%) | COST EVIDENCE NEEDED |
| WEB-006 | Maintenance and server backups | ₦80,000 per **year** | ₦25,000 per **month** | ₦300,000/year (+275%) | COST EVIDENCE NEEDED |
| WEB-007 | Fast-track priority delivery add-on | ₦60,000 | ₦60,000 | 0 | COST EVIDENCE NEEDED |

### 2.2 Business registration and CAC assistance

| ID | Service | Current | Proposed | Delta | Gate |
|---|---|---:|---:|---:|---|
| CAC-001 | Business Name package | ₦35,000 (both tools) | ₦30,000 | −₦5,000 (−14%) | OFFICIAL FEE VERIFICATION NEEDED |
| CAC-002 | LLC package | ₦85,000 (estimator) / ₦95,000 (fee tool) | ₦55,000 | −₦30,000 / −₦40,000 | OFFICIAL FEE VERIFICATION NEEDED |
| CAC-003 | NGO package | ₦195,000 (estimator) / ₦75,000 (fee tool) | ₦95,000 | −₦100,000 / +₦20,000 | OFFICIAL FEE VERIFICATION NEEDED |
| CAC-004 | Incorporated Trustees package | ₦195,000 (estimator) / ₦70,000 (fee tool) | ₦120,000 | −₦75,000 / +₦50,000 | OFFICIAL FEE VERIFICATION NEEDED |
| CAC-005 | Foreign company assistance | ₦240,000 (fee tool only) | ₦150,000 | −₦90,000 (−38%) | OFFICIAL FEE VERIFICATION NEEDED |
| CAC-006 | Express processing add-on | ₦25,000 flat / 40% of service fee | ₦30,000 | +₦5,000 vs flat | OFFICIAL FEE VERIFICATION NEEDED |

### 2.3 Solar energy

| ID | Package | Current (system list / estimator band) | Proposed | Delta vs list | Delta vs band | Gate |
|---|---|---:|---:|---:|---:|---|
| SOL-001 | 1.5 kVA Essential | ₦480,000 / ₦480,000 | ₦950,000 | +₦470,000 (+98%) | +₦470,000 | COST EVIDENCE NEEDED |
| SOL-002 | 3.5 kVA Home Pro | ₦950,000 / ₦1,100,000 | ₦2,500,000 | +₦1,550,000 (+163%) | +₦1,400,000 (+127%) | COST EVIDENCE NEEDED |
| SOL-003 | 5 kVA Executive | ₦1,400,000 / ₦1,100,000 | ₦3,400,000 | +₦2,000,000 (+143%) | +₦2,300,000 (+209%) | COST EVIDENCE NEEDED |
| SOL-004 | 10 kVA Commercial | ₦2,200,000 / ₦2,900,000 | ₦6,700,000 | +₦4,500,000 (+205%) | +₦3,800,000 (+131%) | COST EVIDENCE NEEDED |
| SOL-005 | 20 kVA Industrial | ₦3,800,000 / ₦2,900,000 | ₦12,000,000 | +₦8,200,000 (+216%) | +₦9,100,000 (+314%) | COST EVIDENCE NEEDED |
| SOL-006 | Site survey / energy assessment | not priced | ₦10,000 | new | new | READY FOR OWNER REVIEW |
| SOL-007 | Solar system maintenance | not priced | ₦50,000 | new | new | READY FOR OWNER REVIEW |
| SOL-008 | Lithium battery upgrade | ₦250,000 | ₦500,000 | +₦250,000 (+100%) | — | COST EVIDENCE NEEDED |
| SOL-009 | Inverter upgrade / replacement | not priced | ₦500,000 | new | new | COST EVIDENCE NEEDED |
| SOL-010 | Panel upgrade / addition | not priced | ₦200,000 | new | new | COST EVIDENCE NEEDED |

### 2.4 Epoxy flooring

| ID | Finish | Current | Proposed | Delta | Gate |
|---|---|---:|---:|---:|---|
| EPO-001 | Solid Colour Gloss | ₦9,000/m² + prep + topcoat | ₦35,000/m² | +₦26,000 (+289%) | COST EVIDENCE NEEDED |
| EPO-002 | Decorative Flake | ₦12,000/m² + prep + topcoat | ₦40,000/m² | +₦28,000 (+233%) | COST EVIDENCE NEEDED |
| EPO-003 | Metallic Sheen | ₦18,000/m² + prep + topcoat | ₦30,000/m² | +₦12,000 (+67%) | COST EVIDENCE NEEDED |
| EPO-004 | 3D Marble Vein | ₦22,000/m² + prep + topcoat | ₦35,000/m² | +₦13,000 (+59%) | COST EVIDENCE NEEDED |
| EPO-005 | Glow-in-the-Dark | ₦28,000/m² + prep + topcoat | ₦40,000/m² | +₦12,000 (+43%) | COST EVIDENCE NEEDED |
| EPO-006 | 3D Art / Mural | ₦45,000/m² + prep + topcoat | ₦65,000/m² | +₦20,000 (+44%) | COST EVIDENCE NEEDED |
| EPO-007 | Surface preparation (standalone) | ₦2,500/m², added to every job | ₦45,000/m², standalone only | not comparable | COST EVIDENCE NEEDED |
| EPO-008 | UV topcoat (standalone) | ₦1,500/m², added to every job | ₦55,000/m², standalone only | not comparable | COST EVIDENCE NEEDED |

The standalone rates are **not** a 1,700% / 3,567% surcharge: under the old model they were always added; under the new model they are excluded from every standard finish. The draft enforces `standalone_only: true` on both.

### 2.5 Importation and pre-order

| ID | Service | Current | Proposed | Gate |
|---|---|---:|---:|---|
| IMP-001 | Product sourcing service | not priced | ₦10,000 | COST EVIDENCE NEEDED |
| IMP-002 | Pre-order / order handling | not priced (`preOrders: []`) | ₦5,000 | COST EVIDENCE NEEDED |
| IMP-003 | Supplier verification | not priced | ₦10,000 | COST EVIDENCE NEEDED |
| IMP-004 | Cargo consolidation coordination | not priced | ₦50,000 | COST EVIDENCE NEEDED |
| IMP-005 | Goods inspection coordination | not priced | ₦20,000 | COST EVIDENCE NEEDED |
| IMP-006 | Importation consultation / advisory | not priced | ₦20,000/session | COST EVIDENCE NEEDED |
| IMP-007 | Clearing coordination, large/complex only | not modelled | ₦500,000 conditional | COST EVIDENCE NEEDED |

Current import behaviour is replaced rather than repriced: flat **₦450,000 sea / ₦260,000 air**, **1% clearing on CIF**, and hard-coded FX **1,500** (import) / **1,450** (cost estimator) do not appear in the new register. The register substitutes a variable freight formula and itemised third-party costs.

### 2.6 Business consultation

| ID | Service | Current | Proposed | Gate |
|---|---|---:|---:|---|
| BUS-001 | Basic business consultation | not priced | ₦20,000/session | READY FOR OWNER REVIEW |
| BUS-002 | Business plan preparation | not priced | ₦20,000/plan | READY FOR OWNER REVIEW |
| BUS-003 | Importation advisory | not priced | ₦20,000/session | READY FOR OWNER REVIEW |
| BUS-004 | Business documents / proposal | not priced | ₦150,000 | READY FOR OWNER REVIEW |
| BUS-005 | Online consultation | not priced | **unpriced** | DRAFT |

### 2.7 Printing, cyber café, interior, project services — all new

| ID | Service | Proposed | ID | Service | Proposed |
|---|---|---:|---|---|---:|
| PRT-001 | Business card | ₦500 | CYB-001 | Typing | ₦500 |
| PRT-002 | Flyer | ₦200 | CYB-002 | B&W print/copy | ₦300 |
| PRT-003 | Poster | ₦1,000 | CYB-003 | Colour printing | ₦500 |
| PRT-004 | Banner | ₦1,000 | CYB-004 | Scanning | ₦500 |
| PRT-005 | Branded T-shirt | ₦2,500 | CYB-005 | Internet / computer use | ₦2,000 |
| PRT-006 | Logo design | ₦20,000 | CYB-006 | Online registration assistance | ₦3,000 |
| PRT-007 | Large-format printing | ₦20,000 | CYB-007 | CV preparation | ₦5,000 |
| INT-001 | Interior consultation | ₦10,000 | PRJ-001 | Project supervision | ₦50,000 |
| INT-002 | Space planning | ₦10,000 | PRJ-002 | Procurement coordination | ₦50,000 |
| INT-003 | 3D interior render | ₦20,000 | PRJ-003 | Feasibility study | ₦50,000 |
| INT-004 | Installation / coordination | ₦20,000 | PRJ-004 | Project planning | ₦50,000 |
| INT-005 | Wall décor design | ₦20,000 | PRJ-005 | Site visit / inspection | ₦20,000 |

None of these has a current code location. Activating them requires **new UI**, not a constant swap.

### 2.8 Items with no proposed replacement

| Existing item | Current | Consequence if the register is activated as-is |
|---|---:|---|
| Microfinance Bank registration (`CBN MFB`) | ₦300,000 | Service disappears |
| CAC company stamp | ₦5,000 | Add-on disappears; package inclusions do not mention it |
| CAC courier | ₦8,000 | Add-on disappears |
| SCUML support | ₦35,000 | Declared “separate” but **no new price supplied** |
| CAC TIN add-on | ₦20,000 | Correctly absorbed into packages; must not remain purchasable |
| Solar IoT monitoring | ₦45,000 | Add-on disappears |
| Solar roof rails | ₦65,000 | Add-on disappears |
| Epoxy metallic pigment add-on | ₦60,000 | Add-on disappears (artwork now in finish price) |
| Epoxy anti-slip add-on | ₦35,000 | Add-on disappears |
| Epoxy vapour barrier add-on | ₦55,000 | Add-on disappears |
| Epoxy flat packages | ₦220,000 / ₦650,000 / ₦1,450,000 | Replaced by per-m² only; no “from” package remains |
| Epoxy location multipliers | 1.0 / 1.1 / 1.2 / 1.35 | Not mentioned; would silently disappear |
| Web hosting, domain renewal, content, third-party fees | not priced | Still unpriced |
| Import duty/VAT/levy/insurance/FX defaults | 5/10/20/35%, 7.5%, 1%, 0.75%, ₦1,500 | Remain third-party; no verified source supplied |

---

## 3. Duplicate prices and conflicting calculations

### 3.1 Conflicts that exist today

| # | Conflict | Evidence | Impact |
|---|---|---|---|
| C1 | LLC quoted at two totals | ₦85,000 estimator vs ₦95,000 fee tool | Customer sees different prices on two pages |
| C2 | NGO quoted at two totals | ₦195,000 vs ₦75,000 | **₦120,000** spread |
| C3 | Trustees quoted at two totals | ₦195,000 vs ₦70,000 | **₦125,000** spread |
| C4 | Express model differs | Flat ₦25,000 vs 40% of service fee | ₦10,000–₦100,000 depending on entity |
| C5 | Solar prices differ | Calculator vs band at 4 of 5 sizes | Up to **₦900,000** spread at 20 kVA |
| C6 | Solar unit curve is non-monotonic | 3.5 kVA ₦271,429/kVA; 5 kVA ₦280,000/kVA | Larger system costs more per kVA |
| C7 | Epoxy packages below the calculator floor | ₦8,125–₦9,667/m² vs ₦13,000 minimum all-in | Packages are 26–37% below the cheapest calculator rate |
| C8 | Epoxy volume curve inverted | 80 m² package cheaper per m² than 25 m² | Larger job priced lower per unit |
| C9 | Epoxy “150+ m²” unbounded | No upper area | At 300 m² the implied rate falls to ~₦4,833/m² |
| C10 | Two FX rates | ₦1,500 vs ₦1,450 | 3.4% divergence, no date |
| C11 | Flat import charge overlaps 1% clearing | ₦450,000/₦260,000 already includes “clearing” | Same activity charged twice |
| C12 | Duty ranges snap upward | “5–20%” becomes 20% | Overstates duty without disclosure |
| C13 | Maintenance sold annually but described as one-off | ₦80,000 “1-Year” add-on | Recurring cost presented as a one-time line |
| C14 | Formatter boundary bug | `(999999/1000).toFixed(0) + ",000"` → `₦1000,000` | Malformed price display |
| C15 | Four formatters, one locale bug | `toLocaleString()` with no locale in the estimator | Non-NG browsers can render `1,50,000` |

### 3.2 Conflicts introduced or left open by the new register

| # | Item | Observation | Action |
|---|---|---|---|
| N1 | **Epoxy inversion** | Solid ₦35,000 > Metallic ₦30,000; Flake ₦40,000 > Marble ₦35,000 | Prices preserved exactly. **Owner must confirm this is intentional.** If not, it is a one-line change per finish before approval. |
| N2 | Epoxy standalone rates | ₦45,000 prep and ₦55,000 topcoat are higher per m² than most finishes | Only defensible as standalone services; the draft enforces that. Confirm the standalone scope is real. |
| N3 | Solar increase vs specification | 1.5 kVA rises 98%; 20 kVA rises 216% | No BOM exists to justify the curve. Confirm the specification changed with the price. |
| N4 | Solar upgrades | Lithium ₦500,000, inverter ₦500,000, panel ₦200,000 | Hardware inclusion is unconfirmed. The register says not to assume hardware is included. |
| N5 | CAC package vs official fee | Package prices embed an official CAC fee, but the fee is not cited | Must not be labelled “official CAC fee”. Verify before publishing. |
| N6 | SCUML | Register says “SCUML charges are separate” but gives no amount | SCUML becomes **unpriced**, not free. |
| N7 | CAC stamp/courier | Present today, absent from register | Retire or reprice explicitly. |
| N8 | Business plan vs proposal | ₦20,000 plan vs ₦150,000 proposal | 7.5x gap with no scope definition. |
| N9 | Import consultation vs advisory | IMP-006 and BUS-003 both ₦20,000/session | Either the same service (one ID) or two services with different deliverables. |
| N10 | Solar maintenance vs free contract | ₦50,000 maintenance vs “2-Year Free Maintenance Contract” in the 10–20 kVA tier | The free claim must be removed or scoped, otherwise the paid price is contradictory. |
| N11 | Web add-ons vs inclusions | SEO add-on vs “Basic SEO Setup”; brand kit vs portal branding | Add-ons must be disabled when included. |
| N12 | Printing/cyber prices below plausible production cost | ₦200 flyer, ₦300 B&W print, ₦500 card | Units are unconfirmed; these are “starting from” references only. |

---

## 4. Services missing confirmed units or inclusions

**40 of 67 entries have `unit_confirmed: false`.** The register specifies units only where it says “per project”, “per month”, “per session”, “per plan” or “per m²”.

| Category | Missing units | Detail |
|---|---|---|
| Web | 3 | SEO, brand kit, rush: per project, per add-on or per month not stated |
| CAC | 1 | Express: per application not stated |
| Solar | 5 | Survey (per visit/system), maintenance (per visit/system/contract), lithium/inverter/panel upgrades (scope and hardware not stated) |
| Import | 6 | Sourcing, pre-order handling, supplier verification, consolidation, inspection, clearing coordination: per order, shipment, consignment or supplier not stated |
| Business | 1 | Documents/proposal: per document or project not stated. Online consultation has a unit (session) but no price. |
| Printing | 7 | Per piece, sheet, m², design or order — all unstated |
| Cyber | 7 | Per page, side, document, hour or session — all unstated |
| Interior | 5 | Per session, room, render, wall or project — all unstated |
| Project | 5 | Per day, visit, report or project — all unstated |

**Inclusions that are asserted but not defined**

- Web: page limit, revisions, support period, content responsibility, hosting/domain term.
- CAC: which official fee sits inside each package; what “TIN assistance where applicable” means; what express actually covers.
- Solar: battery chemistry and kWh, inverter rating, panel wattage, accessories, warranty, transport zone.
- Epoxy: minimum project size, repairs, moisture mitigation, travel, special surfaces, design fee for murals.
- Import: chargeable-weight rules (actual vs volumetric), minimum weight, rounding, surcharges, qualifying definition for the ₦500,000 fee.
- Business: session length, plan depth, revision rounds, proposal scope.
- Printing: design-versus-print split, minimum quantities, finishing.
- Cyber: official fee separation (registration assistance).
- Interior/project: third-party purchases, travel, number of visits, deliverable format.

---

## 5. Variable pricing requiring a live quote or manual input

| Area | Variable input | Current behaviour | Required behaviour |
|---|---|---|---|
| Sea/air freight | Chargeable kg × USD/kg × FX | Flat ₦450,000/₦260,000 | Formula with visible inputs, quote timestamp, “pending freight quote” when missing |
| FX | USD/NGN rate | Hard-coded 1,500 / 1,450 | Authorised manual input or approved source; never hard-coded |
| Clearing coordination | Shipment category + authorisation | Not modelled | Add ₦500,000 only when qualifying and authorised |
| Customs duty | HS code / tariff band | 4 fixed bands, ranges snap up | HS lookup or explicit disclosure of the band assumption |
| Solar transport | Distance from service area | Not modelled | Actual location cost; no guessed charge |
| Solar upgrades | Hardware specification | Flat add-ons | Confirm hardware inclusion before quoting |
| Epoxy substrate | Repairs, moisture, condition | Fixed prep on every m² | Site assessment; conditional lines |
| Epoxy travel | Location | 4 multipliers | Confirm or remove; if kept, document the cost basis |
| Web scope | Pages, integrations, content, revisions | Fixed package | Quote after discovery; pass through domain/hosting/licences |
| Printing | Quantity, size, material, finishing | None | Quote from job details; starting price only |
| Interior | Size, renders, materials | None | Quote per project |
| Project services | Duration, visits, travel, deliverables | None | Quote per project/day |
| Discounts | Any | None approved | No automatic discount; authorised exception only |

The freight formula must retain, per quotation: **FX rate, quote date/time, chargeable weight, USD/kg rate and naira amount**. Recalculation happens only when an input changes; stored quotes are immutable.

---

## 6. Potential double-charging risks

| # | Risk | Where it can happen | Guard to implement |
|---|---|---|---|
| D1 | Web add-on already included in the package | SEO vs “Basic SEO”; brand kit vs portal branding | `includedAddons[]` per tier; disable and explain |
| D2 | Maintenance sold twice | Annual add-on plus a new monthly line | One recurring line only; unit `month` |
| D3 | CAC TIN charged after being included | LLC package includes TIN; old ₦20,000 add-on | Remove from purchasable add-ons |
| D4 | CAC registration assistance charged again | ₦20,000 is inside every package | `registrationAssistanceIncluded: true`; no separate line |
| D5 | SCUML charged when it is “separate” | Package exclusions vs add-on | Keep separate, price it, and never list it as included |
| D6 | Express stacked twice | Estimator add-on and fee-tool urgency flag | Single urgency enum, additive once |
| D7 | Epoxy prep/topcoat added to a finish | Old calculator always adds both | `prepIncluded` / `topcoatIncluded`; lock standalone rates when a finish is selected |
| D8 | Solar installation added to a package | Existing estimator has no install line; new one might | `installationIncluded: true`; block install add-on |
| D9 | Solar lithium upgrade on a package that already includes lithium | Tiers 2–3 describe lithium | `includesLithium` flag; block upgrade |
| D10 | Import consultation and advisory charged together | IMP-006 and BUS-003 | Shared service ID or `mutuallyExclusiveWith` |
| D11 | Clearing coordination read as duty, or added twice | ₦500,000 plus itemised clearing | Separate third-party lines; conditional gate |
| D12 | Project supervision + interior coordination on one job | PRJ-001 and INT-004 | Mutually exclusive unless both scopes are documented |
| D13 | Procurement coordination + import sourcing | PRJ-002 and IMP-001 | One coordination fee per order unless scopes differ |
| D14 | Business plan + proposal documents | BUS-002 and BUS-004 | Define the boundary; block both on one deliverable |
| D15 | Interior render + epoxy 3D art | INT-003 and EPO-006 | Different deliverables; confirm, do not bundle silently |

The estimator currently has **no guard at all**: `selectedAddons.forEach(... price += addon.priceNgn)` adds everything selected, including duplicates of included work.

---

## 7. Files and components that would need modification

**Nothing below has been changed.** This is the planned change surface after approval.

### 7.1 New files (single source of truth)

| File | Purpose | Risk |
|---|---|---|
| `src/config/pricing.ts` | Typed catalogue keyed by the 67 IDs: price, currency, unit, pricing type, inclusions, exclusions, add-ons, status, effective date | Low; new file |
| `src/utils/money.ts` | One `en-NG` formatter, whole naira, fixes the `₦1000k` boundary bug | Low; must replace four local formatters |
| `src/config/pricing.types.ts` | Shared types for the catalogue and quote inputs | Low |

### 7.2 Existing files to change

| File | Change | Risk |
|---|---|---|
| `HaritechCostEstimator.tsx` | Read tiers/add-ons from config; add inclusion guards; monthly maintenance label; replace `/1450` with an explicit, dated FX input or remove the USD line | **High** — most-used calculator |
| `CACFeeEstimator.tsx` | Read entity fees from config; express flat ₦30,000; TIN inclusion; SCUML separate; verify official-fee labels; fix `fmt()` | **High** — legal/financial display |
| `SolarSavingsCalculator.tsx` | Read 5 packages from config; make tariff an editable, dated input; payback uses the new prices | **High** — savings/ROI claims change |
| `EpoxyCoverageCalculator.tsx` | Read 6 finishes; prep/topcoat included; standalone mode; decide fate of `space` and multipliers; fix `fmt()` | **High** — formula change |
| `ImportLandedCostEstimator.tsx` | Replace flat charges with freight formula; FX input; conditional ₦500,000; timestamped quote; separate third-party lines | **High** — full formula rewrite |
| `RequestQuote.tsx` | Budget bands must cover ₦6.7m/₦12m; add below-₦100,000 and “prefer not to say” | Medium |
| `src/utils/haritechContent.ts` | Service descriptions/inclusions for new divisions; pre-order numeric fields | Medium |
| `HaritechImportationManager.tsx` | Numeric deposit/landed with currency and unit | Medium |
| `HaritechClientProjectsManager.tsx` | Null-for-unknown budget/spent; validation | Medium |
| `HaritechPortalManager.tsx` | Null-for-unknown approval amount | Medium |
| New service pages/cards (printing, cyber, interior, project, consultation) | Price display with “starting from” labels | Medium; **new UI, not a repricing** |
| `package.json` | Add test script and Vitest devDependency | Low; only after approval |
| `supabase/schema.sql` + migration | Only if quotations are to be persisted; `pricing_version`, immutable snapshots | **High**; approval-gated |

### 7.3 Files explicitly out of scope

- `ProjectHubModules.tsx` and `haritechProperty.ts` (demo hub figures) — untouched; separate content decision.
- Any deployment configuration, Supabase row, or production data.
- Unrelated pages and business logic.

### 7.4 Migration approach

1. Create `pricing.ts` with the **current** values first, and prove the UI renders identically (characterisation test).
2. Switch each component to the config in a separate, reversible commit.
3. Only then change values to the approved register.
4. Keep a `pricingVersion` on every quote so historical values remain auditable.
5. Never recalculate an existing quotation or completed order.

---

## 8. Proposed tests and rollback plan

### 8.1 Test infrastructure

There is **no test framework** in `package.json` and no test config. Adding Vitest is a code change and therefore deferred. The dependency-free validator in `pricing/drafts/validate-draft.mjs` is the only executable check delivered now:

```powershell
node .\pricing\drafts\validate-draft.mjs
```

It confirms 67 unique IDs, 66 prices, 1 blank price, valid statuses, valid currency and no premature effective dates.

### 8.2 Test plan for the implementation phase

| ID | Scenario | Expected |
|---|---|---|
| T01 | Catalogue snapshot | 67 IDs; 66 priced; BUS-005 null; no duplicates |
| T02 | Register fidelity | Every rendered price equals `pricing.ts` exactly |
| T03 | Currency and unit display | `en-NG`, whole naira; `₦27,500` not `₦28,000`; `₦999,999` not `₦1000,000` |
| T04 | Starting-price labels | Printing/cyber/interior/project show “starting from”, not a fixed price |
| T05 | Missing unit | A service with `unit_confirmed:false` cannot produce a final total; shows “confirm details” |
| T06 | Freight formula | 100 kg × $5/kg × ₦1,500 = ₦750,000, with FX, timestamp, weight and rate displayed |
| T07 | Missing freight rate | Shows “pending freight quote”; no number is invented |
| T08 | FX change | Changing FX recalculates; a stored quote keeps its original inputs |
| T09 | Epoxy finish + prep | Selecting a finish never adds the ₦45,000 standalone prep |
| T10 | Standalone prep | Charged once when no finish is selected |
| T11 | Standalone topcoat | Charged once when no finish is selected |
| T12 | Solar installation | Included exactly once; no install add-on appears |
| T13 | CAC assistance | ₦20,000 never appears as a separate line |
| T14 | CAC TIN/SCUML | TIN not purchasable on an inclusive package; SCUML separate and priced |
| T15 | Clearing coordination | Not added by default; added once only for a qualifying, authorised shipment |
| T16 | Third-party separation | Duty, VAT, levy, freight, insurance and storage shown outside Haritech fees |
| T17 | Discounts | No discount applies unless an authorisation flag is set |
| T18 | Historical quotes | Existing quotes and orders are byte-identical after activation |
| T19 | Responsive display | Tables/cards legible at 320, 375, 768 and 1280 px; no clipped prices |
| T20 | Backend validation | Negative price, unknown ID, wrong currency and missing unit are rejected |
| T21 | Duplicate includes | Selecting an included add-on is blocked with an explanation |
| T22 | Hard-coded price scan | No price literals remain outside `pricing.ts` |
| T23 | Admin null handling | Unknown budget/spent is `null`, not `0` |
| T24 | Duty range disclosure | “5–20%” shows the applied band and why |

Use clearly fictional test inputs. Do not treat test rates as supplier quotes.

### 8.3 Rollback plan

| Level | Change | Rollback |
|---|---|---|
| 0 | Draft files only (current state) | Delete `pricing/drafts/`; zero production impact |
| 1 | `pricing.ts` added with current values, components switched | Revert the single switch commit; behaviour returns to hard-coded constants |
| 2 | Values changed to approved register | Revert the activation commit; old constants remain in git history |
| 3 | Quotation persistence / schema migration | Restore from pre-migration backup; run the down-migration; historical quotes are untouched because they store their own `pricingVersion` |

**Before any approved production change:** tag the commit, export the affected tables, and record the live constants in `pricing-audit.csv`. No destructive migration, no deletion of quotations or orders.

---

## 9. Questions requiring owner decisions

### Blocking — price and unit

1. **LLC ₦55,000**: the old estimator said ₦85,000 and the fee tool ₦95,000. Is ₦55,000 the intended package price, and does it still cover the official fee plus service time?
2. **CAC packages**: what official CAC fee is inside each of the five package prices, and on what date was it verified?
3. **SCUML**: it is “separate” but no price was supplied. What is the SCUML price and scope?
4. **CAC stamp and courier**: retire them, or keep them as pass-throughs? At what price?
5. **MFB registration**: the ₦300,000 service has no proposed price. Retire it or reprice it?
6. **Express**: confirm ₦30,000 is per application and state exactly what it covers. May any government-speed promise be made? (Recommended: no.)
7. **Solar upgrades** (lithium ₦500,000, inverter ₦500,000, panel ₦200,000): is hardware included, and what capacity/rating does each cover?
8. **Solar maintenance ₦50,000**: per visit, per system or per contract? Does it conflict with the “2-Year Free Maintenance Contract” claim in the 10–20 kVA tier?
9. **Solar IoT and roof rails**: retire them, or reprice them?
10. **Epoxy inversion**: Solid ₦35,000 > Metallic ₦30,000 and Flake ₦40,000 > Marble ₦35,000. Is this intentional? If not, what are the correct figures?
11. **Epoxy standalone rates**: confirm ₦45,000/m² prep and ₦55,000/m² topcoat apply only when no finish is selected.
12. **Epoxy minimums**: what is the minimum project size, and how are repairs, moisture mitigation, travel and special surfaces charged?
13. **Epoxy multipliers and surface types**: keep the 1.0/1.1/1.2/1.35 location multipliers and the floor/wall/countertop selector, or drop them?
14. **Epoxy add-ons**: retire metallic pigment (₦60,000), anti-slip (₦35,000) and vapour barrier (₦55,000), or reprice them?
15. **Epoxy flat packages**: confirm they are retired in favour of per-m², or keep them as “from” examples with area caps.
16. **Web effort**: what internal day rate or hour estimate supports ₦350,000 / ₦600,000 / ₦750,000? This is needed to test margin.
17. **Web maintenance**: confirm ₦25,000/month (₦300,000/year), the included support hours and the response time.
18. **Web “free domain”**: remove the claim, or state the included term and renewal price?
19. **Printing units**: per piece, sheet, m², design or order? Does ₦500 for a card and ₦200 for a flyer include design, printing or both?
20. **Cyber units**: per page, side, document, hour or session? Is internet use per hour or per session?
21. **Interior units**: per session, room, render or project? How many renders and revisions are included?
22. **Project units**: per day, visit, report or project? Is travel included? What is the boundary between supervision (PRJ-001) and interior coordination (INT-004)?
23. **Business documents vs plan**: why is a proposal ₦150,000 while a business plan is ₦20,000? What differs in scope?
24. **Online consultation**: supply the price. It must differ from the ₦20,000 standard rate and must not default to it.

### Import-specific

25. **Chargeable weight**: actual or volumetric? What divisor, minimum weight and rounding does the freight provider use?
26. **Freight surcharges**: fuel, security, documentation, terminal — included in USD/kg or separate?
27. **FX**: which source, how often updated, and who is authorised to override it?
28. **Qualifying shipments**: define “large or complex” for the ₦500,000 clearing coordination fee, and who authorises it.
29. **Consultation vs advisory**: are IMP-006 and BUS-003 the same service? If not, state the different deliverable.
30. **Sourcing vs pre-order handling vs consolidation**: do these overlap on one order? Which combination is chargeable?

### Product and presentation

31. **Budget bands**: may the quote form be extended above ₦2.5m to cover the ₦6.7m and ₦12m solar packages?
32. **New divisions**: should printing, cyber café, interior, project supervision and business consultation display prices publicly, or remain enquiry-only?
33. **Discounts**: is any default discount authorised? (Current answer: none — the draft applies none.)
34. **Project Hub demo and claims**: zero-downtime, 5-year warranty, 12,500 PSI, “Tier-1”, “2× speed” and the free legal/trademark claims remain unsubstantiated. Remove them, or provide terms? This is a separate content approval.

---

## 10. Non-change confirmation and files created

**Created in Phase 3**

```text
pricing/PHASE3_IMPLEMENTATION_REPORT.md      this report
pricing/drafts/proposed-prices.json          67 services, 66 priced, 1 unpriced
pricing/drafts/review-sheet.html             static review page (not in the site bundle)
pricing/drafts/signoff.csv                   per-service decision sheet (blank)
pricing/drafts/build-review.mjs              regenerates the sheet and CSV
pricing/drafts/validate-draft.mjs            dependency-free validator
pricing/drafts/README.md                     review and activation checklist
```

**Validator result**

```text
Services: 67 (priced 66, unpriced 1)
COST EVIDENCE NEEDED            30
OFFICIAL FEE VERIFICATION NEEDED 6
READY FOR OWNER REVIEW          30
DRAFT                            1
PASS — draft register is internally consistent.
Nothing is approved and nothing is active.
```

**Confirmed**

- No application code was edited.
- No website or displayed price was changed.
- No estimator formula or calculation was changed.
- No database record was read, inserted, updated or deleted.
- No Supabase query was executed.
- Nothing was built, deployed or published.
- The draft lives under `pricing/drafts/` and is not imported anywhere in `src/`.
- `git status` adds only `pricing/` (Phase 2 files plus this Phase 3 material) and the Phase 1 `pricing-audit.csv`. The 14 pre-existing uncommitted disclaimer-copy edits and earlier untracked artefacts were not touched.

**The review is complete. No price will be implemented until the owner gives explicit approval, service by service.**

> **Update — 2026-10-28:** the owner approved implementation ("implement all at a go"). Section 11 records what was actually changed. Sections 0–10 remain the Phase 3 review as written and describe the pre-implementation state.

---

## 11. Phase 4 — Implementation record

**Approval:** owner instruction, 2026-10-28 — implement the full register.
**Scope applied:** all 67 register entries plus the stated pricing rules. Anything the register does not price was left at its previous behaviour or left unpriced; no price, rate, fee, inclusion or unit was invented.
**Data/deployment:** no database migration, no schema change, no production data write, no deployment. Changes are local and uncommitted.

### 11.1 New files

| File | Purpose |
|---|---|
| `src/config/pricing.ts` | Single source of truth. 67 entries with id, category, service, price, unit, pricing type, note; category labels and order; `priceOf()` lookup; constants for express, stamp, courier, clearing coordination and the two standalone epoxy rates. |
| `src/utils/money.ts` | Shared naira formatters (`formatNaira`, `formatNairaShort`, `formatUnitPrice`) using `en-NG`, whole naira. Replaces four private `fmt()` helpers and fixes the `₦1000k` boundary bug. |
| `src/pages/haritech/PriceGuide.tsx` | Public price register: all 67 services, search, category filters, inclusions/notes, conditional and starting-price badges, disclaimers and calculator links. |

### 11.2 Modified files

| File | Change |
|---|---|
| `src/components/haritech/HaritechCostEstimator.tsx` | Rewritten as a config-driven estimator. Web (3), solar (5), CAC (5) and epoxy (6) packages come from `pricing.ts`; epoxy has an m² input. Web maintenance is shown as monthly recurring and excluded from the one-off total. Inline and modal modes both preserved. |
| `src/components/haritech/CACFeeEstimator.tsx` | Package totals replace the government/service split. Express is a flat ₦30,000. Stamp ₦5,000 and courier ₦8,000 retained as optional add-ons. Official CAC fee and the ₦20,000 assistance fee display as "Included" and are confirmed at quotation. Per-package "not included" and note blocks added. MFB stays at ₦300,000 and is labelled as outside the 2026 register. |
| `src/components/haritech/SolarSavingsCalculator.tsx` | Five package prices from the register. Editable electricity-tariff input replaces the hardcoded ₦100/kWh assumption. Package price shown as installed (installation included). |
| `src/components/haritech/EpoxyCoverageCalculator.tsx` | Six finish rates from the register. Standard finish rate already includes surface preparation and UV topcoat, so neither is added again. Standalone prep (₦45,000/m²) and topcoat (₦55,000/m²) modes apply only when no standard finish is selected. Location uplift applied once. |
| `src/components/haritech/ImportLandedCostEstimator.tsx` | Flat ₦450,000 / ₦260,000 freight and the 1% clearing charge removed. Freight is now chargeable kg × USD/kg × FX, with weight, USD/kg and FX entered by the user. Third-party terminal, agent and delivery costs are itemised and user-entered. Optional Haritech services priced from the register. ₦500,000 clearing coordination is opt-in and conditional. Results and the quote CTA are gated until weight, USD/kg and FX are supplied. Every estimate shows FX, weight, rate, naira amount and a timestamp. |
| `src/pages/haritech/RequestQuote.tsx` | Budget bands extended with ₦2.5m–₦5m, ₦5m–₦10m and ₦10m+. |
| `src/main.tsx` | Lazy route `/haritech/price-guide`. |
| `src/layouts/HaritechLayout.tsx` | Price Guide nav item. |

### 11.3 Pricing rules as implemented

- **Solar** — every package price includes installation. No separate installation line.
- **CAC** — each package total already contains the official CAC fee and the ₦20,000 Haritech assistance fee. Neither is added twice. The official-fee split is confirmed in the quotation.
- **Epoxy** — standard finishes include surface preparation and UV topcoat. The standalone rates are a separate service, not an add-on to a finish.
- **Import** — freight is `chargeable kg × USD/kg × FX`. No FX rate and no USD/kg rate is stored in the code. The ₦500,000 clearing coordination fee appears only when the user opts in and is described as requiring written authorisation for a qualifying large or complex shipment.
- **Discounts** — none added. The register contains no approved discounts, so none are displayed.
- **Duplicates** — no price is charged twice in any calculator. Location uplift is applied once; prep/topcoat are either included or standalone.

### 11.4 Verification performed

| Check | Result |
|---|---|
| `npm run build` (`tsc && vite build`) | Passed. Bundle includes `PriceGuide`, `HaritechCostEstimator` and `money`. Only the pre-existing >500 kB chunk advisory remains. |
| `node pricing/drafts/validate-draft.mjs` | `PASS — draft register is internally consistent.` 67 services, 66 priced, 1 unpriced. |
| `pricing.ts` vs `proposed-prices.json` | 67 vs 67 entries. No missing, extra, duplicate or mismatched price. |
| Browser — Price Guide | Renders all 67 services; search and category filters work; no console errors. |
| Browser — CAC | LLC ₦55,000; LLC express ₦85,000 (₦55,000 + ₦30,000); official fee and assistance shown "Included". |
| Browser — Solar | 3.5 kVA package shows ₦2,500,000 installed; tariff input is editable. |
| Browser — Epoxy | 24 m² metallic = ₦720,000 with prep and topcoat "Included"; standalone prep = ₦1,080,000. |
| Browser — Import | 100 kg × $5/kg × ₦1,500 = ₦750,000 freight; total ₦16,888,947 with itemised third-party costs and timestamp. |
| UTF-8 scan | No replacement characters in `src/` or `pricing/`. |

### 11.5 Preserved deliberately

- MFB registration remains ₦300,000 and is labelled outside the 2026 register.
- CAC stamp ₦5,000 and courier ₦8,000 remain optional add-ons, because the existing estimator already offered them and removing them would reduce functionality.
- SCUML, CAC stamp/courier in the register, MFB, solar IoT and roof rails, the three epoxy add-ons, online consultation, and hosting/domain remain unchanged or unpriced. The Price Guide shows "Price on request" where the register has no price.
- Admin workflows, existing routes, quote submission, WhatsApp handoffs and analytics are untouched.
- No historical quote, order or stored record was rewritten.

### 11.6 Open owner questions carried forward

1. SCUML price and whether it is a pass-through.
2. Whether CAC stamp and courier should be formally added to the 2026 register.
3. Whether MFB registration is retired, repriced, or kept as a legacy quote.
4. Solar maintenance: the register prices it, but older copy promised a free service contract.
5. Price for online consultation (the single unpriced entry).
6. Confirmation of units for printing, cyber café, interior and project-supervision lines.
7. Whether the epoxy inversion (Solid above Metallic; Flake above Marble) is intentional.
8. The definition of "large or complex" for the ₦500,000 clearing coordination fee.
9. Validator warning: `IMP-001` (product sourcing) is marked as an add-on but carries its own add-ons. This is a register metadata issue, not a website defect.

### 11.7 Rollback

The implementation is isolated to three new files and eight modified files, with no schema, environment or data change.

```text
# revert modified files
git checkout -- src/components/haritech/HaritechCostEstimator.tsx \
  src/components/haritech/CACFeeEstimator.tsx \
  src/components/haritech/SolarSavingsCalculator.tsx \
  src/components/haritech/EpoxyCoverageCalculator.tsx \
  src/components/haritech/ImportLandedCostEstimator.tsx \
  src/pages/haritech/RequestQuote.tsx \
  src/main.tsx src/layouts/HaritechLayout.tsx

# remove new files
rm src/config/pricing.ts src/utils/money.ts src/pages/haritech/PriceGuide.tsx
```

Then rebuild. No database restore, cache purge or third-party rollback is required. Nothing was deployed, so production is unaffected.

### 11.8 Status

- Implementation complete and verified locally.
- Build passing; validator passing.
- Changes uncommitted; no migration, no deployment, no production data change.
- Dev server used only for verification and stopped afterwards.
