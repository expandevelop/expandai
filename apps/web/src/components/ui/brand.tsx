"use client";

import type { ReactNode } from "react";

/* =========================================================================
 * ExpandAI — primitivos visuais compartilhados (design system v2)
 * Base escura, glassmorphism, glow de marca. Paleta oficial.
 * ===================================================================== */

/** Wordmark oficial: "Expand" branco · "AI" laranja · ponto verde. */
export function ExpandAiLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`select-none font-extrabold leading-none tracking-tight ${className}`}
    >
      <span className="text-white">Expand</span>
      <span className="text-[#FF842A]">AI</span>
      <span className="text-[#13B860]">.</span>
    </span>
  );
}

/** Fundo com mesh de glow (laranja + verde sobre o navy) e grid sutil. */
export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#FF842A]/12 blur-[120px] animate-[float1_14s_ease-in-out_infinite]" />
      <div className="absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-[#0E9A4F]/14 blur-[120px] animate-[float2_18s_ease-in-out_infinite]" />
      <div className="absolute -bottom-48 left-1/3 h-[32rem] w-[32rem] rounded-full bg-[#13B860]/10 blur-[130px] animate-[float3_16s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,132,42,0.10),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(205,214,220,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(205,214,220,.6) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}

const GLOWS: Record<string, string> = {
  orange: "before:bg-[#FF842A]/15",
  green: "before:bg-[#0E9A4F]/18",
  none: "before:bg-transparent",
};

/** Card de vidro fosco com glow opcional que reage no hover. */
export function GlassCard({
  children,
  className = "",
  glow = "none",
}: {
  children: ReactNode;
  className?: string;
  glow?: keyof typeof GLOWS;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/8 bg-[#162A3D]/70 backdrop-blur-xl transition duration-300 hover:border-white/15 before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:blur-3xl before:transition before:duration-500 group-hover:before:scale-125 ${GLOWS[glow]} ${className}`}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/** Loading em três pontos (estilo Google). tone "light" para fundo colorido. */
export function DotsSpinner({ tone = "cta" }: { tone?: "cta" | "light" }) {
  const color = tone === "light" ? "bg-white" : "bg-[#FF842A]";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1.5 w-1.5 animate-bounce rounded-full ${color} [animation-delay:-0.3s]`} />
      <span className={`h-1.5 w-1.5 animate-bounce rounded-full ${color} [animation-delay:-0.15s]`} />
      <span className={`h-1.5 w-1.5 animate-bounce rounded-full ${color}`} />
    </span>
  );
}

/** Bloco de skeleton para carregamento de conteúdo. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/5 bg-[#162A3D]/40 ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Ícones (inline SVG, stroke currentColor)
 * ------------------------------------------------------------------ */

export type IconProps = { className?: string };

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
export function KeyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 8.2-8.2M16 5l3 3M14 7l2 2" />
    </svg>
  );
}
export function GearIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
export function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
export function RefreshIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />
    </svg>
  );
}
export function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
