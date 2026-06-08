"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ChevronIcon, ExpandAiLogo, GridIcon } from "@/components/ui/brand";
import { UserMenuStandalone } from "@/components/ui/user-menu";

/**
 * Cabeçalho global: logo-menu (navegação por módulos) à esquerda,
 * menu de usuário (conta/logout) à direita. Reutiliza useAuth.
 */
export function AppHeader() {
  const pathname = usePathname();
  const { currentUser, visibleModules } = useAuth();

  const navItems: NavItem[] = [
    { key: "home", label: "Visão geral", href: "/", endpoint: "Início" },
    ...visibleModules.map((m) => ({
      key: m.key,
      label: m.title,
      href: m.href,
      endpoint: m.endpoint,
    })),
  ];

  const activeItem =
    navItems.find((i) => i.href !== "/" && pathname.startsWith(i.href)) ??
    navItems.find((i) => i.href === pathname) ??
    navItems[0];

  return (
    <div className="flex items-center justify-between gap-4">
      <LogoMenu navItems={navItems} activeLabel={activeItem?.label} pathname={pathname} />
      <UserMenuStandalone
        name={currentUser?.name}
        email={currentUser?.email}
        role={currentUser?.role}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

type NavItem = { key: string; label: string; href: string; endpoint: string };

function LogoMenu({
  navItems,
  activeLabel,
  pathname,
}: {
  navItems: NavItem[];
  activeLabel?: string;
  pathname: string;
}) {
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

  return (
    <div ref={ref} className="relative z-30 w-fit">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group flex items-center gap-3 rounded-2xl border bg-[#162A3D]/30 px-4 py-3 backdrop-blur-md transition-all duration-300 ${
          open ? "border-[#FF842A]/30" : "border-white/5 hover:border-white/10"
        }`}
      >
        <ExpandAiLogo className="text-3xl" />
        <span className="h-5 w-px bg-white/10" />
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#8A9AA6]">
          <GridIcon className="h-3.5 w-3.5 text-[#FF842A]" />
          {activeLabel}
        </span>
        <ChevronIcon
          className={`h-4 w-4 text-[#8A9AA6] transition-transform duration-300 ${
            open ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>

      <div
        className="absolute left-0 top-full mt-2 w-72 origin-top"
        style={{
          transition: "opacity 220ms ease, transform 320ms cubic-bezier(0.34,1.3,0.5,1)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#162A3D]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-[#FF842A]/12 text-white"
                      : "text-[#8A9AA6] hover:bg-white/5 hover:text-[#CDD6DC]"
                  }`}
                  style={{
                    transition:
                      "transform 360ms cubic-bezier(0.34,1.3,0.5,1), opacity 240ms ease",
                    transitionDelay: open ? `${index * 35}ms` : "0ms",
                    transform: open ? "translateY(0)" : "translateY(-8px)",
                    opacity: open ? 1 : 0,
                  }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#FF842A] shadow-[0_0_12px_rgba(255,132,42,0.8)]" />
                  )}
                  <span className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-[11px] font-normal text-[#8A9AA6]/70">
                      {item.endpoint}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
