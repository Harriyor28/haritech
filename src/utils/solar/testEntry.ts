/* Bundle entry used only by scripts/solar-tests.mjs.
   Keeps the calculation modules importable by the dependency-free test
   runner without changing the application build. */
export { calculateEnergy } from './energy';
export { sizeInverter } from './inverter';
export { sizeBattery } from './battery';
export { sizePv } from './pv';
export { runAssessment } from './engine';
export { evaluateReading, directionLabel, voltageStatusLabel, noteContainsSecret } from './monitor';
export { createDefaultInput, entryFromTemplate, createEmptyEntry } from './defaults';
export { bytesToHex, isOwnerToken, payloadTooLarge, retentionLabel, formatRecoveryCode, normaliseRecoveryCode } from './ownerToken';
export { APPLIANCE_CATALOGUE } from '../../config/solar/appliances';
export { DEFAULT_ASSUMPTIONS } from '../../config/solar/assumptions';
export { QUICK_START_BUNDLES, buildBundleEntries, buildBundleInput } from './quickStart';
export { SOLAR_FAQ, answerQuestion, matchFaq, FAQ_FALLBACK_ANSWER, FAQ_STARTER_QUESTIONS, displayQuestion } from './solarFaq';
export { matchHaritechFaq, answerAnyQuestion, buildRemoteContext, HARI_FALLBACK_ANSWER, HARI_STARTER_QUESTIONS, HARI_FAQ, displayAnyQuestion, HARI_KB_VERSION } from '../haritech/haritechFaq';
