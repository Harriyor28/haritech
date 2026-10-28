# Haritech Pricing Inventory (Phase 2 — working copy)

**Status:** internal working document. No prices changed.
**Date:** 2026-10-28
**Source of record:** `pricing-audit.csv` (project root, 116 rows, generated in Phase 1). This file summarises it and maps each price to a catalogue ID.

## 1. What was inspected

| Surface | Where | Prices found |
|---|---|---|
| Global Smart Cost Estimator | inline `/haritech`; button on all `/haritech/*` pages | 4 services x 3 tiers + 13 add-ons |
| CAC fee estimator | `/haritech/cac-registration` | 6 entities x (govt + service) + express + stamp + courier |
| Solar savings calculator | `/haritech/solar-energy` | 5 system prices + tariff assumption |
| Epoxy coverage calculator | `/haritech/3d-epoxy` | 6 finishes + prep + topcoat + 4 multipliers |
| Import landed-cost estimator | `/haritech/importation` | 2 fixed charges + 4 rates + 4 duty bands + FX default |
| Pre-order pools | `/haritech/importation#import-preorder` | none seeded (`preOrders: []`) |
| Request quote | `/haritech/request-quote` | 5 budget bands (lead classification, not prices) |
| Admin | `/admin` | free-entry budget, spend, approval amount, import deposit/landed |
| Project Hub | `/haritech/project-management` | demo budgets, rent, work orders, approvals |
| Service/product pages | all | no prices (tech, printing, cyber cafe, PM, decor are enquiry-only) |

## 2. Inventory by division

| Division | Rows | Price range | Model |
|---|---:|---|---|
| Web & Digital Systems | 7 | 40,000 – 750,000 | flat package + add-ons |
| Solar & Renewable | 13 | 45,000 – 3,800,000 | flat bands + system list + add-ons |
| 3D Epoxy & Interior | 18 | 1,500/m2 – 1,450,000 | flat packages + per-m2 engine + multipliers |
| CAC Registration | 22 | 5,000 – 300,000 | two independent tools |
| Importation | 12 | 260,000 – 450,000 + percentages | formula + statutory bands |
| Quotation bands | 5 | 100,000 – 2,500,000+ | enquiry classification |
| Admin fields | 8 | operator-entered | free text/number |
| Project Hub demo | 31 | 95,000 – 420,000,000 | seed records |
| **Total** | **116** | | |

## 3. Price-bearing constants (verbatim values)

- Cost estimator: web 150,000 / 350,000 / 750,000; solar 480,000 / 1,100,000 / 2,900,000; epoxy 220,000 / 650,000 / 1,450,000; CAC 35,000 / 85,000 / 195,000.
- Add-ons: web 50,000 / 40,000 / 80,000 / 60,000; solar 250,000 / 45,000 / 65,000; epoxy 60,000 / 35,000 / 55,000; CAC 25,000 / 20,000 / 35,000.
- CAC fee tool: BN 10,000 + 25,000; LLC 30,000 + 65,000; foreign 90,000 + 150,000; MFB 50,000 + 250,000; NGO 20,000 + 55,000; trustee 20,000 + 50,000. Express = 40% of service fee. Stamp 5,000. Courier 8,000.
- Solar systems: 480,000; 950,000; 1,400,000; 2,200,000; 3,800,000.
- Epoxy: metallic 18,000/m2; marble 22,000; flake 12,000; solid 9,000; glow 28,000; art 45,000. Prep 2,500/m2. Topcoat 1,500/m2. Multipliers 1.0 / 1.1 / 1.2 / 1.35.
- Import: sea 450,000; air 260,000; VAT 7.5%; levy 1%; insurance 0.75%; clearing 1%; duty 5 / 10 / 20 / 35%; FX 1,500 (import) and 1,450 (cost estimator).
- Quote bands: 100k–250k; 250k–500k; 500k–1m; 1m–2.5m; 2.5m+.

## 4. What is missing from the inventory

- No supplier quote, invoice, bill of materials or labour rate is recorded anywhere in the repository.
- No effective date, currency-date or revision history accompanies any price.
- No hourly or day rate exists for any service.
- No recurring/hosting/domain/support price exists for web work.
- No itemised equipment cost exists for solar (only panel count and battery kWh).
- No installation labour line exists for solar or epoxy.
- No terminal, haulage, warehousing or demurrage line exists for importation.
- No competitor price was collected (search integration unavailable on 2026-10-28).

## 5. Mapping to the proposed catalogue

| Inventory group | Catalogue ID prefix |
|---|---|
| CAC | `CAC-` |
| Solar | `SOL-` |
| Epoxy | `EPO-` |
| Web | `WEB-` |
| Importation | `IMP-` |
| Quote bands | `QUOTE-` |
| Admin fields | `ADM-` |
| Project Hub demo | `HUB-` |
| Marketing claims | `CLM-` |

See `pricing/PROPOSED_MASTER_CATALOGUE.csv`.
