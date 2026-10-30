import { priceOf } from '../pricing';

/* Published solar packages.

   Only the inverter kVA and the published price are mapped here. The register
   does not state the battery, panel or inverter model included in each
   package, so the advisor must never claim those contents. */
export interface SolarPackage {
  id: string;
  label: string;
  kva: number;
  priceNgn: number;
}

export const SOLAR_PACKAGES: SolarPackage[] = [
  { id: 'SOL-001', label: '1.5 kVA Essential', kva: 1.5, priceNgn: priceOf('SOL-001') },
  { id: 'SOL-002', label: '3.5 kVA Home Pro', kva: 3.5, priceNgn: priceOf('SOL-002') },
  { id: 'SOL-003', label: '5 kVA Executive', kva: 5, priceNgn: priceOf('SOL-003') },
  { id: 'SOL-004', label: '10 kVA Commercial', kva: 10, priceNgn: priceOf('SOL-004') },
  { id: 'SOL-005', label: '20 kVA Industrial', kva: 20, priceNgn: priceOf('SOL-005') },
];

export const PACKAGE_CONTENTS_NOTE =
  'The published package price covers installation and is subject to owner approval and a written quotation. The register does not state the battery, panel or inverter model included, so those specifications are confirmed in the quotation after a site assessment.';
