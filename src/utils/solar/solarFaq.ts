/* Plain-language solar question answering.

   This is deliberately a curated knowledge base with a keyword matcher, not a
   free-text generator: every answer is written here, in the repository, and
   checked against the same rules as the rest of the solar tools.

   Rules the answers follow:
   - kW is power, kWh is energy, kVA is apparent power — the three are never
     swapped, and "kV" is never used for battery energy.
   - Costs quote only the published Haritech package prices, which are subject
     to the owner's approval.
   - Faults are never diagnosed from a description alone; the answer is to stop
     and call a qualified installer.
   - Sizing questions route to the Designer; live inverter questions state that
     live data is not connected.
   - No equipment specifications are invented. */

export interface FaqEntry {
  id: string;
  /** The questions visitors actually ask, plain and spoken. */
  questions: string[];
  keywords: string[];
  /** Plain-language answer. Paragraphs separated by '\n\n'. */
  answer: string;
  /** Optional internal link shown under the answer. */
  link?: { to: string; label: string };
  /** Follow-up questions offered as chips. Reference FaqEntry ids. */
  related?: string[];
}

export const FAQ_ENTRY_IDS = [
  'ah-vs-kwh',
  'mppt-range',
  'parallel-series',
  'battery-lifespan',
  'panel-lifespan',
  'worth-it',
  'load-vs-inverter',
  'generation-low',
  'ups-vs-inverter',
  'expansion',
  'kw-vs-kwh',
  'kva-vs-watts',
  'depth-of-discharge',
  'battery-runtime',
  'peak-sun-hours',
  'cloudy-night',
  'price',
  'running-ac',
  'panel-count',
  'size-system',
  'inverter-fault',
  'installation',
  'live-connection',
  'privacy',
] as const;

export type FaqEntryId = (typeof FAQ_ENTRY_IDS)[number];

const FA_VERSION = 'FAQ answers are estimates in plain language. A qualified installer confirms everything on site.';

export const SOLAR_FAQ_VERSION = FA_VERSION;

