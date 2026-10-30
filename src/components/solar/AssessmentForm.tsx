import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Package, RotateCcw } from 'lucide-react';
import type {
  AssessmentInput,
  BuildingType,
  CustomerDetails,
  IntendedUse,
  PhaseType,
} from '../../utils/solar/types';
import { DEFAULT_PEAK_SUN_HOURS_NOTE } from '../../config/solar/assumptions';
import {
  QUICK_START_BUNDLES,
  type QuickStartBundleId,
} from '../../utils/solar/quickStart';
import { NumberField, SelectField, StepCard, TextField, Toggle, hintClass } from './SolarField';

interface PropertyStepProps {
  input: AssessmentInput;
  customer: CustomerDetails;
  onChange: (patch: Partial<AssessmentInput>) => void;
  onCustomerChange: (patch: Partial<CustomerDetails>) => void;
  /** Optional one-tap starter lists, applied by the page. */
  onApplyBundle?: (bundleId: QuickStartBundleId) => void;
}

const buildingOptions: { value: BuildingType; label: string }[] = [
  { value: 'residential', label: 'A home' },
  { value: 'commercial', label: 'A shop or business place' },
  { value: 'industrial', label: 'A factory or workshop' },
  { value: 'other', label: 'Something else' },
];

const useOptions: { value: IntendedUse; label: string }[] = [
  { value: 'essential', label: 'Only the important things — lights, TV, phone charging' },
  { value: 'whole-home', label: 'The whole home' },
  { value: 'shop', label: 'A shop — fridges, POS, lights' },
  { value: 'office', label: 'Work — computers and office equipment' },
  { value: 'business', label: 'General business operations' },
  { value: 'industrial', label: 'Heavy machines' },
];

const phaseOptions: { value: PhaseType; label: string }[] = [
  { value: 'single', label: 'Single phase' },
  { value: 'three', label: 'Three phase' },
];

const bundleButtonClass =
  'rounded-xl border border-white/10 bg-white/5 p-2.5 text-left transition-colors hover:border-amber-400/40 hover:bg-amber-400/10';

