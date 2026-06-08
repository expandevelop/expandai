"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { AppHeader } from "@/components/ui/app-header";
import { MeshBackground } from "@/components/ui/brand";

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  const { feedback, error, rolesPayload } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0D1E2D] text-[#CDD6DC] antialiased">
      <MeshBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8">
        <AppHeader />

        <header className="px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#8A9AA6]">
            {description}
          </p>
        </header>

        {feedback ? (
          <div className="rounded-2xl border border-[#0E9A4F]/25 bg-[#0E9A4F]/10 px-4 py-3 text-sm text-[#13B860]">
            {feedback}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {rolesPayload ? (
          <pre className="overflow-x-auto rounded-2xl border border-[#FF842A]/20 bg-[#07131F]/70 p-4 text-xs leading-6 text-[#CDD6DC]">
            {rolesPayload}
          </pre>
        ) : null}

        <section className="flex-1">{children}</section>
      </div>
    </div>
  );
}
