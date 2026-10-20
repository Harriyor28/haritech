import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Droplets, MessageCircle, ArrowRight, Rotate3d,
  Check, Gauge
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';

export type CameraView = 'isometric' | 'perspective' | 'overhead';

interface EpoxyPreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  accentColor: string;
  floorGradient: string;
  veinStyle?: string;
  reflectionColor: string;
  psi: number;
  shoreD: number;
  cureHours: number;
  recommendedFor: string;
}

const PRESETS: EpoxyPreset[] = [
  {
    id: 'ocean',
    name: 'Azure Abyss 3D Ocean',
    tagline: 'Deep Caribbean aquatic illusion with submerged reef swirls',
    badge: 'SIGNATURE 3D ART',
    accentColor: '#06b6d4',
    floorGradient: 'radial-gradient(ellipse at 50% 60%, rgba(6, 182, 212, 0.95) 0%, rgba(14, 116, 144, 0.9) 35%, rgba(15, 23, 42, 0.98) 85%)',
    reflectionColor: 'rgba(56, 189, 248, 0.45)',
    psi: 13200,
    shoreD: 88,
    cureHours: 48,
    recommendedFor: 'Luxury Living Rooms, VIP Lounges, Pool Decks'
  },
  {
    id: 'calacatta',
    name: 'Calacatta Imperial Marble',
    tagline: 'Mirror-polished Italian marble with organic gold & grey veins',
    badge: 'LUXURY CLASS',
    accentColor: '#eab308',
    floorGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #cbd5e1 70%, #f1f5f9 100%)',
    reflectionColor: 'rgba(234, 179, 8, 0.35)',
    psi: 12500,
    shoreD: 85,
    cureHours: 48,
    recommendedFor: 'Penthouse Suites, Hotel Lobbies, Master Bedrooms'
  },
  {
    id: 'obsidian',
    name: 'Liquid Obsidian & Emerald',
    tagline: 'Deep dark resin with metallic pearlescent emerald ripples',
    badge: 'PREMIER METALLIC',
    accentColor: '#10b981',
    floorGradient: 'radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.8) 0%, rgba(6, 78, 59, 0.9) 40%, rgba(2, 6, 23, 0.98) 90%)',
    reflectionColor: 'rgba(52, 211, 153, 0.4)',
    psi: 12800,
    shoreD: 86,
    cureHours: 36,
    recommendedFor: 'Executive Boardrooms, Showrooms, Creative Studios'
  },
  {
    id: 'titanium',
    name: 'Molten Titanium Liquid Chrome',
    tagline: 'Seamless industrial liquid silver mirror reflection',
    badge: 'HIGH-DURABILITY',
    accentColor: '#94a3b8',
    floorGradient: 'linear-gradient(125deg, #334155 0%, #64748b 25%, #1e293b 50%, #475569 75%, #0f172a 100%)',
    reflectionColor: 'rgba(241, 245, 249, 0.5)',
    psi: 14500,
    shoreD: 90,
    cureHours: 24,
    recommendedFor: 'Commercial Garages, Warehouses, Modern Lofts'
  },
  {
    id: 'galaxy',
    name: 'Cosmic Galaxy Obsidian',
    tagline: 'Deep midnight obsidian studded with holographic micro-crystal flakes',
    badge: 'ULTRA GLOSS',
    accentColor: '#a855f7',
    floorGradient: 'radial-gradient(circle at 60% 50%, rgba(168, 85, 247, 0.7) 0%, rgba(88, 28, 135, 0.85) 45%, rgba(3, 7, 18, 0.98) 90%)',
    reflectionColor: 'rgba(192, 132, 252, 0.45)',
    psi: 12900,
    shoreD: 87,
    cureHours: 48,
    recommendedFor: 'Nightclubs, Gaming Rooms, Entertainment Centres'
  }
];