export const PropertyStep: React.FC<PropertyStepProps> = ({
  input,
  customer,
  onChange,
  onCustomerChange,
  onApplyBundle,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="space-y-4">
      {onApplyBundle && (
        <StepCard
          title="Start with a ready-made list"
          description="Not sure what to pick? Tap the closest one and you can change or add anything on the next step."
        >
          <div className="grid sm:grid-cols-2 gap-2.5">
            {QUICK_START_BUNDLES.map((bundle) => (
              <button
                key={bundle.id}
                type="button"
                onClick={() => onApplyBundle(bundle.id)}
                className={bundleButtonClass}
              >
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-amber-300" />
                  <span className="text-xs font-bold text-white">{bundle.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{bundle.description}</p>
                <p className="mt-1.5 text-[10px] font-mono uppercase tracking-wide text-slate-500">
                  {bundle.includes.join(' · ')}
                </p>
              </button>
            ))}
          </div>
          <p className={`${hintClass} mt-2.5`}>
            Not on the list? Skip this — the next step has the full appliance catalogue and a custom item option.
          </p>
        </StepCard>
      )}

      <StepCard
        title="Your details"
        description="Used only on the printable assessment you generate. Nothing here is uploaded to the public site."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField
            label="Full name"
            value={customer.name}
            onChange={(value) => onCustomerChange({ name: value })}
            placeholder="e.g. Ada Okafor"
            maxLength={120}
          />
          <TextField
            label="Location"
            value={customer.location}
            onChange={(value) => onCustomerChange({ location: value })}
            placeholder="City / area"
            maxLength={120}
          />
          <TextField
            label="Phone or email"
            value={customer.contact}
            onChange={(value) => onCustomerChange({ contact: value })}
            placeholder="How Haritech should reach you"
            maxLength={160}
          />
        </div>
        <p className={`${hintClass} mt-3`}>
          Assessment history is stored in this browser only. It is not published, and it is not visible to other visitors.
        </p>
      </StepCard>

      <StepCard
        title="About the place"
        description="Two quick questions — plain answers are fine, the advisor takes care of the rest."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <SelectField
            label="What kind of place is it?"
            value={input.buildingType}
            options={buildingOptions}
            onChange={(value) => onChange({ buildingType: value })}
          />
          <SelectField
            label="What should mainly keep running?"
            value={input.intendedUse}
            options={useOptions}
            onChange={(value) => onChange({ intendedUse: value })}
          />
        </div>
        <div className="mt-3 max-w-xs">
          <Toggle
            label="Yes — I expect to add more later"
            checked={input.wantsExpansion}
            onChange={(checked) => onChange({ wantsExpansion: checked })}
            hint="The advisor leaves room to grow when planning."
          />
        </div>
      </StepCard>

      <StepCard
        title="When the power goes off"
        description="This decides how much battery the design builds in."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <NumberField
            label="How many hours should your appliances keep running?"
            suffix="h"
            min={0}
            max={72}
            step={0.5}
            value={input.backupHours}
            onChange={(value) => onChange({ backupHours: value ?? 0 })}
            hint="From the moment of an outage, without grid power."
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5 mt-3">
          <Toggle
            label="Keep appliances on during an outage"
            checked={input.wantsBackup}
            onChange={(checked) => onChange({ wantsBackup: checked })}
          />
          <Toggle
            label="I also want to run at night"
            checked={input.wantsNightUse}
            onChange={(checked) => onChange({ wantsNightUse: checked })}
            hint="Night use needs battery storage."
          />
        </div>
      </StepCard>

      <div className="rounded-xl border border-white/10 bg-[#0b101c]/80">
        <button
          type="button"
          onClick={() => setShowTechnical((value) => !value)}
          aria-expanded={showTechnical}
          className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Technical details — budget, reserve, wiring, existing equipment
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300">
            {showTechnical ? 'Hide' : 'Show'}
            {showTechnical ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        {showTechnical && (
          <div className="px-3.5 pb-3.5 space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <NumberField
                label="Budget (optional)"
                suffix="₦"
                min={0}
                step={10000}
                value={input.budgetNgn}
                placeholder="No budget entered"
                onChange={(value) => onChange({ budgetNgn: value })}
              />
              <NumberField
                label="Battery reserve margin"
                suffix="%"
                min={0}
                max={100}
                step={5}
                value={input.reserveMarginPct}
                onChange={(value) => onChange({ reserveMarginPct: value ?? 0 })}
                hint="Extra capacity added above the calculated requirement."
              />
              <SelectField
                label="Supply phase"
                value={input.phase}
                options={phaseOptions}
                onChange={(value) => onChange({ phase: value })}
                hint="Three-phase designs need a site assessment."
              />
            </div>

            <div className="border-t border-white/10 pt-3.5">
              <p className="text-xs font-bold text-slate-200 mb-1.5">Existing equipment</p>
              <p className={`${hintClass} mb-2.5`}>
                Only tick what you already own. The advisor checks compatibility and will not assume an unstated model.
              </p>
              <div className="grid sm:grid-cols-3 gap-2.5">
                <Toggle
                  label="I own an inverter"
                  checked={input.ownsInverter}
                  onChange={(checked) =>
                    onChange({
                      ownsInverter: checked,
                      existingInverterKva: checked ? input.existingInverterKva : null,
                      existingInverterBatteryVoltage: checked ? input.existingInverterBatteryVoltage : null,
                    })
                  }
                />
                <Toggle
                  label="I own a battery"
                  checked={input.ownsBattery}
                  onChange={(checked) =>
                    onChange({
                      ownsBattery: checked,
                      existingBatteryKwh: checked ? input.existingBatteryKwh : null,
                    })
                  }
                />
                <Toggle
                  label="I own solar panels"
                  checked={input.ownsPanels}
                  onChange={(checked) => onChange({ ownsPanels: checked })}
                />
              </div>

              {(input.ownsInverter || input.ownsBattery) && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  {input.ownsInverter && (
                    <>
                      <NumberField
                        label="Existing inverter rating"
                        suffix="kVA"
                        min={0}
                        step={0.5}
                        value={input.existingInverterKva}
                        placeholder="From the label"
                        onChange={(value) => onChange({ existingInverterKva: value })}
                      />
                      <NumberField
                        label="Inverter battery voltage"
                        suffix="V"
                        min={0}
                        step={1}
                        value={input.existingInverterBatteryVoltage}
                        placeholder="e.g. 48"
                        onChange={(value) => onChange({ existingInverterBatteryVoltage: value })}
                        hint="Used to reject an incompatible battery bank."
                      />
                    </>
                  )}
                  {input.ownsBattery && (
                    <NumberField
                      label="Existing battery energy"
                      suffix="kWh"
                      min={0}
                      step={0.1}
                      value={input.existingBatteryKwh}
                      placeholder="Nominal kWh"
                      onChange={(value) => onChange({ existingBatteryKwh: value })}
                    />
                  )}
                </div>
              )}

              {input.ownsPanels && (
                <p className={`${hintClass} mt-3`}>
                  Panel model, age and condition must be checked on site. The advisor does not count existing panels
                  towards the new array until their specifications are confirmed.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SystemStepProps {
  input: AssessmentInput;
  onChange: (patch: Partial<AssessmentInput>) => void;
  onResetTechnical: () => void;
}

const percent = (value: number): number => Math.round(value * 1000) / 10;

export const SystemStep: React.FC<SystemStepProps> = ({ input, onChange, onResetTechnical }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="space-y-4">
      <StepCard
        title="Sunlight at your location"
        description="One number your installer can confirm: how many full-strength sun hours your area receives per day."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NumberField
            label="Peak sun hours per day"
            suffix="h/day"
            min={0}
            max={12}
            step={0.1}
            value={input.peakSunHours}
            placeholder="Leave blank if unsure"
            onChange={(value) => onChange({ peakSunHours: value })}
            hint="Ask your installer, or press continue and confirm it at the site assessment."
          />
        </div>
        <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2.5 flex items-start gap-2">
          <Info className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
          <p className="text-[11px] text-cyan-100/80 leading-relaxed">{DEFAULT_PEAK_SUN_HOURS_NOTE}</p>
        </div>
      </StepCard>

      <div className="rounded-xl border border-white/10 bg-[#0b101c]/80">
        <button
          type="button"
          onClick={() => setShowTechnical((value) => !value)}
          aria-expanded={showTechnical}
          className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Technical details — efficiencies, battery and panel datasheets
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300">
            {showTechnical ? 'Hide' : 'Show'}
            {showTechnical ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        {!showTechnical && (
          <p className="px-3.5 pb-3 text-[11px] text-slate-500 leading-relaxed">
            Leave the agreed engineering figures as they are — the sizing defaults are shown on the results page, and
            equipment specifics are confirmed in the quotation.
          </p>
        )}

        {showTechnical && (
          <div className="px-3.5 pb-3.5 space-y-4">
            <StepCard
              title="Battery and inverter assumptions"
              description="These figures drive the sizing arithmetic. Change them only if you have a reason and can explain it."
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <NumberField
                  label="PV system efficiency"
                  suffix="%"
                  min={10}
                  max={100}
                  step={1}
                  value={percent(input.systemEfficiency)}
                  onChange={(value) => onChange({ systemEfficiency: (value ?? 0) / 100 })}
                  hint="Wiring, temperature, soiling and inverter losses combined."
                />
                <NumberField
                  label="Inverter efficiency"
                  suffix="%"
                  min={10}
                  max={100}
                  step={1}
                  value={percent(input.inverterEfficiency)}
                  onChange={(value) => onChange({ inverterEfficiency: (value ?? 0) / 100 })}
                />
                <NumberField
                  label="Depth of discharge"
                  suffix="%"
                  min={10}
                  max={100}
                  step={1}
                  value={percent(input.depthOfDischarge)}
                  onChange={(value) => onChange({ depthOfDischarge: (value ?? 0) / 100 })}
                  hint="Manufacturer-approved usable share of the battery."
                />
                <NumberField
                  label="Power factor"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={input.powerFactor}
                  onChange={(value) => onChange({ powerFactor: value ?? 0.8 })}
                  hint="Converts kW to kVA. Confirm the inverter datasheet."
                />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <NumberField
                  label="Battery bank voltage"
                  suffix="V"
                  min={0}
                  step={1}
                  value={input.batteryVoltage}
                  placeholder="e.g. 48"
                  onChange={(value) => onChange({ batteryVoltage: value })}
                  hint="Ah is only calculated when this is known."
                />
                <NumberField
                  label="Battery module voltage"
                  suffix="V"
                  min={0}
                  step={1}
                  value={input.batteryModuleVoltage}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ batteryModuleVoltage: value })}
                />
                <NumberField
                  label="Battery module energy"
                  suffix="kWh"
                  min={0}
                  step={0.1}
                  value={input.batteryModuleKwh}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ batteryModuleKwh: value })}
                />
                <NumberField
                  label="Battery continuous discharge"
                  suffix="kW"
                  min={0}
                  step={0.1}
                  value={input.batteryMaxDischargeKw}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ batteryMaxDischargeKw: value })}
                />
              </div>
            </StepCard>

            <StepCard
              title="Panel and inverter specifications"
              description="Leave these blank unless you have the actual datasheet. The advisor will not invent a model, a string design or a charge limit."
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <NumberField
                  label="Panel rated power"
                  suffix="W"
                  min={0}
                  step={5}
                  value={input.panelWatt}
                  placeholder="e.g. 400"
                  onChange={(value) => onChange({ panelWatt: value })}
                />
                <NumberField
                  label="Panel Voc"
                  suffix="V"
                  min={0}
                  step={0.1}
                  value={input.panelVoc}
                  placeholder="Open-circuit"
                  onChange={(value) => onChange({ panelVoc: value })}
                />
                <NumberField
                  label="Panel Vmp"
                  suffix="V"
                  min={0}
                  step={0.1}
                  value={input.panelVmp}
                  placeholder="Maximum power"
                  onChange={(value) => onChange({ panelVmp: value })}
                />
                <NumberField
                  label="Panel Imp"
                  suffix="A"
                  min={0}
                  step={0.1}
                  value={input.panelImp}
                  placeholder="Maximum power"
                  onChange={(value) => onChange({ panelImp: value })}
                />
                <NumberField
                  label="Panel Isc"
                  suffix="A"
                  min={0}
                  step={0.1}
                  value={input.panelIsc}
                  placeholder="Short-circuit"
                  onChange={(value) => onChange({ panelIsc: value })}
                />
                <NumberField
                  label="Inverter max PV input"
                  suffix="kWp"
                  min={0}
                  step={0.1}
                  value={input.inverterMaxPvKw}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ inverterMaxPvKw: value })}
                />
                <NumberField
                  label="Maximum PV voltage"
                  suffix="V"
                  min={0}
                  step={10}
                  value={input.maxPvVoltage}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ maxPvVoltage: value })}
                />
                <NumberField
                  label="Maximum charge current"
                  suffix="A"
                  min={0}
                  step={1}
                  value={input.maxChargeCurrent}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ maxChargeCurrent: value })}
                />
                <NumberField
                  label="MPPT minimum voltage"
                  suffix="V"
                  min={0}
                  step={1}
                  value={input.mpptMinV}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ mpptMinV: value })}
                />
                <NumberField
                  label="MPPT maximum voltage"
                  suffix="V"
                  min={0}
                  step={1}
                  value={input.mpptMaxV}
                  placeholder="From datasheet"
                  onChange={(value) => onChange({ mpptMaxV: value })}
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={onResetTechnical}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore defaults
                  </button>
                </div>
              </div>
              <p className={`${hintClass} mt-3`}>
                Final string design, cable sizing, isolators and protection must be confirmed by a qualified installer
                using the actual panel and inverter datasheets.
              </p>
            </StepCard>
          </div>
        )}
      </div>
    </div>
  );
};
