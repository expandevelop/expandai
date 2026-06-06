import type { ReactNode } from "react";
import type { TransactionFormOption } from "@/types/expandai";

type FormCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

type FormGridProps = {
  children: ReactNode;
};

type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "number" | "date" | "datetime-local" | "password";
  required?: boolean;
  onChange: (value: string) => void;
};

type TextAreaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
};

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  options: TransactionFormOption[];
  onChange: (value: string) => void;
};

type FormActionsProps = {
  submitLabel: string;
  resetLabel: string;
  isSubmitting: boolean;
  onReset: () => void;
};

type InlineMessageProps = {
  tone: "success" | "error" | "info";
  children: ReactNode;
};

const toneClasses: Record<InlineMessageProps["tone"], string> = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
  error: "border-rose-500/20 bg-rose-500/10 text-rose-100",
  info: "border-cyan-500/20 bg-cyan-500/10 text-cyan-100",
};

export function FormCard({ eyebrow, title, description, children }: FormCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FormGrid({ children }: FormGridProps) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function TextField({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: TextFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label} {required ? "*" : ""}
      </span>
      <input
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  placeholder,
  rows = 4,
  onChange,
}: TextAreaFieldProps) {
  return (
    <label className="block space-y-2 md:col-span-2">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <textarea
        className="min-h-[120px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  placeholder = "Selecione uma opção",
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value
        ? options.find((option) => option.value === value)?.hint && (
            <p className="text-xs leading-5 text-slate-500">
              {options.find((option) => option.value === value)?.hint}
            </p>
          )
        : null}
    </label>
  );
}

export function FormActions({
  submitLabel,
  resetLabel,
  isSubmitting,
  onReset,
}: FormActionsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processando..." : submitLabel}
      </button>
      <button
        className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={onReset}
        disabled={isSubmitting}
      >
        {resetLabel}
      </button>
    </div>
  );
}

export function InlineMessage({ tone, children }: InlineMessageProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}
