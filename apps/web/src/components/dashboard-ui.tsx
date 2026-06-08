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
    return "border-[#0E9A4F]/30 bg-[#0E9A4F]/12 text-[#13B860]";
  }

  if (["PENDING", "ENTRY", "NEW", "QUALIFIED", "PROPOSAL"].includes(normalizedValue)) {
    return "border-[#FF842A]/30 bg-[#FF842A]/12 text-[#FF842A]";
  }

  if (["LOST", "INACTIVE", "CANCELLED", "CANCELED", "OVERDUE", "BLOCKED", "SUSPENDED"].includes(normalizedValue)) {
    return "border-rose-500/30 bg-rose-500/12 text-rose-300";
  }

  return "border-white/10 bg-white/5 text-[#CDD6DC]";
}

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-white/8 bg-[#162A3D]/70 p-5 backdrop-blur-xl">
      <p className="text-xs font-medium uppercase tracking-wider text-[#8A9AA6]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#8A9AA6]">{description}</p>
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
    <div className="rounded-2xl border border-dashed border-white/12 bg-[#07131F]/50 p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#8A9AA6]">{description}</p>
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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-[#8A9AA6]">{description}</p>
    </header>
  );
}

export function FilterShell({ children }: FilterShellProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#162A3D]/70 p-4 backdrop-blur-xl">
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
      <span className="text-xs font-medium uppercase tracking-wider text-[#8A9AA6]">{label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8A9AA6]/60 focus:border-[#FF842A]/50 focus:ring-2 focus:ring-[#FF842A]/15"
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
      <span className="text-xs font-medium uppercase tracking-wider text-[#8A9AA6]">{label}</span>
      <select
        className="w-full rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm text-white outline-none transition focus:border-[#FF842A]/50 focus:ring-2 focus:ring-[#FF842A]/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#162A3D]">
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
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/8 bg-[#162A3D]/70 p-4 backdrop-blur-xl xl:col-span-3 xl:flex-row xl:items-center">
      <p className="text-sm text-[#CDD6DC]">
        <strong className="text-white">{count}</strong> {entityLabel}
        {count === 1 ? " encontrada" : " encontradas"} com os filtros atuais.
      </p>
      <button
        className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-2.5 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        Limpar filtros
      </button>
    </div>
  );
}
