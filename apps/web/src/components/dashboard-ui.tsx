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

type FilterShellProps = {
  children: React.ReactNode;
};

type FilterInputProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

type FilterSummaryProps = {
  count: number;
  entityLabel: string;
  hasActiveFilters: boolean;
  onReset: () => void;
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

  if (["PENDING", "ENTRY", "NEW", "QUALIFIED", "PROPOSAL"].includes(normalizedValue)) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  if (["LOST", "INACTIVE", "CANCELLED", "CANCELED"].includes(normalizedValue)) {
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

export function FilterShell({ children }: FilterShellProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">{children}</div>
    </div>
  );
}

export function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: FilterInputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterSummary({
  count,
  entityLabel,
  hasActiveFilters,
  onReset,
}: FilterSummaryProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 xl:col-span-3 xl:flex-row xl:items-center">
      <p className="text-sm text-slate-300">
        <strong className="text-white">{count}</strong> {entityLabel}
        {count === 1 ? " encontrada" : " encontradas"} com os filtros atuais.
      </p>
      <button
        className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        Limpar filtros
      </button>
    </div>
  );
}
