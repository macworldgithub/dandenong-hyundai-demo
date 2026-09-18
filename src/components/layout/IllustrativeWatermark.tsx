import React from 'react';

export const IllustrativeWatermark: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 flex items-center justify-between text-[11px] font-medium text-amber-700 select-none">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>DEMO SUITE: Single-rooftop accounting instance locked to <strong>Dandenong Hyundai (Booran Motor Group)</strong>. All data is illustrative.</span>
      </div>
      <span className="font-mono text-[10px] text-amber-700 uppercase tracking-wider">Audit Integrity Enforced</span>
    </div>
  );
};