export const Epoxy3DRoomStudio: React.FC = () => {
  const [activePreset, setActivePreset] = useState<EpoxyPreset>(PRESETS[0]);
  const [cameraView, setCameraView] = useState<CameraView>('isometric');
  const [lightAngle, setLightAngle] = useState<number>(45); // degrees
  const [glossIntensity, setGlossIntensity] = useState<number>(92); // 0-100%
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // Compute 3D transform styles based on camera view
  const cameraTransforms = useMemo(() => {
    switch (cameraView) {
      case 'isometric':
        return {
          roomRotateX: 55,
          roomRotateZ: -25,
          floorScale: 1,
          depth: 180,
        };
      case 'perspective':
        return {
          roomRotateX: 68,
          roomRotateZ: 0,
          floorScale: 1.15,
          depth: 220,
        };
      case 'overhead':
        return {
          roomRotateX: 15,
          roomRotateZ: 0,
          floorScale: 0.95,
          depth: 80,
        };
    }
  }, [cameraView]);

  const waMessage = `Hello Haritech 3D Epoxy Division! I am inspecting the 3D Virtual Studio.\n\n` +
    `Selected Finish: ${activePreset.name} (${activePreset.badge})\n` +
    `Application: ${activePreset.recommendedFor}\n` +
    `Rating: ${activePreset.psi.toLocaleString()} PSI / Shore D ${activePreset.shoreD}\n\n` +
    `Please schedule a physical site inspection or send a quote.`;

  return (
    <div className="w-full max-w-6xl mx-auto my-12 rounded-3xl border border-teal-500/20 bg-slate-950/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-teal-950/30">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
            <Rotate3d className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Haritech 3D Epoxy Virtual Showroom
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                REAL-TIME 3D
              </span>
            </h3>
            <p className="text-xs text-slate-400">Interactive lighting refraction, material depth & camera perspective controls</p>
          </div>
        </div>

        {/* Camera Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/10">
          <button
            onClick={() => setCameraView('isometric')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              cameraView === 'isometric'
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric 3D
          </button>
          <button
            onClick={() => setCameraView('perspective')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              cameraView === 'perspective'
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Perspective
          </button>
          <button
            onClick={() => setCameraView('overhead')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              cameraView === 'overhead'
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top-Down
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Main 3D Canvas Viewport (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1122] to-slate-950 min-h-[420px]">
          {/* Ambient Lighting Glow tracking lightAngle */}
          <div
            className="absolute pointer-events-none transition-all duration-700 rounded-full blur-[100px]"
            style={{
              width: '320px',
              height: '320px',
              top: `${20 + Math.sin((lightAngle * Math.PI) / 180) * 20}%`,
              left: `${35 + Math.cos((lightAngle * Math.PI) / 180) * 35}%`,
              background: activePreset.reflectionColor,
              opacity: glossIntensity / 100,
            }}
          />

          {/* Perspective 3D Stage Container */}
          <div
            className="relative w-full max-w-md aspect-square flex items-center justify-center"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 30%',
            }}
          >
            <motion.div
              animate={{
                rotateX: cameraTransforms.roomRotateX,
                rotateZ: cameraTransforms.roomRotateZ,
                scale: cameraTransforms.floorScale,
              }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 18,
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="relative w-64 sm:w-80 h-64 sm:h-80 rounded-2xl shadow-2xl transition-all"
            >
              {/* Back Wall 3D Extrusion */}
              <div
                style={{
                  transform: 'rotateX(-90deg) translateZ(-40px)',
                  transformOrigin: 'top center',
                }}
                className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-800 to-slate-950 border-t border-white/10 opacity-70 pointer-events-none flex items-center justify-center"
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  LUXURY INTERIOR PERIMETER
                </div>
              </div>

              {/* Floor Plane: The 3D Epoxy Surface */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white/20 transition-all duration-700 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                style={{
                  background: activePreset.floorGradient,
                }}
              >
                {/* Marble/Mineral Vein Simulation if Calacatta */}
                {activePreset.id === 'calacatta' && (
                  <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0,40 Q 80,120 180,80 T 320,180" fill="none" stroke="#ca8a04" strokeWidth="4" filter="blur(1px)" />
                    <path d="M 40,240 Q 140,160 260,200 T 320,80" fill="none" stroke="#64748b" strokeWidth="3" filter="blur(1.5px)" />
                    <path d="M 120,0 Q 160,140 220,320" fill="none" stroke="#d97706" strokeWidth="2" />
                  </svg>
                )}

                {/* Ocean Depth Aquatic Ripple Overlay if Ocean */}
                {activePreset.id === 'ocean' && (
                  <div
                    className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,transparent_50%)] animate-pulse"
                    style={{ animationDuration: '4s' }}
                  />
                )}

                {/* Cosmic Glitter Flakes if Galaxy */}
                {activePreset.id === 'galaxy' && (
                  <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                )}

                {/* Dynamic Specular High-Gloss Sheen & Mirror Hotspot */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    opacity: (glossIntensity / 100),
                    background: `radial-gradient(circle 190px at ${50 + Math.cos((lightAngle * Math.PI) / 180) * 35}% ${50 + Math.sin((lightAngle * Math.PI) / 180) * 35}%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.65) 22%, rgba(255, 255, 255, 0.15) 55%, transparent 75%)`,
                    mixBlendMode: 'color-dodge',
                  }}
                />

                {/* Sweeping Mirror Glare Beam */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    opacity: (glossIntensity / 100) * 0.75,
                    background: `linear-gradient(${lightAngle}deg, transparent 20%, rgba(255, 255, 255, 0.2) 42%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.2) 58%, transparent 80%)`,
                    mixBlendMode: 'overlay',
                  }}
                />

                {/* Mirror Wall Reflection on Polished Floor */}
                <div
                  className="absolute top-0 inset-x-0 h-28 pointer-events-none opacity-60 bg-gradient-to-b from-white/45 via-white/15 to-transparent"
                  style={{ mixBlendMode: 'screen' }}
                />

                {/* Premium 6.5s Light-Sheet Sweep (director-mode glare) */}
                <div className="ht-sheen" />

                {/* Counter-side Rim Glint — sells the mirror parallax */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    opacity: (glossIntensity / 100) * 0.5,
                    background: `radial-gradient(circle 70px at ${100 - (50 + Math.cos((lightAngle * Math.PI) / 180) * 30)}% ${100 - (50 + Math.sin((lightAngle * Math.PI) / 180) * 30)}%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)`,
                    mixBlendMode: 'screen',
                  }}
                />

                {/* Floor Grid Wireframe (Optional Overlay) */}
                {showWireframe && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                )}

                {/* Center 3D Resin Stamp Badge */}
                <div 
                  style={{ transform: 'translateZ(20px)' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/30 text-center shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                    <span className="text-[12px] font-black tracking-widest text-white uppercase block font-syne drop-shadow">
                      {activePreset.name}
                    </span>
                    <span className="text-[9px] font-mono text-teal-300 tracking-wider">
                      HIGH-TENSILE POUR • {activePreset.psi.toLocaleString()} PSI
                    </span>
                  </div>
                </div>

                {/* Crisp 1px Glass Rim Bevel */}
                <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />

                {/* Depth Vignette — pushes the floor plane down for mirror-glass realism */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: 'inset 0 18px 44px rgba(0,0,0,0.5), inset 0 -6px 24px rgba(0,0,0,0.35)' }}
                />
              </div>

              {/* 3D Floor True Mirror Reflection Plane */}
              <div
                style={{
                  transform: 'translateZ(-26px) scale(1)',
                  background: activePreset.floorGradient,
                  filter: 'blur(9px)',
                  opacity: (glossIntensity / 100) * 0.72,
                }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Canvas Controls Overlay (Bottom of Viewport) */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-6 mt-4 border-t border-white/10 relative z-10">
            {/* Light Angle Slider */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Sun className="h-4 w-4 text-yellow-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Sun / Spotlight Angle</span>
                  <span className="text-white font-bold">{lightAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={lightAngle}
                  onChange={(e) => setLightAngle(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>
            </div>

            {/* Gloss Wet-Look Intensity */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Droplets className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Wet Gloss Sheen</span>
                  <span className="text-white font-bold">{glossIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={glossIntensity}
                  onChange={(e) => setGlossIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Wireframe toggle */}
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                showWireframe
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Grid {showWireframe ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Preset Selector & Technical Specs Panel (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold block mb-1">
                MATERIAL ARCHIVE
              </span>
              <h4 className="text-xl font-black text-white">Select 3D Finish Grade</h4>
              <p className="text-xs text-slate-400 mt-1">Live shader switch with lab-certified compound metrics</p>
            </div>

            {/* Preset Cards List */}
            <div className="space-y-2.5">
              {PRESETS.map((preset) => {
                const isSelected = activePreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setActivePreset(preset)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-400 shadow-lg shadow-teal-500/10'
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
                          <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : 'text-white'}`}>
                            {preset.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-medium">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{preset.tagline}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-teal-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Preset Technical Specs HUD */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-teal-400" />
                  <span>Lab Certification & Engineering Specs</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">PASSED ISO-9001</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-sm font-black text-white font-mono">{activePreset.psi.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Compressive PSI</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-sm font-black text-teal-400 font-mono">D-{activePreset.shoreD}</div>
                  <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Shore Hardness</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-sm font-black text-cyan-400 font-mono">{activePreset.cureHours}h</div>
                  <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Full Foot Traffic</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                <strong className="text-slate-200">Recommended For: </strong>
                {activePreset.recommendedFor}
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="pt-6 space-y-3">
            <a
              href={getWhatsAppUrl(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Quote for {activePreset.name}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Epoxy3DRoomStudio;
