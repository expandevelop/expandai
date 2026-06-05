type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

type StatusBadgeProps = {
  value: string | null | undefined;
};

type EmptyStateProps = {
  title: string;
  description: string;
};

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function getStatusClasses(value: string) {
  const normalizedValue = value.toUpperCase();

  if (
    ["ACTIVE", "WON", "BILLED", "PAYMENT_CONFIRMED", "RELEASED"].includes(
      normalizedValue,
    )
  ) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  }

  if (["PENDING", "ENTRY"].includes(normalizedValue)) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  if (["LOST", "INACTIVE", "CANCELLED"].includes(normalizedValue)) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  }

  return "border-slate-700 bg-slate-900 text-slate-100";
}

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const safeValue = value ?? "N/A";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
        safeValue,
      )}`}
    >
      {safeValue}
    </span>
  );
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
    </header>
  );
}
