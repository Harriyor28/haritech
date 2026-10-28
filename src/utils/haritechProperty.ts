/* ── Project & Property Management Hub — content model ───────────────────
   Seeded records for the public Hub. Everything here is sample data shown
   with an explicit "sample" label: the Hub must never present seed numbers
   as a client's live records. Admin edits persist to localStorage and sync
   through the same cloud channel as the rest of the Haritech content.
   ---------------------------------------------------------------------- */

export interface HubBuildProject {
  id: string;
  name: string;
  client: string;
  type: string;
  location: string;
  stage: string;
  progress: number;
  planned: number;
  budgetNgn: number;
  spentNgn: number;
  committedNgn: number;
  startDate: string;
  targetDate: string;
  nextMilestone: string;
  lead: string;
  crew: string[];
}

export interface HubReport {
  id: string;
  projectId: string;
  date: string;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Inspection';
  author: string;
  summary: string;
  photos: number;
  geotagged: boolean;
  materials: { name: string; delivered: number; used: number; unit: string }[];
  labour: number;
  risks: string[];
}

export interface HubProperty {
  id: string;
  name: string;
  kind: string;
  location: string;
  units: number;
  occupied: number;
  rentRollNgn: number;
  openIssues: number;
  nextInspection: string;
  manager: string;
}

export interface HubRentRecord {
  propertyId: string;
  tenant: string;
  unit: string;
  dueDate: string;
  amountNgn: number;
  status: 'Verified' | 'Pending' | 'Overdue';
}

export interface HubLandAsset {
  id: string;
  name: string;
  location: string;
  size: string;
  title: string;
  stage: string;
  checklist: { label: string; done: boolean }[];
  approvalExpiry: string;
  note: string;
}

export interface HubWorkOrder {
  id: string;
  title: string;
  property: string;
  category: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Raised' | 'Assigned' | 'In progress' | 'Verification' | 'Closed';
  contractor: string;
  costNgn: number;
  raised: string;
  note: string;
}

export interface HubContractor {
  id: string;
  name: string;
  trade: string;
  projects: number;
  onTime: number;
  quality: number;
  status: 'Active' | 'Under review' | 'Suspended';
  note: string;
}

export interface HubDocument {
  id: string;
  name: string;
  category: string;
  project: string;
  version: string;
  status: 'Approved' | 'Awaiting review' | 'Expiring' | 'Draft';
  owner: string;
  updated: string;
  expiry: string;
}

export interface HubInspection {
  id: string;
  property: string;
  type: string;
  date: string;
  inspector: string;
  status: 'Passed' | 'Defects' | 'Critical';
  score: number;
  findings: string[];
  checklist: { label: string; done: boolean }[];
}

export interface HubBudgetLine {
  category: string;
  budgetNgn: number;
  spentNgn: number;
  committedNgn: number;
}

export interface HubSensor {
  id: string;
  property: string;
  name: string;
  type: string;
  status: 'Online' | 'Offline' | 'No data';
  reading: string;
  threshold: string;
  updated: string;
}

export interface HubActivity {
  id: string;
  when: string;
  kind: string;
  channel: 'Email' | 'WhatsApp' | 'In-app';
  title: string;
  detail: string;
}

export interface PropertyHubContent {
  buildProjects: HubBuildProject[];
  reports: HubReport[];
  properties: HubProperty[];
  rent: HubRentRecord[];
  land: HubLandAsset[];
  workOrders: HubWorkOrder[];
  contractors: HubContractor[];
  documents: HubDocument[];
  inspections: HubInspection[];
  budgets: Record<string, HubBudgetLine[]>;
  sensors: HubSensor[];
  activity: HubActivity[];
}

const KEY = 'haritech-property-hub';

const iso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

