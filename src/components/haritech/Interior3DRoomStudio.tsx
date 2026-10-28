import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sofa, Lamp, MessageCircle, ArrowRight, Rotate3d,
  Check, Gauge
} from 'lucide-react';
import {
  getWhatsAppUrl, getEpoxyContent, defaultInteriorStyles, InteriorStyle,
} from '../../utils/haritechContent';

export type CameraView = 'isometric' | 'perspective' | 'overhead';

/* Styles are admin-editable (Epoxy & Décor manager → Interior Décor Styles)
   and stored under the `haritech-epoxy` content key.                    */

export const Interior3DRoomStudio: React.FC = () => {
  const [styles, setStyles] = useState<InteriorStyle[]>(
    () => (getEpoxyContent().interiorStyles ?? defaultInteriorStyles)
  );
  const [activeId, setActiveId] = useState<string>(() => styles[0]?.id ?? '');
  const [cameraView, setCameraView] = useState<CameraView>('isometric');
  const [lightAngle, setLightAngle] = useState<number>(45);
  const [ambientBright, setAmbientBright] = useState<number>(80); // 0-100% room lights
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => {
      const next = getEpoxyContent().interiorStyles ?? defaultInteriorStyles;
      setStyles(next);
    };
    window.addEventListener('haritech-epoxy-updated', handler);
    window.addEventListener('haritech-cross-tab-styles', handler as EventListener);
    return () => {
      window.removeEventListener('haritech-epoxy-updated', handler);
      window.removeEventListener('haritech-cross-tab-styles', handler as EventListener);
    };
  }, []);

  const stylesList = styles.length ? styles : defaultInteriorStyles;
  const activePreset = stylesList.find((s) => s.id === activeId) ?? stylesList[0];

  const cameraTransforms = useMemo(() => {
    switch (cameraView) {
      case 'isometric':
        return { roomRotateX: 55, roomRotateZ: -25, floorScale: 1 };
      case 'perspective':
        return { roomRotateX: 68, roomRotateZ: 0, floorScale: 1.15 };
      case 'overhead':
        return { roomRotateX: 15, roomRotateZ: 0, floorScale: 0.95 };
    }
  }, [cameraView]);

  const waMessage = `Hello Haritech 3D Epoxy & Interior Decor Division! I am styling a space in the 3D Interior Studio.\n\n` +
    `Selected Style: ${activePreset.name} (${activePreset.badge})\n` +
    `Paired Finish: matching 3D epoxy floor\n` +
    `Best For: ${activePreset.spaceUsage}\n` +
    `Lighting: ${activePreset.ambientK}K ambient palette\n\n` +
    `Please schedule a site visit or send a decoration quote.`;

  return (
    <div className="w-full max-w-6xl mx-auto my-12 rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-cyan-950/30">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <Rotate3d className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Haritech 3D Interior Décor Studio
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                REAL-TIME 3D
              </span>
            </h3>
            <p className="text-xs text-slate-400">Arrange furniture palettes, ambient lighting & camera angles over a matching epoxy floor</p>
          </div>
        </div>

        {/* Camera Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/10">
          {(['isometric', 'perspective', 'overhead'] as CameraView[]).map((v) => (
            <button
              key={v}
              onClick={() => setCameraView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                cameraView === v
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v === 'isometric' ? 'Isometric 3D' : v === 'perspective' ? 'Perspective' : 'Top-Down'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Main 3D Canvas Viewport */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1122] to-slate-950 min-h-[420px]">
          {/* Ambient room glow tracking lightAngle */}
          <div
            className="absolute pointer-events-none transition-all duration-700 rounded-full blur-[100px]"
            style={{
              width: '320px',
              height: '320px',
              top: `${20 + Math.sin((lightAngle * Math.PI) / 180) * 20}%`,
              left: `${35 + Math.cos((lightAngle * Math.PI) / 180) * 35}%`,
              background: activePreset.glowColor,
              opacity: ambientBright / 100,
            }}
          />

          <div
            className="relative w-full max-w-md aspect-square flex items-center justify-center"
            style={{ perspective: '1200px', perspectiveOrigin: '50% 30%' }}
          >
            <motion.div
              animate={{
                rotateX: cameraTransforms.roomRotateX,
                rotateZ: cameraTransforms.roomRotateZ,
                scale: cameraTransforms.floorScale,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-64 sm:w-80 h-64 sm:h-80 rounded-2xl shadow-2xl transition-all"
            >
              {/* Back Wall 3D Extrusion — decorated wall */}
              <div
                style={{ transform: 'rotateX(-90deg) translateZ(-40px)', transformOrigin: 'top center' }}
                className="absolute top-0 inset-x-0 h-32 overflow-hidden border-t border-white/10 pointer-events-none"
              >
                <div className="absolute inset-0" style={{ background: activePreset.wallGradient }} />
                {/* Wall art panels */}
                <div className="absolute left-1/2 top-2 -translate-x-1/2 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-4 h-6 rounded-sm border border-white/25 opacity-80"
                      style={{ background: i === 1 ? activePreset.accentColor : 'rgba(255,255,255,0.15)' }}
                    />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-1 text-center text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  DECORATED PERIMETER
                </div>
              </div>

              {/* Floor Plane — matching epoxy surface */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white/20 transition-all duration-700 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                style={{ background: activePreset.floorGradient }}
              >
                {/* Specular sheen on the resin floor */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    opacity: (ambientBright / 100) * 0.8,
                    background: `radial-gradient(circle 190px at ${50 + Math.cos((lightAngle * Math.PI) / 180) * 35}% ${50 + Math.sin((lightAngle * Math.PI) / 180) * 35}%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 22%, rgba(255,255,255,0.12) 55%, transparent 75%)`,
                    mixBlendMode: 'color-dodge',
                  }}
                />
                {/* Sweeping glare beam */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    opacity: (ambientBright / 100) * 0.6,
                    background: `linear-gradient(${lightAngle}deg, transparent 20%, rgba(255,255,255,0.2) 42%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.2) 58%, transparent 80%)`,
                    mixBlendMode: 'overlay',
                  }}
                />
                {/* ht-sheen director sweep */}
                <div className="ht-sheen" />

                {/* Wireframe grid */}
                {showWireframe && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                )}

                {/* Rug — laid flat on floor */}
                <div
                  style={{ transform: 'translateZ(4px)' }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-[45%] pointer-events-none"
                >
                  <div className="absolute inset-0 rounded-[45%] border border-white/25" style={{ background: activePreset.rugColor }} />
                </div>

                {/* Crisp rim bevel + depth vignette (same as epoxy floor) */}
                <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: 'inset 0 18px 44px rgba(0,0,0,0.5), inset 0 -6px 24px rgba(0,0,0,0.35)' }}
                />
              </div>

              {/* ── Furniture Props (floating above floor on translateZ) ── */}

              {/* Sofa: seat, backrest, two cushions */}
              <div style={{ transform: 'translateZ(14px)', transformStyle: 'preserve-3d' }} className="absolute left-2 top-2 w-24 h-14 pointer-events-none">
                <div className="absolute inset-x-0 bottom-0 h-9 rounded-lg border border-white/25 shadow-lg" style={{ background: activePreset.sofaColor }} />
                <div className="absolute inset-x-1 top-0 h-6 rounded-t-xl border border-white/20 opacity-90" style={{ background: activePreset.sofaColor, filter: 'brightness(0.85)' }} />
                <div className="absolute left-2 bottom-4 w-7 h-5 rounded-md border border-white/25" style={{ background: activePreset.cushionA }} />
                <div className="absolute right-2 bottom-4 w-7 h-5 rounded-md border border-white/25" style={{ background: activePreset.cushionB }} />
              </div>

              {/* Sofa armrest accent */}
              <div className="absolute bottom-[68%] left-[16%] w-10 h-6 rounded-md border border-white/15 pointer-events-none" style={{ transform: 'translateZ(20px)', background: activePreset.accentColor, opacity: 0.35, filter: 'blur(6px)' }} />

              {/* Coffee table */}
              <div style={{ transform: 'translateZ(18px)' }} className="absolute right-4 bottom-10 w-16 h-4 rounded-lg border border-white/30 shadow-md pointer-events-none">
                <div className="absolute inset-0 rounded-lg opacity-90" style={{ background: activePreset.tableColor }} />
                {/* Vase on the table */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-5 rounded-t-full border border-white/30" style={{ background: activePreset.accentColor }} />
              </div>

              {/* TV / media console on wall side */}
              <div style={{ transform: 'translateZ(10px)' }} className="absolute right-3 top-3 w-20 h-3.5 rounded-md border border-white/25 pointer-events-none" >
                <div className="absolute inset-0 rounded-md opacity-90" style={{ background: activePreset.tableColor, filter: 'brightness(0.8)' }} />
                {/* Flat screen */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-9 rounded border border-white/40 bg-slate-950/70 shadow-[0_0_14px_rgba(0,0,0,0.7)]" />
              </div>

              {/* Floor lamp with warm glow */}
              <div style={{ transform: 'translateZ(16px)', transformStyle: 'preserve-3d' }} className="absolute left-6 bottom-6 pointer-events-none">
                <div className="absolute inset-0 -m-6 rounded-full blur-xl transition-opacity duration-500" style={{ background: activePreset.glowColor, opacity: ambientBright / 100 }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-slate-400/80" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-white/40" style={{ background: activePreset.glowColor, boxShadow: `0 0 12px ${activePreset.accentColor}` }} />
              </div>

              {/* Plant */}
              <div style={{ transform: 'translateZ(12px)' }} className="absolute right-8 top-8 pointer-events-none">
                <div className="w-3.5 h-4 rounded-b-md border border-white/25 opacity-90" style={{ background: 'linear-gradient(180deg, #92400e, #5c2c04)' }} />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-5 rounded-full border border-emerald-300/40" style={{ background: 'radial-gradient(circle, rgba(52,211,153,.9), rgba(6,78,59,.8))' }} />
              </div>

              {/* Center Studio Stamp Badge */}
              <div style={{ transform: 'translateZ(28px)' }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/30 text-center shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                  <span className="text-[12px] font-black tracking-widest text-white uppercase block font-syne drop-shadow">
                    {activePreset.name}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 tracking-wider">
                    FULL DECORATION • {activePreset.handoverDays} DAY HANDOVER
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Canvas Controls Overlay */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-6 mt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Lamp className="h-4 w-4 text-yellow-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Key Light Direction</span>
                  <span className="text-white font-bold">{lightAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={lightAngle}
                  onChange={(e) => setLightAngle(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Sofa className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Ambient Brightness</span>
                  <span className="text-white font-bold">{ambientBright}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={ambientBright}
                  onChange={(e) => setAmbientBright(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                showWireframe
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Layout Grid {showWireframe ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Style Selector & Palette Specs Panel */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                DÉCOR ARCHIVE
              </span>
              <h4 className="text-xl font-black text-white">Select Interior Style</h4>
              <p className="text-xs text-slate-400 mt-1">Each style pairs a matched epoxy floor with furniture, wall & lighting palettes</p>
            </div>

            <div className="space-y-2.5">
              {stylesList.map((preset) => {
                const isSelected = activePreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setActiveId(preset.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg border border-white/20 shadow-inner shrink-0"
                        style={{ background: preset.floorGradient }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {preset.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{preset.tagline}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Style Palette HUD */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Palette Specification</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">{activePreset.ambientK}K AMBIENT</span>
              </div>

              {/* Swatch row */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Floor', color: activePreset.floorGradient },
                  { label: 'Walls', color: activePreset.wallGradient },
                  { label: 'Upholstery', color: activePreset.sofaColor },
                  { label: 'Table', color: activePreset.tableColor },
                  { label: 'Lamp', color: activePreset.glowColor },
                ].map((sw) => (
                  <div key={sw.label} className="text-center">
                    <div className="h-8 rounded-xl border border-white/20" style={{ background: sw.color }} />
                    <div className="text-[8px] text-slate-500 uppercase mt-1 font-mono">{sw.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-sm font-black text-white font-mono">{activePreset.handoverDays}d</div>
                  <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Full Handover</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-sm font-black text-cyan-400 font-mono">1–1</div>
                  <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Epoxy Floor Match</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                <strong className="text-slate-200">Recommended For: </strong>
                {activePreset.spaceUsage}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 space-y-3">
            <a
              href={getWhatsAppUrl(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Décor Quote for {activePreset.name}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interior3DRoomStudio;