export const SOLAR_FAQ: FaqEntry[] = [
  {
    id: 'ah-vs-kwh',
    questions: [
      'what does ah mean',
      'what is an amp hour',
      'ah vs kwh',
      'how many ah battery do i need',
      'is ah the same as kwh',
      '220ah battery energy',
      '220 amp hour battery is how much energy',
    ],
    keywords: ['ah', 'amp hour', 'ampere hour', 'amp-hr', 'ah battery', '220ah', '150ah', '100ah', '200ah', '12v battery'],
    answer:
      'Ah (amp-hour) is a like-for-like "fuel quantity" that only means something once the battery voltage is known. Energy in kWh = Ah × voltage ÷ 1000.\n\nExample: a 220 Ah battery at 12 V is about 220 × 12 ÷ 1000 = 2.6 kWh — not 220 kWh, and never "220 kV". At 48 V the same 220 Ah figure would be about 10.6 kWh. That is why the Designer asks for the bank voltage before it converts anything.',
    related: ['depth-of-discharge', 'battery-runtime', 'kva-vs-watts'],
  },
  {
    id: 'mppt-range',
    questions: [
      'what is mppt',
      'what does mppt mean',
      'why does the advisor need panel voc',
      'what is the mppt voltage range',
      'why does it ask for maximum pv voltage',
    ],
    keywords: ['mppt', 'voc', 'charge controller', 'pv voltage'],
    answer:
      'MPPT is the part of the inverter that squeezes the most power out of the panels. It only works within a voltage window printed on the inverter datasheet.\n\nPanels connected in one string add their voltages together, and cold mornings push the voltage higher than the label figure. Exceed the MPPT window and the equipment can be damaged or go into protection.\n\nThis is why the advisor asks for Voc, MPPT min/max and maximum PV voltage from the real datasheet — and refuses to guess a string design without them. Filling those fields in without the datasheet in hand is worse than leaving them blank.',
    related: ['panel-count', 'parallel-series', 'size-system'],
  },
  {
    id: 'parallel-series',
    questions: [
      'can I mix old and new panels',
      'can i use different panel brands together',
      'panels in series or parallel',
      'can i mix panel sizes',
      'parallel and serial connection of panels',
      'second hand panels',
    ],
    keywords: ['mix', 'series', 'parallel', 'different panels', 'old panels', 'second hand', 'brands', 'mismatch'],
    answer:
      'Panels of different ages, sizes or brands can be connected — but badly matched panels waste power and can confuse the MPPT, and the exact series/parallel arrangement decides whether the voltage stays inside the inverter window.\n\nThat is a datasheet-and-calculator job, not a chat guess: the installer confirms each panel’s Voc/Vmp/Imp and designs the strings. The Designer stores your panel figures and warns when they exceed the equipment limits; the physical string plan itself is done on site.',
    related: ['mppt-range', 'panel-count', 'installation'],
  },
  {
    id: 'battery-lifespan',
    questions: [
      'how long do batteries last',
      'battery lifespan in years',
      'how many years does a battery last',
      'battery cycle life',
      'how often replace batteries',
    ],
    keywords: ['life', 'lifespan', 'years', 'cycle', 'replace', 'battery life', 'batteries last', 'how long do'],
    answer:
      'Batteries age by how much of them you use, how deeply, and at what temperature — an exact number of years is not honestly knowable without the specific model, which is confirmed in your quotation.\n\nWhat makes a real difference you control: do not exceed the allowed depth of discharge, keep the bank cool and ventilated, and do not mix old and new batteries in one bank. The manufacturer’s cycle-life rating for the exact model is stated in the quotation paperwork, not invented here.',
    related: ['depth-of-discharge', 'battery-runtime', 'installation'],
  },
  {
    id: 'panel-lifespan',
    questions: [
      'how long do solar panels last',
      'do panels degrade',
      'panel warranty years',
      'do solar panels expire',
    ],
    keywords: ['panel life', 'degrade', 'panel last', 'panels last', 'warranty', 'expire'],
    answer:
      'Panels have no moving parts and keep producing for decades, with a slow output decline (degradation) over the years. How fast that decline goes, and what the performance warranty covers, is model-specific — those details belong to the datasheet and your quotation, not to a general answer.\n\nCleaning, shading and physical damage matter more for day-to-day output than age. A site assessment checks mounting, exposure and condition before anything is counted into a design.',
    related: ['panel-count', 'peak-sun-hours', 'parallel-series'],
  },
  {
    id: 'worth-it',
    questions: [
      'is solar worth it',
      'does solar save money',
      'will solar reduce my bill',
      'is solar a good investment',
      'payback period',
    ],
    keywords: ['worth', 'save', 'reduce', 'bill', 'investment', 'payback', 'money'],
    answer:
      'It depends on your load, not on sentiment: heavy daytime loads and long outages get the most value; a single bulb and a phone charger never justify a large system.\n\nThe honest path is to run your actual appliance list through the Designer (free, no account) and compare the right-sized package against what you spend on fuel, connection and repairs now. Any payback number quoted without sight of your usage is a guess.',
    link: { to: '/haritech/solar-advisor', label: 'Run my numbers in the Designer' },
    related: ['price', 'size-system'],
  },
  {
    id: 'load-vs-inverter',
    questions: [
      'what happens if i overload the inverter',
      'too many appliances at once',
      'inverter shuts off when i use too much',
      'can i run everything at the same time',
      'overload protection',
    ],
    keywords: ['overload', 'shut off', 'shuts off', 'too much', 'at the same time', 'trip', 'overload protection', 'exceed'],
    answer:
      'Inverters are sized for what runs at the same time, not everything you own. Push past the continuous rating and a good inverter cuts out on overload protection before it is damaged.\n\nThe Designer’s "running together" flags exist exactly for this: mark the appliances that genuinely coincide (fridge compressors, pumps, irons, kettles) and it sizes the inverter on simultaneous load plus the worst starting surge. Deliberately overloading then cursing is not a sizing strategy — and overload trips are not a fault to be diagnosed from the trip alone.',
    link: { to: '/haritech/solar-advisor', label: 'Size my simultaneous load' },
    related: ['running-ac', 'kva-vs-watts', 'size-system'],
  },
  {
    id: 'generation-low',
    questions: [
      'why is my solar generation low',
      'charging is slow today',
      'panels not producing much',
      'why is my battery draining fast',
      'battery drains quickly',
    ],
    keywords: ['low', 'slow', 'drain', 'draining', 'producing', 'weak', 'not producing', 'quickly'],
    answer:
      'Generation and discharge rates move all day — one reading cannot separate a weak-panel day, a genuine fault, or simply a heavy-load day. That is exactly why this site never diagnoses from a single figure.\n\nWhat helps is a run of readings at different times: the Monitor keeps a private log of your voltage, current, state of charge and load, so a real pattern (or nothing wrong) becomes visible. Anything that looks truly wrong keeps the same rule: stop and call a qualified installer rather than adjusting settings yourself.',
    link: { to: '/haritech/solar-advisor/monitor', label: 'Log readings in the Monitor' },
    related: ['peak-sun-hours', 'cloudy-night', 'inverter-fault'],
  },
  {
    id: 'ups-vs-inverter',
    questions: [
      'what is the difference between an ups and an inverter',
      'inverter vs ups',
      'do i need a ups',
      'difference between ups and inverter for solar',
    ],
    keywords: ['ups', 'difference between', 'inverter vs'],
    answer:
      'Both give you power when the grid fails; the difference is timing and role. A UPS is built to bridge seconds-to-minutes while computers shut down safely. A solar inverter is built to run the house continuously from battery and panels.\n\nComputers that must never blink during changeover are worth mentioning to your installer — some inverters switch faster than others, and the exact model is specified in your quotation. The Designer sizes the household side either way.',
    related: ['kva-vs-watts', 'size-system', 'running-ac'],
  },
  {
    id: 'expansion',
    questions: [
      'can i add more batteries later',
      'can i expand the system',
      'can i start small and grow',
      'add more panels later',
    ],
    keywords: ['later', 'expand', 'expansion', 'grow', 'add more battery', 'add more panel', 'upgrade'],
    answer:
      'Usually yes, and planning for it is what the Designer’s "expect to add more later" flag is for — it pushes the design to leave sensible headroom.\n\nOne honest caution: batteries added years apart are rarely perfectly matched, so banks are best built with one model and age per bank, confirmed by the installer. Panels are more forgiving, but only if the original inverter and MPPT have the room — which is a datasheet question, answered in your quotation and on site.',
    link: { to: '/haritech/solar-advisor', label: 'Plan for expansion in the Designer' },
    related: ['parallel-series', 'battery-lifespan', 'size-system'],
  },

  {
    id: 'kw-vs-kwh',
    questions: [
      'what is the difference between kw and kwh',
      'is kw the same as kwh',
      'is a kw the same as a kwh',
      'what does kwh mean',
      'what does kw mean',
      'what is kwh',
      'what is kw',
    ],
    keywords: ['kw', 'kwh', 'difference', 'power', 'energy'],
    answer:
      'Think of it like water: kW is how strongly the tap is running, kWh is how much water fills the bucket.\n\nkW (kilowatt) is power — how fast an appliance uses electricity right now. A 100 W TV uses 0.1 kW.\n\nkWh (kilowatt-hour) is energy — power × time. That TV running 5 hours uses 0.5 kWh. Your battery size and daily consumption are kWh numbers. Battery energy is never written "kV" — that unit is not an amount of energy.',
    related: ['kva-vs-watts', 'battery-runtime', 'size-system'],
  },
  {
    id: 'kva-vs-watts',
    questions: [
      'why does the inverter say kva',
      'what is kva',
      'what does kva mean',
      'kva vs kw',
      'what size inverter do i need for my appliances',
    ],
    keywords: ['kva', 'inverter', 'watt', 'kw', 'power factor', 'size'],
    answer:
      'kVA is the "carrying" rating of an inverter — like a bag rated by weight plus the strength of its straps. Because of something called power factor, an inverter rated 1 kVA typically carries about 0.8 kW of appliances at once (our default assumption).\n\nSo a 0.8 kW (800 W) pile of appliances running together needs roughly a 1 kVA inverter — with some headroom for appliances that surge when they start.',
    related: ['size-system', 'running-ac'],
  },
  {
    id: 'depth-of-discharge',
    questions: [
      'what is depth of discharge',
      'what does dod mean',
      'how much of the battery can i use',
      'can i drain a battery to zero',
    ],
    keywords: ['depth of discharge', 'dod', 'battery', 'empty', 'drain', 'usable'],
    answer:
      'Depth of discharge (DoD) is how much of a battery you are allowed to use before refilling it — like drinking a glass down to a marked line, not to the very bottom.\n\nLithium batteries commonly allow about 80% usable. Using more than the manufacturer allows shortens the battery’s life. Also note: battery size is spoken in kWh — never "kV", and Ah is a different unit that only applies when the battery voltage is known.',
    related: ['battery-runtime', 'size-system'],
  },
  {
    id: 'battery-runtime',
    questions: [
      'how long will the battery last',
      'how long can inverter carry load',
      'how many hours will battery run my appliances',
      'battery backup time',
    ],
    keywords: ['how long', 'battery', 'last', 'hours', 'runtime', 'backup'],
    answer:
      'A rough answer you can check yourself: usable battery energy ÷ the appliances’ average draw.\n\nExample: a 5 kWh battery bank used to 80% depth of discharge gives 4 kWh usable. Running an average 0.4 kW of appliances gives 4 ÷ 0.4 = 10 hours. If the battery state of charge is known instead, use bank kWh × the state-of-charge percentage.\n\nThe Monitor page on this site does this arithmetic for you from your own meter readings.',
    link: { to: '/haritech/solar-advisor/monitor', label: 'Open the Power Monitor' },
    related: ['depth-of-discharge', 'size-system'],
  },
  {
    id: 'peak-sun-hours',
    questions: [
      'what are peak sun hours',
      'how many sun hours in nigeria',
      'how much sun does a solar panel need',
    ],
    keywords: ['peak sun', 'sun hours', 'sunlight', 'generation', 'location'],
    answer:
      'Peak sun hours are the number of hours per day with full, strong sunlight — not all daylight hours. A place with 5 peak sun hours charges panels as much as 5 hours at full strength, or 10 hours at half strength.\n\nThe honest number depends on your exact location, season and shading, so this site never assumes a national figure. Your installer, or a site assessment, gives the right number for your roof.',
    related: ['cloudy-night', 'size-system'],
  },
  {
    id: 'cloudy-night',
    questions: [
      'does solar work on cloudy days',
      'does solar work at night',
      'what happens when it rains',
      'does solar work when there is no sun',
    ],
    keywords: ['cloud', 'night', 'rain', 'dark', 'work', 'sun'],
    answer:
      'Panels make little power in heavy cloud and nothing at night — that is what the battery is for.\n\nThink of the battery as a tank filled during good sun hours. At night and in bad weather the house draws from the tank, not from the panels. How many cloudy days you can bridge is a design question your installer works through with you.',
    related: ['peak-sun-hours', 'size-system'],
  },
  {
    id: 'price',
    questions: [
      'how much does solar cost',
      'how much is a solar system in nigeria',
      'price of inverter and battery',
      'solar price',
      'how much do your packages cost',
      'what is the cheapest package',
    ],
    keywords: ['cost', 'price', 'how much', 'package', 'expensive', 'cheapest', 'budget'],
    answer:
      'Published package guide — every price includes installation and is subject to the owner’s confirmation:\n\n• 1.5 kVA — ₦950,000\n• 3.5 kVA — ₦2,500,000\n• 5 kVA — ₦3,400,000\n• 10 kVA — ₦6,700,000\n• 20 kVA — ₦12,000,000\n\nWhich one fits you depends on what you run, so the fair comparison is your own appliance list, not a guess. The Designer sizes it from what you actually use, and includes a quote request button.',
    link: { to: '/haritech/solar-advisor', label: 'Size my system with the Designer' },
    related: ['size-system', 'installation'],
  },
  {
    id: 'running-ac',
    questions: [
      'can solar carry my air conditioner',
      'can it power a deep freezer',
      'can solar run a water pump',
      'can it carry pumping machine and freezer',
      'fridge keeps tripping the inverter',
    ],
    keywords: ['ac', 'air conditioner', 'airconditioner', 'freezer', 'refrigerator', 'pump', 'pumping', 'compressor', 'surge', 'motor', 'tripping'],
    answer:
      'Yes in principle — but motors are the careful part. Fridges, freezers, pumps and air conditioners draw several times their normal power for a moment when starting. A 150 W fridge can momentarily pull 450 W or more.\n\nThat starting surge is why the Designer asks which appliances run at the same time, and why inverter sizing must leave headroom. Run your list through the Designer and it will show the peak starting load, not just the average.',
    link: { to: '/haritech/solar-advisor', label: 'Check my appliances in the Designer' },
    related: ['size-system', 'kva-vs-watts'],
  },
  {
    id: 'panel-count',
    questions: [
      'how many panels do i need',
      'how many solar panels for a 5 kva',
      'how many panels per battery',
    ],
    keywords: ['how many', 'panel', 'panels', 'number', 'need'],
    answer:
      'The count depends on three honest numbers: your daily energy need (kWh), the actual peak sun hours at your location, and the real wattage of the panel model that will be installed — none of which can be guessed responsibly from a chat.\n\nThe Designer gives you the panel-array size (kWp) from your own appliance list and your sun-hours input, then states what still has to be confirmed against the actual panel datasheet on site. Any "X panels for everyone" answer without those numbers is a guess.',
    link: { to: '/haritech/solar-advisor', label: 'Get my array size from the Designer' },
    related: ['peak-sun-hours', 'size-system'],
  },
  {
    id: 'size-system',
    questions: [
      'what size system do i need',
      'what size inverter and battery do i need',
      'how do i know what will work for my house',
      'which package should i buy',
      'what can 1kva carry',
      'what can a one point five kva carry',
      'is 3.5kva enough for a house',
    ],
    keywords: ['size', 'what size', 'enough', 'carry', 'recommend', 'design', 'package', 'house', 'need'],
    answer:
      'Nobody can size a system responsibly from a one-line description — a two-bedroom flat with a heavy freezer is a different job from one without.\n\nThat is exactly what the Designer on this site is for: pick your appliances (or start from a one-tap list), say how long they should run in an outage, and it works out the energy, inverter, battery and panel figures with its assumptions shown on screen. No account needed — everything happens in your browser.',
    link: { to: '/haritech/solar-advisor', label: 'Open the Designer' },
    related: ['price', 'running-ac', 'installation'],
  },
  {
    id: 'inverter-fault',
    questions: [
      'my inverter is beeping',
      'inverter shows an error code',
      'inverter not charging',
      'inverter keeps shutting down',
      'battery is swollen',
      'why did my inverter go off',
      'smell from inverter',
    ],
    keywords: ['beep', 'beeping', 'error', 'fault', 'not charging', 'shut down', 'off', 'swollen', 'smell', 'burning', 'spark', 'tripping', 'breaker', 'restart', 'fix'],
    answer:
      'Please stop there — no one can safely diagnose a live fault from a description, and the wrong "fix" can be dangerous. If there is any smell, heat, swelling or visible damage, switch off at the isolate point if it is safe to reach and keep away.\n\nThe first safe step is to call a qualified installer — send a photo of the label and unit on WhatsApp and Haritech can coordinate a check or a service visit. Do not open the unit or bypass any breaker without written instruction from your installer.',
    link: {
      to: '/haritech/solar-advisor/monitor',
      label: 'Log the readings before the visit',
    },
  },
  {
    id: 'installation',
    questions: [
      'do you install',
      'do you do installation',
      'is installation included',
      'do you come to my house',
      'site assessment',
      'can you inspect my roof',
    ],
    keywords: ['install', 'installation', 'mounting', 'site', 'visit', 'assessment', 'roof'],
    answer:
      'Yes — installation is included with every Haritech solar package, and design-critical details (roof condition, cable routes, distances, actual equipment specifications) are confirmed on site before anything is fixed in place.\n\nSite assessments are booked through the Designer’s "Request site assessment" button or a direct WhatsApp message. Existing panels and second-hand equipment are only counted into a design after they have been inspected.',
    link: { to: '/haritech/solar-advisor', label: 'Request a site assessment in the Designer' },
    related: ['price', 'panel-count'],
  },
  {
    id: 'live-connection',
    questions: [
      'can you monitor my inverter remotely',
      'can you connect to my inverter app',
      'do you support wifi inverter monitoring',
      'can the website show my inverter live',
      'does it connect to my inverter api',
    ],
    keywords: ['live', 'remote', 'monitor', 'connect', 'wifi', 'app', 'api', 'real time', 'realtime'],
    answer:
      'Live inverter data is not connected yet. The Monitor on this site works from readings you take off your inverter meter and enter yourself — it interprets them, estimates runtime and keeps a private history.\n\nDirect inverter connections are only ever added after the exact model, protocol and written authorisation are settled, because it involves hardware access and credentials. A typed reading takes about a minute and needs nothing else.',
    link: { to: '/haritech/solar-advisor/monitor', label: 'Use the manual Power Monitor' },
    related: ['battery-runtime', 'inverter-fault'],
  },
  {
    id: 'privacy',
    questions: [
      'is my information private',
      'do other people see my history',
      'where is my data stored',
      'do i need an account',
      'do you keep my readings',
    ],
    keywords: ['privacy', 'private', 'data', 'stored', 'account', 'history', 'readings', 'assessment'],
    answer:
      'Your Designer and Monitor history stays in your own browser by default — no account, no sign-up, and it is not visible to other visitors or shown in the public site.\n\nThere is an optional cloud backup you switch on yourself with a "Back up" button, and it is opened with a private recovery code kept in your browser. Backed-up copies are stored under that code and are not readable by the admin.',
    link: { to: '/haritech/solar-advisor/monitor', label: 'See the Power Monitor' },
  },
];

