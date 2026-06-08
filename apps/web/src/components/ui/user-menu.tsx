"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  ChevronIcon,
  GearIcon,
  KeyIcon,
  LogoutIcon,
  RefreshIcon,
  UserIcon,
} from "@/components/ui/brand";

function initials(name?: string | null) {
  if (!name) return "EA";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Menu de conta (extremidade direita): perfil, senha, configurações,
 * recarregar perfil e logout. Reutiliza useAuth.
 */
export function UserMenuStandalone({
  name,
  email,
  role,
}: {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}) {
  const { signOut, refreshProfile, isRefreshingProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { key: "perfil", label: "Meu perfil", icon: UserIcon },
    { key: "senha", label: "Alterar senha", icon: KeyIcon },
    { key: "config", label: "Configurações", icon: GearIcon },
  ];

  return (
    <div ref={ref} className="relative z-30">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group flex items-center gap-3 rounded-2xl border bg-[#162A3D]/30 py-2 pl-2 pr-3 backdrop-blur-md transition-all duration-300 ${
          open ? "border-[#FF842A]/30" : "border-white/5 hover:border-white/10"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0E9A4F] text-xs font-bold text-white">
          {initials(name)}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-semibold leading-tight text-white">
            {name ?? "Usuário"}
          </p>
          <p className="text-[11px] leading-tight text-[#8A9AA6]">
            {role ?? "Sem perfil"}
          </p>
        </div>
        <ChevronIcon
          className={`h-4 w-4 text-[#8A9AA6] transition-transform duration-300 ${
            open ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>

      <div
        className="absolute right-0 top-full mt-2 w-60 origin-top-right"
        style={{
          transition: "opacity 220ms ease, transform 320ms cubic-bezier(0.34,1.3,0.5,1)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#162A3D]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="flex items-center gap-3 rounded-xl bg-[#07131F]/60 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E9A4F] text-sm font-bold text-white">
              {initials(name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{name ?? "Usuário"}</p>
              <p className="truncate text-xs text-[#8A9AA6]">{email ?? "—"}</p>
            </div>
          </div>

          <nav className="mt-2 space-y-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setOpen(false)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#8A9AA6] transition hover:bg-white/5 hover:text-[#CDD6DC]"
                  style={{
                    transition:
                      "transform 360ms cubic-bezier(0.34,1.3,0.5,1), opacity 240ms ease",
                    transitionDelay: open ? `${index * 40}ms` : "0ms",
                    transform: open ? "translateY(0)" : "translateY(-8px)",
                    opacity: open ? 1 : 0,
                  }}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 text-[#8A9AA6] transition-colors group-hover:text-[#CDD6DC]" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-1 border-t border-white/8 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                void refreshProfile();
              }}
              disabled={isRefreshingProfile}
              className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#8A9AA6] transition hover:bg-white/5 hover:text-[#CDD6DC] disabled:opacity-60"
            >
              <RefreshIcon className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-[#CDD6DC]" />
              {isRefreshingProfile ? "Atualizando..." : "Recarregar perfil"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#8A9AA6] transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogoutIcon className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-rose-300" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
