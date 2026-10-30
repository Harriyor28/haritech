import type { SolarAssumptions } from '../../utils/solar/types';

/* Default calculation assumptions for the Solar Advisor.

   These are engineering assumptions, not manufacturer specifications and not
   promises about any particular installation. Every one is shown in the
   assessment and can be edited by Haritech staff in the admin panel. */
export const DEFAULT_ASSUMPTIONS: SolarAssumptions = {
  // Inverter continuous rating is sized above the estimated simultaneous load.
  inverterHeadroom: 1.25,
  // kW to kVA conversion. 0.8 is a common planning figure; confirm the
  // selected inverter's datasheet before ordering.
  powerFactor: 0.8,
  // DC-to-AC conversion efficiency used for battery and PV planning.
  inverterEfficiency: 0.9,
  // Lithium depth of discharge used for usable-energy calculations.
  depthOfDischarge: 0.8,
  // Extra battery capacity requested by the customer.
  reserveMarginPct: 10,
  // Overall PV system efficiency (wiring, temperature, soiling, inverter).
  systemEfficiency: 0.75,
  // Efficiency of charging the battery from PV.
  chargeEfficiency: 0.9,
  // Cold-temperature safety factor applied to panel open-circuit voltage.
  temperatureSafetyFactor: 1.15,
  monthlyDays: 30,
  // Common nominal inverter sizes in kVA. The advisor picks the smallest size
  // that covers the calculated requirement; the model's datasheet still has
  // to confirm continuous and surge ratings.
  inverterSizesKva: [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30],
};

export const DEFAULT_PEAK_SUN_HOURS_NOTE =
  'Peak sun hours vary by location and season. Enter the figure supplied by your installer or a verified local source; the advisor does not assume one national value.';
