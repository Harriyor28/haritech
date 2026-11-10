import React, { useRef, useState } from 'react';
import { ChevronDown, Image as ImageIcon, Plus, Save, Upload, X } from 'lucide-react';
import type { ProjectData } from '../../../utils/projects';
import type { Testimonial } from '../../../utils/testimonials';
import { fileToSizedDataUrl } from '../../../utils/image';
import { adminInput, adminLabel, cx } from './ui';

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const emptyProject = (): ProjectData => ({
  id: 0,
  title: '',
  category: 'Business',
  description: '',
  image: '',
  tags: [],
  year: new Date().getFullYear().toString(),
  desktopImage: '',
  tabletImage: '',
  mobileImage: '',
  liveDemo: '',
  challenges: '',
  solutions: '',
  features: [],
  technology: [],
  metrics: { loadTime: '1.5s', performanceScore: 95, mobileScore: 98 },
});

export const ProjectForm: React.FC<{
  project: ProjectData | null;
  onSave: (project: ProjectData) => void;
  onCancel: () => void;
  notify: (type: 'success' | 'error', message: string) => void;
}> = ({ project, onSave, onCancel, notify }) => {
  const [form, setForm] = useState<ProjectData>(() => (project ? { ...project } : emptyProject()));
  const [showDetails, setShowDetails] = useState(Boolean(project?.challenges || project?.solutions));
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    fileToSizedDataUrl(file, 1280)
      .then((dataUrl) => {
        update('image', dataUrl);
        notify('success', 'Image loaded — it will be saved with the project.');
      })
      .catch(() => notify('error', 'Could not read that image. Try a smaller PNG or WebP.'));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          tags: form.tags.map((item) => item.trim()).filter(Boolean),
          technology: form.technology.map((item) => item.trim()).filter(Boolean),
          features: form.features.map((item) => item.trim()).filter(Boolean),
          metrics: {
            loadTime: form.metrics.loadTime,
            performanceScore: Number(form.metrics.performanceScore) || 0,
            mobileScore: Number(form.metrics.mobileScore) || 0,
          },
        });
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="project-title" className={adminLabel}>Project title *</label>
          <input
            id="project-title"
            required
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="Elegant Bistro — restaurant website"
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="project-category" className={adminLabel}>Category</label>
          <select
            id="project-category"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            className={adminInput}
          >
            {[
              'Business',
              'Restaurant',
              'School',
              'Hospital',
              'Hotel',
              'Church',
              'E-commerce',
              'Corporate',
              'Real Estate',
              'Portfolio',
            ].map((category) => (
              <option key={category} value={category} className="bg-[#080d18]">
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project-year" className={adminLabel}>Year</label>
          <input
            id="project-year"
            value={form.year}
            onChange={(event) => update('year', event.target.value)}
            placeholder="2026"
            className={adminInput}
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-description" className={adminLabel}>Short description *</label>
        <textarea
          id="project-description"
          required
          rows={3}
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What the business needed and what you built."
          className={cx(adminInput, 'resize-none')}
        />
      </div>

      <div>
        <p className={adminLabel}>Cover image</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#060a14] sm:w-44">
            {form.image ? (
              <img src={form.image} alt="Project cover preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5 text-slate-700" />
            )}
            {form.image && (
              <button
                type="button"
                onClick={() => update('image', '')}
                className="absolute right-1.5 top-1.5 rounded-md border border-white/10 bg-black/60 p-1 text-slate-300 hover:text-white"
                aria-label="Remove cover image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="url"
              value={/^(https?:)?\/|^data:/.test(form.image) ? form.image : ''}
              onChange={(event) => update('image', event.target.value)}
              placeholder="https://… image URL"
              aria-label="Project image URL"
              className={adminInput}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => upload(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-[10px] font-bold text-slate-300 hover:border-cyan-400/25 hover:text-white"
            >
              <Upload className="h-3 w-3" /> Upload from this device
            </button>
            <p className="text-[9px] text-slate-600">
              Stored as a resized data URL so it publishes with the project.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-tech" className={adminLabel}>Technologies</label>
          <input
            id="project-tech"
            value={form.technology.join(', ')}
            onChange={(event) => update('technology', splitList(event.target.value))}
            placeholder="React, Node.js, Supabase"
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="project-tags" className={adminLabel}>Tags</label>
          <input
            id="project-tags"
            value={form.tags.join(', ')}
            onChange={(event) => update('tags', splitList(event.target.value))}
            placeholder="Responsive, Fast, Booking"
            className={adminInput}
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-demo" className={adminLabel}>Live demo URL</label>
        <input
          id="project-demo"
          type="url"
          value={form.liveDemo}
          onChange={(event) => update('liveDemo', event.target.value)}
          placeholder="https://client-site.com"
          className={adminInput}
        />
      </div>

      <div className="rounded-lg border border-white/[0.06]">
        <button
          type="button"
          onClick={() => setShowDetails((current) => !current)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[11px] font-bold text-slate-200">Case study details</span>
            <span className="block text-[10px] text-slate-600">
              Challenges, solution, feature list and performance metrics
            </span>
          </span>
          <ChevronDown
            className={cx('h-4 w-4 text-slate-500 transition-transform', showDetails && 'rotate-180')}
          />
        </button>

        {showDetails && (
          <div className="space-y-4 border-t border-white/[0.05] p-4">
            <div>
              <label htmlFor="project-challenges" className={adminLabel}>Challenges</label>
              <textarea
                id="project-challenges"
                rows={3}
                value={form.challenges}
                onChange={(event) => update('challenges', event.target.value)}
                className={cx(adminInput, 'resize-none')}
                placeholder="What was hard about this project?"
              />
            </div>
            <div>
              <label htmlFor="project-solutions" className={adminLabel}>Solutions</label>
              <textarea
                id="project-solutions"
                rows={3}
                value={form.solutions}
                onChange={(event) => update('solutions', event.target.value)}
                className={cx(adminInput, 'resize-none')}
                placeholder="How you solved it."
              />
            </div>
            <div>
              <label htmlFor="project-features" className={adminLabel}>Key features (one per line)</label>
              <textarea
                id="project-features"
                rows={4}
                value={form.features.join('\n')}
                onChange={(event) => update('features', event.target.value.split('\n'))}
                className={cx(adminInput, 'resize-none font-mono text-[11px]')}
                placeholder={'Online booking\nMenu management\nPayment integration'}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="project-load" className={adminLabel}>Load time</label>
                <input
                  id="project-load"
                  value={form.metrics.loadTime}
                  onChange={(event) =>
                    update('metrics', { ...form.metrics, loadTime: event.target.value })
                  }
                  className={adminInput}
                  placeholder="1.5s"
                />
              </div>
              <div>
                <label htmlFor="project-performance" className={adminLabel}>Performance</label>
                <input
                  id="project-performance"
                  type="number"
                  min={0}
                  max={100}
                  value={form.metrics.performanceScore}
                  onChange={(event) =>
                    update('metrics', {
                      ...form.metrics,
                      performanceScore: Number(event.target.value),
                    })
                  }
                  className={adminInput}
                />
              </div>
              <div>
                <label htmlFor="project-mobile" className={adminLabel}>Mobile score</label>
                <input
                  id="project-mobile"
                  type="number"
                  min={0}
                  max={100}
                  value={form.metrics.mobileScore}
                  onChange={(event) =>
                    update('metrics', { ...form.metrics, mobileScore: Number(event.target.value) })
                  }
                  className={adminInput}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-white/[0.05] pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-[11px] font-bold text-slate-400 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2.5 text-[11px] font-bold text-slate-950 hover:bg-cyan-300"
        >
          <Save className="h-3.5 w-3.5" />
          {project ? 'Update project' : 'Publish project'}
        </button>
      </div>
    </form>
  );
};

export const TestimonialForm: React.FC<{
  testimonial: Testimonial | null;
  onSave: (testimonial: Testimonial) => void;
  onCancel: () => void;
  notify: (type: 'success' | 'error', message: string) => void;
}> = ({ testimonial, onSave, onCancel, notify }) => {
  const [form, setForm] = useState<Testimonial>(
    () =>
      testimonial ?? {
        id: 0,
        name: '',
        company: '',
        position: '',
        content: '',
        rating: 5,
        image: '',
      }
  );
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          name: form.name.trim(),
          company: form.company.trim(),
          position: form.position.trim(),
          content: form.content.trim(),
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="testimonial-name" className={adminLabel}>Client name *</label>
          <input
            id="testimonial-name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Chinedu Okafor"
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="testimonial-company" className={adminLabel}>Company *</label>
          <input
            id="testimonial-company"
            required
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
            placeholder="Brightline Foods"
            className={adminInput}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="testimonial-position" className={adminLabel}>Role / position</label>
          <input
            id="testimonial-position"
            value={form.position}
            onChange={(event) => setForm({ ...form, position: event.target.value })}
            placeholder="Founder"
            className={adminInput}
          />
        </div>
      </div>

      <div>
        <label htmlFor="testimonial-content" className={adminLabel}>Testimonial *</label>
        <textarea
          id="testimonial-content"
          required
          rows={4}
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
          placeholder="What the client said, in their own words."
          className={cx(adminInput, 'resize-none')}
        />
        <p className="mt-1 text-[10px] text-slate-600">
          Only publish feedback the client gave you permission to show.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className={adminLabel}>Rating</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, rating: value })}
                aria-label={`${value} star${value === 1 ? '' : 's'}`}
                className={cx(
                  'text-xl leading-none transition-colors',
                  value <= form.rating ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'
                )}
              >
                ★
              </button>
            ))}
            <span className="ml-1 text-[10px] text-slate-500">{form.rating} / 5</span>
          </div>
        </div>
        <div>
          <p className={adminLabel}>Portrait (optional)</p>
          <div className="flex items-center gap-2">
            {form.image ? (
              <img
                src={form.image}
                alt="Client portrait preview"
                className="h-10 w-10 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-slate-600">
                <ImageIcon className="h-4 w-4" />
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                fileToSizedDataUrl(file, 320)
                  .then((dataUrl) => setForm((current) => ({ ...current, image: dataUrl })))
                  .catch(() => notify('error', 'Could not read that image. Try a smaller file.'));
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] font-bold text-slate-300 hover:border-cyan-400/25"
            >
              <Upload className="h-3 w-3" /> Upload
            </button>
            {form.image && (
              <button
                type="button"
                onClick={() => setForm({ ...form, image: '' })}
                className="rounded-lg border border-white/[0.08] p-1.5 text-slate-500 hover:text-red-300"
                aria-label="Remove portrait"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-white/[0.05] pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-[11px] font-bold text-slate-400 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2.5 text-[11px] font-bold text-slate-950 hover:bg-cyan-300"
        >
          <Plus className="h-3.5 w-3.5" />
          {testimonial ? 'Update testimonial' : 'Publish testimonial'}
        </button>
      </div>
    </form>
  );
};
