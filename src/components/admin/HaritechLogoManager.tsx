import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Code2 } from 'lucide-react';
import { getHaritechBrandLogo, setHaritechBrandLogo } from '../../utils/haritechBrand';
import { fileToSizedDataUrl } from '../../utils/image';

const HaritechLogoManager: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState(() => getHaritechBrandLogo());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => { setLogoUrl(getHaritechBrandLogo()); }, []);

  const handleSave = () => {
    const logo = logoPreview || logoUrl;
    if (!logo) return;
    const ok = setHaritechBrandLogo(logo);
    if (!ok) {
      setUploadError('Logo too large for browser storage — try a smaller file or an image URL instead.');
      return;
    }
    setLogoUrl(logo);
    setLogoPreview(null);
    setUploadError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
      <div className="flex items-center justify-between mb-6">
        <div>
                    <h3 className="text-xl font-bold text-white">Site Logo</h3>
                    <p className="text-slate-400 text-xs mt-1">One logo for the whole site — same on portfolio and Haritech pages</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save Logo</motion.button>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold mb-4">Logo saved successfully!</div>}
      {uploadError && <div className="text-red-400 text-sm font-bold mb-4">{uploadError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Haritech Logo</p>
          <div className="w-full h-32 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center p-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Haritech Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md">
                  <Code2 className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">HARITECH</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Upload Logo File</label>
            <div className="relative border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-6 text-center transition-all bg-slate-950/30 cursor-pointer group">
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; e.target.value = ''; setUploadError(''); fileToSizedDataUrl(file).then((dataUrl) => setLogoPreview(dataUrl)).catch((err: Error) => setUploadError(err.message)); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs text-slate-300 font-medium">Click or drag & drop</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, SVG, WebP — auto-resized to fit</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Or enter Logo URL</label>
            <input type="url" placeholder="https://example.com/haritech-logo.png" value={logoUrl} onChange={(e) => { setLogoUrl(e.target.value); setLogoPreview(null); }} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
          </div>
          {(logoPreview || logoUrl) && (
            <button onClick={() => { setLogoPreview(null); setLogoUrl(''); setHaritechBrandLogo(''); }} className="px-4 py-2.5 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all">Reset Logo</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaritechLogoManager;
