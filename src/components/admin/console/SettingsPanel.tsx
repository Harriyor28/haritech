import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Upload,
} from 'lucide-react';
import type { SiteSettings } from '../../../utils/settings';
import { fileToSizedDataUrl } from '../../../utils/image';
import {
  Badge,
  Panel,
  PanelHeader,
  adminInput,
  adminLabel,
  cx,
} from './ui';

const fields: Array<{
  key: keyof SiteSettings;
  label: string;
  placeholder: string;
  type: string;
  hint?: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'companyName',
    label: 'Company name',
    placeholder: 'HARITECH EXCLUSIVE SERVICES',
    type: 'text',
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
  {
    key: 'tagline',
    label: 'Tagline',
    placeholder: 'Building powerful websites that grow businesses',
    type: 'text',
    hint: 'Used in the hero and meta descriptions.',
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
  {
    key: 'contactEmail',
    label: 'Contact email',
    placeholder: 'hello@haritech.com',
    type: 'email',
    icon: <Mail className="h-3.5 w-3.5" />,
  },
  {
    key: 'phoneNumber',
    label: 'Phone number',
    placeholder: '+234 800 000 0000',
    type: 'tel',
    icon: <Phone className="h-3.5 w-3.5" />,
  },
  {
    key: 'whatsappNumber',
    label: 'WhatsApp number',
    placeholder: '+234 800 000 0000',
    type: 'tel',
    hint: 'Digits only are used for WhatsApp links.',
    icon: <Phone className="h-3.5 w-3.5" />,
  },
];

const SettingsPanel: React.FC<{
  settings: SiteSettings;
  logo: string;
  cloudConfigured: boolean;
  sessionEmail: string | null;
  onSaveSettings: (settings: SiteSettings) => Promise<boolean>;
  onSaveLogo: (logo: string) => boolean;
  notify: (type: 'success' | 'error', message: string) => void;
}> = ({ settings, logo, cloudConfigured, sessionEmail, onSaveSettings, onSaveLogo, notify }) => {
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [errors, setErrors] = useState<Partial<Record<keyof SiteSettings, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(() => (/^(https?:)?\//.test(logo) ? logo : ''));
  const fileRef = useRef<HTMLInputElement>(null);

  const settingsDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings]
  );

  const logoValue = uploadPreview ?? urlInput.trim() ?? '';
  const logoDirty = logoValue !== logo;
  const displayedLogo = uploadPreview || urlInput.trim() || logo;
  const dirty = settingsDirty || logoDirty;

  const validate = (): boolean => {
    const next: Partial<Record<keyof SiteSettings, string>> = {};
    if (!draft.companyName.trim()) next.companyName = 'A company name is required.';
    if (!draft.contactEmail.trim()) {
      next.contactEmail = 'A contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim())) {
      next.contactEmail = 'Enter a valid email address.';
    }
    if (draft.whatsappNumber && draft.whatsappNumber.replace(/\D/g, '').length < 7) {
      next.whatsappNumber = 'That does not look like a full phone number.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveSettings = async () => {
    if (!validate()) {
      notify('error', 'Check the highlighted fields before saving.');
      return;
    }
    setSaving(true);
    const pushed = await onSaveSettings({
      ...draft,
      companyName: draft.companyName.trim(),
      contactEmail: draft.contactEmail.trim(),
      phoneNumber: draft.phoneNumber.trim(),
      whatsappNumber: draft.whatsappNumber.trim(),
      tagline: draft.tagline.trim(),
      address: draft.address.trim(),
    });
    setSaving(false);
    if (pushed) {
      notify('success', 'Site settings saved and published.');
    } else {
      notify('error', 'Saved on this device only — sign in as the site owner so it reaches the live site.');
    }
  };

  const saveLogo = () => {
    const value = (uploadPreview ?? urlInput.trim()).trim();
    if (!value) {
      notify('error', 'Upload a logo file or paste an image URL first.');
      return;
    }
    if (!onSaveLogo(value)) {
      notify('error', 'Could not save the logo — browser storage is full. Try a smaller file or use a URL.');
      return;
    }
    setUploadPreview(null);
    setUrlInput(/^(https?:)?\//.test(value) ? value : '');
    notify('success', 'Logo updated across the site.');
  };

  const removeLogo = () => {
    if (!onSaveLogo('')) {
      notify('error', 'Could not remove the logo.');
      return;
    }
    setUploadPreview(null);
    setUrlInput('');
    notify('success', 'Logo removed — the text wordmark is used instead.');
  };

  const discard = () => {
    setDraft(settings);
    setUploadPreview(null);
    setUrlInput(/^(https?:)?\//.test(logo) ? logo : '');
    setErrors({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Settings</h1>
          <p className="mt-1 text-xs text-slate-500">
            Brand identity, contact details and how the site represents you.
          </p>
        </div>
        <Badge tone={cloudConfigured && sessionEmail ? 'emerald' : 'amber'} dot>
          {cloudConfigured ? (sessionEmail ? 'Publishing live' : 'No owner session') : 'Local only'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader
              icon={<ImageIcon className="h-4 w-4" />}
              title="Brand logo"
              hint="Appears in the header, footer and admin console."
              actions={logo ? <Badge tone="emerald">Active</Badge> : <Badge tone="neutral">Text wordmark</Badge>}
            />
            <div className="p-4">
              <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#060a14] p-4">
                <div
                  className="absolute inset-0 opacity-[0.35]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                {displayedLogo ? (
                  <img src={displayedLogo} alt="Current site logo" className="relative max-h-full max-w-full object-contain" />
                ) : (
                  <div className="relative flex items-center gap-2.5">
                    <img src="/brand-symbol.svg" alt="" className="relative h-8 w-8" />
                    <span className="text-lg font-black tracking-[0.18em] text-slate-300">HARITECH</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="logo-url" className={adminLabel}>Image URL</label>
                  <input
                    id="logo-url"
                    type="url"
                    value={urlInput}
                    onChange={(event) => {
                      setUrlInput(event.target.value);
                      setUploadPreview(null);
                    }}
                    placeholder="https://example.com/logo.png"
                    className={adminInput}
                  />
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    fileToSizedDataUrl(file, 640)
                      .then((dataUrl) => {
                        setUploadPreview(dataUrl);
                        notify('success', 'Logo loaded — save it to publish.');
                      })
                      .catch(() => notify('error', 'Could not read that image. Try a smaller PNG or SVG.'));
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.01] px-4 py-4 text-center transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.02]"
                >
                  <Upload className="h-4 w-4 text-cyan-400/80" />
                  <span className="text-[11px] font-bold text-slate-300">Upload a logo file</span>
                  <span className="text-[9px] text-slate-600">PNG, SVG or WebP · resized automatically</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveLogo}
                    disabled={!logoDirty}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"
                  >
                    <Save className="h-3.5 w-3.5" /> Save logo
                  </button>
                  {logo && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="rounded-lg border border-white/[0.08] px-3 py-2 text-[11px] font-bold text-slate-400 hover:border-red-400/25 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader icon={<Mail className="h-4 w-4" />} title="Contact card preview" hint="How visitors read your details." />
            <div className="space-y-2.5 p-4 text-[11px]">
              <p className="text-[12px] font-bold text-white">{draft.companyName || 'Company name'}</p>
              <p className="text-slate-500">{draft.tagline || 'Tagline not set'}</p>
              <div className="space-y-1.5 border-t border-white/[0.04] pt-2.5 text-slate-400">
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-cyan-400/70" /> {draft.contactEmail || 'Email not set'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-cyan-400/70" /> {draft.phoneNumber || 'Phone not set'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-emerald-400/70" /> {draft.whatsappNumber || 'WhatsApp not set'}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400/70" />
                  <span>{draft.address || 'Address not set'}</span>
                </p>
              </div>
            </div>
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            icon={<Building2 className="h-4 w-4" />}
            title="General configuration"
            hint="Saved to your site settings and published to every visitor."
            actions={
              dirty ? <Badge tone="amber" dot>Unsaved changes</Badge> : <Badge tone="emerald" dot>Saved</Badge>
            }
          />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            {fields.map((field) => {
              const wide = field.key === 'companyName' || field.key === 'tagline';
              const error = errors[field.key];
              return (
                <div key={field.key} className={cx(wide && 'sm:col-span-2')}>
                  <label htmlFor={`setting-${field.key}`} className={adminLabel}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-cyan-400/60">{field.icon}</span>
                      {field.label}
                    </span>
                  </label>
                  <input
                    id={`setting-${field.key}`}
                    type={field.type}
                    value={draft[field.key]}
                    onChange={(event) => {
                      setDraft({ ...draft, [field.key]: event.target.value });
                      setErrors((current) => ({ ...current, [field.key]: undefined }));
                    }}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                    className={cx(
                      adminInput,
                      error && 'border-red-400/40 focus:border-red-400/60 focus:ring-red-400/10'
                    )}
                  />
                  {error ? (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-red-400">
                      <AlertCircle className="h-3 w-3" /> {error}
                    </p>
                  ) : (
                    field.hint && <p className="mt-1 text-[10px] text-slate-600">{field.hint}</p>
                  )}
                </div>
              );
            })}

            <div className="sm:col-span-2">
              <label htmlFor="setting-address" className={adminLabel}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-cyan-400/60"><MapPin className="h-3.5 w-3.5" /></span>
                  Office address
                </span>
              </label>
              <textarea
                id="setting-address"
                rows={2}
                value={draft.address}
                onChange={(event) => setDraft({ ...draft, address: event.target.value })}
                placeholder="Street, city, state, country"
                className={cx(adminInput, 'resize-none')}
              />
              <p className="mt-1 text-[10px] text-slate-600">
                This is read by the contact section and every Haritech page footer.
              </p>
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Check className={cx('h-3.5 w-3.5', cloudConfigured ? 'text-emerald-400' : 'text-amber-400')} />
                {cloudConfigured
                  ? 'Changes publish to Supabase when an owner session is active.'
                  : 'Supabase is not configured; changes stay in this browser.'}
              </div>
              <button
                type="button"
                onClick={discard}
                disabled={!dirty}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-white/5 disabled:opacity-40"
              >
                <RefreshCw className="h-3 w-3" /> Discard
              </button>
            </div>
          </div>

          <div
            className={cx(
              'flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 transition-colors',
              dirty
                ? 'border-cyan-400/20 bg-cyan-400/[0.04]'
                : 'border-white/[0.05] bg-transparent'
            )}
          >
            <p className="text-[10px] text-slate-500">
              {dirty ? 'You have unsaved changes.' : 'All settings are up to date.'}
            </p>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={!settingsDirty || saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"
            >
              <Save className={cx('h-3.5 w-3.5', saving && 'animate-pulse')} />
              {saving ? 'Saving…' : 'Save configuration'}
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default SettingsPanel;