export const defaultPropertyHub: PropertyHubContent = {
  buildProjects: [
    {
      id: 'lekki-duplex', name: '4-Bedroom Duplex — Lekki Phase 1', client: 'Dr. & Mrs. Adeyemi', type: 'Residential',
      location: 'Lekki Phase 1, Lagos', stage: 'Superstructure', progress: 46, planned: 52,
      budgetNgn: 96_000_000, spentNgn: 39_800_000, committedNgn: 8_400_000,
      startDate: iso(-128), targetDate: iso(96), nextMilestone: 'First-floor slab casting',
      lead: 'Ibrahim Suleiman', crew: ['Ibrahim Suleiman', 'Samuel Ojo', 'Grace Effiong'],
    },
    {
      id: 'ikeja-estate', name: '12-Unit Terrace Estate', client: 'Crownfield Estates Ltd', type: 'Estate / multi-unit',
      location: 'Ikeja GRA, Lagos', stage: 'Finishes', progress: 72, planned: 70,
      budgetNgn: 420_000_000, spentNgn: 268_000_000, committedNgn: 41_000_000,
      startDate: iso(-240), targetDate: iso(64), nextMilestone: 'Block B tiling & joinery',
      lead: 'Grace Effiong', crew: ['Grace Effiong', 'Ngozi Eze', 'Kelvin Adebayo'],
    },
    {
      id: 'abuja-office', name: '4-Storey Office Fit-out', client: 'Meridian Capital', type: 'Commercial',
      location: 'Wuse II, Abuja', stage: 'Services & MEP', progress: 38, planned: 41,
      budgetNgn: 180_000_000, spentNgn: 61_500_000, committedNgn: 22_800_000,
      startDate: iso(-86), targetDate: iso(118), nextMilestone: 'HVAC ducting sign-off',
      lead: 'Tunde Adeyemi', crew: ['Tunde Adeyemi', 'Chidi Okonkwo', 'Samuel Ojo'],
    },
    {
      id: 'ph-renovation', name: 'Bungalow Renovation & Extension', client: 'Mrs. Okoro', type: 'Renovation',
      location: 'GRA, Port Harcourt', stage: 'Strip-out & structure', progress: 24, planned: 30,
      budgetNgn: 28_500_000, spentNgn: 6_900_000, committedNgn: 3_200_000,
      startDate: iso(-38), targetDate: iso(74), nextMilestone: 'New roof trusses',
      lead: 'Ngozi Eze', crew: ['Ngozi Eze', 'Samuel Ojo'],
    },
  ],
  reports: [
    {
      id: 'r1', projectId: 'lekki-duplex', date: iso(-1), type: 'Daily', author: 'Samuel Ojo',
      summary: 'Column starter bars fixed on grid B; blockwork to first floor at 60%. 14 workers on site.',
      photos: 12, geotagged: true, labour: 14,
      materials: [
        { name: 'Cement (50kg)', delivered: 180, used: 142, unit: 'bags' },
        { name: 'Sand', delivered: 24, used: 19, unit: 'tonnes' },
        { name: '12mm reinforcement', delivered: 3.2, used: 2.7, unit: 'tonnes' },
      ],
      risks: ['Cement delivery for next week not yet confirmed by supplier.'],
    },
    {
      id: 'r2', projectId: 'lekki-duplex', date: iso(-8), type: 'Weekly', author: 'Ibrahim Suleiman',
      summary: 'Ground-floor slab cured and signed off. Superstructure started one day behind programme; recovery planned by adding a second blockwork gang.',
      photos: 26, geotagged: true, labour: 16,
      materials: [
        { name: 'Cement (50kg)', delivered: 240, used: 231, unit: 'bags' },
        { name: 'Granite 3/4', delivered: 18, used: 17, unit: 'tonnes' },
      ],
      risks: ['Blockwork gang productivity below target on day 2–3.', 'Rain lost half a day on Tuesday.'],
    },
    {
      id: 'r3', projectId: 'ikeja-estate', date: iso(-2), type: 'Weekly', author: 'Ngozi Eze',
      summary: 'Block A joinery installed and protected. Block B screeding complete, tiling starts Monday.',
      photos: 31, geotagged: true, labour: 28,
      materials: [
        { name: 'Floor tiles (600×600)', delivered: 420, used: 388, unit: 'boxes' },
        { name: 'Emulsion paint', delivered: 65, used: 20, unit: 'drums' },
      ],
      risks: ['Tile batch shade variation on 12 boxes — replacement requested.'],
    },
    {
      id: 'r4', projectId: 'abuja-office', date: iso(-3), type: 'Daily', author: 'Chidi Okonkwo',
      summary: 'Chilled-water pipework first fix 80% complete; ceiling grid layout marked on level 2.',
      photos: 9, geotagged: true, labour: 21,
      materials: [
        { name: 'Copper pipe 22mm', delivered: 320, used: 264, unit: 'metres' },
        { name: 'Ceiling grid', delivered: 540, used: 120, unit: 'm²' },
      ],
      risks: ['MEP drawing revision 4 awaiting consultant approval.'],
    },
    {
      id: 'r5', projectId: 'ikeja-estate', date: iso(-16), type: 'Monthly', author: 'Grace Effiong',
      summary: 'Month 7: Block A and B weather-tight, Block C roof completed. Overall programme tracking two days ahead.',
      photos: 48, geotagged: true, labour: 34,
      materials: [
        { name: 'Roofing sheets', delivered: 210, used: 205, unit: 'sheets' },
        { name: 'Cement (50kg)', delivered: 900, used: 884, unit: 'bags' },
      ],
      risks: ['Escalation on aluminium prices could affect Block C windows.'],
    },
    {
      id: 'r6', projectId: 'ph-renovation', date: iso(-4), type: 'Inspection', author: 'Ngozi Eze',
      summary: 'Structural inspection after strip-out: two lintels need replacement, damp course intact elsewhere.',
      photos: 18, geotagged: true, labour: 8,
      materials: [
        { name: 'Hardcore', delivered: 12, used: 9, unit: 'tonnes' },
      ],
      risks: ['Replacement lintels add an estimated ₦420,000 variation.'],
    },
  ],
  properties: [
    { id: 'p1', name: 'Adeyemi Court', kind: 'Residential', location: 'Lekki Phase 1, Lagos', units: 6, occupied: 5, rentRollNgn: 14_400_000, openIssues: 2, nextInspection: iso(18), manager: 'Grace Effiong' },
    { id: 'p2', name: 'Crownfield Terraces', kind: 'Estate', location: 'Ikeja GRA, Lagos', units: 12, occupied: 10, rentRollNgn: 43_200_000, openIssues: 4, nextInspection: iso(9), manager: 'Ngozi Eze' },
    { id: 'p3', name: 'Meridian Place', kind: 'Commercial', location: 'Wuse II, Abuja', units: 8, occupied: 6, rentRollNgn: 36_000_000, openIssues: 1, nextInspection: iso(27), manager: 'Tunde Adeyemi' },
    { id: 'p4', name: 'Okoro Residence', kind: 'Residential', location: 'GRA, Port Harcourt', units: 1, occupied: 1, rentRollNgn: 3_600_000, openIssues: 3, nextInspection: iso(5), manager: 'Ngozi Eze' },
    { id: 'p5', name: 'Palms Serviced Apartments', kind: 'Serviced', location: 'Victoria Island, Lagos', units: 10, occupied: 7, rentRollNgn: 60_000_000, openIssues: 2, nextInspection: iso(33), manager: 'Adaeze Nwosu' },
  ],
  rent: [
    { propertyId: 'p1', tenant: 'K. Balogun', unit: 'Unit 2', dueDate: iso(-6), amountNgn: 2_400_000, status: 'Verified' },
    { propertyId: 'p1', tenant: 'O. Nnamdi', unit: 'Unit 5', dueDate: iso(4), amountNgn: 2_400_000, status: 'Pending' },
    { propertyId: 'p2', tenant: 'B. Adekunle', unit: 'Block C-3', dueDate: iso(-14), amountNgn: 3_600_000, status: 'Overdue' },
    { propertyId: 'p2', tenant: 'F. Yusuf', unit: 'Block A-2', dueDate: iso(11), amountNgn: 3_600_000, status: 'Pending' },
    { propertyId: 'p3', tenant: 'Northbridge Ltd', unit: 'Suite 4', dueDate: iso(-2), amountNgn: 4_500_000, status: 'Verified' },
    { propertyId: 'p5', tenant: 'H. Okafor', unit: 'Apt 3B', dueDate: iso(9), amountNgn: 6_000_000, status: 'Pending' },
  ],
  land: [
    {
      id: 'l1', name: 'Lakeside Parcel A', location: 'Epe, Lagos', size: '2.4 hectares', title: 'Governor’s Consent — in process',
      stage: 'Due diligence', approvalExpiry: iso(46),
      checklist: [
        { label: 'Survey plan obtained and stamped', done: true },
        { label: 'Search at Lands Registry', done: true },
        { label: 'Family root-of-title confirmation', done: true },
        { label: 'Physical beacon check', done: false },
        { label: 'Planning permit application', done: false },
      ],
      note: 'Boundary dispute raised by an adjoining owner — survey re-verification required before payment.',
    },
    {
      id: 'l2', name: 'Ibeju Plot 14', location: 'Ibeju-Lekki, Lagos', size: '650 sqm', title: 'Deed of Assignment',
      stage: 'Documentation', approvalExpiry: iso(120),
      checklist: [
        { label: 'Survey plan obtained and stamped', done: true },
        { label: 'Search at Lands Registry', done: true },
        { label: 'Family root-of-title confirmation', done: true },
        { label: 'Physical beacon check', done: true },
        { label: 'Planning permit application', done: false },
      ],
      note: 'Acquisition completed; development permit to be filed before site mobilisation.',
    },
    {
      id: 'l3', name: 'Asaba Mixed-use Site', location: 'Okpanam Road, Asaba', size: '1.8 hectares', title: 'Certificate of Occupancy',
      stage: 'Development', approvalExpiry: iso(-12),
      checklist: [
        { label: 'Survey plan obtained and stamped', done: true },
        { label: 'Search at Lands Registry', done: true },
        { label: 'Family root-of-title confirmation', done: true },
        { label: 'Physical beacon check', done: true },
        { label: 'Planning permit application', done: true },
      ],
      note: 'Development permit renewal overdue — filed and awaiting assessment.',
    },
    {
      id: 'l4', name: 'Kuje Farm Cluster', location: 'Kuje, FCT', size: '6.0 hectares', title: 'Customary right — gazette pending',
      stage: 'Acquisition', approvalExpiry: iso(210),
      checklist: [
        { label: 'Survey plan obtained and stamped', done: true },
        { label: 'Search at Lands Registry', done: false },
        { label: 'Family root-of-title confirmation', done: false },
        { label: 'Physical beacon check', done: false },
        { label: 'Planning permit application', done: false },
      ],
      note: 'Community consent meeting scheduled; no payment should be released before search is complete.',
    },
  ],
  workOrders: [
    { id: 'w1', title: 'Replace failed water pump', property: 'Adeyemi Court', category: 'Plumbing', priority: 'Urgent', status: 'In progress', contractor: 'AquaFix Services', costNgn: 185_000, raised: iso(-3), note: 'Pump tripping on overload; replacement unit sourced.' },
    { id: 'w2', title: 'Rewire kitchen circuit', property: 'Okoro Residence', category: 'Electrical', priority: 'Emergency', status: 'Assigned', contractor: 'Voltline Electricals', costNgn: 240_000, raised: iso(-1), note: 'Burning smell at socket reported by occupant.' },
    { id: 'w3', title: 'Repaint common stairwell', property: 'Crownfield Terraces', category: 'Painting', priority: 'Routine', status: 'Raised', contractor: 'Unassigned', costNgn: 320_000, raised: iso(-6), note: 'Peeling in Block B stairwell, budgeted in Q4.' },
    { id: 'w4', title: 'Reseal Block A roof flashing', property: 'Meridian Place', category: 'Roofing', priority: 'Urgent', status: 'Verification', contractor: 'Summit Roofing', costNgn: 410_000, raised: iso(-11), note: 'Work completed; leak test during next rainfall.' },
    { id: 'w5', title: 'Service generator — 60kVA', property: 'Palms Serviced Apartments', category: 'Mechanical', priority: 'Routine', status: 'Closed', contractor: 'PowerCare Ltd', costNgn: 95_000, raised: iso(-24), note: 'Oil, filters and coolant changed; log updated.' },
    { id: 'w6', title: 'Replace two rotted lintels', property: 'Okoro Residence', category: 'Structural', priority: 'Urgent', status: 'Assigned', contractor: 'Stonebridge Construction', costNgn: 420_000, raised: iso(-4), note: 'Raised from structural inspection; variation pending client approval.' },
    { id: 'w7', title: 'Install intercom at gatehouse', property: 'Adeyemi Court', category: 'Security', priority: 'Routine', status: 'Raised', contractor: 'Unassigned', costNgn: 150_000, raised: iso(-8), note: 'Requested by residents’ association.' },
    { id: 'w8', title: 'Clear drainage channel', property: 'Crownfield Terraces', category: 'Civil', priority: 'Urgent', status: 'In progress', contractor: 'AquaFix Services', costNgn: 130_000, raised: iso(-5), note: 'Blockage causing standing water at Block C entrance.' },
  ],
  contractors: [
    { id: 'c1', name: 'Stonebridge Construction', trade: 'Main contractor', projects: 3, onTime: 92, quality: 94, status: 'Active', note: 'Strong structural delivery; two minor snags closed inside 5 days.' },
    { id: 'c2', name: 'Voltline Electricals', trade: 'Electrical', projects: 2, onTime: 84, quality: 88, status: 'Active', note: 'Good workmanship, slow to submit as-built drawings.' },
    { id: 'c3', name: 'AquaFix Services', trade: 'Plumbing', projects: 4, onTime: 78, quality: 86, status: 'Active', note: 'Response time excellent; documentation needs tightening.' },
    { id: 'c4', name: 'Summit Roofing', trade: 'Roofing', projects: 2, onTime: 95, quality: 90, status: 'Active', note: 'Reliable on weather-critical works.' },
    { id: 'c5', name: 'Precision Interiors', trade: 'Joinery & finishes', projects: 1, onTime: 61, quality: 72, status: 'Under review', note: 'Two missed dates on Block A joinery; recovery plan requested.' },
    { id: 'c6', name: 'PowerCare Ltd', trade: 'Mechanical', projects: 5, onTime: 97, quality: 91, status: 'Active', note: 'Retained for all generator servicing.' },
  ],
  documents: [
    { id: 'd1', name: 'Architectural drawing set', category: 'Drawings', project: 'Lekki Duplex', version: 'Rev C', status: 'Approved', owner: 'Ibrahim Suleiman', updated: iso(-21), expiry: '' },
    { id: 'd2', name: 'Structural calculations', category: 'Engineering', project: 'Lekki Duplex', version: 'Rev B', status: 'Approved', owner: 'Ibrahim Suleiman', updated: iso(-30), expiry: '' },
    { id: 'd3', name: 'Bill of quantities — Block C', category: 'BOQ', project: 'Ikeja Terraces', version: 'Rev A', status: 'Awaiting review', owner: 'Grace Effiong', updated: iso(-4), expiry: '' },
    { id: 'd4', name: 'MEP drawing revision 4', category: 'Engineering', project: 'Abuja Office', version: 'Rev D', status: 'Awaiting review', owner: 'Tunde Adeyemi', updated: iso(-2), expiry: '' },
    { id: 'd5', name: 'Building permit — Asaba site', category: 'Permits', project: 'Asaba Mixed-use', version: '—', status: 'Expiring', owner: 'Bisi Adeyinka', updated: iso(-365), expiry: iso(-12) },
    { id: 'd6', name: 'Contractor quotation — lintels', category: 'Quotations', project: 'Okoro Residence', version: '—', status: 'Awaiting review', owner: 'Ngozi Eze', updated: iso(-4), expiry: '' },
    { id: 'd7', name: 'Handover pack — Block A', category: 'Handover', project: 'Ikeja Terraces', version: 'Final', status: 'Approved', owner: 'Grace Effiong', updated: iso(-18), expiry: '' },
    { id: 'd8', name: 'Inspection report — structural', category: 'Reports', project: 'Okoro Residence', version: '—', status: 'Approved', owner: 'Ngozi Eze', updated: iso(-4), expiry: '' },
    { id: 'd9', name: 'Insurance certificate — site', category: 'Insurance', project: 'Lekki Duplex', version: '2026', status: 'Approved', owner: 'Adaeze Nwosu', updated: iso(-120), expiry: iso(58) },
    { id: 'd10', name: 'Survey plan — Lakeside A', category: 'Land', project: 'Lakeside Parcel A', version: '—', status: 'Expiring', owner: 'Bisi Adeyinka', updated: iso(-400), expiry: iso(21) },
  ],
  inspections: [
    {
      id: 'i1', property: 'Adeyemi Court', type: 'Periodic inspection', date: iso(-9), inspector: 'Grace Effiong', status: 'Defects', score: 78,
      findings: ['Failed pump housing shows corrosion.', 'Block A downpipe disconnected at first-floor outlet.', 'No smoke detector in Unit 4.'],
      checklist: [
        { label: 'Roof covering and flashings', done: true },
        { label: 'Rainwater goods and drainage', done: false },
        { label: 'External walls and render', done: true },
        { label: 'Electrical intake and earthing', done: true },
        { label: 'Plumbing and water pressure', done: true },
        { label: 'Fire detection and extinguishers', done: false },
      ],
    },
    {
      id: 'i2', property: 'Crownfield Terraces', type: 'Pre-handover inspection', date: iso(-18), inspector: 'Ngozi Eze', status: 'Passed', score: 94,
      findings: ['Two door hinges require adjustment.', 'Minor paint touch-up at Block B entrance.'],
      checklist: [
        { label: 'Roof covering and flashings', done: true },
        { label: 'Rainwater goods and drainage', done: true },
        { label: 'External walls and render', done: true },
        { label: 'Electrical intake and earthing', done: true },
        { label: 'Plumbing and water pressure', done: true },
        { label: 'Fire detection and extinguishers', done: true },
      ],
    },
    {
      id: 'i3', property: 'Meridian Place', type: 'Building condition assessment', date: iso(-33), inspector: 'Tunde Adeyemi', status: 'Defects', score: 71,
      findings: ['HVAC condensate drain partially blocked.', 'Lift machine-room ventilation below spec.', 'Car park surface water pooling.'],
      checklist: [
        { label: 'Roof covering and flashings', done: true },
        { label: 'Rainwater goods and drainage', done: false },
        { label: 'External walls and render', done: true },
        { label: 'Electrical intake and earthing', done: true },
        { label: 'Plumbing and water pressure', done: true },
        { label: 'Fire detection and extinguishers', done: true },
      ],
    },
    {
      id: 'i4', property: 'Okoro Residence', type: 'Structural inspection', date: iso(-4), inspector: 'Ngozi Eze', status: 'Critical', score: 54,
      findings: ['Two lintels show significant rot and require replacement.', 'Rear extension roof pitch insufficient for rainfall.', 'Damp ingress at rear wall base.'],
      checklist: [
        { label: 'Roof covering and flashings', done: false },
        { label: 'Rainwater goods and drainage', done: false },
        { label: 'External walls and render', done: true },
        { label: 'Electrical intake and earthing', done: true },
        { label: 'Plumbing and water pressure', done: true },
        { label: 'Fire detection and extinguishers', done: false },
      ],
    },
  ],
  budgets: {
    'lekki-duplex': [
      { category: 'Substructure', budgetNgn: 14_000_000, spentNgn: 13_650_000, committedNgn: 0 },
      { category: 'Structure & slab', budgetNgn: 26_000_000, spentNgn: 15_900_000, committedNgn: 4_800_000 },
      { category: 'Blockwork & plaster', budgetNgn: 12_000_000, spentNgn: 4_100_000, committedNgn: 2_100_000 },
      { category: 'Roofing', budgetNgn: 9_000_000, spentNgn: 0, committedNgn: 1_500_000 },
      { category: 'MEP services', budgetNgn: 18_000_000, spentNgn: 3_200_000, committedNgn: 0 },
      { category: 'Finishes', budgetNgn: 14_000_000, spentNgn: 2_950_000, committedNgn: 0 },
      { category: 'Contingency', budgetNgn: 3_000_000, spentNgn: 0, committedNgn: 0 },
    ],
    'ikeja-estate': [
      { category: 'Substructure', budgetNgn: 62_000_000, spentNgn: 61_400_000, committedNgn: 0 },
      { category: 'Structure & slab', budgetNgn: 128_000_000, spentNgn: 124_800_000, committedNgn: 0 },
      { category: 'Blockwork & plaster', budgetNgn: 74_000_000, spentNgn: 58_200_000, committedNgn: 3_400_000 },
      { category: 'Roofing', budgetNgn: 46_000_000, spentNgn: 12_600_000, committedNgn: 0 },
      { category: 'MEP services', budgetNgn: 58_000_000, spentNgn: 9_100_000, committedNgn: 18_000_000 },
      { category: 'Finishes', budgetNgn: 44_000_000, spentNgn: 1_900_000, committedNgn: 19_600_000 },
      { category: 'Contingency', budgetNgn: 8_000_000, spentNgn: 0, committedNgn: 0 },
    ],
    'abuja-office': [
      { category: 'Strip-out & demolition', budgetNgn: 12_000_000, spentNgn: 11_800_000, committedNgn: 0 },
      { category: 'Partitions & ceilings', budgetNgn: 34_000_000, spentNgn: 26_400_000, committedNgn: 9_000_000 },
      { category: 'MEP services', budgetNgn: 62_000_000, spentNgn: 18_300_000, committedNgn: 13_800_000 },
      { category: 'Joinery & finishes', budgetNgn: 48_000_000, spentNgn: 4_200_000, committedNgn: 0 },
      { category: 'AV & data', budgetNgn: 16_000_000, spentNgn: 800_000, committedNgn: 0 },
      { category: 'Contingency', budgetNgn: 8_000_000, spentNgn: 0, committedNgn: 0 },
    ],
    'ph-renovation': [
      { category: 'Strip-out', budgetNgn: 3_200_000, spentNgn: 3_100_000, committedNgn: 0 },
      { category: 'Structural repairs', budgetNgn: 7_800_000, spentNgn: 1_200_000, committedNgn: 2_600_000 },
      { category: 'Roofing', budgetNgn: 6_500_000, spentNgn: 0, committedNgn: 600_000 },
      { category: 'Services', budgetNgn: 5_000_000, spentNgn: 1_900_000, committedNgn: 0 },
      { category: 'Finishes', budgetNgn: 5_000_000, spentNgn: 700_000, committedNgn: 0 },
      { category: 'Contingency', budgetNgn: 1_000_000, spentNgn: 0, committedNgn: 0 },
    ],
  },
  sensors: [
    { id: 's1', property: 'Palms Serviced Apartments', name: 'Tank level — Block A', type: 'Ultrasonic level', status: 'Online', reading: '68%', threshold: 'Alert below 25%', updated: '2 min ago' },
    { id: 's2', property: 'Palms Serviced Apartments', name: 'Generator fuel', type: 'Fuel level', status: 'Online', reading: '41%', threshold: 'Alert below 30%', updated: '6 min ago' },
    { id: 's3', property: 'Adeyemi Court', name: 'Leak sensor — pump room', type: 'Water presence', status: 'Online', reading: 'Dry', threshold: 'Alert on wet', updated: '1 min ago' },
    { id: 's4', property: 'Meridian Place', name: 'Energy meter — main', type: 'Consumption', status: 'Online', reading: '184 kWh today', threshold: 'Alert above 320 kWh', updated: '12 min ago' },
    { id: 's5', property: 'Crownfield Terraces', name: 'Ambient temperature', type: 'Temperature', status: 'No data', reading: '—', threshold: 'Alert above 38°C', updated: '3 days ago' },
    { id: 's6', property: 'Okoro Residence', name: 'Generator run status', type: 'Runtime', status: 'Offline', reading: '—', threshold: 'Notify on start', updated: '8 days ago' },
  ],
  activity: [
    { id: 'a1', when: 'Today, 09:14', kind: 'Milestone', channel: 'In-app', title: 'First-floor slab casting completed', detail: 'Lekki Duplex — verified by Ibrahim Suleiman with 12 photographs.' },
    { id: 'a2', when: 'Today, 08:02', kind: 'Approval', channel: 'Email', title: 'BOQ revision awaiting your approval', detail: 'Ikeja Terraces — Block C joinery package, ₦41.2m.' },
    { id: 'a3', when: 'Yesterday, 17:40', kind: 'Budget', channel: 'WhatsApp', title: 'Structure line at 61% of budget', detail: 'Lekki Duplex — committed spend now ₦20.7m against ₦26.0m.' },
    { id: 'a4', when: 'Yesterday, 15:12', kind: 'Maintenance', channel: 'In-app', title: 'Emergency work order raised', detail: 'Okoro Residence — kitchen circuit rewiring assigned to Voltline.' },
    { id: 'a5', when: 'Yesterday, 11:05', kind: 'Document', channel: 'Email', title: 'Building permit expiring in 12 days', detail: 'Asaba Mixed-use Site — renewal filed and awaiting assessment.' },
    { id: 'a6', when: '2 days ago', kind: 'Inspection', channel: 'In-app', title: 'Structural inspection scored 54/100', detail: 'Okoro Residence — two lintels flagged for replacement.' },
    { id: 'a7', when: '3 days ago', kind: 'Payment', channel: 'Email', title: 'Rent payment verified', detail: 'Adeyemi Court, Unit 2 — ₦2.4m reconciled against the bank statement.' },
    { id: 'a8', when: '4 days ago', kind: 'Task', channel: 'In-app', title: 'Delivery of cement moved to Thursday', detail: 'Lekki Duplex — supplier confirmed; programme unaffected.' },
  ],
};

