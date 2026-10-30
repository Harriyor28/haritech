import type { ApplianceTemplate } from '../../utils/solar/types';

/* Catalogue of common appliances.

   Wattages are planning estimates, not guaranteed specifications. A customer
   can edit every wattage, quantity, daily hours and surge value. The UI shows
   a standing note asking them to check the appliance label or manufacturer
   documentation. */
export const APPLIANCE_CATALOGUE: ApplianceTemplate[] = [
  // Lighting
  { id: 'led-bulb', name: 'LED bulb', category: 'lighting', watts: 10, surgeWatts: null, defaultHours: 5, duty: 'intermittent', note: 'Replace the wattage with the figure printed on the bulb.' },
  { id: 'security-light', name: 'Security light', category: 'lighting', watts: 30, surgeWatts: null, defaultHours: 10, duty: 'scheduled', note: 'Often runs from dusk to dawn.' },
  { id: 'streetlight', name: 'Streetlight', category: 'lighting', watts: 100, surgeWatts: null, defaultHours: 10, duty: 'scheduled', note: 'Confirm the actual fitting wattage.' },
  { id: 'floodlight', name: 'Floodlight', category: 'lighting', watts: 150, surgeWatts: null, defaultHours: 6, duty: 'scheduled', note: 'Higher-output fittings can draw considerably more.' },

  // Home appliances
  { id: 'television', name: 'Television', category: 'home', watts: 100, surgeWatts: null, defaultHours: 6, duty: 'intermittent', note: 'Large screens and sound systems can draw more.' },
  { id: 'decoder', name: 'Decoder', category: 'home', watts: 20, surgeWatts: null, defaultHours: 6, duty: 'intermittent', note: 'Usually left on standby.' },
  { id: 'fan', name: 'Fan', category: 'home', watts: 60, surgeWatts: null, defaultHours: 8, duty: 'intermittent', note: 'Ceiling and standing fans vary.' },
  { id: 'refrigerator', name: 'Refrigerator', category: 'home', watts: 150, surgeWatts: 450, defaultHours: 8, duty: 'continuous', note: 'Compressor cycles on and off. The hours figure is an effective running estimate, not 24 hours at rated power.' },
  { id: 'freezer', name: 'Freezer', category: 'home', watts: 200, surgeWatts: 600, defaultHours: 8, duty: 'continuous', note: 'Compressor duty cycle applies. Actual consumption depends on ambient temperature and door openings.' },
  { id: 'ac-1hp', name: 'Air conditioner (1 HP)', category: 'home', watts: 900, surgeWatts: 2700, defaultHours: 6, duty: 'intermittent', note: 'Inverter air conditioners draw variable power; the simple watts × hours estimate is approximate.' },
  { id: 'ac-15hp', name: 'Air conditioner (1.5 HP)', category: 'home', watts: 1300, surgeWatts: 3900, defaultHours: 6, duty: 'intermittent', note: 'Starting surge can be several times the running load. Confirm the label.' },
  { id: 'washing-machine', name: 'Washing machine', category: 'home', watts: 500, surgeWatts: 1000, defaultHours: 1, duty: 'intermittent', note: 'Heating cycles draw more than the wash motor.' },
  { id: 'microwave', name: 'Microwave', category: 'home', watts: 1200, surgeWatts: null, defaultHours: 0.5, duty: 'intermittent', note: 'Short, high-power bursts.' },
  { id: 'kettle', name: 'Electric kettle', category: 'home', watts: 2000, surgeWatts: null, defaultHours: 0.3, duty: 'intermittent', note: 'One of the highest short-duration loads in a home.' },
  { id: 'blender', name: 'Blender', category: 'home', watts: 400, surgeWatts: 800, defaultHours: 0.3, duty: 'intermittent', note: 'Motor starting surge applies.' },
  { id: 'water-pump', name: 'Water pump', category: 'home', watts: 750, surgeWatts: 2250, defaultHours: 2, duty: 'intermittent', note: 'Pump motors have a high starting surge.' },
  { id: 'iron', name: 'Clothes iron', category: 'home', watts: 1000, surgeWatts: null, defaultHours: 1, duty: 'intermittent', note: 'Thermostat cycles reduce average draw.' },

  // Office and computer equipment
  { id: 'laptop', name: 'Laptop', category: 'office', watts: 65, surgeWatts: null, defaultHours: 8, duty: 'intermittent', note: 'Charging and heavy use increase draw.' },
  { id: 'desktop', name: 'Desktop computer', category: 'office', watts: 200, surgeWatts: null, defaultHours: 8, duty: 'intermittent', note: 'Include the monitor separately if it is not powered from the system unit.' },
  { id: 'monitor', name: 'Monitor', category: 'office', watts: 40, surgeWatts: null, defaultHours: 8, duty: 'intermittent', note: 'Size and brightness affect consumption.' },
  { id: 'printer', name: 'Printer', category: 'office', watts: 300, surgeWatts: 600, defaultHours: 1, duty: 'intermittent', note: 'Laser printers draw a heating surge.' },
  { id: 'photocopier', name: 'Photocopier', category: 'office', watts: 800, surgeWatts: 1600, defaultHours: 2, duty: 'intermittent', note: 'Confirm the machine label; large copiers draw more.' },
  { id: 'router', name: 'Router', category: 'office', watts: 15, surgeWatts: null, defaultHours: 24, duty: 'continuous', note: 'Usually left on continuously.' },
  { id: 'modem', name: 'Internet modem', category: 'office', watts: 10, surgeWatts: null, defaultHours: 24, duty: 'continuous', note: 'Usually left on continuously.' },
  { id: 'cctv', name: 'CCTV system', category: 'office', watts: 50, surgeWatts: null, defaultHours: 24, duty: 'continuous', note: 'Include the recorder and cameras; add a monitor if separate.' },
  { id: 'server', name: 'Server', category: 'office', watts: 400, surgeWatts: null, defaultHours: 24, duty: 'continuous', note: 'Rack servers can draw much more. Confirm the power supply rating.' },
  { id: 'office-other', name: 'Other office equipment', category: 'office', watts: 100, surgeWatts: null, defaultHours: 4, duty: 'intermittent', note: 'Use this as a placeholder and edit the wattage.' },

  // Business equipment
  { id: 'pos', name: 'POS terminal', category: 'business', watts: 30, surgeWatts: null, defaultHours: 8, duty: 'intermittent', note: 'Include the receipt printer if separate.' },
  { id: 'display-fridge', name: 'Display refrigerator', category: 'business', watts: 300, surgeWatts: 900, defaultHours: 10, duty: 'continuous', note: 'Glass-door displays lose cooling quickly; duty cycle matters.' },
  { id: 'commercial-freezer', name: 'Commercial freezer', category: 'business', watts: 500, surgeWatts: 1500, defaultHours: 10, duty: 'continuous', note: 'Confirm the compressor rating on the nameplate.' },
  { id: 'business-small', name: 'Small business equipment', category: 'business', watts: 150, surgeWatts: null, defaultHours: 4, duty: 'intermittent', note: 'Use this as a placeholder and edit the wattage.' },
  { id: 'workshop-tools', name: 'Workshop tools', category: 'business', watts: 1000, surgeWatts: 2000, defaultHours: 3, duty: 'intermittent', note: 'Motor-driven tools have a starting surge.' },
  { id: 'commercial-machinery', name: 'Commercial machinery', category: 'business', watts: 3000, surgeWatts: 6000, defaultHours: 4, duty: 'intermittent', note: 'A site assessment is required for machinery loads.' },
];

export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceTemplate['category'], string> = {
  lighting: 'Lighting',
  home: 'Home appliances',
  office: 'Office & computer',
  business: 'Business equipment',
  other: 'Other',
};

export const APPLIANCE_NOTE =
  'Catalogue wattages are estimates, not guaranteed specifications. Check the appliance label or the manufacturer documentation and edit the figure before relying on the result.';
