import React, { memo } from "react";

const Cell = memo(function Cell({ color }) {
  if (!color) return <div className="w-full h-full bg-black/20" />;

  return (
    <div className="w-full h-full relative">
      {/* Base depth shadow */}
      <div className="absolute inset-0 bg-black/70 rounded-[3px]" />
      {/* Main glossy block */}
      <div
        className="absolute inset-[6%] rounded-[6px] border-2"
        style={{
          borderColor: `${color}99`,
          background: `linear-gradient(135deg, ${color}ff 0%, ${color}e6 40%, ${color}cc 70%, ${color}b3 100%)`,
          boxShadow: `0 2px 8px ${color}66, 0 0 16px ${color}44, inset 0 -4px 12px rgba(0,0,0,0.5), inset 2px 2px 8px rgba(255,255,255,0.3)`,
        }}
      />
      {/* Top highlight */}
      <div
        className="absolute inset-[6%] rounded-[6px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 25%, transparent 50%)",
          mixBlendMode: "overlay",
        }}
      />
      {/* Edge highlight */}
      <div
        className="absolute inset-[6%] rounded-[6px] pointer-events-none"
        style={{
          boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.4)`,
        }}
      />
    </div>
  );
});

export default Cell;