export function getPropertyHub(): PropertyHubContent {
  if (typeof window === 'undefined') return defaultPropertyHub;
  const stored = window.localStorage.getItem(KEY);
  if (!stored) return defaultPropertyHub;
  try {
    const parsed = JSON.parse(stored) as Partial<PropertyHubContent>;
    return {
      ...defaultPropertyHub,
      ...parsed,
      buildProjects: parsed.buildProjects?.length ? parsed.buildProjects : defaultPropertyHub.buildProjects,
      reports: parsed.reports?.length ? parsed.reports : defaultPropertyHub.reports,
      properties: parsed.properties?.length ? parsed.properties : defaultPropertyHub.properties,
      rent: parsed.rent?.length ? parsed.rent : defaultPropertyHub.rent,
      land: parsed.land?.length ? parsed.land : defaultPropertyHub.land,
      workOrders: parsed.workOrders?.length ? parsed.workOrders : defaultPropertyHub.workOrders,
      contractors: parsed.contractors?.length ? parsed.contractors : defaultPropertyHub.contractors,
      documents: parsed.documents?.length ? parsed.documents : defaultPropertyHub.documents,
      inspections: parsed.inspections?.length ? parsed.inspections : defaultPropertyHub.inspections,
      budgets: parsed.budgets && Object.keys(parsed.budgets).length ? parsed.budgets : defaultPropertyHub.budgets,
      sensors: parsed.sensors?.length ? parsed.sensors : defaultPropertyHub.sensors,
      activity: parsed.activity?.length ? parsed.activity : defaultPropertyHub.activity,
    };
  } catch {
    return defaultPropertyHub;
  }
}

export function setPropertyHub(data: PropertyHubContent): void {
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('haritech-property-hub-updated'));
}

export const naira = (value: number): string => `₦${Math.round(value).toLocaleString('en-NG')}`;

export const nairaShort = (value: number): string => {
  if (value >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(1)}b`;
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
};

export const shortDay = (value: string): string => {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return '—';
  return new Date(time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const fullDay = (value: string): string => {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return '—';
  return new Date(time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const daysFromNow = (value: string): number => {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return 0;
  return Math.round((time - Date.now()) / 86_400_000);
};
