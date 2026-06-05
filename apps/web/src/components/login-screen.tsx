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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10">
        <section className="grid w-full gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              ExpandAI Platform
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Camada web autenticada pronta para operar sobre a API real da ExpandAI.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                Esta etapa organiza a aplicação em um <strong>app shell modular</strong>, com
                login persistido em <strong>local storage</strong>, navegação por perfil e base
                pronta para rotas dedicadas dos módulos de negócio.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sessão</p>
                <p className="mt-2 text-sm font-medium text-white">JWT persistido localmente</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Navegação</p>
                <p className="mt-2 text-sm font-medium text-white">Rotas por módulo e perfil</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Próxima fase</p>
                <p className="mt-2 text-sm font-medium text-white">CRUDs e fluxos transacionais</p>
              </article>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Entrar na operação</h2>
                <p className="text-sm leading-6 text-slate-400">
                  Utilize uma credencial habilitada para carregar os módulos protegidos da plataforma.
                </p>
              </div>
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-200">E-mail</span>
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@expandai.com"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-200">Senha</span>
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite a senha de acesso"
                  />
                </label>
              </div>
              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
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
