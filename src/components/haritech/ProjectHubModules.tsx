import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Bell, Boxes, Building2, CalendarClock, Camera, CheckCircle2,
  ChevronDown, Circle, ClipboardCheck, ClipboardList, Clock, Cpu, Droplets, Eye, FileText,
  FolderOpen, HardHat, Hammer, Home, LayoutDashboard, Lock, MapPin, MessageCircle,
  Receipt, Ruler, ScanLine, Search, ShieldAlert, ShieldCheck, TrendingDown,
  TrendingUp, UserCheck, Users, Wallet, Wrench, Zap, LucideIcon,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import {
  daysFromNow, fullDay, naira, nairaShort, shortDay,
} from '../../utils/haritechProperty';
import type { PropertyHubContent } from '../../utils/haritechProperty';

export interface HubModuleSpec {
  id: string;
  label: string;
  short: string;
  icon: LucideIcon;
  blurb: string;
}

/* Reference models shown on the Project Management page. Each is a planning
   and reporting pattern, not a claim that Haritech operates a live platform or
   holds construction, surveying, property-management or engineering licences.
   Sensor/IoT monitoring is deliberately absent — it is not a confirmed service. */
export const HUB_MODULES: HubModuleSpec[] = [
  { id: 'overview', label: 'Delivery Overview', short: 'Overview', icon: LayoutDashboard, blurb: 'How a plan, its milestones and its reporting fit together' },
  { id: 'construction', label: 'Build Coordination', short: 'Build', icon: HardHat, blurb: 'Reference model: programme, budget lines and trade coordination' },
  { id: 'monitoring', label: 'Progress Reporting', short: 'Reporting', icon: Eye, blurb: 'Reference model: planned versus actual, with written updates' },
  { id: 'properties', label: 'Property Records', short: 'Property', icon: Home, blurb: 'Reference model: unit records and maintenance history' },
  { id: 'land', label: 'Site & Land Records', short: 'Site', icon: MapPin, blurb: 'Reference model: document register and checks before a purchase' },
  { id: 'maintenance', label: 'Renovation & Maintenance', short: 'Renovation', icon: Wrench, blurb: 'Reference model: work orders and recurring upkeep' },
  { id: 'visualisation', label: 'Finishes Preview', short: 'Finishes', icon: Boxes, blurb: 'Illustrative finishes and room palettes' },
  { id: 'inspections', label: 'Checks & Snags', short: 'Checks', icon: ClipboardCheck, blurb: 'Reference model: defect and completion checklists' },
  { id: 'budget', label: 'Budget Tracking', short: 'Budget', icon: Wallet, blurb: 'Reference model: budget against spend, with assumptions' },
  { id: 'contractors', label: 'Trades & Suppliers', short: 'Trades', icon: Users, blurb: 'Reference model: who is doing what, and when' },
  { id: 'documents', label: 'Documents & Approvals', short: 'Documents', icon: FileText, blurb: 'Reference model: document register and sign-off' },
  { id: 'portal', label: 'Client Access Model', short: 'Access', icon: Lock, blurb: 'What a client is given access to during a project' },
  { id: 'activity', label: 'Updates & Activity', short: 'Updates', icon: Bell, blurb: 'Reference model: how updates are issued and recorded' },
];

/* ── Shared primitives ─────────────────────────────────────────────────── */

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/5 bg-[#0b101d]/70 p-4 sm:p-5 ${className}`}>{children}</div>
);

const SectionHead: React.FC<{ eyebrow: string; title: string; accent: string; desc: string; icon: LucideIcon }> = ({ eyebrow, title, accent, desc, icon: Icon }) => (
  <div className="mb-6">
    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
      <Icon className="h-3 w-3" /> {eyebrow}
    </div>
    <h2 className="mb-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl md:text-3xl">
      {title} <span className="text-cyan-400">{accent}</span>
    </h2>
    <p className="max-w-3xl text-xs leading-relaxed text-slate-400 sm:text-sm">{desc}</p>
  </div>
);

const Bar: React.FC<{ value: number; tone?: string; height?: string }> = ({ value, tone = 'from-cyan-500 to-blue-500', height = 'h-1.5' }) => (
  <div className={`w-full overflow-hidden rounded-full bg-white/5 ${height}`}>
    <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

type Tone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet';
const TONE: Record<Tone, string> = {
  cyan: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  rose: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  slate: 'border-white/10 bg-white/5 text-slate-300',
  violet: 'border-violet-500/25 bg-violet-500/10 text-violet-300',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: Tone; dot?: boolean }> = ({ children, tone = 'slate', dot }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${TONE[tone]}`}>
    {dot && <span className="h-1 w-1 rounded-full bg-current" />}
    {children}
  </span>
);

const Stat: React.FC<{ label: string; value: string; note?: string; icon: LucideIcon; tone?: Tone }> = ({ label, value, note, icon: Icon, tone = 'cyan' }) => (
  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
    <Icon className="mb-1.5 h-4 w-4 text-slate-400" />
    <div className={`font-mono text-lg font-extrabold sm:text-xl ${TONE[tone].split(' ').pop()}`}>{value}</div>
    <div className="mt-0.5 text-[10px] leading-snug text-slate-500">{label}</div>
    {note && <div className="mt-1 font-mono text-[9px] text-slate-600">{note}</div>}
  </div>
);

const Notice: React.FC<{ children: React.ReactNode; tone?: Tone; icon?: LucideIcon }> = ({ children, tone = 'amber', icon: Icon = ShieldAlert }) => (
  <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-[11px] leading-relaxed ${TONE[tone]}`}>
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    <p className="text-slate-300">{children}</p>
  </div>
);