/** One line of standing disclaimer, reused by the widget for every answer. */
export const FAQ_DISCLAIMER = FA_VERSION;

export const FAQ_FALLBACK_ANSWER =
  'I answer general solar questions in plain language — units, batteries, costs, starting loads — but I could not match that question with confidence.\n\nIf it is specific to your own appliances or your own inverter, the Designer or the Monitor will do the real work, and WhatsApp reaches a human at Haritech.';

const normalise = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9\s.]/g, ' ').replace(/\s+/g, ' ').trim();

export interface FaqMatch {
  entry: FaqEntry;
  score: number;
}

/** Score every entry by keyword hits in the normalised question. Multi-word
    keywords count double; an exact phrase match from `questions` wins outright. */
export const matchFaq = (question: string): FaqMatch | null => {
  const text = normalise(question);
  if (!text) return null;

  let best: FaqMatch | null = null;
  for (const entry of SOLAR_FAQ) {
    let score = 0;
    for (const q of entry.questions) {
      if (text.includes(normalise(q))) {
        score += 100;
      }
    }
    for (const keyword of entry.keywords) {
      if (text.includes(normalise(keyword))) {
        score += normalise(keyword).includes(' ') ? 2 : 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best;
};

/** The answer a visitor sees. Returns the matched entry or, when nothing
    matches, a fallback that routes to the Designer, the Monitor and WhatsApp
    instead of guessing. */
export const answerQuestion = (
  question: string,
): { answer: string; entryId: FaqEntryId | null; link?: { to: string; label: string }; related: string[] } => {
  const match = matchFaq(question);
  if (!match || match.score < 2) {
    return { answer: FAQ_FALLBACK_ANSWER, entryId: null, related: ['size-system', 'price', 'inverter-fault'] };
  }
  return match.entry.link
    ? {
        answer: match.entry.answer,
        entryId: match.entry.id as FaqEntryId,
        link: match.entry.link,
        related: match.entry.related ?? [],
      }
    : {
        answer: match.entry.answer,
        entryId: match.entry.id as FaqEntryId,
        related: match.entry.related ?? [],
      };
};

/** Question chips the widget offers before anything is typed. */
export const FAQ_STARTER_QUESTIONS = [
  'What size system do I need?',
  'How much does solar cost?',
  'Does solar work at night?',
  'My inverter is beeping — what should I do?',
];

/** Stored questions are lowercase matching keys; chips need sentence case. */
export const displayQuestion = (question: string): string => {
  const body = question.charAt(0).toUpperCase() + question.slice(1).replace(/\bi\b/g, 'I');
  return /[?.]$/.test(body) ? body : `${body}?`;
};
