"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  DotsSpinner,
  ExpandAiLogo,
  MeshBackground,
} from "@/components/ui/brand";

export function LoginScreen() {
  const { signIn, isSubmitting, error } = useAuth();
  const [email, setEmail] = useState("admin@expandai.com");
  const [password, setPassword] = useState("Expand@123");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await signIn(email, password);
    } catch {
      // O provider já consolida o erro para a interface.
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0D1E2D] text-[#CDD6DC] antialiased">
      <MeshBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <ExpandAiLogo className="text-4xl" />
            <p className="mt-3 text-sm text-[#8A9AA6]">
              Plataforma de orquestração da expansão comercial
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#162A3D]/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Entrar na operação
              </h1>
              <p className="mt-1.5 text-sm text-[#8A9AA6]">
                Use uma credencial habilitada para acessar seu portal.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#8A9AA6]">
                  E-mail
                </span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8A9AA6]/60 focus:border-[#FF842A]/50 focus:ring-2 focus:ring-[#FF842A]/15"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@expandai.com"
                  aria-label="E-mail"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#8A9AA6]">
                  Senha
                </span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8A9AA6]/60 focus:border-[#FF842A]/50 focus:ring-2 focus:ring-[#FF842A]/15"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite a senha de acesso"
                  aria-label="Senha"
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF842A] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF842A]/30 transition hover:bg-[#E06D1B] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <DotsSpinner tone="light" /> : "Entrar na plataforma"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-[#8A9AA6]/70">
            Acesso autenticado por perfil · ExpandAI
          </p>
        </div>
      </div>
    </main>
  );
}