const Selector: React.FC<{ options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }> = ({ options, value, onChange }) => (
  <div className="mb-4 flex flex-wrap gap-2">
    {options.map(option => (
      <button
        key={option.id}
        onClick={() => onChange(option.id)}
        className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-colors ${value === option.id ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400 hover:text-white'}`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const toWa = (message: string) => getWhatsAppUrl(message);

/* ── 2. Construction Management ────────────────────────────────────────── */

const CONSTRUCTION_TYPES = [
  { icon: Home, title: 'Residential builds', body: 'Detached houses, duplexes and bungalows — from foundation to handover.' },
  { icon: Building2, title: 'Estates & multi-unit', body: 'Terraces, apartments and phased estate delivery with shared infrastructure.' },
  { icon: HardHat, title: 'Commercial', body: 'Offices, shops and mixed-use premises, including fit-out and services.' },
  { icon: Hammer, title: 'Renovation & extension', body: 'Structural alterations, extensions and full refurbishment programmes.' },
];

const COORDINATION = [
  'Architectural & engineering coordination', 'Bill of quantities and cost estimation',
  'Materials procurement and delivery tracking', 'Contractor and subcontractor scheduling',
  'Workmanship and quality inspections', 'Milestone verification and sign-off',
  'Site progress reporting', 'Handover documentation and completion reports',
];

const ConstructionModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => (
  <div>
    <SectionHead icon={HardHat} eyebrow="Construction Management" title="Build Programmes, Not" accent="Promises"
      desc="Every build is run against a costed programme: a named lead, a phase, a budget with committed spend, and a next milestone you can verify. Sample build records are shown below." />

    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CONSTRUCTION_TYPES.map((type, i) => {
        const Icon = type.icon;
        return (
          <motion.div key={type.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card className="h-full">
              <Icon className="mb-2 h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white">{type.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{type.body}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>

    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">Live build programmes</h3>
          <Pill tone="cyan" dot>sample records</Pill>
        </div>
        <div className="space-y-3">
          {data.buildProjects.map(project => {
            const spend = project.spentNgn + project.committedNgn;
            const slip = project.progress - project.planned;
            return (
              <div key={project.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
                <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-white">{project.name}</h4>
                    <p className="text-[10px] text-slate-500">{project.client} · {project.location}</p>
                  </div>
                  <Pill tone={slip < -5 ? 'rose' : slip < 0 ? 'amber' : 'emerald'}>
                    {slip >= 0 ? '+' : ''}{slip}% vs plan
                  </Pill>
                </div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>{project.stage}</span>
                  <span>{project.progress}% actual · {project.planned}% planned</span>
                </div>
                <Bar value={project.progress} />
                <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-[10px]">
                  <div>
                    <div className="text-slate-500">Budget</div>
                    <div className="font-mono text-white">{nairaShort(project.budgetNgn)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Spent + committed</div>
                    <div className="font-mono text-white">{nairaShort(spend)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Next milestone</div>
                    <div className="truncate text-slate-300">{project.nextMilestone}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Pill tone="slate"><UserCheck className="h-2.5 w-2.5" /> {project.lead}</Pill>
                  <Pill tone="slate"><CalendarClock className="h-2.5 w-2.5" /> {shortDay(project.targetDate)}</Pill>
                  <Pill tone={spend > project.budgetNgn * 0.85 ? 'amber' : 'slate'}>{Math.round((spend / project.budgetNgn) * 100)}% budget used</Pill>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <h3 className="mb-3 text-sm font-bold text-white">What we coordinate</h3>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {COORDINATION.map(item => (
              <li key={item} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> {item}
              </li>
            ))}
          </ul>
        </Card>
        <Notice tone="cyan" icon={Ruler}>
          Bill of quantities figures are estimates until a quantity surveyor prices them. Structural and engineering
          designs are issued by registered professionals — the Hub coordinates them, it does not certify them.
        </Notice>
        <a href={toWa('Hello Haritech! I would like to discuss a construction project and monitoring package.')} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-xs">
          <MessageCircle className="h-4 w-4" /> Discuss a build
        </a>
      </div>
    </div>
  </div>
);

/* ── 3. Project Monitoring ─────────────────────────────────────────────── */

const MonitoringModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [projectId, setProjectId] = useState(data.buildProjects[0]?.id ?? '');
  const [openReport, setOpenReport] = useState<string | null>(null);
  const project = data.buildProjects.find(item => item.id === projectId) ?? data.buildProjects[0];
  const reports = data.reports.filter(report => report.projectId === projectId);
  if (!project) return null;
  const slip = project.progress - project.planned;

  return (
    <div>
      <SectionHead icon={Eye} eyebrow="Remote Construction Monitoring" title="See the Site Without" accent="Being There"
        desc="Timestamped reports, geotagged photographs, materials delivered against materials used, labour records and outstanding risks — so an investor abroad can follow the build without daily site visits." />

      <Selector options={data.buildProjects.map(item => ({ id: item.id, label: item.name }))} value={projectId} onChange={id => { setProjectId(id); setOpenReport(null); }} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="Actual progress" value={`${project.progress}%`} note={`${project.stage}`} tone="cyan" />
        <Stat icon={TrendingDown} label="Planned progress" value={`${project.planned}%`} note={slip >= 0 ? `${slip}% ahead` : `${Math.abs(slip)}% behind`} tone={slip < 0 ? 'amber' : 'emerald'} />
        <Stat icon={Camera} label="Reports on file" value={String(reports.length)} note="sample records" tone="violet" />
        <Stat icon={Clock} label="Target completion" value={shortDay(project.targetDate)} note={`${daysFromNow(project.targetDate)} days away`} tone="slate" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Planned vs actual</h3>
            <Pill tone={slip < -5 ? 'rose' : slip < 0 ? 'amber' : 'emerald'}>{slip >= 0 ? 'on or ahead' : 'behind programme'}</Pill>
          </div>
          <div className="space-y-3">
            {[{ label: 'Planned', value: project.planned, tone: 'from-slate-500 to-slate-400' },
              { label: 'Actual', value: project.progress, tone: 'from-cyan-500 to-blue-500' }].map(row => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>{row.label}</span><span>{row.value}%</span>
                </div>
                <Bar value={row.value} tone={row.tone} height="h-2" />
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
            {[
              { label: 'Milestone verification', value: project.nextMilestone },
              { label: 'Materials delivered vs used', value: 'Reconciled per report' },
              { label: 'Labour records', value: 'Daily attendance captured' },
              { label: 'Photo evidence', value: 'Geotagged where available' },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between gap-3 text-[10px]">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-right text-slate-300">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Notice tone="amber">
              Photographs and reports are evidence, not proof of every activity or expense. Payments are only
              reconciled against verified records by a named approver.
            </Notice>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Site reports</h3>
            <Pill tone="cyan" dot>{reports.length} sample</Pill>
          </div>
          <div className="space-y-2">
            {reports.map(report => {
              const expanded = openReport === report.id;
              return (
                <div key={report.id} className="overflow-hidden rounded-xl border border-white/5 bg-slate-950/40">
                  <button onClick={() => setOpenReport(expanded ? null : report.id)} className="w-full px-3 py-2.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Pill tone={report.type === 'Inspection' ? 'violet' : report.type === 'Weekly' ? 'cyan' : 'slate'}>{report.type}</Pill>
                        <span className="font-mono text-[10px] text-slate-500">{fullDay(report.date)}</span>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                    <p className={`mt-1.5 text-[11px] leading-relaxed text-slate-300 ${expanded ? '' : 'line-clamp-2'}`}>{report.summary}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[9px] text-slate-600">
                      <span className="inline-flex items-center gap-1"><Camera className="h-2.5 w-2.5" /> {report.photos} photos</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {report.geotagged ? 'geotagged' : 'no geotag'}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {report.labour} workers</span>
                      <span>{report.author}</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="space-y-2.5 border-t border-white/5 px-3 py-3">
                      <div>
                        <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">Materials delivered vs used</div>
                        <div className="space-y-1">
                          {report.materials.map(material => (
                            <div key={material.name} className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">{material.name}</span>
                              <span className="font-mono text-slate-300">
                                {material.delivered} / {material.used} {material.unit}
                                <span className={`ml-1.5 ${material.used > material.delivered ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {material.used > material.delivered ? 'over' : `${material.delivered - material.used} left`}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">Risks & outstanding tasks</div>
                        <ul className="space-y-1">
                          {report.risks.map(risk => (
                            <li key={risk} className="flex items-start gap-1.5 text-[10px] text-amber-200/80">
                              <AlertTriangle className="mt-0.5 h-2.5 w-2.5 shrink-0" /> {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {reports.length === 0 && <p className="py-6 text-center text-xs text-slate-600">No reports recorded for this project yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ── 4. Property Management ────────────────────────────────────────────── */

const STATUS_TONE: Record<string, Tone> = { Verified: 'emerald', Pending: 'amber', Overdue: 'rose' };

const PropertyModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [propertyId, setPropertyId] = useState('all');
  const totals = useMemo(() => {
    const units = data.properties.reduce((sum, p) => sum + p.units, 0);
    const occupied = data.properties.reduce((sum, p) => sum + p.occupied, 0);
    return {
      units, occupied, vacant: units - occupied,
      rentRoll: data.properties.reduce((sum, p) => sum + p.rentRollNgn, 0),
      issues: data.properties.reduce((sum, p) => sum + p.openIssues, 0),
    };
  }, [data.properties]);
  const rent = data.rent.filter(record => propertyId === 'all' || record.propertyId === propertyId);
  const verified = rent.filter(record => record.status === 'Verified').reduce((sum, record) => sum + record.amountNgn, 0);
  const pending = rent.filter(record => record.status === 'Pending').reduce((sum, record) => sum + record.amountNgn, 0);
  const overdue = rent.filter(record => record.status === 'Overdue').reduce((sum, record) => sum + record.amountNgn, 0);

  return (
    <div>
      <SectionHead icon={Home} eyebrow="Property & Rental Management" title="Every Unit, Tenant and" accent="Rent Record"
        desc="Register properties and units, track occupancy, lease dates and maintenance, and keep a rent ledger that separates verified payments from receipts that are merely pending." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={Building2} label="Units under management" value={String(totals.units)} tone="cyan" />
        <Stat icon={Users} label="Occupied" value={String(totals.occupied)} note={`${Math.round((totals.occupied / Math.max(totals.units, 1)) * 100)}% occupancy`} tone="emerald" />
        <Stat icon={Home} label="Vacant" value={String(totals.vacant)} tone={totals.vacant > 0 ? 'amber' : 'slate'} />
        <Stat icon={Wallet} label="Annual rent roll" value={nairaShort(totals.rentRoll)} tone="violet" />
        <Stat icon={Wrench} label="Open maintenance" value={String(totals.issues)} tone={totals.issues > 2 ? 'amber' : 'slate'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Property register</h3>
            <Pill tone="cyan" dot>sample records</Pill>
          </div>
          <div className="space-y-2">
            {data.properties.map(property => {
              const occupancy = Math.round((property.occupied / Math.max(property.units, 1)) * 100);
              const inspectionIn = daysFromNow(property.nextInspection);
              return (
                <div key={property.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-white">{property.name}</h4>
                      <p className="text-[10px] text-slate-500">{property.kind} · {property.location}</p>
                    </div>
                    <Pill tone={inspectionIn < 7 ? 'amber' : 'slate'}>inspection {inspectionIn < 0 ? 'overdue' : `in ${inspectionIn}d`}</Pill>
                  </div>
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span>{property.occupied}/{property.units} units · {property.manager}</span>
                    <span>{nairaShort(property.rentRollNgn)}/yr</span>
                  </div>
                  <Bar value={occupancy} tone={occupancy >= 90 ? 'from-emerald-500 to-teal-500' : occupancy >= 70 ? 'from-cyan-500 to-blue-500' : 'from-amber-500 to-orange-500'} />
                  {property.openIssues > 0 && (
                    <p className="mt-1.5 font-mono text-[9px] text-amber-300/80">{property.openIssues} open maintenance {property.openIssues === 1 ? 'item' : 'items'}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Rent ledger</h3>
            <select value={propertyId} onChange={e => setPropertyId(e.target.value)} className="rounded-lg border border-white/5 bg-slate-950/60 px-2 py-1 text-[10px] text-white outline-none focus:border-cyan-500/40">
              <option value="all">All properties</option>
              {data.properties.map(property => <option key={property.id} value={property.id}>{property.name}</option>)}
            </select>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
              <div className="font-mono text-[9px] uppercase tracking-wider text-emerald-300">Verified</div>
              <div className="font-mono text-xs font-bold text-white">{nairaShort(verified)}</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
              <div className="font-mono text-[9px] uppercase tracking-wider text-amber-300">Pending</div>
              <div className="font-mono text-xs font-bold text-white">{nairaShort(pending)}</div>
            </div>
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-2">
              <div className="font-mono text-[9px] uppercase tracking-wider text-rose-300">Overdue</div>
              <div className="font-mono text-xs font-bold text-white">{nairaShort(overdue)}</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {rent.map((record, i) => (
              <div key={`${record.tenant}-${i}`} className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-2 text-[10px]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 font-mono text-[9px] text-slate-300">
                  {record.tenant.split(' ').map(part => part[0]).join('').slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-white">{record.tenant}</div>
                  <div className="truncate text-slate-500">{record.unit} · due {shortDay(record.dueDate)}</div>
                </div>
                <span className="shrink-0 font-mono text-slate-300">{naira(record.amountNgn)}</span>
                <Pill tone={STATUS_TONE[record.status]}>{record.status}</Pill>
              </div>
            ))}
            {rent.length === 0 && <p className="py-5 text-center text-xs text-slate-600">No rent records for this property.</p>}
          </div>
          <div className="mt-3">
            <Notice tone="amber">
              A tenant uploading a receipt does not make a payment verified. Only reconciled bank credits are marked
              verified; everything else stays pending.
            </Notice>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ── 5. Land & Development ─────────────────────────────────────────────── */

const LandModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [assetId, setAssetId] = useState(data.land[0]?.id ?? '');
  const [checks, setChecks] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(data.land.map(asset => [asset.id, asset.checklist.map(item => item.done)]))
  );
  const asset = data.land.find(item => item.id === assetId) ?? data.land[0];
  if (!asset) return null;
  const state = checks[asset.id] ?? asset.checklist.map(item => item.done);
  const done = state.filter(Boolean).length;
  const readiness = Math.round((done / Math.max(state.length, 1)) * 100);
  const toggle = (index: number) => {
    setChecks(prev => ({ ...prev, [asset.id]: state.map((value, i) => (i === index ? !value : value)) }));
  };

  return (
    <div>
      <SectionHead icon={MapPin} eyebrow="Land & Property Development" title="An Asset Register You Can" accent="Defend"
        desc="Land, title positions and development stages in one register, with a due-diligence checklist per parcel. Nothing here declares a title valid — that needs the registry and a qualified professional." />

      <Selector options={data.land.map(item => ({ id: item.id, label: item.name }))} value={assetId} onChange={setAssetId} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">{asset.name}</h3>
              <p className="text-[10px] text-slate-500">{asset.location} · {asset.size}</p>
            </div>
            <Pill tone={daysFromNow(asset.approvalExpiry) < 30 ? 'rose' : 'slate'}>
              permit {daysFromNow(asset.approvalExpiry) < 0 ? 'overdue' : `${daysFromNow(asset.approvalExpiry)}d`}
            </Pill>
          </div>
          <div className="space-y-2 border-t border-white/5 pt-3 text-[11px]">
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Development stage</span>
              <span className="text-right text-slate-300">{asset.stage}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Title position</span>
              <span className="text-right text-slate-300">{asset.title}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Approval expiry</span>
              <span className="text-right text-slate-300">{fullDay(asset.approvalExpiry)}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-500">
              <span>Due diligence readiness</span><span className="text-cyan-300">{readiness}%</span>
            </div>
            <Bar value={readiness} tone={readiness === 100 ? 'from-emerald-500 to-teal-500' : 'from-cyan-500 to-blue-500'} height="h-2" />
            <p className="mt-1 font-mono text-[9px] text-slate-600">{done} of {state.length} checks evidenced</p>
          </div>

          {asset.note && <p className="mt-3 rounded-lg border border-white/5 bg-slate-950/50 p-2.5 text-[10px] leading-relaxed text-amber-200/80">{asset.note}</p>}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Due-diligence checklist</h3>
            <Pill tone="cyan">interactive</Pill>
          </div>
          <div className="space-y-1.5">
            {asset.checklist.map((item, index) => {
              const checked = state[index];
              return (
                <button key={item.label} onClick={() => toggle(index)}
                  className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[11px] transition-colors ${checked ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-300' : 'border-white/5 bg-slate-950/40 text-slate-400'}`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 text-transparent'}`}>
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                  {item.label}
                  {!checked && <span className="ml-auto font-mono text-[8px] uppercase tracking-wider text-amber-400/70">pending</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Notice tone="rose" icon={ShieldAlert}>
              Ticking a box records your own evidence, not legal verification. Ownership, survey boundaries and
              land-use permissions must be confirmed through the Lands Registry and qualified professionals.
            </Notice>
          </div>
          <a href={toWa(`Hello Haritech! I would like due diligence on ${asset.name} (${asset.location}).`)} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3 w-full justify-center text-xs">
            <MessageCircle className="h-4 w-4 text-cyan-400" /> Request a title search
          </a>
        </Card>
      </div>
    </div>
  );
};

/* ── 6. Renovation & Maintenance ───────────────────────────────────────── */

const ORDER_COLUMNS = ['Raised', 'Assigned', 'In progress', 'Verification', 'Closed'];
const PRIORITY_TONE: Record<string, Tone> = { Emergency: 'rose', Urgent: 'amber', Routine: 'slate' };

const MaintenanceModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [property, setProperty] = useState('all');
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState(data.properties[0]?.name ?? '');
  const [detail, setDetail] = useState('');
  const orders = data.workOrders.filter(order => property === 'all' || order.property === property);
  const emergency = orders.filter(order => order.priority === 'Emergency').length;
  const value = orders.reduce((sum, order) => sum + order.costNgn, 0);
  const waived = toWa(`Hello Haritech! Maintenance request.\n\nProperty: ${place}\nIssue: ${title || '(describe the issue)'}\nDetails: ${detail || '—'}\n\nPlease assign a contractor.`);

  return (
    <div>
      <SectionHead icon={Wrench} eyebrow="Renovation & Maintenance" title="From Repair Request to" accent="Verified Work"
        desc="Work orders move from raised to assigned, in progress, verification and closed — with a contractor, a cost, and evidence of completion attached at each step." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={ClipboardList} label="Orders in view" value={String(orders.length)} tone="cyan" />
        <Stat icon={ShieldAlert} label="Emergency" value={String(emergency)} tone={emergency ? 'rose' : 'slate'} />
        <Stat icon={Wallet} label="Estimated value" value={nairaShort(value)} tone="violet" />
        <Stat icon={CheckCircle2} label="Closed" value={String(orders.filter(order => order.status === 'Closed').length)} tone="emerald" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setProperty('all')} className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold ${property === 'all' ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400'}`}>All properties</button>
        {data.properties.map(item => (
          <button key={item.id} onClick={() => setProperty(item.name)} className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold ${property === item.name ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400 hover:text-white'}`}>{item.name}</button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ORDER_COLUMNS.map(status => {
          const column = orders.filter(order => order.status === status);
          return (
            <div key={status} className="rounded-2xl border border-white/5 bg-[#0b101d]/60 p-2.5">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-white">{status}</span>
                <span className="rounded-full bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">{column.length}</span>
              </div>
              <div className="space-y-2">
                {column.map(order => (
                  <div key={order.id} className="rounded-xl border border-white/5 bg-slate-950/50 p-2.5">
                    <h4 className="mb-1 text-[11px] font-bold leading-snug text-white">{order.title}</h4>
                    <p className="truncate text-[9px] text-slate-500">{order.property} · {order.category}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <Pill tone={PRIORITY_TONE[order.priority]}>{order.priority}</Pill>
                      <span className="font-mono text-[9px] text-slate-400">{nairaShort(order.costNgn)}</span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[8px] text-slate-600">{order.contractor}</p>
                  </div>
                ))}
                {column.length === 0 && <p className="py-3 text-center text-[9px] text-slate-600">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <h3 className="mb-3 text-sm font-bold text-white">Raise a maintenance request</h3>
          <div className="space-y-2.5">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs fixing?" className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40" />
            <select value={place} onChange={e => setPlace(e.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/40">
              {data.properties.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={2} placeholder="Anything the contractor should know (access, timing, tenant contact…)" className="w-full resize-none rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40" />
            <a href={waived} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-xs">
              <MessageCircle className="h-4 w-4" /> Send request on WhatsApp
            </a>
            <p className="text-center font-mono text-[9px] text-slate-600">Recorded as “Raised” once the team logs it in the Hub.</p>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-bold text-white">Preventive schedule</h3>
          <div className="space-y-1.5">
            {[
              { task: 'Generator service — 60kVA', due: 'in 6 days', property: 'Palms Apartments' },
              { task: 'Borehole pump inspection', due: 'in 12 days', property: 'Adeyemi Court' },
              { task: 'Roof & gutter check', due: 'in 18 days', property: 'Crownfield Terraces' },
              { task: 'Fire extinguisher audit', due: 'in 24 days', property: 'Meridian Place' },
              { task: 'Repaint stairwell — Block B', due: 'scheduled', property: 'Crownfield Terraces' },
            ].map(item => (
              <div key={item.task} className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-2 text-[10px]">
                <Hammer className="h-3 w-3 shrink-0 text-cyan-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-slate-300">{item.task}</div>
                  <div className="truncate text-slate-600">{item.property}</div>
                </div>
                <span className="shrink-0 font-mono text-[9px] text-slate-500">{item.due}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ── 7. 3D Visualisation ───────────────────────────────────────────────── */

const FLOORS = [
  { id: 'ground', label: 'Ground floor', rooms: 'Living, dining, kitchen, guest suite', area: '142 m²', y: 232 },
  { id: 'first', label: 'First floor', rooms: '3 bedrooms, family bath, study', area: '128 m²', y: 186 },
  { id: 'roof', label: 'Roof / terrace', rooms: 'Roof terrace, plant area', area: '54 m²', y: 140 },
];
const MATERIALS = [
  { id: 'render', label: 'Sandcrete render', fill: '#c8ccc4', tone: 'from-slate-300 to-slate-400' },
  { id: 'brick', label: 'Face brick', fill: '#a9614a', tone: 'from-orange-400 to-rose-600' },
  { id: 'stone', label: 'Stone cladding', fill: '#9aa3ad', tone: 'from-slate-400 to-slate-600' },
  { id: 'timber', label: 'Timber screen', fill: '#b58a5a', tone: 'from-amber-500 to-orange-600' },
];
const STAGES = [
  { id: 'structure', label: 'Structure', detail: 'Frame, slabs and blockwork modelled; services and finishes not shown.' },
  { id: 'services', label: 'Services', detail: 'MEP routes overlaid on the frame — indicative only, not coordinated drawings.' },
  { id: 'finishes', label: 'Finishes', detail: 'Finishes and joinery palette applied to the selected material scheme.' },
];

const VisualisationModule: React.FC = () => {
  const [floor, setFloor] = useState('first');
  const [material, setMaterial] = useState(MATERIALS[0].id);
  const [stage, setStage] = useState('services');
  const materialSpec = MATERIALS.find(item => item.id === material) ?? MATERIALS[0];
  const activeFloor = FLOORS.find(item => item.id === floor) ?? FLOORS[0];
  const roof = floor === 'roof';

  return (
    <div>
      <SectionHead icon={Boxes} eyebrow="3D Building Visualisation" title="Understand the Building Before" accent="It Is Built"
        desc="A conceptual massing viewer for floor-by-floor orientation and finish discussions. It is not a construction-ready model, and it does not replace approved architectural or engineering drawings." />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">Lekki Duplex — conceptual massing</h3>
            <Pill tone="violet">concept model</Pill>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-slate-950 via-slate-950 to-cyan-950/20">
            <svg viewBox="0 0 400 300" className="h-64 w-full sm:h-80" role="img" aria-label="Conceptual isometric building model">
              <defs>
                <linearGradient id="groundGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0e7490" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <ellipse cx="200" cy="258" rx="150" ry="34" fill="url(#groundGrad)" />
              {FLOORS.map((item, index) => {
                const selected = item.id === floor;
                const y = item.y;
                const half = roof ? 74 : 96;
                const depth = roof ? 34 : 44;
                const height = roof ? 22 : 44;
                const top = `200,${y - depth} ${200 + half},${y} 200,${y + depth} ${200 - half},${y}`;
                const left = `${200 - half},${y} 200,${y + depth} 200,${y + depth + height} ${200 - half},${y + height}`;
                const right = `${200 + half},${y} 200,${y + depth} 200,${y + depth + height} ${200 + half},${y + height}`;
                return (
                  <g key={item.id} opacity={selected ? 1 : 0.55}>
                    <polygon points={top} fill={selected ? '#67e8f9' : '#334155'} opacity={selected ? 0.85 : 0.9} />
                    <polygon points={left} fill={materialSpec.fill} opacity={selected ? 0.9 : 0.5} />
                    <polygon points={right} fill={materialSpec.fill} opacity={selected ? 0.65 : 0.32} />
                    {stage !== 'structure' && selected && (
                      <g stroke="#22d3ee" strokeWidth="1.4" fill="none" opacity="0.9">
                        <polyline points={`${200 - half + 18},${y + 18} ${200 - half + 18},${y + height + 14} ${200 - 20},${y + depth + height + 8}`} />
                        <polyline points={`${200 + half - 18},${y + 16} ${200 + half - 18},${y + height + 12}`} />
                      </g>
                    )}
                    {stage === 'finishes' && selected && (
                      <polygon points={top} fill="#fcd34d" opacity="0.22" />
                    )}
                    <text x="200" y={y + depth + height + 16} textAnchor="middle" fontSize="9" fill={selected ? '#67e8f9' : '#64748b'} fontFamily="monospace">
                      {item.label.toUpperCase()}
                    </text>
                    {index === 0 && <text x="200" y={y - depth - 8} textAnchor="middle" fontSize="8" fill="#475569" fontFamily="monospace">CONCEPT — NOT FOR CONSTRUCTION</text>}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {FLOORS.map(item => (
              <button key={item.id} onClick={() => setFloor(item.id)} className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold ${floor === item.id ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400'}`}>{item.label}</button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{activeFloor.label}</h3>
              <Pill tone="slate">{activeFloor.area}</Pill>
            </div>
            <p className="text-[11px] text-slate-400">{activeFloor.rooms}</p>
            <div className="mt-3">
              <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">External material</div>
              <div className="grid grid-cols-2 gap-1.5">
                {MATERIALS.map(item => (
                  <button key={item.id} onClick={() => setMaterial(item.id)} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[10px] ${material === item.id ? 'border-cyan-500/40 bg-cyan-500/10 text-white' : 'border-white/5 bg-slate-950/60 text-slate-400'}`}>
                    <span className={`h-3 w-3 rounded-sm bg-gradient-to-br ${item.tone}`} /> {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Construction stage view</div>
              <div className="grid grid-cols-3 gap-1.5">
                {STAGES.map(item => (
                  <button key={item.id} onClick={() => setStage(item.id)} className={`rounded-lg border px-1.5 py-2 text-[10px] font-bold ${stage === item.id ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400'}`}>{item.label}</button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">{STAGES.find(item => item.id === stage)?.detail}</p>
            </div>
          </Card>
          <Notice tone="amber" icon={ScanLine}>
            Visualisations are conceptual. Approved architectural drawings, structural calculations and coordinated
            MEP drawings govern the actual build; IFC/BIM models are shared under a separate viewer when available.
          </Notice>
          <a href={toWa('Hello Haritech! I would like to discuss a 3D/BIM visualisation for my project.')} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center text-xs">
            <Boxes className="h-4 w-4 text-cyan-400" /> Discuss a BIM workflow
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── 8. Inspections & Reports ──────────────────────────────────────────── */

const InspectionModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [id, setId] = useState(data.inspections[0]?.id ?? '');
  const [checks, setChecks] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(data.inspections.map(item => [item.id, item.checklist.map(point => point.done)]))
  );
  const inspection = data.inspections.find(item => item.id === id) ?? data.inspections[0];
  if (!inspection) return null;
  const state = checks[inspection.id] ?? inspection.checklist.map(point => point.done);
  const scoreOf = (item: (typeof data.inspections)[number]) => {
    const itemState = checks[item.id] ?? item.checklist.map(point => point.done);
    return Math.round((itemState.filter(Boolean).length / Math.max(itemState.length, 1)) * 100);
  };
  const statusOf = (value: number): 'Passed' | 'Defects' | 'Critical' => (value >= 85 ? 'Passed' : value >= 65 ? 'Defects' : 'Critical');
  const score = scoreOf(inspection);
  const status = statusOf(score);
  const tone: Tone = score >= 85 ? 'emerald' : score >= 65 ? 'amber' : 'rose';
  const toneHex = score >= 85 ? '#34d399' : score >= 65 ? '#fbbf24' : '#fb7185';

  return (
    <div>
      <SectionHead icon={ClipboardCheck} eyebrow="Inspections & Condition Reports" title="A Score, the Evidence and the" accent="Defects"
        desc="Condition assessments and periodic inspections with photographs, findings and a tracked defect list. Specialist structural or electrical opinions are referred to qualified professionals." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Inspection register</h3>
            <Pill tone="cyan" dot>sample</Pill>
          </div>
          <div className="space-y-2">
            {data.inspections.map(item => {
              const itemScore = scoreOf(item);
              const itemStatus = statusOf(itemScore);
              return (
                <button key={item.id} onClick={() => setId(item.id)} className={`w-full rounded-xl border p-2.5 text-left transition-colors ${id === item.id ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/5 bg-slate-950/40 hover:border-white/10'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-[11px] font-bold text-white">{item.property}</h4>
                      <p className="text-[9px] text-slate-500">{item.type} · {fullDay(item.date)} · {item.inspector}</p>
                    </div>
                    <Pill tone={itemStatus === 'Passed' ? 'emerald' : itemStatus === 'Defects' ? 'amber' : 'rose'}>{itemStatus}</Pill>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Bar value={itemScore} tone={itemScore >= 85 ? 'from-emerald-500 to-teal-500' : itemScore >= 65 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-600'} />
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{itemScore}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">{inspection.property}</h3>
              <p className="text-[10px] text-slate-500">{inspection.type} · {inspection.inspector} · {fullDay(inspection.date)}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2" style={{ borderColor: toneHex }}>
              <span className="font-mono text-sm font-extrabold" style={{ color: toneHex }}>{score}</span>
              <span className="font-mono text-[7px] uppercase tracking-wider text-slate-500">score</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Checklist — toggle to re-score</div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {inspection.checklist.map((point, index) => {
                const checked = state[index];
                return (
                  <button key={point.label} onClick={() => setChecks(prev => ({ ...prev, [inspection.id]: state.map((value, i) => (i === index ? !value : value)) }))}
                    className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[10px] ${checked ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-300' : 'border-amber-500/20 bg-amber-500/5 text-amber-200/80'}`}>
                    {checked ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" /> : <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />}
                    <span className="flex-1">{point.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>              <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Findings</span>
              <Pill tone={tone}>{status} · {status === 'Passed' ? 'no action' : status === 'Defects' ? 'defects logged' : 'urgent attention'}</Pill>
            </div>
            <ul className="space-y-1">
              {inspection.findings.map(finding => (
                <li key={finding} className="flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-300">
                  <Circle className="mt-0.5 h-2 w-2 shrink-0 text-rose-400" /> {finding}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a href={toWa(`Hello Haritech! I would like an inspection for ${inspection.property}.`)} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 justify-center text-[11px]">
              <ClipboardCheck className="h-4 w-4" /> Book an inspection
            </a>
            <button onClick={() => window.print()} className="btn-secondary flex-1 justify-center text-[11px]">
              <FileText className="h-4 w-4 text-cyan-400" /> Print / save report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ── 9. Budget & Expenses ──────────────────────────────────────────────── */

const BudgetModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [projectId, setProjectId] = useState(data.buildProjects[0]?.id ?? '');
  const project = data.buildProjects.find(item => item.id === projectId) ?? data.buildProjects[0];
  const lines = data.budgets[projectId] ?? [];
  if (!project) return null;
  const budget = lines.reduce((sum, line) => sum + line.budgetNgn, 0);
  const spent = lines.reduce((sum, line) => sum + line.spentNgn, 0);
  const committed = lines.reduce((sum, line) => sum + line.committedNgn, 0);
  const remaining = budget - spent - committed;
  const monthsLeft = Math.max(1, Math.ceil(daysFromNow(project.targetDate) / 30));
  const monthly = Math.max(0, remaining) / monthsLeft;
  const forecast = Array.from({ length: 6 }, (_, index) => ({
    label: new Date(Date.now() + index * 30 * 86_400_000).toLocaleDateString('en-GB', { month: 'short' }),
    value: Math.max(0, monthly * (index < monthsLeft ? 1 : 0)),
  }));
  const peak = Math.max(...forecast.map(item => item.value), 1);

  return (
    <div>
      <SectionHead icon={Wallet} eyebrow="Project Financial Management" title="Budget, Committed Spend and" accent="Cash Flow"
        desc="Approved budgets, actual spend, committed orders and a forward cash-flow model — with a clear separation between estimates, submitted expenses, approved expenses and confirmed payments." />

      <Selector options={data.buildProjects.map(item => ({ id: item.id, label: item.name }))} value={projectId} onChange={setProjectId} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Wallet} label="Approved budget" value={nairaShort(budget)} tone="cyan" />
        <Stat icon={Receipt} label="Spent to date" value={nairaShort(spent)} note={`${Math.round((spent / Math.max(budget, 1)) * 100)}% of budget`} tone="violet" />
        <Stat icon={Clock} label="Committed" value={nairaShort(committed)} note="orders not yet invoiced" tone="amber" />
        <Stat icon={remaining < 0 ? TrendingDown : TrendingUp} label="Remaining" value={nairaShort(remaining)} note={remaining < 0 ? 'over budget' : 'available'} tone={remaining < 0 ? 'rose' : 'emerald'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Budget vs actual by package</h3>
            <Pill tone={remaining < 0 ? 'rose' : 'emerald'}>{remaining < 0 ? 'over' : 'within'} budget</Pill>
          </div>
          <div className="space-y-2.5">
            {lines.map(line => {
              const used = line.spentNgn + line.committedNgn;
              const pct = Math.round((used / Math.max(line.budgetNgn, 1)) * 100);
              return (
                <div key={line.category}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                    <span className="text-slate-300">{line.category}</span>
                    <span className="font-mono text-slate-500">{nairaShort(used)} / {nairaShort(line.budgetNgn)} <span className={pct > 100 ? 'text-rose-400' : pct > 85 ? 'text-amber-400' : 'text-emerald-400'}>{pct}%</span></span>
                  </div>
                  <div className="relative">
                    <Bar value={100} tone="from-slate-700 to-slate-700" height="h-2" />
                    <div className="absolute inset-0"><Bar value={pct} tone={pct > 100 ? 'from-rose-500 to-red-600' : pct > 85 ? 'from-amber-500 to-orange-500' : 'from-cyan-500 to-blue-500'} height="h-2" /></div>
                  </div>
                  <div className="mt-0.5 flex justify-between font-mono text-[8px] text-slate-600">
                    <span>spent {nairaShort(line.spentNgn)}</span>
                    <span>committed {nairaShort(line.committedNgn)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-1 text-sm font-bold text-white">Cash-flow forecast</h3>
            <p className="mb-3 text-[10px] text-slate-500">{nairaShort(monthly)}/month over {monthsLeft} remaining months — model, not a commitment.</p>
            <div className="flex h-32 items-end gap-2">
              {forecast.map(item => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div className="w-full rounded-t bg-gradient-to-t from-cyan-600/40 to-cyan-400" style={{ height: `${Math.max(3, (item.value / peak) * 100)}%` }} />
                  </div>
                  <span className="font-mono text-[8px] text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-2 text-sm font-bold text-white">Expense states</h3>
            <div className="space-y-1.5">
              {[
                { state: 'Estimate', tone: 'slate' as Tone, text: 'Indicative, not yet submitted.' },
                { state: 'Submitted', tone: 'cyan' as Tone, text: 'Awaiting approval, not payable.' },
                { state: 'Approved', tone: 'amber' as Tone, text: 'Cleared for payment, not yet paid.' },
                { state: 'Paid', tone: 'emerald' as Tone, text: 'Reconciled against a bank record.' },
              ].map(row => (
                <div key={row.state} className="flex items-start gap-2">
                  <Pill tone={row.tone}>{row.state}</Pill>
                  <span className="flex-1 text-[10px] text-slate-400">{row.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 border-t border-white/5 pt-2 font-mono text-[9px] leading-relaxed text-slate-600">
              Every entry keeps an audit trail of who created, approved or cancelled it. No payment is marked paid from a receipt alone.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ── 10. Contractors & Suppliers ───────────────────────────────────────── */

const ContractorModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const trades = ['All', ...Array.from(new Set(data.contractors.map(item => item.trade)))];
  const [trade, setTrade] = useState('All');
  const list = data.contractors.filter(item => trade === 'All' || item.trade === trade);

  return (
    <div>
      <SectionHead icon={Users} eyebrow="Contractors & Suppliers" title="Performance You Can" accent="Compare"
        desc="Contractors are scored on on-time delivery and workmanship, and that score decides who gets the next package. Suppliers carry lead times and delivery records." />

      <div className="mb-4 flex flex-wrap gap-2">
        {trades.map(item => (
          <button key={item} onClick={() => setTrade(item)} className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold ${trade === item ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400 hover:text-white'}`}>{item}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(contractor => (
          <Card key={contractor.id} className="h-full">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-bold text-white">{contractor.name}</h3>
                <p className="text-[10px] text-slate-500">{contractor.trade} · {contractor.projects} packages</p>
              </div>
              <Pill tone={contractor.status === 'Active' ? 'emerald' : contractor.status === 'Under review' ? 'amber' : 'rose'}>{contractor.status}</Pill>
            </div>
            <div className="space-y-2">
              <div>
                <div className="mb-0.5 flex justify-between font-mono text-[9px] text-slate-500"><span>On-time delivery</span><span>{contractor.onTime}%</span></div>
                <Bar value={contractor.onTime} tone={contractor.onTime >= 85 ? 'from-emerald-500 to-teal-500' : contractor.onTime >= 70 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-600'} />
              </div>
              <div>
                <div className="mb-0.5 flex justify-between font-mono text-[9px] text-slate-500"><span>Workmanship</span><span>{contractor.quality}%</span></div>
                <Bar value={contractor.quality} tone="from-cyan-500 to-blue-500" />
              </div>
            </div>
            <p className="mt-2.5 border-t border-white/5 pt-2 text-[10px] leading-relaxed text-slate-400">{contractor.note}</p>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] text-slate-600">
              <ShieldCheck className="h-2.5 w-2.5" /> score drives award decisions
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-bold text-white">Supplier lead times</h3>
          <div className="space-y-1.5">
            {[
              { name: 'Dangote Cement — Ikeja depot', lead: '2–3 days', note: 'Delivered 96% on booked date' },
              { name: 'Berger Paints — Lagos', lead: '4–6 days', note: 'One shade mismatch this quarter' },
              { name: 'Tower Aluminium — windows', lead: '3–5 weeks', note: 'Price escalation clause active' },
              { name: 'Hydraform Blocks — Ogun', lead: '5–7 days', note: 'Backup supplier identified' },
            ].map(supplier => (
              <div key={supplier.name} className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] text-slate-300">{supplier.name}</div>
                  <div className="truncate text-[9px] text-slate-600">{supplier.note}</div>
                </div>
                <span className="shrink-0 font-mono text-[9px] text-cyan-300">{supplier.lead}</span>
              </div>
            ))}
          </div>
        </Card>
        <Notice tone="amber">
          Contractor scores are internal performance records, not professional accreditations. Statutory registrations
          and licences are checked separately before award, and specialist works require certified professionals.
        </Notice>
      </div>
    </div>
  );
};

/* ── 11. Documents & Approvals ─────────────────────────────────────────── */

const DOC_STATUS_TONE: Record<string, Tone> = { Approved: 'emerald', 'Awaiting review': 'amber', Expiring: 'rose', Draft: 'slate' };

const DocumentsModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});
  const categories = ['All', ...Array.from(new Set(data.documents.map(item => item.category)))];
  const list = data.documents
    .filter(item => category === 'All' || item.category === category)
    .filter(item => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return `${item.name} ${item.project} ${item.owner} ${item.category}`.toLowerCase().includes(needle);
    });
  const queue = data.documents.filter(item => item.status === 'Awaiting review' && !decisions[item.id]);

  return (
    <div>
      <SectionHead icon={FileText} eyebrow="Documents & Approvals" title="One Register, Controlled" accent="Versions"
        desc="Drawings, BOQs, contracts, permits, inspection reports and handover packs in one register — versioned, searchable, with an approval queue and expiry reminders." />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search document, project or owner…" className="w-full rounded-lg border border-white/5 bg-slate-950/60 py-2 pl-8 pr-2 text-[11px] text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-white/5 bg-slate-950/60 px-2 py-2 text-[11px] text-white outline-none focus:border-cyan-500/40">
              {categories.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            {list.map(item => (
              <div key={item.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] text-slate-200">{item.name}</div>
                  <div className="truncate font-mono text-[9px] text-slate-600">{item.project} · {item.version} · {item.owner} · {shortDay(item.updated)}</div>
                </div>
                {item.expiry && <span className="hidden shrink-0 font-mono text-[8px] text-rose-400/80 sm:block">exp {shortDay(item.expiry)}</span>}
                <Pill tone={DOC_STATUS_TONE[item.status]}>{decisions[item.id] ? (decisions[item.id] === 'approved' ? 'Approved' : 'Rejected') : item.status}</Pill>
              </div>
            ))}
            {list.length === 0 && <p className="py-6 text-center text-xs text-slate-600">No documents match that search.</p>}
          </div>
          <div className="mt-3">
            <Notice tone="cyan" icon={Lock}>
              Documents are stored privately and shared through time-limited access, not public links. In this preview
              no files are uploaded — the register demonstrates structure and status only.
            </Notice>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Approval queue</h3>
              <Pill tone="amber">{queue.length} waiting</Pill>
            </div>
            {queue.length === 0 ? (
              <p className="py-5 text-center text-xs text-slate-600">Nothing awaiting your approval.</p>
            ) : (
              <div className="space-y-2">
                {queue.map(item => (
                  <div key={item.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-2.5">
                    <div className="text-[11px] font-semibold text-white">{item.name}</div>
                    <div className="font-mono text-[9px] text-slate-600">{item.project} · {item.version} · {item.owner}</div>
                    <div className="mt-2 flex gap-1.5">
                      <button onClick={() => setDecisions(prev => ({ ...prev, [item.id]: 'approved' }))} className="flex-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 py-1.5 text-[10px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20">Approve</button>
                      <button onClick={() => setDecisions(prev => ({ ...prev, [item.id]: 'rejected' }))} className="flex-1 rounded-lg border border-rose-500/25 bg-rose-500/10 py-1.5 text-[10px] font-bold text-rose-300 transition-colors hover:bg-rose-500/20">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-slate-600">
              Preview decisions are kept in this browser session. Real approvals are recorded against an authenticated
              account with an audit trail.
            </p>
          </Card>
          <a href={toWa('Hello Haritech! I need access to project documents for my engagement.')} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center text-xs">
            <MessageCircle className="h-4 w-4 text-cyan-400" /> Request document access
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── 12. Client Portal ─────────────────────────────────────────────────── */

const PortalModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [projectId, setProjectId] = useState(data.buildProjects[0]?.id ?? '');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ Milestones: true, Budget: true, Documents: true, Maintenance: false });
  const project = data.buildProjects.find(item => item.id === projectId) ?? data.buildProjects[0];
  const docs = data.documents.filter(item => item.project.split(' ')[0] === project?.name.split(' ')[0]);
  if (!project) return null;
  const budget = data.budgets[projectId]?.reduce((sum, line) => sum + line.budgetNgn, 0) ?? 0;

  return (
    <div>
      <SectionHead icon={Lock} eyebrow="Client Portal" title="The Dashboard an Onboarded Client" accent="Actually Sees"
        desc="A preview of the client workspace: only their projects, their approved budgets, their documents and the approvals waiting on them. Accounts are issued during onboarding — there is no public sign-up." />

      <Selector options={data.buildProjects.map(item => ({ id: item.id, label: item.name }))} value={projectId} onChange={setProjectId} />

      <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/5 to-transparent p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Client workspace</div>
              <h3 className="text-sm font-bold text-white">{project.client}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="cyan" dot>preview account</Pill>
              <Link to="/haritech/client-portal" className="btn-secondary px-3 py-1.5 text-[10px]">
                <Lock className="h-3 w-3 text-cyan-400" /> Sign In
              </Link>
            </div>
          </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-3">
            <Card>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white">{project.name}</h4>
                  <p className="text-[10px] text-slate-500">{project.stage} · lead {project.lead}</p>
                </div>
                <Pill tone={project.progress >= project.planned ? 'emerald' : 'amber'}>{project.progress}% complete</Pill>
              </div>
              <Bar value={project.progress} height="h-2" />
              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                <div><div className="text-slate-500">Next milestone</div><div className="truncate text-slate-300">{project.nextMilestone}</div></div>
                <div><div className="text-slate-500">Budget</div><div className="font-mono text-slate-300">{nairaShort(budget)}</div></div>
                <div><div className="text-slate-500">Target</div><div className="font-mono text-slate-300">{shortDay(project.targetDate)}</div></div>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-white/5 pt-2">
                {['Progress photographs', 'Approved reports', 'Budget statement', 'Milestone history'].map(item => (
                  <span key={item} className="flex items-center gap-1.5 text-[10px] text-slate-400"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> {item}</span>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="mb-2 text-xs font-bold text-white">Approvals waiting on you</h4>
              {queueItems(project.name).map(item => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[10px]">
                  <ClipboardCheck className="h-3 w-3 shrink-0 text-amber-400" />
                  <span className="flex-1 text-slate-300">{item}</span>
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                </div>
              ))}
              {queueItems(project.name).length === 0 && <p className="text-[10px] text-slate-600">Nothing pending.</p>}
            </Card>

            <Card>
              <h4 className="mb-2 text-xs font-bold text-white">Your documents</h4>
              <div className="space-y-1">
                {docs.slice(0, 4).map(document => (
                  <div key={document.id} className="flex items-center gap-2 text-[10px]">
                    <FileText className="h-3 w-3 shrink-0 text-slate-500" />
                    <span className="min-w-0 flex-1 truncate text-slate-300">{document.name}</span>
                    <Pill tone={DOC_STATUS_TONE[document.status]}>{document.status}</Pill>
                  </div>
                ))}
                {docs.length === 0 && <p className="text-[10px] text-slate-600">Documents appear once shared by your project manager.</p>}
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <Card>
              <h4 className="mb-2 text-xs font-bold text-white">Notifications</h4>
              <div className="space-y-1.5">
                {Object.entries(prefs).map(([key, value]) => (
                  <button key={key} onClick={() => setPrefs(prev => ({ ...prev, [key]: !value }))} className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-2 text-[10px] text-slate-300">
                    {key}
                    <span className={`relative h-3.5 w-7 rounded-full transition-colors ${value ? 'bg-cyan-500/70' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${value ? 'left-[15px]' : 'left-0.5'}`} />
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="mb-2 text-xs font-bold text-white">Message your project owner</h4>
              <div className="space-y-1.5">
                <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-cyan-500/15 px-2.5 py-2 text-[10px] text-slate-200">Can we see the first-floor slab photos before the pour?</div>
                <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-white/5 px-2.5 py-2 text-[10px] text-slate-300">{project.lead}: Uploaded 12 photos with yesterday’s report — images are timestamped.</div>
                <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-cyan-500/15 px-2.5 py-2 text-[10px] text-slate-200">Approved. Please proceed.</div>
              </div>
              <a href={toWa(`Hello Haritech! This is ${project.client}. I would like to discuss ${project.name}.`)} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-2.5 w-full justify-center text-[10px]">
                <MessageCircle className="h-3.5 w-3.5 text-cyan-400" /> Continue on WhatsApp
              </a>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Notice tone="cyan" icon={Lock}>
          Clients see only the projects, budgets, documents and messages they are authorised for. Accounts are created
          with role-based access during onboarding; there is no open registration.
        </Notice>
      </div>
    </div>
  );
};

const queueItems = (projectName: string) => {
  if (projectName.includes('Duplex')) return ['Roofing package quotation — ₦9.4m', 'Revised finishing schedule'];
  if (projectName.includes('Estate')) return ['BOQ revision — Block C joinery, ₦41.2m'];
  if (projectName.includes('Office')) return ['MEP drawing revision 4'];
  return ['Lintel replacement variation — ₦420,000'];
};

/* ── 13. Smart Building Monitoring ─────────────────────────────────────── */

const SmartModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => (
  <div>
    <SectionHead icon={Cpu} eyebrow="Smart Building Monitoring" title="Sensors, Thresholds and" accent="Alerts"
      desc="An optional layer for supported devices: tank levels, leak detection, energy use and generator status. Readings below are sample data — no building is being monitored live from this page." />

    <div className="mb-4">
      <Notice tone="rose" icon={ShieldAlert}>
        No sensors are connected to this demo. Live monitoring only begins after compatible devices are installed and
        their authenticated data connections are verified — this Hub will never show a reading it is not receiving.
      </Notice>
    </div>

    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat icon={Cpu} label="Devices listed" value={String(data.sensors.length)} tone="cyan" />
      <Stat icon={CheckCircle2} label="Online" value={String(data.sensors.filter(s => s.status === 'Online').length)} tone="emerald" />
      <Stat icon={AlertTriangle} label="No data / offline" value={String(data.sensors.filter(s => s.status !== 'Online').length)} tone="amber" />
      <Stat icon={Bell} label="Alert rules" value="4" note="per-property thresholds" tone="violet" />
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.sensors.map(sensor => {
        const tone: Tone = sensor.status === 'Online' ? 'emerald' : sensor.status === 'No data' ? 'amber' : 'rose';
        return (
          <Card key={sensor.id} className="h-full">
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-bold text-white">{sensor.name}</h3>
                <p className="truncate text-[10px] text-slate-500">{sensor.property}</p>
              </div>
              <Pill tone={tone} dot>{sensor.status}</Pill>
            </div>
            <div className="mb-1 font-mono text-lg font-extrabold text-white">{sensor.reading}</div>
            <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
              <span>{sensor.type}</span>
              <span>{sensor.updated}</span>
            </div>
            <div className="mt-2 border-t border-white/5 pt-2 font-mono text-[9px] text-slate-600">Rule: {sensor.threshold}</div>
          </Card>
        );
      })}
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-2 text-sm font-bold text-white">What gets installed</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: Droplets, label: 'Water tank level' },
            { icon: ShieldAlert, label: 'Leak detection' },
            { icon: Zap, label: 'Energy metering' },
            { icon: Cpu, label: 'Generator runtime' },
            { icon: Home, label: 'Temperature & humidity' },
            { icon: Lock, label: 'Access events' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-slate-950/40 px-2 py-1.5 text-[10px] text-slate-300">
                <Icon className="h-3 w-3 text-cyan-400" /> {item.label}
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <h3 className="mb-2 text-sm font-bold text-white">Data handling</h3>
        <ul className="space-y-1.5">
          {[
            'Authenticated device connections with per-device keys',
            'Encrypted transport and role-scoped access',
            'Readings retained per an agreed retention policy',
            'Alerts routed to named staff, never public feeds',
          ].map(item => (
            <li key={item} className="flex items-start gap-1.5 text-[10px] text-slate-300">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </div>
);

/* ── 14. Notifications & Activity ──────────────────────────────────────── */

const CHANNEL_TONE: Record<string, Tone> = { Email: 'violet', WhatsApp: 'emerald', 'In-app': 'cyan' };

const ActivityModule: React.FC<{ data: PropertyHubContent }> = ({ data }) => {
  const [channel, setChannel] = useState('All');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'Milestones & deadlines': true, 'Budget thresholds': true, 'Documents & renewals': true,
    'Maintenance requests': true, 'Rent & payments': false, 'Weekly summary': true,
  });
  const list = data.activity.filter(item => channel === 'All' || item.channel === channel);

  return (
    <div>
      <SectionHead icon={Bell} eyebrow="Notifications & Activity Logs" title="The Right Update on the" accent="Right Channel"
        desc="Clients choose what reaches them and how. Every trigger is logged so nothing is claimed to have been sent when it was not." />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">Activity log</h3>
            <div className="flex gap-1.5">
              {['All', 'Email', 'WhatsApp', 'In-app'].map(item => (
                <button key={item} onClick={() => setChannel(item)} className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${channel === item ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400'}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            {list.map(item => (
              <div key={item.id} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-slate-950/40 p-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white">{item.title}</span>
                    <Pill tone={CHANNEL_TONE[item.channel]}>{item.channel}</Pill>
                    <span className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{item.kind}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{item.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-[8px] text-slate-600">{item.when}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 text-sm font-bold text-white">Notification preferences</h3>
            <div className="space-y-1.5">
              {Object.entries(prefs).map(([key, value]) => (
                <button key={key} onClick={() => setPrefs(prev => ({ ...prev, [key]: !value }))} className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-2 text-[10px] text-slate-300">
                  {key}
                  <span className={`relative h-3.5 w-7 rounded-full transition-colors ${value ? 'bg-cyan-500/70' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${value ? 'left-[15px]' : 'left-0.5'}`} />
                  </span>
                </button>
              ))}
            </div>
          </Card>
          <Notice tone="amber" icon={MessageCircle}>
            WhatsApp messages are sent through click-to-chat links unless an official WhatsApp Business integration is
            configured. Consent is recorded, and provider charges are disclosed before enabling paid channels.
          </Notice>
        </div>
      </div>
    </div>
  );
};

/* ── Router ────────────────────────────────────────────────────────────── */

export const HubModule: React.FC<{ slug: string; data: PropertyHubContent }> = ({ slug, data }) => {
  switch (slug) {
    case 'construction': return <ConstructionModule data={data} />;
    case 'monitoring': return <MonitoringModule data={data} />;
    case 'properties': return <PropertyModule data={data} />;
    case 'land': return <LandModule data={data} />;
    case 'maintenance': return <MaintenanceModule data={data} />;
    case 'visualisation': return <VisualisationModule />;
    case 'inspections': return <InspectionModule data={data} />;
    case 'budget': return <BudgetModule data={data} />;
    case 'contractors': return <ContractorModule data={data} />;
    case 'documents': return <DocumentsModule data={data} />;
    case 'portal': return <PortalModule data={data} />;
    case 'smart': return <SmartModule data={data} />;
    case 'activity': return <ActivityModule data={data} />;
    default: return null;
  }
};
