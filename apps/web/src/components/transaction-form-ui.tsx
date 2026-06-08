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
  success: "border-[#0E9A4F]/25 bg-[#0E9A4F]/10 text-[#13B860]",
  error: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  info: "border-[#FF842A]/25 bg-[#FF842A]/10 text-[#FF842A]",
};

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8A9AA6]/60 focus:border-[#FF842A]/50 focus:ring-2 focus:ring-[#FF842A]/15";

const labelClasses = "text-xs font-medium uppercase tracking-wider text-[#8A9AA6]";

export function FormCard({ eyebrow, title, description, children }: FormCardProps) {
  return (
    <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6 backdrop-blur-xl">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-[#8A9AA6]">{description}</p>
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
      <span className={labelClasses}>
        {label} {required ? <span className="text-[#FF842A]">*</span> : ""}
      </span>
      <input
        className={inputClasses}
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
      <span className={labelClasses}>{label}</span>
      <textarea
        className={`min-h-[120px] ${inputClasses}`}
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
      <span className={labelClasses}>{label}</span>
      <select
        className={inputClasses}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" className="bg-[#162A3D]">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#162A3D]">
            {option.label}
          </option>
        ))}
      </select>
      {value
        ? options.find((option) => option.value === value)?.hint && (
            <p className="text-xs leading-5 text-[#8A9AA6]">
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
        className="inline-flex items-center justify-center rounded-xl bg-[#FF842A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF842A]/30 transition hover:bg-[#E06D1B] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processando..." : submitLabel}
      </button>
      <button
        className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-5 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
