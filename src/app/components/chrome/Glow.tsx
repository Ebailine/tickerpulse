"use client";

export function Glow() {
  return (
    <div aria-hidden className="pointer-events-none">
      <div className="absolute -top-32 right-10 h-72 w-72 rounded-full blur-3xl opacity-40 animate-glow"
           style={{ background: "radial-gradient(circle at 30% 30%, #22d3ee, transparent 60%)" }} />
      <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full blur-3xl opacity-30 animate-glow"
           style={{ background: "radial-gradient(circle at 70% 70%, #60a5fa, transparent 60%)" }} />
    </div>
  );
}
