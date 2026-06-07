"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "@/types/expandai";
import type { PortalConfig } from "@/lib/portal-config";

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
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["PENDING", "NEW", "QUALIFIED", "PROPOSAL", "ENTRY", "PIPELINE"].includes(normalizedValue)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (["LOST", "INACTIVE", "CANCELLED", "CANCELED"].includes(normalizedValue)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function PortalBadge({ portal }: { portal: PortalConfig }) {
  return (
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f1d2f] via-[#1e3a5f] to-[#16a34a] text-sm font-semibold tracking-[0.18em] text-white shadow-lg shadow-emerald-950/15">
      {portal.icon}
    </div>
  );
}

function SidebarLink({
  href,
  label,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-[#16a34a]/20 bg-[#16a34a]/10 text-[#0f1d2f]"
          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
      )}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      <span
        aria-hidden="true"
        className={joinClasses(
          "inline-flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-semibold",
          active
            ? "border-[#16a34a]/20 bg-white text-[#16a34a]"
            : "border-slate-200 bg-white text-slate-500 group-hover:text-slate-900",
        )}
      >
        {label.slice(0, 2).toUpperCase()}
      </span>
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}

function PortalSidebar({
  portal,
  pathname,
  collapsed,
  onCloseMobile,
}: {
  portal: PortalConfig;
  pathname: string;
  collapsed: boolean;
  onCloseMobile?: () => void;
}) {
  const navItems = [
    { label: "Dashboard", href: portal.route },
    { label: "Relatórios", href: portal.reportsRoute },
    ...portal.legacyModules.map((module) => ({ label: module.label, href: module.href })),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-4">
        <PortalBadge portal={portal} />
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold text-slate-950">{portal.title}</p>
            <p className="text-xs text-slate-500">Experiência dedicada</p>
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <div key={`${portal.key}-${item.href}`} onClick={onCloseMobile}>
                <SidebarLink href={item.href} label={item.label} active={active} collapsed={collapsed} />
              </div>
            );
          })}
        </div>
      </div>

      {!collapsed ? (
        <div className="border-t border-slate-200/80 px-4 py-4">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Portal ativo</p>
            <p className="mt-3 text-sm font-semibold text-slate-950">{portal.navigationLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{portal.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HeaderActionButton({ children }: { children: ReactNode }) {
  return <div className="shrink-0">{children}</div>;
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const actionItems = useMemo(() => {
    if (!actionSlot) {
      return [];
    }

    return Array.isArray(actionSlot) ? actionSlot : [actionSlot];
  }, [actionSlot]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1720px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegação"
            >
              <span aria-hidden="true" className="text-lg">☰</span>
            </button>
            <PortalBadge portal={portal} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#16a34a]">Expand Experience</p>
              <h1 className="text-base font-semibold text-slate-950 sm:text-lg">{portal.title}</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expandir navegação lateral" : "Recolher navegação lateral"}
            >
              {collapsed ? "Expandir menu" : "Recolher menu"}
            </button>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sessão</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{currentUser.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1720px] gap-0 lg:grid-cols-[auto_minmax(0,1fr)]">
        <aside
          className={joinClasses(
            "hidden border-r border-slate-200/80 bg-white lg:block",
            collapsed ? "w-[104px]" : "w-[300px]",
          )}
        >
          <PortalSidebar portal={portal} pathname={pathname} collapsed={collapsed} />
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,29,47,0.06)] lg:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl">
                <span className={joinClasses("inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]", portal.accentSoft)}>
                  {portal.badge}
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">{title}</h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
                {previewMessage ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {previewMessage}
                  </div>
                ) : null}
              </div>

              {actionItems.length > 0 ? (
                <div className="flex flex-wrap gap-3 xl:max-w-[480px] xl:justify-end">
                  {actionItems.map((item, index) => (
                    <HeaderActionButton key={`portal-action-${index}`}>{item}</HeaderActionButton>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-6">{children}</div>
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden" aria-hidden="true" onClick={() => setMobileOpen(false)} />
      ) : null}

      <aside
        className={joinClasses(
          "fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navegação móvel do portal"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <PortalBadge portal={portal} />
            <div>
              <p className="text-sm font-semibold text-slate-950">{portal.title}</p>
              <p className="text-xs text-slate-500">Menu de navegação</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar navegação"
          >
            ×
          </button>
        </div>
        <PortalSidebar portal={portal} pathname={pathname} collapsed={false} onCloseMobile={() => setMobileOpen(false)} />
      </aside>
    </div>
  );
}

export function PortalMetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,29,47,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,29,47,0.05)] lg:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#16a34a]">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SpotlightList({ items }: SpotlightListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Nenhum item de destaque foi carregado nesta visão.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={`${item.title}-${item.status}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.eyebrow}</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h4>
            </div>
            <span className={joinClasses("rounded-full border px-3 py-1 text-xs font-medium", getStatusClasses(item.status))}>
              {item.status}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export function TrendBars({ title, description, items }: TrendBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-lg font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Sem dados suficientes para esta leitura.</p>
        ) : (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-700">{item.label}</span>
                <span className="font-semibold text-slate-950">{item.formattedValue}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-[#0f1d2f] via-[#1e3a5f] to-[#16a34a]"
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
        <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportTable({ rows }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Indicador</th>
              <th className="px-5 py-4">Valor principal</th>
              <th className="px-5 py-4">Leitura complementar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-5 py-4 font-semibold text-slate-950">{row.label}</td>
                <td className="px-5 py-4">{row.primary}</td>
                <td className="px-5 py-4 text-slate-600">{row.secondary}</td>
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
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${portalLabel}: ${title}`}
        className="relative z-10 w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,29,47,0.18)] lg:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#16a34a]">{portalLabel}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <button
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]"
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
