"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthUser } from "@/types/expandai";
import type { PortalConfig } from "@/lib/portal-config";
import { ChevronIcon, ExpandAiLogo, MeshBackground } from "@/components/ui/brand";
import { UserMenuStandalone } from "@/components/ui/user-menu";

type PortalShellProps = {
  portal: PortalConfig;
  currentUser: AuthUser;
  title: string;
  description: string;
  previewMessage?: string | null;
  actionSlot?: ReactNode;
  children: ReactNode;
};

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

type SpotlightListProps = {
  items: Array<{
    title: string;
    eyebrow: string;
    description: string;
    status: string;
  }>;
};

type TrendBarsProps = {
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: number;
    formattedValue: string;
  }>;
};

type QuickFactGridProps = {
  items: Array<{ label: string; value: string }>;
};

type ReportTableProps = {
  rows: Array<{ label: string; primary: string; secondary: string }>;
};

type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  portalLabel?: string;
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getStatusClasses(value: string) {
  const normalizedValue = value.toUpperCase();

  if (["ACTIVE", "WON", "BILLED", "PAYMENT_CONFIRMED", "RELEASED"].includes(normalizedValue)) {
    return "border-[#0E9A4F]/30 bg-[#0E9A4F]/12 text-[#13B860]";
  }

  if (["PENDING", "NEW", "QUALIFIED", "PROPOSAL", "ENTRY", "PIPELINE"].includes(normalizedValue)) {
    return "border-[#FF842A]/30 bg-[#FF842A]/12 text-[#FF842A]";
  }

  if (["LOST", "INACTIVE", "CANCELLED", "CANCELED", "OVERDUE", "BLOCKED"].includes(normalizedValue)) {
    return "border-rose-500/30 bg-rose-500/12 text-rose-300";
  }

  return "border-white/10 bg-white/5 text-[#CDD6DC]";
}

/**
 * Menu do portal: logo + dropdown com navegação específica do portal
 * (Dashboard, Relatórios e módulos legados). Mesma linguagem do AppHeader.
 */
function PortalLogoMenu({ portal, pathname }: { portal: PortalConfig; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Dashboard", href: portal.route },
    { label: "Relatórios", href: portal.reportsRoute },
    ...portal.legacyModules.map((m) => ({ label: m.label, href: m.href })),
  ];

  const activeLabel =
    navItems.find((i) => i.href === pathname)?.label ?? portal.navigationLabel;

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
        className={joinClasses(
          "group flex items-center gap-3 rounded-2xl border bg-[#162A3D]/30 px-4 py-3 backdrop-blur-md transition-all duration-300",
          open ? "border-[#FF842A]/30" : "border-white/5 hover:border-white/10",
        )}
      >
        <ExpandAiLogo className="text-3xl" />
        <span className="h-5 w-px bg-white/10" />
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#8A9AA6]">
          <span className="text-[#FF842A]">{portal.badge}</span>
          <span className="text-[#8A9AA6]/50">·</span>
          {activeLabel}
        </span>
        <ChevronIcon
          className={joinClasses(
            "h-4 w-4 text-[#8A9AA6] transition-transform duration-300",
            open ? "-rotate-90" : "rotate-90",
          )}
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
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`${portal.key}-${item.href}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={joinClasses(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium",
                    isActive
                      ? "bg-[#FF842A]/12 text-white"
                      : "text-[#8A9AA6] hover:bg-white/5 hover:text-[#CDD6DC]",
                  )}
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function PortalShell({
  portal,
  currentUser,
  title,
  description,
  previewMessage,
  actionSlot,
  children,
}: PortalShellProps) {
  const pathname = usePathname();

  const actionItems = useMemo(() => {
    if (!actionSlot) return [];
    return Array.isArray(actionSlot) ? actionSlot : [actionSlot];
  }, [actionSlot]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0D1E2D] text-[#CDD6DC] antialiased">
      <MeshBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <PortalLogoMenu portal={portal} pathname={pathname} />
          <UserMenuStandalone
            name={currentUser.name}
            email={currentUser.email}
            role={currentUser.role}
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl px-1">
            <span
              className={joinClasses(
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                "border-[#FF842A]/25 bg-[#FF842A]/10 text-[#FF842A]",
              )}
            >
              {portal.badge}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8A9AA6]">
              {description}
            </p>
            {previewMessage ? (
              <div className="mt-5 rounded-2xl border border-[#FF842A]/25 bg-[#FF842A]/10 px-4 py-3 text-sm text-[#FF842A]">
                {previewMessage}
              </div>
            ) : null}
          </div>

          {actionItems.length > 0 ? (
            <div className="flex flex-wrap gap-3 xl:max-w-[480px] xl:justify-end">
              {actionItems.map((item, index) => (
                <div key={`portal-action-${index}`} className="shrink-0">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

export function PortalMetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-5 backdrop-blur-xl">
      <p className="text-xs font-medium uppercase tracking-wider text-[#8A9AA6]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-[#8A9AA6]">{description}</p>
    </article>
  );
}

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6 backdrop-blur-xl lg:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8A9AA6]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SpotlightList({ items }: SpotlightListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/12 bg-[#07131F]/50 p-6 text-sm text-[#8A9AA6]">
        Nenhum item de destaque foi carregado nesta visão.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article
          key={`${item.title}-${item.status}`}
          className="rounded-2xl border border-white/8 bg-[#07131F]/50 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A9AA6]">{item.eyebrow}</p>
              <h4 className="mt-2 text-lg font-semibold text-white">{item.title}</h4>
            </div>
            <span className={joinClasses("rounded-full border px-3 py-1 text-xs font-medium", getStatusClasses(item.status))}>
              {item.status}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#8A9AA6]">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export function TrendBars({ title, description, items }: TrendBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl border border-white/8 bg-[#07131F]/50 p-5">
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-[#8A9AA6]">{description}</p>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-[#8A9AA6]">Sem dados suficientes para esta leitura.</p>
        ) : (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-[#CDD6DC]">{item.label}</span>
                <span className="font-semibold text-white">{item.formattedValue}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-2.5 rounded-full bg-[#FF842A]"
                  style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function QuickFactGrid({ items }: QuickFactGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/8 bg-[#07131F]/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A9AA6]">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportTable({ rows }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#07131F]/50">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/8 text-left text-sm text-[#CDD6DC]">
          <thead className="text-xs uppercase tracking-[0.18em] text-[#8A9AA6]">
            <tr>
              <th className="px-5 py-4 font-medium">Indicador</th>
              <th className="px-5 py-4 font-medium">Valor principal</th>
              <th className="px-5 py-4 font-medium">Leitura complementar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.label} className="transition hover:bg-white/[0.03]">
                <td className="px-5 py-4 font-semibold text-white">{row.label}</td>
                <td className="px-5 py-4">{row.primary}</td>
                <td className="px-5 py-4 text-[#8A9AA6]">{row.secondary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PortalModal({
  open,
  title,
  description,
  onClose,
  children,
  portalLabel = "Portal",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${portalLabel}: ${title}`}
        className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#162A3D]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">{portalLabel}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#8A9AA6]">{description}</p>
          </div>
          <button
            className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-2 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20 hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="Fechar modal"
          >
            Fechar
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
