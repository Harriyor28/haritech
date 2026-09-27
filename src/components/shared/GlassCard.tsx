import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hoverGlow = false, onClick }: GlassCardProps) {
  const hoverClass = hoverGlow 
    ? 'transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] hover:border-cyan-500/20 hover:-translate-y-1' 
    : '';
    
  return (
    <div 
      className={`bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 ${hoverClass} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {children}
    </div>
  );
}
export default GlassCard;
