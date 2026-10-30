import type { InverterResult, PhaseType } from './types';
import { nonNegative, roundTo } from './validation';

export interface InverterInput {
  simultaneousKw: number;
  surgeKw: number | null;
  powerFactor: number;
  headroom: number;
  sizesKva: number[];
  existingKva: number | null;
  phase: PhaseType;
}

export const sizeInverter = (input: InverterInput): InverterResult => {
  const warnings: string[] = [];
  const pf = input.powerFactor > 0 && input.powerFactor <= 1 ? input.powerFactor : 0.8;
  const headroom = input.headroom >= 1 ? input.headroom : 1.25;
  const loadKw = nonNegative(input.simultaneousKw);
  const requiredContinuousKw = loadKw * headroom;
  const requiredKva = pf > 0 ? requiredContinuousKw / pf : requiredContinuousKw;

  if (loadKw <= 0) {
    return {
      requiredContinuousKw: 0,
      requiredKva: 0,
      recommendedKva: null,
      recommendedContinuousKw: null,
      surgeRequiredKw: input.surgeKw,
      warnings: ['Add appliances and mark which ones run together to size an inverter.'],
    };
  }

  const sizes = [...input.sizesKva].filter((size) => size > 0).sort((a, b) => a - b);
  const recommendedKva = sizes.find((size) => size >= requiredKva && size * pf >= requiredContinuousKw) ?? null;

  if (recommendedKva === null) {
    warnings.push(
      'The calculated requirement is above the standard sizes this tool models. A custom three-phase or parallel-inverter design is needed.',
    );
  }

  const recommendedContinuousKw = recommendedKva === null ? null : recommendedKva * pf;

  if (input.surgeKw !== null && recommendedKva !== null && recommendedContinuousKw !== null) {
    if (input.surgeKw > recommendedContinuousKw) {
      warnings.push(
        `Starting surge is estimated at ${roundTo(input.surgeKw, 1)} kW, above the recommended inverter's ${roundTo(recommendedContinuousKw, 1)} kW continuous rating. Confirm the model's surge rating (kW) and its duration in the datasheet.`,
      );
    } else {
      warnings.push(
        `Confirm the selected inverter's surge rating covers ${roundTo(input.surgeKw, 1)} kW for the time your largest motor needs to start.`,
      );
    }
  }

  if (input.existingKva !== null && input.existingKva > 0 && input.existingKva < requiredKva) {
    warnings.push(
      `The existing ${input.existingKva} kVA inverter is below the calculated ${roundTo(requiredKva, 1)} kVA requirement. It may overload or shut down under the declared load.`,
    );
  }

  if (input.phase === 'three' && recommendedKva !== null && recommendedKva < 5) {
    warnings.push('Three-phase equipment usually needs a larger inverter and a site assessment. Confirm the phase requirement with a qualified installer.');
  }

  return {
    requiredContinuousKw: roundTo(requiredContinuousKw, 2),
    requiredKva: roundTo(requiredKva, 2),
    recommendedKva,
    recommendedContinuousKw: recommendedContinuousKw === null ? null : roundTo(recommendedContinuousKw, 2),
    surgeRequiredKw: input.surgeKw,
    warnings,
  };
};
