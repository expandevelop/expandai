"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function LoginScreen() {
  const { signIn, isSubmitting } = useAuth();
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid w-full gap-6 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,29,47,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[linear-gradient(135deg,#0f1d2f_0%,#1e3a5f_55%,#16a34a_100%)] p-8 text-white lg:p-12">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
              Expand AI
            </span>
            <div className="mt-6 space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight lg:text-5xl">
                Uma plataforma mais clara para orquestrar expansão comercial.
              </h1>
              <p className="max-w-2xl text-sm leading-8 text-white/85 lg:text-base">
                A nova experiência organiza a operação em portais separados para Expand, Operadora, Partner e Cliente Final, com foco em navegação simples, leitura objetiva e usabilidade moderna.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <article className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Acesso</p>
                <p className="mt-3 text-sm font-semibold text-white">Entrada autenticada por perfil</p>
              </article>
              <article className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Experiência</p>
                <p className="mt-3 text-sm font-semibold text-white">Portais limpos e segmentados</p>
              </article>
              <article className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Objetivo</p>
                <p className="mt-3 text-sm font-semibold text-white">Testar usabilidade antes da homologação</p>
              </article>
            </div>
          </div>

          <div className="p-6 lg:p-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#16a34a]">Acesso à plataforma</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Entrar na operação</h2>
                <p className="text-sm leading-7 text-slate-600">
                  Utilize uma credencial habilitada para acessar os portais protegidos da ExpandAI com leitura por perfil e navegação segmentada.
                </p>
              </div>

              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">E-mail</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#16a34a]"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@expandai.com"
                    aria-label="E-mail"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Senha</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#16a34a]"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite a senha de acesso"
                    aria-label="Senha"
                  />
                </label>
              </div>

              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Autenticando..." : "Entrar na plataforma"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
