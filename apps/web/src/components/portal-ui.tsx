"use client";

import Link from "next/link";
import { type ReactNode } from "react";
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
};

function getStatusClasses(value: string) {
  const normalizedValue = value.toUpperCase();

  if (["ACTIVE", "WON", "BILLED", "PAYMENT_CONFIRMED", "RELEASED"].includes(normalizedValue)) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  }

  if (["PENDING", "NEW", "QUALIFIED", "PROPOSAL", "ENTRY", "PIPELINE"].includes(normalizedValue)) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  if (["LOST", "INACTIVE", "CANCELLED", "CANCELED"].includes(normalizedValue)) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  }

  return "border-slate-700 bg-slate-900 text-slate-100";
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
  const navItems = [
    { label: "Dashboard", href: portal.route },
    { label: "Relatórios", href: portal.reportsRoute },
    ...portal.legacyModules.map((module) => ({ label: module.label, href: module.href })),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]" />
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[300px_1fr] lg:px-8 xl:px-10">
        <aside className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] ${portal.accentSoft}`}>
              {portal.badge}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">{portal.title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">{portal.description}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Sessão ativa</p>
              <p className="mt-3 text-base font-semibold text-white">{currentUser.name}</p>
              <p className="mt-1 text-sm text-slate-400">{currentUser.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${portal.accentSoft}`}>
                  {currentUser.role}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {currentUser.ecosystemProfile ?? "perfil não definido"}
                </span>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={`${portal.key}-${item.href}`}
                  href={item.href}
                  className="block rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Aplicativos operacionais</p>
              <p className="mt-2 leading-6 text-slate-400">
                Os módulos funcionais já existentes continuam disponíveis e podem ser acessados diretamente enquanto a nova experiência por portal amadurece.
              </p>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <div className={`h-1.5 w-full bg-gradient-to-r ${portal.accent}`} />
            <div className="p-6 lg:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-4xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">ExpandAI Experience</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white lg:text-4xl">{title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300 lg:text-base">{description}</p>
                </div>
                <div className="flex flex-wrap gap-3">{actionSlot}</div>
              </div>
              {previewMessage ? (
                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  {previewMessage}
                </div>
              ) : null}
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

export function PortalMetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl lg:p-7">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SpotlightList({ items }: SpotlightListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
        Nenhum item de destaque foi carregado nesta visão.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={`${item.title}-${item.status}`} className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.eyebrow}</p>
              <h4 className="mt-2 text-lg font-semibold text-white">{item.title}</h4>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(item.status)}`}>
              {item.status}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export function TrendBars({ title, description, items }: TrendBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Sem dados suficientes para esta leitura.</p>
        ) : (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-medium text-white">{item.formattedValue}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500"
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
        <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportTable({ rows }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
        <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-5 py-4">Indicador</th>
            <th className="px-5 py-4">Valor principal</th>
            <th className="px-5 py-4">Leitura complementar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-5 py-4 font-medium text-white">{row.label}</td>
              <td className="px-5 py-4">{row.primary}</td>
              <td className="px-5 py-4 text-slate-400">{row.secondary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortalModal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">ExpandAI modal</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
          </div>
          <button
            className="inline-flex rounded-2xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:text-white"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
