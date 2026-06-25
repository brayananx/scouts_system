"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AppHeader({
  onCreateUser,
  onCreatePatrol,
}: {
  onCreateUser?: () => void;
  onCreatePatrol?: () => void;
}) {
  const router = useRouter();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <section className="bg-emerald-800 px-8 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
          Grupo 175 · Guías y Scouts de Costa Rica
        </p>

        <h1 className="mt-3 text-4xl font-bold">⚜️ Tropa Coquiva 175</h1>

        <p className="mt-2 text-xl font-semibold text-emerald-50">
          Sistema de Registro de Protagonistas
        </p>

        <p className="mt-2 max-w-2xl text-emerald-100">
          Gestión de protagonistas, patrullas, asistencia, progresión scout y fichas médicas.
        </p>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              🏠 Inicio
            </Link>

            <Link
              href="/attendance"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              📋 Asistencia
            </Link>

            {onCreateUser && onCreatePatrol && (
              <div className="relative">
                <button
                  onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                  className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  ➕ Nuevo
                </button>

                {isNewMenuOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-56 rounded-2xl bg-white p-2 text-slate-900 shadow-xl">
                    <button
                      onClick={() => {
                        onCreateUser();
                        setIsNewMenuOpen(false);
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-slate-100"
                    >
                      👤 Protagonista
                    </button>

                    <button
                      onClick={() => {
                        onCreatePatrol();
                        setIsNewMenuOpen(false);
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-slate-100"
                    >
                      🐺 Patrulla
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            🚪 Salir
          </button>
        </div>
      </div>
    </section>
  );
}